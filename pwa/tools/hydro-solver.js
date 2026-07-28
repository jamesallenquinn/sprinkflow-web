/* ============================================================================
 * SprinkFlow — hydraulic network solver (gridded sprinkler systems)
 * ----------------------------------------------------------------------------
 * Solves a sprinkler piping NETWORK as a simultaneous pressure-flow balance,
 * the way a real hydraulic engine (AutoSPRINK / HydraCALC) does — not the
 * one-pass accumulation the parametric estimator uses. Handles looped grids,
 * multiple feed paths, flow reversal, and pressure-driven sprinkler discharge.
 *
 * Method: nodal Newton-Raphson. The most-remote sprinkler is anchored at its
 * minimum required pressure (the fixed grade); every other node pressure is an
 * unknown solved so that flow continuity holds at every node. The source
 * pressure that falls out is the required system pressure; the sum of sprinkler
 * discharges is the system demand. Loop closure is satisfied implicitly because
 * pressure is single-valued at every node.
 *
 *   Pipe (Hazen-Williams, signed for reversible flow):
 *     R   = 4.52 * Leff / (C^1.85 * d^4.87)
 *     Q   = sign(dP) * (|dP| / R)^(1/1.85),   dP = P_a - P_b - 0.433*(z_b - z_a)
 *   Sprinkler outlet:  Q = K * sqrt(P_node)
 *   Continuity:        sum(flow into node) - external_demand(node) = 0
 *
 * UMD global `HydroSolver`.
 * ========================================================================== */
(function (global) {
  "use strict";
  var ELEV = 0.433;        // psi per vertical foot
  var EXP = 1.85;          // Hazen-Williams flow exponent
  var INV = 1 / EXP;

  // Hazen-Williams resistance for a pipe of effective length Leff (ft).
  function hwResistance(cFactor, dInches, leffFt) {
    return 4.52 * leffFt / (Math.pow(cFactor, EXP) * Math.pow(dInches, 4.87));
  }

  // Signed flow (gpm) from driving pressure dP (psi) and resistance R.
  function pipeFlow(dP, R) {
    if (R <= 0) return 0;
    var a = Math.abs(dP);
    if (a < 1e-12) return 0;
    var q = Math.pow(a / R, INV);
    return dP > 0 ? q : -q;
  }

  // dQ/d(dP) (conductance), regularized near zero so Newton stays stable.
  function pipeConductance(dP, R) {
    if (R <= 0) return 0;
    var a = Math.abs(dP);
    if (a < 1e-3) a = 1e-3;
    return INV * Math.pow(1 / R, INV) * Math.pow(a, INV - 1);
  }

  // Dense linear solve A x = b (Gaussian elimination, partial pivot). null if singular.
  function solveLinear(A, b) {
    var n = b.length, i, j, c, r;
    var M = []; for (i = 0; i < n; i++) M.push(A[i].slice());
    var x = b.slice();
    for (c = 0; c < n; c++) {
      var piv = c, mx = Math.abs(M[c][c]);
      for (r = c + 1; r < n; r++) { if (Math.abs(M[r][c]) > mx) { mx = Math.abs(M[r][c]); piv = r; } }
      if (mx < 1e-14) return null;
      if (piv !== c) { var tm = M[piv]; M[piv] = M[c]; M[c] = tm; var tx = x[piv]; x[piv] = x[c]; x[c] = tx; }
      for (r = c + 1; r < n; r++) {
        var f = M[r][c] / M[c][c];
        if (f === 0) continue;
        for (j = c; j < n; j++) M[r][j] -= f * M[c][j];
        x[r] -= f * x[c];
      }
    }
    for (i = n - 1; i >= 0; i--) {
      var s = x[i];
      for (j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  /* Solve the network.
   *   nodes: [{ id, elev, type:'source'|'junction'|'sprinkler', k?, fixedDemand? }]
   *   pipes: [{ id, from, to, C, d, length, fittingLength? }]  (or precomputed R)
   *   opts:  { remoteNodeId, remotePressure (P_min), sourceNodeId, tol?, maxIter? }
   * Returns { converged, iterations, maxResidual, sourcePressure, totalSprinklerFlow,
   *           nodePressures[], pipeFlows[], sprinklerFlows{} }.
   */
  function solveNetwork(nodes, pipes, opts) {
    opts = opts || {};
    var tol = opts.tol || 5e-4;
    var maxIter = opts.maxIter || 200;
    var idx = {}, i, j;
    for (i = 0; i < nodes.length; i++) { idx[nodes[i].id] = i; nodes[i]._i = i; }
    var N = nodes.length;
    var remoteI = idx[opts.remoteNodeId], sourceI = idx[opts.sourceNodeId];
    var Pmin = opts.remotePressure;

    var adj = []; for (i = 0; i < N; i++) adj.push([]);
    for (i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      p._a = idx[p.from]; p._b = idx[p.to];
      if (p.R == null) p.R = hwResistance(p.C || 120, p.d, p.length + (p.fittingLength || 0));
      adj[p._a].push({ pipe: i, other: p._b });
      adj[p._b].push({ pipe: i, other: p._a });
    }

    var P = new Array(N);
    for (i = 0; i < N; i++) P[i] = Pmin + 10;
    P[remoteI] = Pmin;

    // unknown columns = all nodes except remote; equation rows = all except source
    var col = new Array(N), row = new Array(N), nc = 0, nr = 0;
    for (i = 0; i < N; i++) col[i] = (i === remoteI) ? -1 : nc++;
    for (i = 0; i < N; i++) row[i] = (i === sourceI) ? -1 : nr++;

    function elevDrop(a, b) { return ELEV * (nodes[b].elev - nodes[a].elev); } // a->b consumes

    // Continuity residual vector for a given pressure array.
    function residuals(Pv) {
      var rr = new Array(nr).fill(0), ii, jj;
      for (ii = 0; ii < N; ii++) {
        if (ii === sourceI) continue;
        var inflow = 0;
        for (jj = 0; jj < adj[ii].length; jj++) {
          var e = adj[ii][jj], p2 = pipes[e.pipe], a = p2._a, b = p2._b;
          var q = pipeFlow(Pv[a] - Pv[b] - elevDrop(a, b), p2.R);
          inflow += (ii === b) ? q : -q;
        }
        var nd = nodes[ii], out = 0;
        if (nd.type === "sprinkler" && nd.k > 0) out += nd.k * Math.sqrt(Math.max(Pv[ii], 0));
        if (nd.fixedDemand) out += nd.fixedDemand;
        rr[row[ii]] = inflow - out;
      }
      return rr;
    }
    function maxAbs(v) { var m = 0; for (var t = 0; t < v.length; t++) m = Math.max(m, Math.abs(v[t])); return m; }
    function step(Pv, dp, frac) {
      var Pn = Pv.slice();
      for (var t = 0; t < N; t++) if (col[t] >= 0) { Pn[t] += frac * dp[col[t]]; if (Pn[t] < 0.01) Pn[t] = 0.01; }
      return Pn;
    }

    var iter, maxr = Infinity, bestP = P.slice(), bestR = Infinity;
    for (iter = 0; iter < maxIter; iter++) {
      var r = residuals(P);
      maxr = maxAbs(r);
      if (maxr < bestR) { bestR = maxr; bestP = P.slice(); }
      if (maxr < tol) break;

      var J = []; for (i = 0; i < nr; i++) J.push(new Array(nc).fill(0));
      for (i = 0; i < N; i++) {
        if (i === sourceI) continue;
        var ri = row[i];
        for (j = 0; j < adj[i].length; j++) {
          var ee = adj[i][j], pp = pipes[ee.pipe], aa = pp._a, bb = pp._b;
          var g = pipeConductance(P[aa] - P[bb] - elevDrop(aa, bb), pp.R);
          var s = (i === bb) ? 1 : -1;            // inflow into i = s*q
          var dq_dPi = (i === aa) ? g : -g;        // dq(a->b)/dP_i
          var dq_dPo = (i === aa) ? -g : g;        // wrt the other end
          if (col[i] >= 0) J[ri][col[i]] += s * dq_dPi;
          if (col[ee.other] >= 0) J[ri][col[ee.other]] += s * dq_dPo;
        }
        var ndj = nodes[i];
        if (ndj.type === "sprinkler" && ndj.k > 0 && col[i] >= 0) {
          J[ri][col[i]] += -(ndj.k / (2 * Math.sqrt(Math.max(P[i], 1e-6))));
        }
      }

      var rhs = []; for (i = 0; i < nr; i++) rhs.push(-r[i]);
      var dp = solveLinear(J, rhs);
      if (!dp) return { converged: false, reason: "singular", iterations: iter };
      var mxstep = 0; for (i = 0; i < nc; i++) mxstep = Math.max(mxstep, Math.abs(dp[i]));
      var frac = mxstep > 25 ? 25 / mxstep : 1;   // cap the largest pressure change
      // backtracking line search: accept the largest step that reduces the residual norm
      var accepted = false;
      for (var ls = 0; ls < 10; ls++) {
        var Ptry = step(P, dp, frac);
        if (maxAbs(residuals(Ptry)) < maxr) { P = Ptry; accepted = true; break; }
        frac *= 0.5;
      }
      if (!accepted) P = step(P, dp, frac);       // take the smallest step anyway to escape
    }
    if (maxr > tol && bestR < maxr) { P = bestP; maxr = bestR; }  // return the best seen

    var sprFlows = {}, totalSpr = 0, totalFixed = 0;
    for (i = 0; i < N; i++) {
      var n2 = nodes[i];
      if (n2.type === "sprinkler" && n2.k > 0) { var qq = n2.k * Math.sqrt(Math.max(P[i], 0)); sprFlows[n2.id] = qq; totalSpr += qq; }
      if (n2.fixedDemand) totalFixed += n2.fixedDemand;
    }
    var pf = pipes.map(function (p) {
      var dPf = P[p._a] - P[p._b] - elevDrop(p._a, p._b);
      return { id: p.id, from: p.from, to: p.to, flow: pipeFlow(dPf, p.R), R: p.R };
    });
    return {
      converged: maxr < tol,
      iterations: iter,
      maxResidual: maxr,
      sourcePressure: P[sourceI],
      totalSprinklerFlow: totalSpr,
      totalDemand: totalSpr + totalFixed,
      nodePressures: nodes.map(function (n) { return { id: n.id, P: P[n._i] }; }),
      pipeFlows: pf,
      sprinklerFlows: sprFlows
    };
  }

  var HydroSolver = { hwResistance: hwResistance, pipeFlow: pipeFlow, pipeConductance: pipeConductance, solveLinear: solveLinear, solveNetwork: solveNetwork, ELEV: ELEV };
  global.HydroSolver = HydroSolver;
  if (typeof module !== "undefined" && module.exports) module.exports = HydroSolver;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
