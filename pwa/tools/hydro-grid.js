/* ============================================================================
 * SprinkFlow — grid/tree network GENERATOR + analyzer
 * ----------------------------------------------------------------------------
 * Turns the preliminary-calc inputs (building L×W, density/area, K, spacings,
 * pipe sizes, supply) into an explicit node/pipe graph and solves it with the
 * Newton-Raphson engine in hydro-solver.js — a real network solve, not the
 * parametric one-pass estimate.
 *
 * Topology (mains run along M, branches span P; source at the (0,0) corner):
 *   - Bottom cross main  BM_0..BM_n  along M at the supply side (primary size)
 *   - Top cross main     TM_0..TM_n  along M (grid only; secondary size)
 *   - Rungs (branch lines) connect BM_i↔TM_i at each branch spacing
 *   - The remote design area = the block of operating sprinklers in the far
 *     corner; those rungs carry a chain of discharging head nodes, the rest are
 *     plain return-path pipes (the grid's parallel feed)
 *   - Riser lifts from grade (source, elev 0) to the ceiling mains (elev H)
 *
 * The most-remote head is found by re-anchoring until the P_min-anchored head
 * is the true hydraulic minimum (so every operating head meets its density).
 *
 * UMD global `HydroGrid`. Depends on `HydroSolver`.
 * ========================================================================== */
(function (global) {
  "use strict";
  var Solver = (typeof require !== "undefined") ? require("./hydro-solver.js") : global.HydroSolver;

  // NFPA 13 equivalent pipe length (ft, C=120) — interpolated by actual ID.
  var EQ_ELBOW = { 1: 2, 1.25: 3, 1.5: 4, 2: 5, 2.5: 6, 3: 7, 4: 10, 5: 12, 6: 14, 8: 18 };
  var EQ_TEE = { 1: 5, 1.25: 6, 1.5: 8, 2: 10, 2.5: 12, 3: 15, 4: 20, 5: 25, 6: 30, 8: 35 };
  // nominal size whose ID is closest (equivalent-length tables are by nominal size)
  var NOM_ID = { 1: 1.049, 1.25: 1.380, 1.5: 1.610, 2: 2.067, 2.5: 2.469, 3: 3.068, 4: 4.026, 5: 5.047, 6: 6.065, 8: 7.981 };
  function nominalFor(idInches) {
    var best = 2, bd = Infinity;
    for (var k in NOM_ID) { var diff = Math.abs(NOM_ID[k] - idInches); if (diff < bd) { bd = diff; best = +k; } }
    return best;
  }
  function eqLen(table, idInches) { return table[nominalFor(idInches)] || 0; }

  /* Build the network graph. Returns { nodes, pipes, sourceId, remoteId, Pmin, meta }. */
  function buildNetwork(inp) {
    var grid = inp.systemType === "grid";
    var L = inp.lengthFt, W = inp.widthFt, H = inp.heightFt || 0;
    var alongLength = inp.mainOrientation !== "width";
    var M = alongLength ? L : W;          // main direction
    var Pd = alongLength ? W : L;         // branch (perpendicular) direction
    var C = inp.C || 120;
    var fit = inp.includeFittings !== false;

    var Sb = inp.branchSpacingFt || 10;                       // branch line spacing (along M)
    var cover = inp.coverageFt2 || (Sb * Sb);
    var Sh = Math.max(4, cover / Sb);                         // head spacing (along branch)
    var nB = Math.max(1, Math.round(M / Sb));
    var nH = Math.max(1, Math.round(Pd / Sh));

    // operating (design) area in the far corner
    var nOp = Math.max(1, Math.ceil(inp.designAreaFt2 / cover));
    var span = 1.2 * Math.sqrt(inp.designAreaFt2);            // design-area width along the branch
    var kHeads = Math.min(nH, Math.max(1, Math.round(span / Sh)));
    var nOpBranches = Math.min(nB, Math.max(1, Math.ceil(nOp / kHeads)));

    var mainId = inp.mainId, secId = inp.secondaryId || inp.mainId, brId = inp.branchId;
    var riserId = inp.riserId || mainId;

    var nodes = [], pipes = [];
    function node(id, x, y, z, type, k) { nodes.push({ id: id, x: x, y: y, elev: z, type: type, k: k || 0 }); }
    function pipe(id, from, to, d, len, fitLen) { pipes.push({ id: id, from: from, to: to, C: C, d: d, length: len, fittingLength: fitLen || 0 }); }

    // source at grade + riser up to BM_0
    node("SRC", 0, 0, 0, "source");
    var riserBase = "SRC";
    if (inp.hasUnderground && inp.undergroundLengthFt > 0) {
      node("UG", -10, 0, 0, "junction");
      pipe("ug", "UG", "SRC", inp.undergroundId, inp.undergroundLengthFt, 0); // C handled below
      pipes[pipes.length - 1].C = inp.undergroundC || 140;
      // make UG the true source
      nodes[0].type = "junction"; nodes[2 - 1]; // SRC stays junction-like; mark UG source
      nodes.find(function (n) { return n.id === "UG"; }).type = "source";
      riserBase = "SRC";
    }

    // GRID: two cross mains at the perimeter (y=0 supply side, y=Pd), branches fed from BOTH.
    // TREE: one central feed main (y=Pd/2) with branch arms running BOTH directions, so the
    //       remote operating heads sit ~half the building depth from the main (the standard
    //       center-fed layout — an edge main with full-depth dead-end branches is unrealistic).
    var mainY = grid ? 0 : Pd / 2;
    var firstOp = nB - nOpBranches;          // operating branches are the farthest (highest index)
    var tie = 2;                             // tie-in nipple length to a cross main (ft)

    for (var i = 0; i < nB; i++) node("BM" + i, i * Sb, mainY, H, "junction");
    pipe("riser", riserBase, "BM0", riserId, H || 1, fit ? eqLen(EQ_ELBOW, riserId) : 0);
    for (i = 0; i < nB - 1; i++) pipe("bm" + i, "BM" + i, "BM" + (i + 1), mainId, Sb, 0);
    if (grid) {
      for (i = 0; i < nB; i++) node("TM" + i, i * Sb, Pd, H, "junction");
      for (i = 0; i < nB - 1; i++) pipe("tm" + i, "TM" + i, "TM" + (i + 1), secId, Sb, 0);
    }

    // Build the operating head chain on rung i, from the head nearest `nearY` outward to `farY`.
    // `farEnd` is either a cross-main node id (grid, both-end feed) or null (tree dead-end).
    function buildArm(i, farY, nearY, farEndId) {
      var dir = farY > nearY ? 1 : -1, prev = farEndId, tag = farY > nearY ? "U" : "D";
      var farHeadY = farY;                                   // most-remote head at the far tip
      for (var t = 0; t < kHeads; t++) {
        var yh = farHeadY - dir * t * Sh;
        var hid = "H" + i + tag + t;
        node(hid, i * Sb, yh, H, "sprinkler", inp.kFactor);
        if (prev === farEndId && farEndId != null) pipe("tie" + tag + i, hid, farEndId, brId, tie, fit ? eqLen(EQ_TEE, brId) : 0);
        else if (prev !== null) pipe("br" + tag + i + "_" + t, prev, hid, brId, Sh, fit ? eqLen(EQ_ELBOW, brId) * 0.25 : 0);
        prev = hid;
      }
      // run from the innermost operating head back to the main
      var innerY = farHeadY - dir * (kHeads - 1) * Sh;
      var run = Math.max(1, Math.abs(innerY - nearY) - (grid ? tie : 0));
      pipe("armB" + tag + i, prev, "BM" + i, brId, run, fit ? eqLen(EQ_TEE, brId) : 0);
    }

    for (i = 0; i < nB; i++) {
      if (i < firstOp) {
        // non-operating rung: a return-path pipe in a grid; nothing in a tree (no flow)
        if (grid) pipe("rung" + i, "BM" + i, "TM" + i, brId, Pd, fit ? 2 * eqLen(EQ_TEE, brId) : 0);
        continue;
      }
      if (grid) buildArm(i, Pd, 0, "TM" + i);                // bottom main → up to top main, heads at top
      else buildArm(i, Pd, Pd / 2, null);                    // central main → up the far arm, dead-end tip
    }

    // pick the geometrically most-remote head as the initial anchor
    var remote = null, best = -1;
    nodes.forEach(function (n) {
      if (n.type === "sprinkler") { var dd = n.x * n.x + n.y * n.y; if (dd > best) { best = dd; remote = n.id; } }
    });

    var source = nodes.find(function (n) { return n.type === "source"; }).id;
    return {
      nodes: nodes, pipes: pipes, sourceId: source, remoteId: remote, Pmin: inp.minHeadPressure,
      meta: { nB: nB, nH: nH, nOpBranches: nOpBranches, kHeads: kHeads, operatingHeads: nOpBranches * kHeads, Sb: Sb, Sh: Sh, M: M, Pd: Pd, grid: grid }
    };
  }

  /* Build + solve, re-anchoring so the P_min head is the true hydraulic minimum. */
  function analyze(inp) {
    var net = buildNetwork(inp);
    // continuity tolerance scaled to the system flow (an absolute 5e-4 gpm is needlessly
    // strict for a multi-thousand-gpm system and stalls on near-frictionless large pipe).
    var demandEst = inp.kFactor * Math.sqrt(Math.max(net.Pmin, 1)) * net.meta.operatingHeads;
    var tol = Math.max(5e-4, demandEst * 1e-5);
    var anchor = net.remoteId, res = null, tries = 0;
    while (tries++ < 6) {
      res = Solver.solveNetwork(net.nodes, net.pipes, { remoteNodeId: anchor, remotePressure: net.Pmin, sourceNodeId: net.sourceId, tol: tol, maxIter: 400 });
      if (!res.converged) break;
      // find the true minimum-pressure operating head
      var minId = anchor, minP = Infinity;
      res.nodePressures.forEach(function (np) {
        var nd = net.nodes.find(function (n) { return n.id === np.id; });
        if (nd && nd.type === "sprinkler" && np.P < minP) { minP = np.P; minId = np.id; }
      });
      if (minId === anchor) break;       // anchored head IS the minimum → done
      anchor = minId;                    // otherwise re-anchor to the true remote
    }

    var hose = inp.hoseGpm || 0;
    var demand = res ? res.totalDemand : 0;
    var totalFlow = demand + hose;
    var solvedP = res ? res.sourcePressure : 0;       // pressure at the source from the pipe network
    var fixedLoss = inp.fixedLossPsi || 0;            // backflow etc. (a fixed device loss, not piped)
    var marginPct = inp.psiMarginPct || 0;
    var requiredP = solvedP + fixedLoss;              // hydraulic requirement, pre-margin
    var requiredTotal = requiredP * (1 + marginPct / 100);

    // supply comparison (same 1.85 curve as the parametric tool), vs the FINAL required pressure
    var avail = null, margin = null;
    if (inp.supplyStatic != null && inp.supplyResidual != null && inp.supplyTestFlow > 0) {
      var s = inp.supplyStatic, rr = inp.supplyResidual, q1 = inp.supplyTestFlow;
      var qMax = q1 * Math.pow((s - 0) / (s - rr), 0.54);
      avail = totalFlow <= qMax ? s - (s - rr) * Math.pow(totalFlow / q1, 1.85) : 0;
      margin = avail - requiredTotal;
    }

    return {
      converged: res && res.converged, anchorHead: anchor, iterations: res ? res.iterations : 0,
      sourcePressure: solvedP, fixedLossPsi: fixedLoss, marginPct: marginPct,
      requiredPressure: requiredP, requiredTotal: requiredTotal,
      sprinklerDemand: demand, hoseGpm: hose, totalDemand: totalFlow,
      availablePressure: avail, safetyMargin: margin,
      meta: net.meta, network: net, solution: res
    };
  }

  var HydroGrid = { buildNetwork: buildNetwork, analyze: analyze, eqLen: eqLen, EQ_ELBOW: EQ_ELBOW, EQ_TEE: EQ_TEE };
  global.HydroGrid = HydroGrid;
  if (typeof module !== "undefined" && module.exports) module.exports = HydroGrid;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
