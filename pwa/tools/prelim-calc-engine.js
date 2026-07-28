/* ============================================================================
 * SprinkFlow — Preliminary Calculation engine
 * ----------------------------------------------------------------------------
 * PRELIMINARY ESTIMATING TOOL ONLY. This produces an early feasibility estimate
 * of theoretical sprinkler demand. It is NOT a substitute for a full NFPA 13
 * hydraulic calculation or engineering review.
 *
 * Pure, side-effect-free calculation helpers + indexed reference data.
 * Exposed as a UMD global `PrelimCalc` (browser: window.PrelimCalc; Node: module.exports)
 * so the same code drives the UI and the automated tests.
 *
 * Sources / traceability:
 *  - Design density & area:  NFPA 13 (2025) Table 19.2.3.1.1 (Density/Area Criteria)
 *  - Hose stream allowance:  NFPA 13 (2025) Table 19.2.3.1.2 (Hose Stream Allowance
 *                            and Water Supply Duration Requirements)
 *    (indexed locally in docs/nfpa13-2025-full-link-index.md)
 *  - Backflow friction loss: chart-derived index, see header of BACKFLOW below and
 *    Documents/Codex/2026-06-25/ref/outputs/backflow_friction_loss_notes.md
 * ========================================================================== */
(function (global) {
  "use strict";

  /* --- NFPA 13 design density / area / hose-allowance by occupancy hazard -----
   * density   = design density, gpm/ft^2            (Table 19.2.3.1.1)
   * designArea= design area of operation, ft^2      (lower-end / minimum design
   *             area at the listed density — the commonly used preliminary point;
   *             the full density/area curve allows density<->area trade-offs)
   * hoseGpm   = total hose stream allowance, gpm     (Table 19.2.3.1.2)
   * durationMin = water supply duration, minutes     (Table 19.2.3.1.2)
   * coverageFt2 = assumed max protection area per sprinkler (for head-pressure est.)
   * branchSpacingFt = assumed branch line spacing (for branch tributary flow est.)
   */
  //  Design-basis list. `type` selects how demand + head pressure are computed:
  //    "da"        — density/area occupancy (LH/OH/EH): demand = density x designArea.
  //    "da-custom" — storage density/area (user enters density + area, e.g. 0.60 / 2000).
  //    "residential" — (n) heads x flow/head; head P = (flow/K)^2 (default 4 @ 13 gpm, K4.9).
  //    "esfr"      — storage ESFR/FM: (n) heads x K x sqrt(P); head P = P (e.g. 12, K22.4, 50 psi).
  //  maxCoverageFt2 = NFPA max protection area per sprinkler — drives head PRESSURE (worst
  //  case) and the sprinkler COUNT take-off. kFactor is the head K for the basis.
  var HAZARDS = [
    { id: "light", label: "Light Hazard",            type: "da", density: 0.10, designArea: 1500, hoseGpm: 100, durationMin: 30,  maxCoverageFt2: 225, branchSpacingFt: 14, kFactor: 5.6,  ref: "NFPA 13 Table 19.2.3.1.1 / 19.2.3.1.2" },
    { id: "oh1",   label: "Ordinary Hazard 1",       type: "da", density: 0.15, designArea: 1500, hoseGpm: 250, durationMin: 90,  maxCoverageFt2: 130, branchSpacingFt: 10, kFactor: 5.6,  ref: "NFPA 13 Table 19.2.3.1.1 / 19.2.3.1.2" },
    { id: "oh2",   label: "Ordinary Hazard 2",       type: "da", density: 0.20, designArea: 1500, hoseGpm: 250, durationMin: 90,  maxCoverageFt2: 130, branchSpacingFt: 10, kFactor: 5.6,  ref: "NFPA 13 Table 19.2.3.1.1 / 19.2.3.1.2" },
    { id: "eh1",   label: "Extra Hazard 1",          type: "da", density: 0.30, designArea: 2500, hoseGpm: 500, durationMin: 120, maxCoverageFt2: 100, branchSpacingFt: 10, kFactor: 5.6,  ref: "NFPA 13 Table 19.2.3.1.1 / 19.2.3.1.2" },
    { id: "eh2",   label: "Extra Hazard 2",          type: "da", density: 0.40, designArea: 2500, hoseGpm: 500, durationMin: 120, maxCoverageFt2: 100, branchSpacingFt: 10, kFactor: 5.6,  ref: "NFPA 13 Table 19.2.3.1.1 / 19.2.3.1.2" },
    { id: "res",   label: "Residential (4 heads)",   type: "residential", heads: 4, flowPerHead: 13, kFactor: 4.9, hoseGpm: 0, durationMin: 30, maxCoverageFt2: 144, branchSpacingFt: 12, ref: "NFPA 13R/13D residential (4 most-remote heads)" },
    { id: "storage-da",   label: "Storage — Density / Area", type: "da-custom", density: 0.60, designArea: 2000, hoseGpm: 500, durationMin: 120, maxCoverageFt2: 100, branchSpacingFt: 10, kFactor: 16.8, ref: "NFPA 13 storage (CMDA/CMSA) — use the Storage Analysis tool for criteria" },
    { id: "storage-esfr", label: "Storage — ESFR / FM",      type: "esfr", heads: 12, kFactor: 22.4, psi: 50, hoseGpm: 250, durationMin: 60, maxCoverageFt2: 100, branchSpacingFt: 10, ref: "NFPA 13 storage (ESFR) — use the Storage Analysis tool for criteria" }
  ];

  function hazardById(id) {
    for (var i = 0; i < HAZARDS.length; i++) if (HAZARDS[i].id === id) return HAZARDS[i];
    return null;
  }

  /* --- Schedule 40 black steel actual internal diameters (in.) --------------- */
  var PIPE_ID_SCH40 = {
    "1": 1.049, "1.25": 1.380, "1.5": 1.610, "2": 2.067, "2.5": 2.469,
    "3": 3.068, "4": 4.026, "6": 6.065, "8": 7.981, "10": 10.020
  };
  // Default Hazen-Williams roughness for black steel (NFPA 13 Table 23.4.4.7.1).
  var DEFAULT_C = 120;
  var ELEV_PSI_PER_FT = 0.433;      // standard water column, ~0.433 psi/ft
  var DEFAULT_K = 5.6;              // most common K-factor for a starting head

  // Standard sprinkler K-factors. Auto-selection picks the one whose starting head
  // pressure (Q/K)² is closest to a ~7 psi target (a practical minimum operating pressure),
  // so a higher per-head flow steps up to a larger orifice instead of demanding more pressure.
  var STANDARD_K = [2.8, 4.2, 5.6, 8.0, 11.2, 14.0, 16.8, 19.6, 22.4, 25.2, 28.0];
  var K_TARGET_PSI = 7;
  function autoKFactor(qGpm) {
    if (!(qGpm > 0)) return DEFAULT_K;
    var best = STANDARD_K[0], bestErr = Infinity;
    for (var i = 0; i < STANDARD_K.length; i++) {
      var p = Math.pow(qGpm / STANDARD_K[i], 2);
      var err = Math.abs(p - K_TARGET_PSI);
      if (err < bestErr) { bestErr = err; best = STANDARD_K[i]; }
    }
    return best;
  }

  // Ordered nominal pipe sizes (for "two sizes below" secondary-main defaults).
  var PIPE_ORDER = ["1", "1.25", "1.5", "2", "2.5", "3", "4", "6", "8", "10"];
  function twoSizesBelow(nominal) {
    var i = PIPE_ORDER.indexOf(String(nominal));
    if (i < 0) return null;
    return PIPE_ORDER[Math.max(0, i - 2)];
  }

  // System "overflow" factor: real discharge above the theoretical density*area minimum.
  // Trees over-discharge more (remote-vs-near pressure imbalance); grids stay near minimum.
  // Calibrated to reference hydraulic results (OH2 200x100): tree ~+5%, grid ~+1%.
  var OVERAGE = { tree: 1.05, grid: 1.01 };

  // Friction calibration coefficients (see docs/prelim-calc-grid-plan.md). Mains and tree
  // branches carry distributed (tapering) flow, so raw full-flow Hazen-Williams loss is
  // scaled by MAIN_TAPER / BRANCH_TAPER. GRID_BRANCH_FACTOR is the both-end-feed reduction
  // applied to a grid branch (vs a dead-end tree branch). Tuned to four OH2 200x100 owner
  // reference configs (K5.6, 100 ft2/head 20 gpm, 16 ft to sprinklers).
  var MAIN_TAPER = 0.50;
  var BRANCH_TAPER = 0.50;
  var GRID_BRANCH_FACTOR = 0.38;

  function actualIdForNominal(nominalIn) {
    var key = String(nominalIn);
    return Object.prototype.hasOwnProperty.call(PIPE_ID_SCH40, key) ? PIPE_ID_SCH40[key] : null;
  }

  // Cement-lined ductile iron actual internal diameters (in.) for the underground
  // supply lateral (AWWA C151/C104, representative). C = 140 (cement-lined cast/
  // ductile iron, NFPA 13 Table 23.4.4.7.1).
  var PIPE_ID_DUCTILE = { "4": 4.28, "6": 6.40, "8": 8.51, "10": 10.62, "12": 12.72 };
  var UNDERGROUND_SIZES = ["4", "6", "8", "10", "12"];
  var DEFAULT_C_UNDERGROUND = 140;
  function actualIdUnderground(nominalIn) {
    var key = String(nominalIn);
    return Object.prototype.hasOwnProperty.call(PIPE_ID_DUCTILE, key) ? PIPE_ID_DUCTILE[key] : null;
  }

  /* --- Hazen-Williams friction loss ------------------------------------------
   * psi/ft = 4.52 * Q^1.85 / (C^1.85 * d^4.87)   (sprinkler form, d = actual ID in.)
   */
  function hazenWilliamsPsiPerFt(qGpm, cFactor, dInches) {
    if (!(qGpm > 0) || !(cFactor > 0) || !(dInches > 0)) return 0;
    return 4.52 * Math.pow(qGpm, 1.85) / (Math.pow(cFactor, 1.85) * Math.pow(dInches, 4.87));
  }
  function hazenWilliamsLoss(qGpm, cFactor, dInches, lengthFt) {
    return hazenWilliamsPsiPerFt(qGpm, cFactor, dInches) * (lengthFt > 0 ? lengthFt : 0);
  }

  function elevationLoss(heightFt) {
    return (heightFt > 0 ? heightFt : 0) * ELEV_PSI_PER_FT;
  }

  // Flow velocity (ft/s) for water in a pipe: v = 0.4085 * Q(gpm) / d(in)^2.
  function velocityFps(qGpm, dInches) {
    if (!(qGpm > 0) || !(dInches > 0)) return 0;
    return 0.4085 * qGpm / (dInches * dInches);
  }

  // Two parallel mains (grid primary + secondary) sharing a flow over a common length.
  // Flow splits so head loss is equal across both; returns that common loss (psi).
  // Larger primary carries more; a bigger secondary further lowers the shared loss.
  function parallelMainLoss(qGpm, dPrimary, dSecondary, cFactor, lengthFt) {
    if (!(dSecondary > 0)) return hazenWilliamsLoss(qGpm, cFactor, dPrimary, lengthFt);
    // q1/q2 such that q1^1.85/d1^4.87 = q2^1.85/d2^4.87
    var ratio = Math.pow(Math.pow(dPrimary, 4.87) / Math.pow(dSecondary, 4.87), 1 / 1.85);
    var q2 = qGpm / (1 + ratio), q1 = qGpm - q2;
    return hazenWilliamsLoss(q1, cFactor, dPrimary, lengthFt); // equals loss across secondary
  }

  /* --- Backflow friction-loss index ------------------------------------------
   * Chart-derived lookup points (gpm -> psi loss). Visually interpreted from
   * manufacturer flow-characteristic charts; treat as preliminary estimating data.
   * Curves are NOT monotonic and must NOT be reduced to a single K factor.
   *   DCDA (double check detector assembly):
   *     < 2.5 in -> Zurn Wilkins 950XL3 ;  >= 2.5 in -> Ames 3000SS
   *   RPA  (reduced pressure assembly):
   *     < 2.5 in -> Zurn Wilkins 375XL  ;  >= 2.5 in -> Ames 4000SS
   * Source: backflow_friction_loss_index.csv (bf-375xl, bf-950xl3,
   *         Ames 3000SS, Ames 4000SS datasheets).
   */
  var BACKFLOW = {
    "950XL3": {
      mfr: "Zurn Wilkins", model: "950XL3", type: "dcda", label: "Zurn Wilkins 950XL3 (double check)",
      source: "bf-950xl3.pdf p.2", confidence: "medium",
      sizes: {
        "0.75": [[0,4.5],[10,5.5],[20,6.2],[30,8],[40,14],[45,20]],
        "1":    [[0,4],[20,5],[40,6],[50,8.5],[60,11],[70,15.5],[75,18]],
        "1.25": [[0,4],[50,6],[75,7.5],[100,10],[115,15]],
        "1.5":  [[0,4],[50,5],[100,8],[125,12],[150,18.5]],
        "2":    [[0,4],[50,5],[100,5],[150,8],[200,14],[225,18],[235,21]]
      }
    },
    "375XL": {
      mfr: "Zurn Wilkins", model: "375XL", type: "rpa", label: "Zurn Wilkins 375XL (reduced pressure)",
      source: "bf-375xl(sm).pdf p.2", confidence: "low-medium",
      sizes: {
        "0.5":  [[0,12],[5,14],[10,15],[15,16],[20,18],[25,20]],
        "0.75": [[0,12],[10,14],[20,15],[30,17],[40,24],[45,30]],
        "1":    [[0,12],[20,14],[40,15],[60,20],[70,25],[75,27]],
        "1.25": [[0,9],[10,11],[50,12],[75,13],[100,15],[115,16]],
        "1.5":  [[0,10],[50,11],[100,11],[125,13],[150,18]],
        "2":    [[0,10],[50,11],[100,11],[150,12],[200,14],[225,16],[240,18]]
      }
    },
    "3000SS": {
      mfr: "Ames Fire & Waterworks", model: "3000SS", type: "dcda", label: "Ames 3000SS (double check detector)",
      source: "Ames 3000SS datasheet p.3", confidence: "low-medium",
      sizes: {
        "2.5": [[0,5.5],[25,7],[50,6],[100,3.5],[150,3],[200,2.7],[250,3],[300,3.5],[350,5],[400,6],[450,7],[500,8.5],[525,10]],
        "3":   [[0,4.5],[25,5.8],[50,6],[75,4.5],[100,2],[150,1.8],[200,1.8],[250,2.1],[300,2.3],[350,3.2],[400,4],[450,5.2],[500,6.2],[550,7.8],[600,9]],
        "4":   [[0,2.5],[50,5.8],[100,2],[150,1.8],[200,1.5],[250,1.6],[300,1.8],[350,2.5],[400,3],[450,3.5],[500,4],[550,5.5],[600,6],[650,7],[700,7],[750,10]],
        "6":   [[0,3.5],[100,4],[200,3],[300,2.6],[400,2.2],[500,2.2],[600,2.5],[700,2.8],[800,3.2],[900,4],[1000,4.6],[1100,6],[1200,6],[1300,7.3],[1400,8],[1500,9]],
        "8":   [[0,2.5],[250,5],[500,4.2],[750,3.7],[1000,3.6],[1250,3],[1500,2.8],[1600,3.2],[1750,4],[2000,4],[2250,4.5],[2500,5]],
        "10":  [[0,2.2],[250,4.6],[500,4],[750,3.8],[1000,3.8],[1250,3.6],[1500,3.2],[1750,4],[2000,4.5],[2250,5],[2500,5.8],[2750,6.8],[3000,8],[3250,9.5],[3500,12]],
        "12":  [[0,5],[500,3.5],[1000,2],[1500,3],[2000,4],[2500,5],[3000,7],[3500,9],[4000,12],[4500,15]]
      }
    },
    "4000SS": {
      mfr: "Ames Fire & Waterworks", model: "4000SS", type: "rpa", label: "Ames 4000SS (reduced pressure)",
      source: "ES-A-4000SS+2352.pdf p.3", confidence: "medium",
      sizes: {
        "2.5": [[0,8],[50,11.5],[100,8.5],[150,7.5],[200,7.5],[250,8],[300,9],[400,10.5],[500,12],[600,16]],
        "3":   [[0,8],[50,9.5],[100,7.5],[200,7.5],[250,8],[300,9],[400,11],[500,12.5],[550,14],[600,16]],
        "4":   [[0,8],[25,10.5],[75,8],[125,7],[175,6.5],[250,7.5],[300,8.5],[400,10],[500,11],[600,12]],
        "6":   [[0,7.5],[100,8],[250,6.5],[500,7],[750,8],[1000,9],[1250,11],[1400,13.5],[1500,15.5]],
        "8":   [[0,11.5],[200,10.5],[400,9.8],[800,9.5],[1200,10],[1600,12],[2000,13],[2400,14.5]],
        "10":  [[0,12],[100,13],[300,11],[500,10.2],[1000,10],[1500,11],[2000,12],[2400,14],[2800,16],[3000,18]]
      }
    }
  };

  // Backflow assembly types the UI offers.
  var BACKFLOW_TYPES = [
    { id: "none", label: "None / unknown" },
    { id: "dcda", label: "Double check detector assembly" },
    { id: "rpa",  label: "Reduced pressure assembly" }
  ];

  // Pick the indexed model for a given assembly type + line size.
  function backflowModelFor(assemblyType, sizeIn) {
    if (assemblyType === "dcda") return sizeIn >= 2.5 ? BACKFLOW["3000SS"] : BACKFLOW["950XL3"];
    if (assemblyType === "rpa")  return sizeIn >= 2.5 ? BACKFLOW["4000SS"] : BACKFLOW["375XL"];
    return null;
  }

  // All line sizes available (sorted) for an assembly type, across both models.
  function backflowSizesFor(assemblyType) {
    var out = [];
    Object.keys(BACKFLOW).forEach(function (k) {
      if (BACKFLOW[k].type === assemblyType) {
        Object.keys(BACKFLOW[k].sizes).forEach(function (s) { out.push(parseFloat(s)); });
      }
    });
    return out.sort(function (a, b) { return a - b; }).filter(function (v, i, a) { return i === 0 || a[i - 1] !== v; });
  }

  // Choose the nearest available size for a model: prefer exact, else closest >= , else closest.
  function nearestSize(model, sizeIn) {
    var sizes = Object.keys(model.sizes).map(parseFloat).sort(function (a, b) { return a - b; });
    if (sizes.indexOf(sizeIn) !== -1) return { size: sizeIn, substituted: false };
    var larger = sizes.filter(function (s) { return s >= sizeIn; });
    if (larger.length) return { size: larger[0], substituted: true };
    return { size: sizes[sizes.length - 1], substituted: true };
  }

  /* Linear interpolation of pressure loss for a (model, size) curve at a flow.
   * Returns { psi, outOfRange, ... }. Does NOT extrapolate above the chart range:
   * clamps to the last point and flags outOfRange so the UI can warn.
   */
  function interpCurve(points, qGpm) {
    var n = points.length;
    if (!n) return { psi: null, outOfRange: true };
    if (qGpm <= points[0][0]) return { psi: points[0][1], outOfRange: false, belowRange: qGpm < points[0][0] };
    var max = points[n - 1];
    if (qGpm >= max[0]) {
      return { psi: max[1], outOfRange: qGpm > max[0], maxGpm: max[0] };
    }
    for (var i = 1; i < n; i++) {
      if (qGpm <= points[i][0]) {
        var x0 = points[i - 1][0], y0 = points[i - 1][1], x1 = points[i][0], y1 = points[i][1];
        var t = (x1 === x0) ? 0 : (qGpm - x0) / (x1 - x0);
        return { psi: y0 + t * (y1 - y0), outOfRange: false };
      }
    }
    return { psi: max[1], outOfRange: false };
  }

  /* Full backflow loss lookup for an assembly type, line size, and flow.
   * { psi, model, sizeUsed, substituted, outOfRange, maxGpm, note } | null (type none)
   */
  function backflowLoss(assemblyType, sizeIn, qGpm) {
    if (assemblyType === "none" || !assemblyType) return null;
    var model = backflowModelFor(assemblyType, sizeIn);
    if (!model) return null;
    var pick = nearestSize(model, sizeIn);
    var curve = model.sizes[String(pick.size)];
    var res = interpCurve(curve, qGpm);
    var note = "";
    if (pick.substituted) note = "Nearest indexed size used (" + pick.size + " in.).";
    if (res.outOfRange) note = (note ? note + " " : "") + "Flow " + Math.round(qGpm) + " gpm exceeds the indexed chart range (max " + res.maxGpm + " gpm) — value clamped, verify against manufacturer data.";
    return {
      psi: res.psi,
      model: model.model,
      mfr: model.mfr,
      label: model.label,
      source: model.source,
      confidence: model.confidence,
      sizeUsed: pick.size,
      substituted: pick.substituted,
      outOfRange: !!res.outOfRange,
      maxGpm: res.maxGpm || null,
      note: note
    };
  }

  /* --- Water supply curve helpers (mirror water-supply.html) ------------------ */
  function pressureAtFlow(q, ps, pr, q1) { return ps - (ps - pr) * Math.pow(q / q1, 1.85); }
  function flowAtPressure(p2, ps, pr, q1) { return q1 * Math.pow((ps - p2) / (ps - pr), 0.54); }

  /* ============================================================================
   * Master preliminary calculation.
   * inputs: {
   *   lengthFt, widthFt, heightFt, hazardId,
   *   mainNominal, branchNominal, cFactor?, kFactor?,
   *   backflowType, backflowSizeIn?,
   *   gpmMarginPct (default 15), psiMarginPct (default 15),
   *   supply?: { static, residual, flow } | null
   * }
   * Returns a structured breakdown. `errors` is non-empty when inputs are invalid.
   * ========================================================================== */
  function calculate(inputs) {
    inputs = inputs || {};
    var errors = [];
    var warnings = [];

    var L = parseFeetInches(inputs.lengthFt), W = parseFeetInches(inputs.widthFt), H = parseFeetInches(inputs.heightFt);
    var hazard = hazardById(inputs.hazardId);
    var C = num(inputs.cFactor) || DEFAULT_C;
    var K = num(inputs.kFactor) || DEFAULT_K;
    var gpmMargin = (inputs.gpmMarginPct == null ? 5 : num(inputs.gpmMarginPct)) || 0;
    var psiMargin = (inputs.psiMarginPct == null ? 10 : num(inputs.psiMarginPct)) || 0;
    var systemType = (inputs.systemType === "grid") ? "grid" : "tree";
    var orientation = (inputs.mainOrientation === "width") ? "width" : "length";

    if (!(L > 0)) errors.push("Enter a building length greater than 0.");
    if (!(W > 0)) errors.push("Enter a building width greater than 0.");
    if (H == null || H < 0) errors.push("Enter a building height (0 or more).");
    if (!hazard) errors.push("Select an occupancy hazard classification.");

    var primaryNominal = inputs.mainNominal;
    var secondaryNominal = inputs.secondaryNominal || twoSizesBelow(primaryNominal);
    var mainId = actualIdForNominal(primaryNominal);
    var secondaryId = actualIdForNominal(secondaryNominal);
    var branchId = actualIdForNominal(inputs.branchNominal);
    if (mainId == null) errors.push("Select a maximum (primary) main pipe size.");
    if (branchId == null) errors.push("Select a maximum branchline pipe size.");
    if (systemType === "grid" && secondaryId == null) errors.push("Select a secondary main pipe size.");

    if (errors.length) return { errors: errors, warnings: warnings };

    // 1-3) Demand, head pressure, and an "effective design area" (for the branch geometry)
    //      depend on the design basis. maxCoverage (NFPA max) drives head pressure (worst
    //      case = max-spaced) and the sprinkler count. The GPM safety margin is added on top.
    var basisType = hazard.type || "da";
    var maxCoverage = num(inputs.maxCoverageFt2) || hazard.maxCoverageFt2;
    var headFlow, headPressure, headK = K, density, designArea, sprinklerBaseGpm, effDesignArea, overageFactor, hoseGpm, basisText, basisSub;
    var resHeads = null, resK = null, resFlowPerHead = null, esfrHeads = null, esfrK = null, esfrPsi = null;
    var autoKVal = null, kIsAuto = false;
    var hoseOverride = num(inputs.hoseGpm);

    if (basisType === "residential") {
      resHeads = num(inputs.resHeads) || hazard.heads;
      resK = num(inputs.resK) || hazard.kFactor;
      resFlowPerHead = num(inputs.resFlowPerHead) || hazard.flowPerHead;
      sprinklerBaseGpm = resHeads * resFlowPerHead;
      headPressure = Math.pow(resFlowPerHead / resK, 2);
      headK = resK; headFlow = resFlowPerHead;
      effDesignArea = resHeads * maxCoverage;
      density = resFlowPerHead / maxCoverage;          // equivalent density for branch geometry
      designArea = effDesignArea;
      overageFactor = 1;                               // demand is specified directly, no overflow
      hoseGpm = (hoseOverride == null) ? hazard.hoseGpm : hoseOverride;
      basisText = "(" + resHeads + ") residential heads @ " + resFlowPerHead + " gpm";
      basisSub = "K=" + resK + " — " + resHeads + " most-remote heads";
    } else if (basisType === "esfr") {
      esfrHeads = num(inputs.esfrHeads) || hazard.heads;
      esfrK = num(inputs.esfrK) || hazard.kFactor;
      esfrPsi = num(inputs.esfrPsi) || hazard.psi;
      headFlow = esfrK * Math.sqrt(esfrPsi);
      sprinklerBaseGpm = esfrHeads * headFlow;
      headPressure = esfrPsi;
      headK = esfrK;
      effDesignArea = esfrHeads * maxCoverage;
      density = headFlow / maxCoverage;
      designArea = effDesignArea;
      overageFactor = 1;
      hoseGpm = (hoseOverride == null) ? hazard.hoseGpm : hoseOverride;
      basisText = "(" + esfrHeads + ") ESFR heads, K" + esfrK + " @ " + esfrPsi + " psi";
      basisSub = headFlow.toFixed(0) + " gpm/head — storage ESFR/FM";
    } else {
      // "da" (occupancy preset) or "da-custom" (storage — user enters density + area + K).
      if (basisType === "da-custom") {
        density = num(inputs.densityGpm) || hazard.density;
        designArea = num(inputs.designAreaFt2) || hazard.designArea;
      } else {
        density = hazard.density;
        designArea = hazard.designArea;
      }
      sprinklerBaseGpm = density * designArea;
      headFlow = density * maxCoverage;
      autoKVal = autoKFactor(headFlow);                 // K closest to a ~7 psi starting head
      if (basisType === "da-custom") {
        headK = num(inputs.daK) || hazard.kFactor;       // storage DA: K is part of the criteria
      } else {
        // occupancy: explicit override > auto-select (opt-in) > legacy fixed K (default 5.6)
        var kOverride = num(inputs.kFactorOverride);
        if (kOverride && kOverride > 0) { headK = kOverride; kIsAuto = false; }
        else if (inputs.autoSelectK) { headK = autoKVal; kIsAuto = true; }
        else { headK = K; kIsAuto = false; }
      }
      headPressure = Math.pow(headFlow / headK, 2);
      effDesignArea = designArea;
      overageFactor = OVERAGE[systemType];
      hoseGpm = (hoseOverride == null) ? hazard.hoseGpm : hoseOverride;
      basisText = density.toFixed(2) + " gpm/ft² over " + designArea.toLocaleString() + " ft²";
      basisSub = hazard.ref;
    }
    var physicalGpm = sprinklerBaseGpm * overageFactor;                 // estimated real demand
    var sprinklerDesignGpm = physicalGpm * (1 + gpmMargin / 100);       // + safety cushion

    // 4) Elevation loss over building height.
    var elevPsi = elevationLoss(H);

    // --- system geometry --------------------------------------------------------
    //  orientation = which building dimension the main(s) run along; branches run the
    //  perpendicular dimension. Friction coefficients are calibrated to reference
    //  hydraulic results for OH2 (see docs/prelim-calc-grid-plan.md).
    var mainRunDim = (orientation === "length") ? L : W;
    var branchRunDim = (orientation === "length") ? W : L;
    var mainLen = mainRunDim + 0.5 * branchRunDim;   // riser -> center -> along the main

    //  Branch lines run the full perpendicular building dimension as dead-ends (tree)
    //  or between the two mains (grid). The flowing portion is the design-area span
    //  (1.2*sqrt(area)); beyond that the branch dead-runs the cumulative flow back to
    //  the main — which is why mains on the short side (long branches) lose far more.
    var designAreaBranchLen = 1.2 * Math.sqrt(effDesignArea);
    var flowSpan = Math.min(branchRunDim, designAreaBranchLen);
    var branchFlowGpm = Math.min(density * flowSpan * hazard.branchSpacingFt, physicalGpm);
    var branchLen = Math.max(designAreaBranchLen, branchRunDim);
    // Number of branch lines feeding the design area (= design-area width along the main /
    // branch spacing). The demand is split across them, so each line carries demand / count.
    var branchCount = Math.max(1, Math.round(physicalGpm / Math.max(branchFlowGpm, 1)));

    // 5) Main friction. Tree = single main; grid = primary + secondary mains in parallel
    //    (both-end feed shares the flow, lowering loss; secondary size matters). Raw
    //    full-flow loss is scaled by MAIN_TAPER for distributed branch takeoffs.
    var mainRawPsi = (systemType === "grid")
      ? parallelMainLoss(physicalGpm, mainId, secondaryId, C, mainLen)
      : hazenWilliamsLoss(physicalGpm, C, mainId, mainLen);
    var mainPsi = mainRawPsi * MAIN_TAPER;
    var mainVel = velocityFps(physicalGpm, mainId);
    if (mainVel > 30) warnings.push("Primary main velocity is high (" + mainVel.toFixed(0) + " ft/s) for " + primaryNominal + " in. — main friction is a conservative upper bound for this flow.");

    // 6) Branch friction along the path to the MOST REMOTE area. The demand is split across
    //    `branchCount` branch lines, so each line carries branchFlowGpm = demand / count.
    //    That per-line flow runs the branch length out to the remote area. Tree branches are
    //    dead-end; grid branches are fed from both cross mains (GRID_BRANCH_FACTOR), which
    //    reduces—but does not eliminate—the loss, since the most-remote run still reaches the
    //    far/supply main. Scales with the run length (a deeper building = a more remote area).
    var branchRawPsi = hazenWilliamsLoss(branchFlowGpm, C, branchId, branchLen);
    var branchPsi = branchRawPsi * BRANCH_TAPER * (systemType === "grid" ? GRID_BRANCH_FACTOR : 1);
    var branchVel = velocityFps(branchFlowGpm, branchId);
    if (branchVel > 30) warnings.push("Branch velocity is high (" + branchVel.toFixed(0) + " ft/s) for " + inputs.branchNominal + " in. — branch friction is a conservative upper bound for this flow.");

    // 7) Backflow loss at the estimated demand flow.
    var bf = null, backflowPsi = 0;
    if (inputs.backflowType && inputs.backflowType !== "none") {
      var bfSize = num(inputs.backflowSizeIn);
      if (bfSize == null) bfSize = num(primaryNominal); // fall back to main size
      bf = backflowLoss(inputs.backflowType, bfSize, physicalGpm);
      if (bf) {
        backflowPsi = bf.psi || 0;
        if (bf.note) warnings.push(bf.note);
      }
    }

    // 7b) Riser friction: vertical run of the primary main carrying the full system
    //     flow up to the sprinklers (length = building height). This is friction loss,
    //     in addition to the static elevation loss counted above.
    var riserPsi = hazenWilliamsLoss(physicalGpm, C, mainId, H);

    // 7c) Underground supply lateral (optional): ductile iron, C = 140, over its length,
    //     carrying the full system flow from the source to the building.
    var ugId = actualIdUnderground(inputs.undergroundNominal);
    var ugLen = parseFeetInches(inputs.undergroundLengthFt);
    var undergroundPsi = 0, hasUnderground = false;
    if (ugId && ugLen != null && ugLen > 0) {
      undergroundPsi = hazenWilliamsLoss(physicalGpm, DEFAULT_C_UNDERGROUND, ugId, ugLen);
      hasUnderground = true;
    }

    // 8) Total pressure: estimated (physical) then + PSI safety margin.
    var totalPsiPre = headPressure + elevPsi + mainPsi + branchPsi + riserPsi + backflowPsi + undergroundPsi;
    var totalPsi = totalPsiPre * (1 + psiMargin / 100);

    // 9) Rough take-off quantities (for the Bid Estimator hand-off). Whole-building
    //    coverage, not the design area. Heads = area / coverage. Branch pipe ~ area /
    //    spacing (heads on a grid, branch lines one spacing apart); mains add the feed
    //    run (one tree main, or two grid cross mains).
    var buildingArea = L * W;
    var sprinklerCount = Math.ceil(buildingArea / maxCoverage);
    var estBranchPipeFt = buildingArea / hazard.branchSpacingFt;
    var estMainPipeFt = (systemType === "grid") ? (2 * mainRunDim + 0.5 * branchRunDim) : mainLen;
    var estPipeLengthFt = estBranchPipeFt + estMainPipeFt;

    var result = {
      errors: [],
      warnings: warnings,
      hazard: hazard,
      systemType: systemType,
      orientation: orientation,
      inputs: { lengthFt: L, widthFt: W, heightFt: H, cFactor: C, kFactor: K,
        systemType: systemType, mainOrientation: orientation,
        mainNominal: primaryNominal,
        secondaryNominal: (systemType === "grid" ? secondaryNominal : null),
        branchNominal: inputs.branchNominal,
        mainId: mainId, secondaryId: secondaryId, branchId: branchId,
        gpmMarginPct: gpmMargin, psiMarginPct: psiMargin },
      areaFt2: L * W,
      basisType: basisType,
      basisText: basisText,
      basisSub: basisSub,
      density: density,
      designArea: designArea,
      headKFactor: headK,
      autoKFactor: autoKVal,
      kFactorIsAuto: kIsAuto,
      residential: (basisType === "residential") ? { heads: resHeads, kFactor: resK, flowPerHead: resFlowPerHead } : null,
      esfr: (basisType === "esfr") ? { heads: esfrHeads, kFactor: esfrK, psi: esfrPsi, gpmPerHead: headFlow } : null,
      // flows
      sprinklerBaseGpm: sprinklerBaseGpm,
      overageFactor: overageFactor,
      physicalGpm: physicalGpm,
      sprinklerDesignGpm: sprinklerDesignGpm,
      hoseGpm: hoseGpm,
      branchFlowGpm: branchFlowGpm,
      branchCount: branchCount,
      branchLengthFt: branchLen,
      mainLengthFt: mainLen,
      mainVelocityFps: mainVel,
      branchVelocityFps: branchVel,
      totalGpm: sprinklerDesignGpm,           // demand-point flow (excl. outside hose)
      totalGpmWithHose: sprinklerDesignGpm + hoseGpm,
      // pressure components
      headPressurePsi: headPressure,
      maxCoverageFt2: maxCoverage,
      elevationPsi: elevPsi,
      mainFrictionPsi: mainPsi,
      branchFrictionPsi: branchPsi,
      riserFrictionPsi: riserPsi,
      riserLengthFt: H,
      backflowPsi: backflowPsi,
      backflow: bf,
      // underground supply lateral (ductile iron, C=140)
      hasUnderground: hasUnderground,
      undergroundFrictionPsi: undergroundPsi,
      undergroundNominal: hasUnderground ? String(inputs.undergroundNominal) : null,
      undergroundId: hasUnderground ? ugId : null,
      undergroundLengthFt: hasUnderground ? ugLen : null,
      undergroundCFactor: DEFAULT_C_UNDERGROUND,
      totalPsiPreMargin: totalPsiPre,
      totalPsi: totalPsi,
      durationMin: hazard.durationMin,
      // rough take-off quantities
      sprinklerCount: sprinklerCount,
      estBranchPipeFt: estBranchPipeFt,
      estMainPipeFt: estMainPipeFt,
      estPipeLengthFt: estPipeLengthFt
    };

    // 9) Water supply adequacy + preliminary fire pump (optional).
    if (inputs.supply) {
      var ps = num(inputs.supply.static), pr = num(inputs.supply.residual), q1 = num(inputs.supply.flow);
      if (ps == null || pr == null || q1 == null) {
        result.supply = { provided: false, error: "Enter static, residual, and test flow to check the supply." };
      } else if (!(ps > pr) || !(q1 > 0)) {
        result.supply = { provided: false, error: "Static must exceed residual and test flow must be > 0." };
      } else {
        var qMax = flowAtPressure(0, ps, pr, q1);
        var demandFlow = result.totalGpmWithHose;            // include hose against the supply
        var availP = demandFlow <= qMax ? pressureAtFlow(demandFlow, ps, pr, q1) : 0;
        var adequate = demandFlow <= qMax && availP >= totalPsi;
        var s = {
          provided: true, static: ps, residual: pr, testFlow: q1, qMax: qMax,
          demandFlow: demandFlow, availablePsi: availP, requiredPsi: totalPsi,
          adequate: adequate, marginPsi: availP - totalPsi
        };
        if (!adequate) {
          // Preliminary fire pump recommendation.
          s.pump = {
            flowGpm: demandFlow,
            boostPsi: Math.max(0, totalPsi - availP),
            note: "Preliminary recommendation only — not a final engineered pump selection."
          };
        }
        result.supply = s;
      }
    }

    return result;
  }

  function num(v) {
    if (v === "" || v == null) return null;
    var n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  // Sum an inch token that may carry a fraction: "6", "6.5", "6 1/2", "1/2".
  function inchToken(s) {
    var total = 0, parts = String(s).trim().split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p) continue;
      if (p.indexOf("/") !== -1) {
        var fr = p.split("/"), a = parseFloat(fr[0]), b = parseFloat(fr[1]);
        if (Number.isFinite(a) && Number.isFinite(b) && b !== 0) total += a / b;
      } else {
        var v = parseFloat(p);
        if (Number.isFinite(v)) total += v;
      }
    }
    return total;
  }

  // Parse a length in feet that may be entered as decimal feet ("16", "16.5"),
  // feet-inches ("16-6" = 16'-6", "200-6 1/2"), or with ft/in marks ("16' 6\"").
  // Returns decimal feet, or null when blank/unparseable. Mirrors the spacing
  // calculator's parseSpacingDimension so the apps behave identically.
  function parseFeetInches(value) {
    if (value == null) return null;
    var text = String(value).trim().toLowerCase();
    if (!text) return null;
    // feet-inches via dash, e.g. "16-6" — only when there are no unit letters
    if (text.indexOf("-") !== -1 && !/[a-z]/.test(text.replace(/\./g, ""))) {
      var idx = text.indexOf("-");
      var feet = parseFloat(text.slice(0, idx));
      var inches = inchToken(text.slice(idx + 1));
      if (!Number.isFinite(feet)) return null;
      return feet + (Number.isFinite(inches) ? inches : 0) / 12;
    }
    // explicit ft / in marks
    var fm = text.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|')/);
    var im = text.match(/(\d+(?:\.\d+)?)\s*(?:in|inches|")/);
    if (fm || im) {
      return (fm ? parseFloat(fm[1]) : 0) + (im ? parseFloat(im[1]) : 0) / 12;
    }
    var n = parseFloat(text);
    return Number.isFinite(n) ? n : null;
  }

  var PrelimCalc = {
    HAZARDS: HAZARDS, hazardById: hazardById,
    PIPE_ID_SCH40: PIPE_ID_SCH40, actualIdForNominal: actualIdForNominal,
    PIPE_ID_DUCTILE: PIPE_ID_DUCTILE, UNDERGROUND_SIZES: UNDERGROUND_SIZES,
    DEFAULT_C_UNDERGROUND: DEFAULT_C_UNDERGROUND, actualIdUnderground: actualIdUnderground,
    PIPE_ORDER: PIPE_ORDER, twoSizesBelow: twoSizesBelow,
    OVERAGE: OVERAGE, MAIN_TAPER: MAIN_TAPER, BRANCH_TAPER: BRANCH_TAPER, GRID_BRANCH_FACTOR: GRID_BRANCH_FACTOR,
    DEFAULT_C: DEFAULT_C, DEFAULT_K: DEFAULT_K, ELEV_PSI_PER_FT: ELEV_PSI_PER_FT,
    hazenWilliamsPsiPerFt: hazenWilliamsPsiPerFt, hazenWilliamsLoss: hazenWilliamsLoss,
    elevationLoss: elevationLoss, velocityFps: velocityFps, parallelMainLoss: parallelMainLoss,
    BACKFLOW: BACKFLOW, BACKFLOW_TYPES: BACKFLOW_TYPES,
    backflowModelFor: backflowModelFor, backflowSizesFor: backflowSizesFor,
    nearestSize: nearestSize, interpCurve: interpCurve, backflowLoss: backflowLoss,
    pressureAtFlow: pressureAtFlow, flowAtPressure: flowAtPressure,
    parseFeetInches: parseFeetInches,
    autoKFactor: autoKFactor, STANDARD_K: STANDARD_K,
    calculate: calculate
  };

  global.PrelimCalc = PrelimCalc;
  if (typeof module !== "undefined" && module.exports) module.exports = PrelimCalc;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
