/* Preliminary Calculation — desktop-native UI controller.
 * Self-contained: drives the [data-tool-panel="prelim"] panel using the shared
 * engine (window.PrelimCalc from pwa/tools/prelim-calc-engine.js). No app.js coupling;
 * tab activation is handled generically by app.js via data-tool-tab/data-tool-panel.
 */
(function () {
  "use strict";
  function boot() {
    var P = window.PrelimCalc;
    var panel = document.querySelector('[data-tool-panel="prelim"]');
    if (!P || !panel) return;
    var lastResult = null;

    // Map prelim hazard ids to the Bid Estimator's occupancy buckets.
    var OCC_MAP = { light: "light", oh1: "ordinary", oh2: "ordinary", eh1: "extra", eh2: "extra" };

    var PIPE_SIZES = [
      ["1", '1"'], ["1.25", '1-1/4"'], ["1.5", '1-1/2"'], ["2", '2"'], ["2.5", '2-1/2"'],
      ["3", '3"'], ["4", '4"'], ["6", '6"'], ["8", '8"'], ["10", '10"']
    ];
    var PIPE_ORDER = PIPE_SIZES.map(function (p) { return p[0]; });
    function twoSizesBelow(nominal) {
      var i = PIPE_ORDER.indexOf(String(nominal));
      return i < 0 ? null : PIPE_ORDER[Math.max(0, i - 2)];
    }
    function sizeLabel(v) {
      for (var i = 0; i < PIPE_SIZES.length; i++) if (PIPE_SIZES[i][0] === String(v)) return PIPE_SIZES[i][1];
      return v + '"';
    }
    function fmt(n, d) { return Number(n).toLocaleString(undefined, { maximumFractionDigits: d == null ? 0 : d }); }
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    function radio(name) { var n = panel.querySelector('input[name="' + name + '"]:checked'); return n ? n.value : null; }

    // ---- populate selects ----
    var hz = el("prelimHazard");
    P.HAZARDS.forEach(function (h) { hz.add(new Option(h.label, h.id)); });
    hz.value = "oh2";

    // Show the input group for the selected design basis (residential / storage-DA / ESFR)
    // and the "open Storage Analysis" hint for the storage bases.
    function showBasisGroups() {
      var t = (P.hazardById(val("prelimHazard")) || {}).type || "da";
      el("prelimGrpRes").hidden = t !== "residential";
      el("prelimGrpSda").hidden = t !== "da-custom";
      el("prelimGrpEsfr").hidden = t !== "esfr";
      el("prelimStorageHint").hidden = (t !== "da-custom" && t !== "esfr");
    }
    [["prelimMainPipe", "4"], ["prelimSecondaryPipe", "2.5"], ["prelimBranchPipe", "1.25"],
     ["prelimOptMain", "4"], ["prelimOptSec", "2.5"], ["prelimOptBranch", "1.25"]].forEach(function (pair) {
      var s = el(pair[0]); if (!s) return;
      PIPE_SIZES.forEach(function (p) { s.add(new Option(p[1], p[0])); });
      s.value = pair[1];
    });
    var ug = el("prelimUgPipe");
    if (ug) {
      ug.add(new Option("— none —", ""));
      (P.UNDERGROUND_SIZES || ["4", "6", "8", "10", "12"]).forEach(function (s) { ug.add(new Option(sizeLabel(s), String(s))); });
      ug.value = "";
    }
    var bt = el("prelimBfType");
    P.BACKFLOW_TYPES.forEach(function (t) { bt.add(new Option(t.label, t.id)); });
    bt.value = "none";

    function refreshBackflowSizes() {
      var type = val("prelimBfType");
      var wrap = el("prelimBfSizeWrap"), sel = el("prelimBfSize");
      if (type === "none") { wrap.style.display = "none"; return; }
      wrap.style.display = "";
      var prev = sel.value;
      sel.innerHTML = "";
      P.backflowSizesFor(type).forEach(function (s) { sel.add(new Option(sizeLabel(s), String(s))); });
      var target = prev || val("prelimMainPipe");
      if ([].some.call(sel.options, function (o) { return o.value === target; })) sel.value = target;
    }

    function syncSystemFields() {
      var grid = radio("prelimSysType") === "grid";
      el("prelimSecondaryWrap").style.display = grid ? "" : "none";
      var pg = el("prelimPipingGrid");
      if (pg) pg.classList.toggle("prelim-piping-2col", !grid);
    }

    function gatherInputs() {
      var supply = null;
      if (val("prelimStatic") !== "" || val("prelimResidual") !== "" || val("prelimSupplyFlow") !== "") {
        supply = { static: val("prelimStatic"), residual: val("prelimResidual"), flow: val("prelimSupplyFlow") };
      }
      return {
        lengthFt: val("prelimLen"), widthFt: val("prelimWid"), heightFt: val("prelimHgt"),
        hazardId: val("prelimHazard"),
        resHeads: val("prelimResHeads"), resK: val("prelimResK"), resFlowPerHead: val("prelimResFlow"),
        densityGpm: val("prelimDaDensity"), designAreaFt2: val("prelimDaArea"), daK: val("prelimDaK"),
        esfrHeads: val("prelimEsfrHeads"), esfrK: val("prelimEsfrK"), esfrPsi: val("prelimEsfrPsi"),
        systemType: radio("prelimSysType"), mainOrientation: radio("prelimOrient"),
        mainNominal: val("prelimMainPipe"),
        secondaryNominal: radio("prelimSysType") === "grid" ? val("prelimSecondaryPipe") : null,
        branchNominal: val("prelimBranchPipe"),
        undergroundNominal: val("prelimUgPipe"),
        undergroundLengthFt: val("prelimUgLength"),
        cFactor: val("prelimCFactor"),
        autoSelectK: true,
        kFactorOverride: el("prelimKFactor").dataset.touched ? val("prelimKFactor") : null,
        backflowType: val("prelimBfType"),
        backflowSizeIn: el("prelimBfSizeWrap").style.display === "none" ? null : val("prelimBfSize"),
        gpmMarginPct: val("prelimGpmMargin"), psiMarginPct: val("prelimPsiMargin"),
        supply: supply
      };
    }

    function brow(label, value, sub) {
      return '<div class="prelim-row"><span class="prelim-row-l">' + label +
        (sub ? '<span class="prelim-row-sub">' + sub + '</span>' : '') +
        '</span><span class="prelim-row-v">' + value + '</span></div>';
    }

    function themeColor(name, fallback) {
      var v = getComputedStyle(panel).getPropertyValue(name);
      return (v && v.trim()) || fallback;
    }

    function render() {
      syncSystemFields();
      var r = P.calculate(gatherInputs());
      var summary = el("prelimSummary"), breakdown = el("prelimBreakdown");
      if (r.errors && r.errors.length) {
        lastResult = null; updateExportButton();
        summary.textContent = r.errors[0];
        breakdown.innerHTML = "";
        el("prelimWarn").hidden = true; el("prelimSrc").textContent = "";
        el("prelimSupplyStatus").hidden = true; el("prelimChart").setAttribute("hidden", "");
        return;
      }
      lastResult = r; updateExportButton();
      summary.innerHTML = "This <strong>" + fmt(r.areaFt2) + " sq ft</strong>, <strong>" + fmt(r.inputs.heightFt) +
        " ft tall</strong> " + r.hazard.label + " building (" + r.systemType + " system) is estimated to require <strong>" +
        fmt(r.totalPsi) + " PSI</strong> available while flowing <strong>" + fmt(r.totalGpm) +
        " GPM</strong>, plus <strong>" + fmt(r.hoseGpm) + " GPM</strong> hose stream allowance." +
        '<span class="prelim-takeoff">Rough take-off: ~<strong>' + fmt(r.sprinklerCount) + "</strong> sprinklers and ~<strong>" +
        fmt(r.estPipeLengthFt) + "</strong> ft of pipe.</span>";

      var b = "";
      b += brow("Design basis", r.basisText, r.basisSub);
      b += brow("Sprinkler demand (theoretical min)", fmt(r.sprinklerBaseGpm) + " gpm", "density × design area");
      b += brow("Estimated demand (overflow ×" + r.overageFactor.toFixed(2) + ")", fmt(r.physicalGpm) + " gpm", r.systemType + " system");
      b += brow("Design flow (+" + r.inputs.gpmMarginPct + "% margin)", fmt(r.sprinklerDesignGpm) + " gpm");
      b += brow("Hose stream allowance", fmt(r.hoseGpm) + " gpm", "duration " + r.durationMin + " min");
      b += brow("Start sprinkler pressure", r.headPressurePsi.toFixed(1) + " psi", "K=" + r.headKFactor + ", max " + r.maxCoverageFt2 + " ft²/head (worst case)");
      b += brow("Elevation loss", r.elevationPsi.toFixed(1) + " psi", fmt(r.inputs.heightFt) + " ft × 0.433");
      var mainDesc = (r.systemType === "grid" ? "Primary " + sizeLabel(r.inputs.mainNominal) + " + secondary " + sizeLabel(r.inputs.secondaryNominal) : sizeLabel(r.inputs.mainNominal)) +
        " × " + fmt(r.mainLengthFt) + " ft";
      b += brow("Main friction (Hazen-Williams)", r.mainFrictionPsi.toFixed(1) + " psi", mainDesc);
      b += brow("Branch friction (Hazen-Williams)", r.branchFrictionPsi.toFixed(1) + " psi", sizeLabel(r.inputs.branchNominal) + " × " + fmt(r.branchLengthFt) + " ft @ " + fmt(r.branchFlowGpm) + " gpm/line, " + r.branchCount + " head lines" + (r.systemType === "grid" ? " — conservative; a grid disperses flow through all lines (see network solve below)" : ""));
      b += brow("Riser friction (vertical)", r.riserFrictionPsi.toFixed(1) + " psi", sizeLabel(r.inputs.mainNominal) + " × " + fmt(r.riserLengthFt) + " ft (building height)");
      if (r.hasUnderground) b += brow("Underground friction", r.undergroundFrictionPsi.toFixed(1) + " psi", sizeLabel(r.undergroundNominal) + " DI (C=" + r.undergroundCFactor + ") × " + fmt(r.undergroundLengthFt) + " ft");
      if (r.backflow) b += brow("Backflow loss", r.backflowPsi.toFixed(1) + " psi", r.backflow.label + " @ " + r.backflow.sizeUsed + '"');
      b += '<div class="prelim-row total">' + '<span class="prelim-row-l">Total pressure required<span class="prelim-row-sub">incl. +' + r.inputs.psiMarginPct + "% margin (before: " + r.totalPsiPreMargin.toFixed(1) + ' psi)</span></span><span class="prelim-row-v">' + fmt(r.totalPsi) + " psi</span></div>";
      b += '<div class="prelim-row total">' + '<span class="prelim-row-l">Total flow required<span class="prelim-row-sub">+ ' + fmt(r.hoseGpm) + " gpm hose = " + fmt(r.totalGpmWithHose) + ' gpm</span></span><span class="prelim-row-v">' + fmt(r.totalGpm) + " gpm</span></div>";
      breakdown.innerHTML = b;

      var warn = el("prelimWarn");
      if (r.warnings && r.warnings.length) { warn.hidden = false; warn.textContent = "⚠ " + r.warnings.join(" "); }
      else warn.hidden = true;

      el("prelimSrc").textContent = "Density/area & hose: NFPA 13 (2025) Tables 19.2.3.1.1 / 19.2.3.1.2." +
        (r.backflow ? "  Backflow: " + r.backflow.label + " — " + r.backflow.source + " (chart-derived, " + r.backflow.confidence + ")." : "");

      renderSupply(r);

      // K-factor field: auto-selected & editable for occupancy (da); locked for the bases whose
      // K is set in the design-basis step (ESFR / residential / storage density-area).
      var kf = el("prelimKFactor");
      if (r.basisType === "da") {
        kf.readOnly = false; kf.classList.remove("prelim-locked");
        if (!kf.dataset.touched) kf.value = r.autoKFactor;
        el("prelimKFactorLbl").textContent = "Sprinkler K-factor" + (r.kFactorIsAuto ? " (auto)" : " (override)");
        el("prelimKFactorHint").textContent = "K auto-selected for a ~7 psi starting head" + (r.kFactorIsAuto ? " (now K" + r.autoKFactor + ", head " + r.headPressurePsi.toFixed(1) + " psi)" : "") + ". Edit to override; clear to re-auto.";
      } else {
        kf.readOnly = true; kf.classList.add("prelim-locked"); kf.dataset.touched = "";
        kf.value = r.headKFactor;
        el("prelimKFactorLbl").textContent = "Sprinkler K-factor (locked)";
        el("prelimKFactorHint").textContent = "K = " + r.headKFactor + ", set in the design-basis step — not editable here.";
      }

      var canSolve = r.density > 0 && r.designArea > 0 && r.headKFactor > 0 && window.HydroGrid;
      el("prelimNetWrap").hidden = !canSolve;
      el("prelimNetResult").hidden = true;
      clearTimeout(netTimer);
      if (canSolve) netTimer = setTimeout(runNetworkSolve, 350);
      syncSizingEditor();
    }
    var netTimer = null;

    function numv(id) { var v = parseFloat(val(id)); return isFinite(v) ? v : null; }

    function syncSizingEditor() {
      if (!el("prelimOptMain")) return;
      el("prelimOptMain").value = val("prelimMainPipe");
      el("prelimOptBranch").value = val("prelimBranchPipe");
      var grid = radio("prelimSysType") === "grid";
      el("prelimOptSecWrap").style.display = grid ? "" : "none";
      if (grid) el("prelimOptSec").value = val("prelimSecondaryPipe");
    }

    // Smallest main + branch that still meets the entered supply.
    function optimizeSizing() {
      var msg = el("prelimOptMsg");
      var ss = numv("prelimStatic"), sr = numv("prelimResidual"), sf = numv("prelimSupplyFlow");
      if (!(ss != null && sr != null && sf != null && ss > sr && sf > 0)) {
        msg.className = "prelim-optmsg bad"; msg.textContent = "Enter a water supply (static, residual, flow) first — optimization needs something to size against."; return;
      }
      msg.className = "prelim-optmsg"; msg.textContent = "Optimizing…";
      var orig = { main: val("prelimMainPipe"), branch: val("prelimBranchPipe"), sec: val("prelimSecondaryPipe") };
      // Priority: SMALLEST main first (the secondary tracks it two sizes down), then the smallest
      // branch — but keep branch lines ≤ 2" if possible (step past 2" only when nothing else passes).
      var mains = ["2", "2.5", "3", "4", "6", "8", "10"];
      var smallBranch = ["1", "1.25", "1.5", "2"], bigBranch = ["2.5", "3", "4"];
      setTimeout(function () {
        var grid = radio("prelimSysType") === "grid";
        function tryCombo(main, branch) {
          el("prelimMainPipe").value = main; el("prelimBranchPipe").value = branch;
          if (grid) el("prelimSecondaryPipe").value = P.twoSizesBelow(main) || main;
          var r = P.calculate(gatherInputs());
          if (r.errors && r.errors.length) return null;
          var reqP = null, avail = null, pass = false;
          if (window.HydroGrid && r.density > 0 && r.designArea > 0 && r.headKFactor > 0) {
            var out = window.HydroGrid.analyze(solverInputsFrom(r));
            if (out && out.converged && out.availablePressure != null) { reqP = out.requiredTotal; avail = out.availablePressure; pass = out.safetyMargin >= 0; }
          }
          if (reqP == null && r.supply && r.supply.provided && r.supply.available != null) { reqP = r.totalPsi; avail = r.supply.available; pass = avail >= reqP; }
          return pass ? { reqP: reqP, avail: avail } : null;
        }
        var best = null, overBranch = false;
        for (var attempt = 0; attempt < 2 && !best; attempt++) {
          var pool = attempt === 0 ? smallBranch : smallBranch.concat(bigBranch);
          for (var mi = 0; mi < mains.length && !best; mi++) {
            for (var bi = 0; bi < pool.length; bi++) {
              var res = tryCombo(mains[mi], pool[bi]);
              if (res) { best = { main: mains[mi], branch: pool[bi], reqP: res.reqP, avail: res.avail }; overBranch = attempt === 1; break; }
            }
          }
        }
        if (best) {
          el("prelimMainPipe").value = best.main; el("prelimBranchPipe").value = best.branch;
          if (grid) el("prelimSecondaryPipe").value = P.twoSizesBelow(best.main) || best.main;
          syncSizingEditor(); render();
          msg.className = "prelim-optmsg ok";
          msg.textContent = "Smallest main that passes: " + sizeLabel(best.main) + (grid ? " / secondary " + sizeLabel(val("prelimSecondaryPipe")) : "") + ", branch " + sizeLabel(best.branch) + (overBranch ? " (a branch over 2\" was needed)" : "") + " — required " + best.reqP.toFixed(1) + " psi vs " + best.avail.toFixed(1) + " psi available.";
        } else {
          el("prelimMainPipe").value = orig.main; el("prelimBranchPipe").value = orig.branch; el("prelimSecondaryPipe").value = orig.sec;
          syncSizingEditor(); render();
          msg.className = "prelim-optmsg bad"; msg.textContent = "Even at the largest pipe sizes the supply can't meet the demand — a fire pump is likely required.";
        }
      }, 30);
    }

    function numv(id) { var v = parseFloat(val(id)); return isFinite(v) ? v : null; }

    function solverInputsFrom(r) {
      var inp = {
        lengthFt: r.inputs.lengthFt, widthFt: r.inputs.widthFt, heightFt: r.inputs.heightFt,
        systemType: r.systemType, mainOrientation: r.orientation,
        density: r.density, designAreaFt2: r.designArea, coverageFt2: r.maxCoverageFt2,
        kFactor: r.headKFactor, minHeadPressure: r.headPressurePsi,
        branchSpacingFt: r.hazard.branchSpacingFt,
        mainId: r.inputs.mainId, secondaryId: r.inputs.secondaryId, branchId: r.inputs.branchId, riserId: r.inputs.mainId,
        C: r.inputs.cFactor, hoseGpm: r.hoseGpm, includeFittings: true,
        fixedLossPsi: r.backflowPsi || 0, psiMarginPct: parseFloat(r.inputs.psiMarginPct) || 0
      };
      if (r.hasUnderground) { inp.hasUnderground = true; inp.undergroundId = r.undergroundId; inp.undergroundLengthFt = r.undergroundLengthFt; inp.undergroundC = r.undergroundCFactor; }
      var ss = numv("prelimStatic"), sr = numv("prelimResidual"), sf = numv("prelimSupplyFlow");
      if (ss != null && sr != null && sf != null && ss > sr && sf > 0) { inp.supplyStatic = ss; inp.supplyResidual = sr; inp.supplyTestFlow = sf; }
      return inp;
    }

    function runNetworkSolve() {
      if (!lastResult) return;
      var box = el("prelimNetResult"); box.hidden = false;
      box.innerHTML = '<p class="prelim-netnote">Solving…</p>';
      setTimeout(function () {
        var out;
        try { out = window.HydroGrid.analyze(solverInputsFrom(lastResult)); }
        catch (e) { box.innerHTML = '<p class="prelim-warn">Network solve failed: ' + (e && e.message ? e.message : e) + '</p>'; return; }
        renderNetwork(out, lastResult);
      }, 30);
    }

    function netCell(label, value, sub) {
      return '<div class="prelim-netcell"><span class="nl">' + label + '</span><span class="nv">' + value + '</span>' + (sub ? '<span class="ns">' + sub + '</span>' : '') + '</div>';
    }

    function renderNetwork(out, r) {
      var box = el("prelimNetResult"), m = out.meta, sol = out.solution;
      if (!out.converged) { box.innerHTML = '<p class="prelim-warn">⚠ The network solve did not converge (residual ' + (sol ? sol.maxResidual.toFixed(2) : "?") + ' gpm). Showing the parametric estimate only.</p>'; return; }
      var qs = Object.keys(sol.sprinklerFlows).map(function (k) { return sol.sprinklerFlows[k]; });
      var qMin = Math.min.apply(null, qs), qMax = Math.max.apply(null, qs);
      var remoteRung = out.anchorHead.replace(/^H(\d+).*/, "$1"), fromTop = 0, fromBot = 0;
      sol.pipeFlows.forEach(function (p) {
        if (p.id === "tieU" + remoteRung) fromTop = Math.abs(p.flow);
        if (p.id === "armBU" + remoteRung) fromBot = Math.abs(p.flow);
      });
      var dispersed = 0, returnLines = 0;
      sol.pipeFlows.forEach(function (p) { if (/^rung\d+$/.test(p.id)) { dispersed += Math.abs(p.flow); returnLines++; } });
      var headlineP = out.requiredTotal;
      var b = '<div class="prelim-netgrid">';
      b += netCell("Required pressure", headlineP.toFixed(1) + " psi", "solved " + out.sourcePressure.toFixed(1) + (out.fixedLossPsi ? " + " + out.fixedLossPsi.toFixed(1) + " backflow" : "") + (out.marginPct ? " + " + out.marginPct + "% margin" : ""));
      b += netCell("System demand", fmt(out.totalDemand) + " gpm", fmt(out.sprinklerDemand) + " sprinkler + " + fmt(out.hoseGpm) + " hose");
      b += netCell("Operating heads", m.operatingHeads + "", m.nOpBranches + " branch lines × " + m.kHeads + " heads");
      b += netCell("Head discharge", qMin.toFixed(1) + "–" + qMax.toFixed(1) + " gpm", "remote head at minimum; near heads over-discharge");
      if (m.grid && returnLines > 0) b += netCell("Flow dispersion", fmt(dispersed) + " gpm", "through " + returnLines + " non-operating lines (not just the " + m.nOpBranches + " with heads)");
      if (m.grid && (fromTop + fromBot) > 0) b += netCell("Remote branch feed", fromBot.toFixed(0) + " + " + fromTop.toFixed(0) + " gpm", "fed from BOTH cross mains");
      b += netCell("Network size", sol.pipeFlows.length + " pipes", out.iterations + " Newton iterations");
      b += '</div>';
      b += '<p class="prelim-netcompare">Quick parametric estimate: <strong>' + fmt(r.totalPsi) + ' psi</strong> (forces all flow through the ' + m.nOpBranches + ' head lines). Full network solve: <strong>' + headlineP.toFixed(1) + ' psi</strong> — the grid disperses ' + fmt(dispersed) + ' gpm through the other lines, so this is the realistic figure.</p>';
      if (out.availablePressure != null) {
        var ok = out.safetyMargin >= 0;
        b += '<p class="prelim-netsupply ' + (ok ? "ok" : "bad") + '">' + (ok ? "✓" : "✗") + ' Supply at ' + fmt(out.totalDemand) + ' gpm: <strong>' + out.availablePressure.toFixed(1) + ' psi</strong> available vs <strong>' + headlineP.toFixed(1) + ' psi</strong> required — margin <strong>' + (out.safetyMargin >= 0 ? "+" : "") + out.safetyMargin.toFixed(1) + ' psi</strong>.</p>';
      }
      box.innerHTML = b;
    }

    function renderSupply(r) {
      var st = el("prelimSupplyStatus"), chart = el("prelimChart"), empty = el("prelimSupplyEmpty");
      // NOTE: <svg> is an SVGElement and does NOT reflect the .hidden IDL property,
      // so toggle the hidden ATTRIBUTE explicitly (the app hides [hidden] with !important).
      function showEmpty() { if (empty) empty.hidden = false; chart.setAttribute("hidden", ""); }
      function showChart() { if (empty) empty.hidden = true; chart.removeAttribute("hidden"); }
      if (!r.supply) { st.hidden = true; showEmpty(); return; }
      st.hidden = false;
      if (!r.supply.provided) { st.className = "prelim-status idle"; st.textContent = r.supply.error; showEmpty(); return; }
      var s = r.supply;
      if (s.adequate) { st.className = "prelim-status ok"; st.textContent = "✓ Supply appears adequate — " + s.marginPsi.toFixed(1) + " psi to spare at " + fmt(s.demandFlow) + " gpm (incl. hose)."; }
      else { st.className = "prelim-status bad"; var m = "✗ Supply appears inadequate at " + fmt(s.demandFlow) + " gpm."; if (s.pump) m += " Preliminary fire pump: ~" + fmt(s.pump.flowGpm) + " gpm @ +" + fmt(s.pump.boostPsi) + " psi boost."; st.textContent = m; }
      showChart();
      chart.innerHTML = supplyChart(480, 240, s, r.totalGpm, r.totalPsi);
    }

    function supplyChart(W, H, s, demandGpm, demandPsi) {
      var padL = 46, padR = 16, padT = 14, padB = 30;
      var maxX = Math.max(s.qMax, s.demandFlow, s.testFlow) * 1.08;
      var maxY = Math.max(s.static, demandPsi) * 1.12;
      var X = function (q) { return padL + (q / maxX) * (W - padL - padR); };
      var Y = function (p) { return H - padB - (p / maxY) * (H - padT - padB); };
      var axis = themeColor("--line", "#2d3742"), text = themeColor("--muted", "#aab4bd");
      var curve = "#37b7e4", okc = "#1aa06a", badc = "#cf2f2f", stat = "#d98a10", test = "#e0461f";
      var c = s.adequate ? okc : badc;
      var out = "";
      out += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (H - padB) + '" stroke="' + axis + '" stroke-width="1.5"/>';
      out += '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="' + axis + '" stroke-width="1.5"/>';
      var pts = [], n = 60;
      for (var k = 0; k <= n; k++) { var q = maxX * k / n; var p = Math.max(0, P.pressureAtFlow(q, s.static, s.residual, s.testFlow)); pts.push(X(q).toFixed(1) + "," + Y(p).toFixed(1)); }
      out += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + curve + '" stroke-width="2.5"/>';
      var dot = function (q, p, col, rr) { return '<circle cx="' + X(q).toFixed(1) + '" cy="' + Y(p).toFixed(1) + '" r="' + (rr || 4.5) + '" fill="' + col + '"/>'; };
      var drop = function (q, p, col) { return '<line x1="' + X(q).toFixed(1) + '" y1="' + Y(p).toFixed(1) + '" x2="' + X(q).toFixed(1) + '" y2="' + (H - padB) + '" stroke="' + col + '" stroke-dasharray="3 3" opacity="0.55"/>'; };
      out += dot(0, s.static, stat) + dot(s.testFlow, s.residual, test);
      out += drop(s.demandFlow, demandPsi, c);
      if (s.demandFlow > demandGpm) {
        out += '<line x1="' + X(demandGpm).toFixed(1) + '" y1="' + Y(demandPsi).toFixed(1) + '" x2="' + X(s.demandFlow).toFixed(1) + '" y2="' + Y(demandPsi).toFixed(1) + '" stroke="' + text + '" stroke-width="2" stroke-dasharray="6 4"/>';
        out += dot(demandGpm, demandPsi, c, 3.6);
      }
      out += dot(s.demandFlow, demandPsi, c);
      out += '<text x="' + padL + '" y="' + (padT + 9) + '" fill="' + text + '" font-size="10">' + fmt(maxY) + ' psi</text>';
      out += '<text x="' + (W - padR) + '" y="' + (H - padB + 18) + '" fill="' + text + '" font-size="10" text-anchor="end">' + fmt(maxX) + ' gpm</text>';
      return out;
    }

    function reset() {
      ["prelimLen", "prelimWid", "prelimHgt", "prelimStatic", "prelimResidual", "prelimSupplyFlow"].forEach(function (id) { el(id).value = ""; });
      el("prelimHazard").value = "oh2";
      el("prelimMainPipe").value = "4"; el("prelimSecondaryPipe").value = "2.5"; el("prelimBranchPipe").value = "1.25";
      if (el("prelimUgPipe")) el("prelimUgPipe").value = ""; if (el("prelimUgLength")) el("prelimUgLength").value = "";
      el("prelimBfType").value = "none";
      el("prelimGpmMargin").value = "5"; el("prelimPsiMargin").value = "10";
      el("prelimCFactor").value = "120"; el("prelimKFactor").value = "5.6"; el("prelimKFactor").dataset.touched = "";
      var tree = panel.querySelector('input[name="prelimSysType"][value="tree"]'); if (tree) tree.checked = true;
      var len = panel.querySelector('input[name="prelimOrient"][value="length"]'); if (len) len.checked = true;
      el("prelimResHeads").value = "4"; el("prelimResFlow").value = "13"; el("prelimResK").value = "4.9";
      el("prelimDaDensity").value = "0.60"; el("prelimDaArea").value = "2000"; el("prelimDaK").value = "16.8";
      el("prelimEsfrHeads").value = "12"; el("prelimEsfrK").value = "22.4"; el("prelimEsfrPsi").value = "50";
      showBasisGroups();
      refreshBackflowSizes();
      render();
    }

    function updateExportButton() {
      var btn = el("prelimExportBidButton");
      if (btn) btn.disabled = !lastResult;
    }

    // Hand the take-off off to the Bid Estimator tab (same app; app.js globals are shared).
    function exportToBidEstimator() {
      var r = lastResult;
      if (!r) return;
      if (typeof state === "undefined" || typeof activateTool !== "function" || !state.estimator) {
        return; // estimator not available in this build
      }
      var est = state.estimator;
      var area = Math.round(r.areaFt2);
      var heads = r.sprinklerCount;
      var occ = OCC_MAP[r.hazard.id] || "ordinary";
      // PDF-intake summary fields
      est.bid.intake.squareFeet = String(area);
      est.bid.intake.buildingHeight = String(Math.round(r.inputs.heightFt));
      est.bid.intake.occupancy = r.hazard.label;
      // head-count estimator
      est.bid.headEst.sqft = area;
      est.bid.headEst.occupancy = occ;
      // first system section — carry both area and head count
      if (est.bid.sections && est.bid.sections[0]) {
        est.bid.sections[0].sqft = area;
        est.bid.sections[0].headCount = heads;
        est.bid.sections[0].name = r.hazard.label + " — " + r.systemType + " system";
      }
      // quick-estimate basis
      est.quick.sqft = area;
      est.quick.heads = heads;
      if (typeof renderEstimator === "function") renderEstimator();
      if (typeof saveState === "function") saveState();
      activateTool("estimator");
      if (typeof setEstimatorStatus === "function") {
        setEstimatorStatus("Imported from Preliminary Calculation: " + fmt(area) + " ft², " + fmt(heads) + " heads (" + r.hazard.label + ").", "info");
      }
    }

    // The K-factor override and the on-the-fly sizing selects are handled specially below;
    // exclude them from the generic render-on-change so render() can't clobber the typed value.
    var SKIP = { prelimKFactor: 1, prelimOptMain: 1, prelimOptSec: 1, prelimOptBranch: 1 };
    panel.querySelectorAll("input, select").forEach(function (n) {
      if (SKIP[n.id]) return;
      n.addEventListener("input", render);
      n.addEventListener("change", render);
    });
    el("prelimKFactor").addEventListener("input", function () { this.dataset.touched = this.value === "" ? "" : "1"; render(); });
    el("prelimOptMain").addEventListener("change", function () { el("prelimMainPipe").value = this.value; if (radio("prelimSysType") === "grid") el("prelimSecondaryPipe").value = P.twoSizesBelow(this.value) || el("prelimSecondaryPipe").value; render(); });
    el("prelimOptBranch").addEventListener("change", function () { el("prelimBranchPipe").value = this.value; render(); });
    el("prelimOptSec").addEventListener("change", function () { el("prelimSecondaryPipe").value = this.value; render(); });
    el("prelimOptimizeBtn").addEventListener("click", optimizeSizing);
    el("prelimBfType").addEventListener("change", function () { refreshBackflowSizes(); render(); });
    el("prelimHazard").addEventListener("change", function () { el("prelimKFactor").dataset.touched = ""; showBasisGroups(); render(); });
    if (el("prelimStorageLink")) el("prelimStorageLink").addEventListener("click", function () { if (typeof activateTool === "function") activateTool("storage"); });
    el("prelimClearButton").addEventListener("click", reset);
    var exportBtn = el("prelimExportBidButton");
    if (exportBtn) exportBtn.addEventListener("click", exportToBidEstimator);
    var netBtn = el("prelimNetButton");
    if (netBtn) netBtn.addEventListener("click", runNetworkSolve);

    refreshBackflowSizes();
    syncSystemFields();
    showBasisGroups();
    render();
    updateExportButton();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
