(function () {
  function normalizeTheme(theme) {
    return theme === "plain-light" ? "plain-light" : "default";
  }

  function applyTheme(theme) {
    const normalizedTheme = normalizeTheme(theme);
    document.documentElement.dataset.theme = normalizedTheme;
    if (document.body) document.body.dataset.theme = normalizedTheme;
  }

  applyTheme(new URLSearchParams(window.location.search).get("theme"));
  window.addEventListener("message", (event) => {
    if (event.data?.type !== "sprinkflow-theme") return;
    applyTheme(event.data.theme);
  });

  const DEFAULT_DATASET = {
    version: 0,
    references: {
      "2025": {
        storageChapters: "NFPA 13 2025 Chapters 20 through 26, plus Chapter 30 existing system modifications/evaluation",
        hoseAllowance: "20.15.2.6",
        esfrDesignArea: "23.2.2",
        cmsaDesignArea: "28.2.4.3.1",
        cmdaDesignArea: "28.2.4.2.1",
        inRackNumber: "25.7.3.1",
        inRackFlowPressure: "25.7.3.1",
      },
      "2022": {
        storageChapters: "NFPA 13 2022 Chapters 20 through 25, plus Chapter 26 special storage",
        hoseAllowance: "20.15.2.6",
        esfrDesignArea: "23.2.2",
        cmsaDesignArea: "28.2.4.3.1",
        cmdaDesignArea: "28.2.4.2.1",
        inRackNumber: "25.12.2.1",
        inRackFlowPressure: "25.12.3.1",
      },
      "2019": {
        storageChapters: "NFPA 13 2019 Chapters 20 through 25",
        hoseAllowance: "20.12.2.6",
        esfrDesignArea: "27.2.4.4.1",
        cmsaDesignArea: "27.2.4.3.1",
        inRackNumber: "25.12.2.1",
        inRackFlowPressure: "25.12.3.1",
      },
      "2016": {
        storageChapters: "NFPA 13 2016 Chapters 12 through 17",
        hoseAllowance: "12.8.6",
        esfrDesignArea: "12.7.6.3",
        cmsaDesignArea: "12.7.6.2",
        cmdaDesignArea: "12.7.6.1",
      },
    },
    criteriaRows: [],
    seedCriteria: [
      {
        id: "cmda-storage-minimum-2025",
        label: "2025 CMDA storage minimum",
        edition: "2025",
        systemType: "CMDA",
        appliesWhen: { storageHeightMinExclusive: 12 },
        densityMin: 0.15,
        wetAreaMin: 2000,
        dryAreaMin: 2600,
        hoseAllowance: 500,
        confidence: "indexed-rule",
        source: "21.1.8.3 / 21.2.2.1.1 / 20.15.2.6",
      },
      {
        id: "cmda-storage-minimum-2022",
        label: "2022 CMDA storage minimum",
        edition: "2022",
        systemType: "CMDA",
        appliesWhen: { storageHeightMinExclusive: 12 },
        densityMin: 0.15,
        wetAreaMin: 2000,
        dryAreaMin: 2600,
        hoseAllowance: 500,
        confidence: "indexed-rule",
        source: "21.1.10.4 / 21.2.2.2.1 / 20.15.2.6",
      },
      {
        id: "cmda-storage-minimum-2019",
        label: "2019 CMDA storage minimum",
        edition: "2019",
        systemType: "CMDA",
        appliesWhen: { storageHeightMinExclusive: 12 },
        densityMin: 0.15,
        wetAreaMin: 2000,
        dryAreaMin: 2600,
        hoseAllowance: 500,
        confidence: "indexed-rule",
        source: "21.2.2.5 / 20.12.2.6",
      },
      {
        id: "cmda-storage-minimum-2016",
        label: "2016 CMDA storage minimum",
        edition: "2016",
        systemType: "CMDA",
        appliesWhen: { storageHeightMinExclusive: 12 },
        densityMin: 0.15,
        wetAreaMin: 2000,
        dryAreaMin: 2600,
        hoseAllowance: 500,
        confidence: "indexed-rule",
        source: "12.7.6.1 / 12.8.6",
      },
    ],
    inRackQuickPicks: [],
  };

  const ESFR_COMMON_OPTIONS = [
    {
      maxCeiling: 25,
      options: [
        { kFactor: 14, pressure: 50, orientation: "Upright/pendent" },
        { kFactor: 16.8, pressure: 35, orientation: "Upright/pendent" },
        { kFactor: 22.4, pressure: 25, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 15, orientation: "Pendent" },
      ],
    },
    {
      maxCeiling: 30,
      options: [
        { kFactor: 14, pressure: 50, orientation: "Upright/pendent" },
        { kFactor: 16.8, pressure: 35, orientation: "Upright/pendent" },
        { kFactor: 22.4, pressure: 25, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 15, orientation: "Pendent" },
      ],
    },
    {
      maxCeiling: 32,
      options: [
        { kFactor: 14, pressure: 60, orientation: "Upright/pendent" },
        { kFactor: 16.8, pressure: 42, orientation: "Upright/pendent" },
      ],
    },
    {
      maxCeiling: 35,
      options: [
        { kFactor: 14, pressure: 75, orientation: "Upright/pendent" },
        { kFactor: 16.8, pressure: 52, orientation: "Upright/pendent" },
        { kFactor: 22.4, pressure: 35, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 20, orientation: "Pendent" },
      ],
    },
    {
      maxCeiling: 40,
      options: [
        { kFactor: 16.8, pressure: 52, orientation: "Pendent" },
        { kFactor: 22.4, pressure: 40, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 25, orientation: "Pendent" },
      ],
    },
    {
      maxCeiling: 45,
      options: [
        { kFactor: 22.4, pressure: 40, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 40, orientation: "Pendent" },
      ],
    },
  ];

  const STORAGE_REFERENCE_LOG = {
    "2025": {
      chapters: "NFPA 13 2025 storage chapters 20 through 26, plus Chapter 30 existing system modifications/evaluation",
      count: 118,
      refs: [
        "Table 4.3.1.7.1", "Table 4.3.1.7.4", "Table 19.2.3.1.1", "Table 19.2.3.1.2",
        "Table 20.15.2.6", "Table 20.17.1.2(a)", "Table 20.17.1.2(b)", "Table 20.17.1.2(c)", "Table 20.17.2.2.3",
        "Table 21.1.9", "Table 21.1.9.1", "Table 21.1.9.2", "Table 21.2.2.1.1", "Figure 21.3.1",
        "Table 21.3.1", "Table 21.3.3(a)", "Table 21.3.3(b)",
        "Table 21.4.1.2.1(a)", "Table 21.4.1.2.1(b)", "Table 21.4.1.2.1(c)", "Table 21.4.1.2.1(d)", "Table 21.4.1.2.1(e)",
        "Table 21.4.1.3.1(a)", "Table 21.4.1.3.1(b)", "Table 21.4.1.3.1(c)", "Table 21.4.1.3.1(d)", "Table 21.4.1.3.1(e)",
        "Table 21.4.1.4.1", "Table 21.5.1.1", "Table 21.5.2", "Table 21.7.1(a)", "Table 21.7.1(b)", "Table 21.8.3(a)", "Table 21.8.3(b)",
        "Table 22.2", "Table 22.3", "Table 22.4", "Table 22.5", "Table 22.6", "Table 22.7",
        "Table 23.3.1", "Table 23.5", "Table 23.6",
        "Table 24.2.1", "Table 24.3.1", "Table 24.3.2", "Table 24.3.3",
        "Table 25.4.1.1", "Table 25.5.1.3", "Table 25.6.2.3", "Table 25.6.3.1",
        "Table 25.7.2.2", "Table 25.7.2.3.1", "Table 25.7.2.4.1", "Table 25.7.3.1",
        "Table 26.2", "Table 26.5.1", "Table 26.6.6.2", "Figure 26.6.6.4",
        "Chapter 30 existing system modifications or evaluation",
      ],
    },
    "2022": {
      chapters: "NFPA 13 2022 storage chapters 20 through 26",
      count: 132,
      refs: [
        "Table 20.15.2.6", "Table 20.17.1.2(a)", "Table 20.17.1.2(b)", "Table 20.17.1.2(c)", "Table 20.17.2.2.3", "Table 20.18.1",
        "Table 4.3.1.7.1.1", "Table 19.2.3.1.1", "Table 19.2.3.1.2",
        "Table 21.2.2.2.1", "Figure 21.2.2.3.1", "Figure 21.2.2.3.2", "Figure 21.2.2.3.3", "Table 21.3.1", "Table 21.3.3(a)", "Table 21.3.3(b)",
        "Table 21.4.1.2.1.1(a)", "Table 21.4.1.2.1.1(b)", "Table 21.4.1.2.1.1(c)", "Table 21.4.1.2.1.1(d)", "Table 21.4.1.2.1.1(e)",
        "Table 21.4.1.2.2.1", "Figure 21.4.1.2.2.1(a)", "Figure 21.4.1.2.2.1(b)", "Figure 21.4.1.2.2.1(c)", "Figure 21.4.1.2.2.1(d)", "Figure 21.4.1.2.2.1(e)",
        "Table 21.4.1.3.1.1(a)", "Table 21.4.1.3.1.1(b)", "Table 21.4.1.3.1.1(c)", "Table 21.4.1.3.1.1(d)", "Table 21.4.1.3.1.1(e)",
        "Table 21.4.1.3.2.1", "Section 21.4.1.4 solid shelf racks", "Table 21.4.1.5.1", "Table 21.5.1.1", "Table 21.7.1(a)", "Table 21.7.1(b)", "Table 21.8.3(a)", "Table 21.8.3(b)",
        "Table 22.2", "Table 22.3", "Table 22.4", "Table 22.5", "Table 22.6", "Table 22.7",
        "Table 23.3.1", "Table 23.5", "Table 23.6",
        "Table 24.2.1", "Table 24.3.1", "Table 24.3.2(a)", "Table 24.3.2(b)", "Table 24.3.3", "Table 24.4.1",
        "Table 25.3.1.1", "Figure 25.3.2.5.1(a)", "Figure 25.3.2.5.1(b)", "Figure 25.3.2.5.2.1", "Section 25.6 solid shelf rack in-rack rules", "Table 25.12.2.1", "Table 25.12.3.1",
        "Table 26.5.1", "Figure 26.7.2.2.2", "Section 26.8 high-bay records storage",
      ],
    },
    "2016": {
      chapters: "NFPA 13 2016 storage chapters 12 through 20",
      count: 102,
      refs: [
        "Table 12.8.6", "Table 12.12.1.2(a)", "Table 12.12.1.2(b)", "Table 12.12.1.2(c)", "Table 12.12.2.2.3",
        "Figure 13.2.1", "Table 13.2.1",
        "Figure 14.2.4.1", "Figure 14.2.4.2", "Figure 14.2.4.3", "Table 14.3.1", "Table 14.4.1",
        "Figure 15.2.2.1", "Table 15.2.2.1", "Table 15.2.2.5(a)", "Table 15.2.2.5(b)", "Table 15.3.1", "Table 15.4.1",
        "Figure 16.1.2.4.4.1(A)", "Figure 16.1.2.4.4.2(A)", "Figure 16.1.2.4.4.3(A)", "Table 16.1.4.1",
        "Table 16.2.1.3.2", "Figure 16.2.1.3.2(a)", "Figure 16.2.1.3.2(b)", "Figure 16.2.1.3.2(c)", "Figure 16.2.1.3.2(d)", "Figure 16.2.1.3.2(e)", "Figure 16.2.1.3.2(f)", "Figure 16.2.1.3.2(g)",
        "Table 16.2.1.3.3.1", "Table 16.2.1.3.3.2", "Figure 16.2.1.3.4.1", "Table 16.2.1.3.4.3",
        "Table 16.2.1.4.2.1", "Table 16.2.1.4.2.2", "Table 16.2.2.1", "Table 16.2.3.1",
        "Table 16.3.1.1", "Table 16.3.1.2", "Figure 16.3.1.3.1.1(A)", "Figure 16.3.1.3.1.2(A)", "Figure 16.3.1.3.1.3(A)", "Table 16.3.2.1", "Table 16.3.3.1",
        "Figure 17.1.2.1", "Figure 17.1.2.9.4.1(A)", "Figure 17.1.2.9.4.2(A)", "Figure 17.1.2.9.4.3(A)", "Table 17.1.4.1",
        "Figure 17.2.1.2.1(a)", "Figure 17.2.1.2.1(b)", "Figure 17.2.1.2.1(c)", "Figure 17.2.1.2.1(d)", "Figure 17.2.1.2.1(e)", "Figure 17.2.1.2.1(f)",
        "Figure 17.2.1.4(a)", "Figure 17.2.1.4(b)", "Figure 17.2.1.4(c)", "Figure 17.2.1.4(d)", "Figure 17.2.1.4(e)", "Figure 17.2.1.4(f)", "Figure 17.2.1.4(g)", "Figure 17.2.1.4(h)", "Figure 17.2.1.4(i)", "Figure 17.2.1.4(j)", "Figure 17.2.1.4(k)", "Figure 17.2.1.4(l)",
        "Table 17.2.2.1", "Table 17.2.3.1", "Table 17.3.1.3",
        "Figure 17.3.1.4(a)", "Figure 17.3.1.4(b)", "Figure 17.3.1.4(c)", "Figure 17.3.1.5(a)", "Figure 17.3.1.5(b)", "Figure 17.3.1.7", "Figure 17.3.1.8(a)", "Figure 17.3.1.8(b)", "Figure 17.3.1.8(c)", "Figure 17.3.1.8(d)", "Figure 17.3.1.8(e)", "Figure 17.3.1.8(f)",
        "Table 17.3.1.17", "Table 17.3.2.1", "Table 17.3.3.1",
        "Table 18.4(a)", "Table 18.4(b)", "Table 18.4(c)", "Table 18.4(d)",
        "Table 19.1.2.1.3(a)", "Table 19.1.2.1.3(b)", "Table 19.1.2.2", "Table 19.1.2.3",
        "Table 20.2", "Table 20.4.2.1", "Table 20.5.6.2", "Figure 20.5.6.4",
      ],
    },
    "2019": {
      chapters: "NFPA 13 2019 storage chapters 20 through 26",
      count: 145,
      refs: [
        "Figure 20.4.3.3(a)", "Figure 20.4.3.3(b)", "Figure 20.4.8", "Table 20.6.4.2", "Table 20.6.4.3", "Table 20.6.4.4", "Table 20.12.2.6", "Table 20.14.1.2(a)", "Table 20.14.1.2(b)", "Table 20.14.1.2(c)", "Table 20.14.2.2.3", "Table 20.15.1",
        "Table 4.3.1.7.1", "Figure 19.3.3.1.1",
        "Figure 21.2.2.1", "Figure 21.2.2.2", "Figure 21.2.2.3", "Figure 21.3.1", "Table 21.3.1", "Table 21.3.3(a)", "Table 21.3.3(b)", "Table 21.4.1.2", "Figure 21.4.1.2(a)", "Figure 21.4.1.2(b)", "Figure 21.4.1.2(c)", "Figure 21.4.1.2(d)", "Figure 21.4.1.2(e)", "Table 21.4.1.3.1", "Table 21.4.1.3.2", "Figure 21.4.1.4.1", "Table 21.5.1.1", "Table 21.5.3", "Table 21.6.1(a)", "Table 21.6.1(b)", "Table 21.7.3(a)", "Table 21.7.3(b)", "Table 21.10.1", "Table 21.11.6.2", "Figure 21.11.6.4",
        "Table 22.2", "Table 22.3", "Table 22.4", "Table 22.5",
        "Table 23.3.1", "Table 23.4.2", "Table 23.5.1", "Table 23.6.1", "Table 23.8", "Table 23.10",
        "Table 24.2.1", "Table 24.3.1", "Table 24.3.2(a)", "Table 24.3.2(b)", "Table 24.3.3", "Table 24.4.1",
        "Figure 25.2.2.1.2", "Table 25.2.3.2.1", "Table 25.2.3.2.2.1", "Table 25.2.3.2.2.2", "Section 25.6 solid shelf rack in-rack rules",
        "Figure 25.2.3.2.3.1(a)", "Figure 25.2.3.2.3.1(b)", "Figure 25.2.3.2.3.1(c)", "Figure 25.2.3.2.3.1(d)", "Figure 25.2.3.2.3.1(e)", "Figure 25.2.3.2.3.1(f)", "Figure 25.2.3.2.3.1(g)", "Figure 25.2.3.2.4.1", "Table 25.2.3.2.4.2",
        "Table 25.2.3.3.1", "Table 25.2.3.3.2", "Table 25.2.3.5", "Table 25.2.4.2.1", "Table 25.2.4.3.1", "Table 25.2.5.1.1",
        "Table 25.5.2.2.1", "Table 25.5.2.2.2",
        "Figure 25.8.1.6.1", "Figure 25.8.1.7.1", "Figure 25.8.1.8.1", "Figure 25.8.2.4(a)", "Figure 25.8.2.4(b)", "Figure 25.8.2.4(c)", "Figure 25.8.2.4(d)", "Figure 25.8.2.4(e)", "Figure 25.8.2.4(f)", "Table 25.8.2.6", "Table 25.8.2.7",
        "Figure 25.8.3.3.1(A)", "Figure 25.8.3.3.2(A)", "Figure 25.8.3.3.3(A)",
        "Table 25.9.2.1.1", "Figure 25.9.2.1.1(a)", "Figure 25.9.2.1.1(b)", "Figure 25.9.2.1.1(c)", "Figure 25.9.2.1.1(d)", "Figure 25.9.2.1.1(e)",
        "Table 25.9.2.2.1", "Figure 25.9.2.2.1(a)", "Figure 25.9.2.2.1(b)", "Figure 25.9.2.2.1(c)", "Figure 25.9.2.2.1(d)", "Figure 25.9.2.2.1(e)", "Figure 25.9.2.2.1(f)", "Figure 25.9.2.2.1(g)", "Figure 25.9.2.2.1(h)", "Figure 25.9.2.2.1(i)", "Figure 25.9.2.2.1(j)",
        "Table 25.9.2.3.1", "Figure 25.9.2.3.1(a)", "Figure 25.9.2.3.1(b)", "Figure 25.9.2.3.1(c)",
        "Figure 25.9.3.1(a)", "Figure 25.9.3.1(b)", "Figure 25.9.3.1(c)", "Figure 25.9.3.1(d)", "Figure 25.9.3.1(e)",
        "Figure 25.9.3.3(a)", "Figure 25.9.3.3(b)", "Figure 25.9.3.3(c)", "Figure 25.9.3.3(d)", "Figure 25.9.3.3(e)", "Figure 25.9.3.3(f)", "Figure 25.9.3.3(g)", "Figure 25.9.3.3(h)", "Figure 25.9.3.3(i)", "Figure 25.9.3.3(j)", "Figure 25.9.3.3(k)",
        "Figure 25.9.4.1.1(a)", "Figure 25.9.4.1.1(b)", "Figure 25.9.4.1.1(c)", "Figure 25.9.4.1.1(d)", "Figure 25.9.4.1.3", "Figure 25.9.4.2.1(a)", "Figure 25.9.4.2.1(b)", "Figure 25.9.4.2.1(c)", "Figure 25.9.4.3.1(a)", "Figure 25.9.4.3.1(b)", "Figure 25.9.4.3.1(c)", "Figure 25.9.4.3.1(d)", "Figure 25.9.4.3.1(e)", "Figure 25.9.4.3.1(f)",
        "Table 25.12.2.1", "Table 25.12.3.1",
        "Figure 26.7.2.2.2", "Table 26.36.1.3.1", "Table 26.36.1.3.4.1(B)", "Table 26.36.1.3.4.3", "Figure 26.36.1.3.4.4(A)",
      ],
    },
  };

  const CMDA_GROUP_A_DENSITY_ROWS = [
    {
      maxStorage: 12,
      ceilingBands: [
        { maxCeiling: 15, densities: { A: 0.2, B: "EH2", C: 0.3, D: "EH1", E: "EH2" } },
        { maxCeiling: 20, densities: { A: 0.3, B: 0.6, C: 0.5, D: "EH2", E: "EH2" } },
        { maxCeiling: 32, densities: { A: 0.4, B: 0.8, C: 0.6, D: 0.45, E: 0.7 } },
      ],
    },
    {
      maxStorage: 15,
      ceilingBands: [
        { maxCeiling: 20, densities: { A: 0.3, B: 0.6, C: 0.5, D: 0.4, E: 0.45 } },
        { maxCeiling: 25, densities: { A: 0.4, B: 0.8, C: 0.6, D: 0.45, E: 0.7 } },
        { maxCeiling: 35, densities: { A: 0.45, B: 0.9, C: 0.7, D: 0.55, E: 0.85 } },
      ],
    },
    {
      maxStorage: 20,
      ceilingBands: [
        { maxCeiling: 25, densities: { A: 0.4, B: 0.8, C: 0.6, D: 0.45, E: 0.7 } },
        { maxCeiling: 30, densities: { A: 0.45, B: 0.9, C: 0.7, D: 0.55, E: 0.85 } },
        { maxCeiling: 35, densities: { A: 0.6, B: 1.2, C: 0.85, D: 0.7, E: 1.1 } },
      ],
    },
    {
      maxStorage: 25,
      ceilingBands: [
        { maxCeiling: 30, densities: { A: 0.45, B: 0.9, C: 0.7, D: 0.55, E: 0.85 } },
        { maxCeiling: 35, densities: { A: 0.6, B: 1.2, C: 0.85, D: 0.7, E: 1.1 } },
      ],
    },
  ];

  const CMDA_CLASS_SOLID_PILE_CURVES = {
    ordinary: {
      "Class I": [[0.16, 3000], [0.17, 2700], [0.185, 2350], [0.205, 2000]],
      "Class II": [[0.18, 3000], [0.192, 2700], [0.207, 2350], [0.228, 2000]],
      "Class III": [[0.235, 3000], [0.25, 2700], [0.27, 2350], [0.3, 2000]],
      "Class IV": [[0.3, 3000], [0.32, 2700], [0.35, 2350], [0.39, 2000]],
    },
    high: {
      "Class I": [[0.15, 2050], [0.152, 2050], [0.153, 2000], [0.154, 2000]],
      "Class II": [[0.155, 2400], [0.158, 2300], [0.162, 2200], [0.167, 2100], [0.171, 2000]],
      "Class III": [[0.164, 3000], [0.173, 2750], [0.184, 2500], [0.197, 2250], [0.214, 2000]],
      "Class IV": [[0.227, 3000], [0.242, 2650], [0.264, 2350], [0.284, 2100], [0.296, 2000]],
    },
  };

  const CMDA_CLASS_RACK_20FT_CURVES = {
    "Class I": {
      figure: "a",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.242, 3000], [0.247, 2700], [0.252, 2450], [0.258, 2200], [0.266, 2000]]]],
      B: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.264, 3000], [0.269, 2700], [0.275, 2400], [0.283, 2200], [0.291, 2000]]]],
      C: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.273, 3000], [0.278, 2700], [0.285, 2400], [0.292, 2200], [0.301, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.302, 3000], [0.308, 2650], [0.316, 2350], [0.324, 2150], [0.332, 2000]]]],
    },
    "Class II": {
      figure: "b",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.293, 3000], [0.298, 2750], [0.305, 2450], [0.314, 2200], [0.325, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.332, 3000], [0.34, 2700], [0.349, 2450], [0.36, 2200], [0.373, 2000]]]],
      C: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.34, 3000], [0.347, 2700], [0.357, 2400], [0.369, 2150], [0.383, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.395, 3000], [0.403, 2650], [0.415, 2400], [0.428, 2150], [0.44, 2000]]]],
    },
    "Class III": {
      figure: "c",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.307, 3000], [0.312, 2700], [0.32, 2450], [0.329, 2200], [0.342, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.349, 3000], [0.356, 2700], [0.365, 2400], [0.375, 2150], [0.386, 2000]]]],
      C: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.357, 3000], [0.364, 2700], [0.372, 2400], [0.383, 2200], [0.395, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.405, 3000], [0.414, 2700], [0.424, 2400], [0.436, 2200], [0.452, 2000]]]],
    },
    "Class IV": {
      figure: "d",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.45, 3000], [0.46, 2650], [0.471, 2400], [0.482, 2150], [0.496, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.509, 3000], [0.522, 2700], [0.535, 2400], [0.551, 2150], [0.57, 2000]]]],
      C: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.522, 3000], [0.529, 2800], [0.541, 2500], [0.558, 2250], [0.58, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.6, 3000]]]],
    },
    "Class I Encapsulated": {
      figure: "e",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.45, 2400], [0.458, 2250], [0.468, 2100], [0.476, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.485, 3000], [0.497, 2650], [0.512, 2350], [0.535, 2000]]]],
      C: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.505, 3000], [0.515, 2700], [0.528, 2350], [0.545, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.535, 3000]]]],
    },
    "Class II Encapsulated": {
      figure: "e",
      A: [["High-temperature ceiling sprinklers", "8 ft aisles", [[0.45, 2400], [0.458, 2250], [0.468, 2100], [0.476, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers", "8 ft aisles", [[0.485, 3000], [0.497, 2650], [0.512, 2350], [0.535, 2000]]]],
      C: [["High-temperature ceiling sprinklers", "4 ft aisles", [[0.505, 3000], [0.515, 2700], [0.528, 2350], [0.545, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers", "4 ft aisles", [[0.535, 3000]]]],
    },
  };

  const CMDA_CLASS_RACK_WITH_INRACK_CURVES = {
    "Class I": {
      figure: "a",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.172, 3000], [0.178, 2600], [0.188, 2200], [0.2, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.205, 3000], [0.211, 2600], [0.223, 2200], [0.238, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.21, 3000], [0.218, 2600], [0.232, 2200], [0.248, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.25, 3000], [0.26, 2600], [0.275, 2200], [0.295, 2000]]]],
    },
    "Class II": {
      figure: "b",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.19, 3000], [0.197, 2600], [0.207, 2200], [0.22, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.23, 3000], [0.238, 2600], [0.25, 2200], [0.268, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.24, 3000], [0.248, 2600], [0.262, 2200], [0.28, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.28, 3000], [0.292, 2600], [0.308, 2200], [0.33, 2000]]]],
    },
    "Class III": {
      figure: "c",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.22, 3000], [0.228, 2600], [0.24, 2200], [0.255, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.255, 3000], [0.264, 2600], [0.278, 2200], [0.295, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.265, 3000], [0.274, 2600], [0.289, 2200], [0.308, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.305, 3000], [0.318, 2600], [0.335, 2200], [0.358, 2000]]]],
    },
    "Class IV": {
      figure: "d",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.29, 3000], [0.3, 2600], [0.313, 2200], [0.33, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.345, 3000], [0.355, 2600], [0.37, 2200], [0.39, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.355, 3000], [0.365, 2600], [0.382, 2200], [0.405, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles or multiple-row racks", [[0.405, 3000], [0.418, 2600], [0.438, 2200], [0.465, 2000]]]],
    },
    "Class I Encapsulated": {
      figure: "e",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.22, 3000], [0.228, 2600], [0.24, 2200], [0.255, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.248, 3000], [0.256, 2600], [0.27, 2200], [0.288, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.27, 3000], [0.28, 2600], [0.294, 2200], [0.312, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.315, 3000], [0.328, 2600], [0.345, 2200], [0.365, 2000]]]],
    },
    "Class II Encapsulated": {
      figure: "e",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.22, 3000], [0.228, 2600], [0.24, 2200], [0.255, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.248, 3000], [0.256, 2600], [0.27, 2200], [0.288, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.27, 3000], [0.28, 2600], [0.294, 2200], [0.312, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.315, 3000], [0.328, 2600], [0.345, 2200], [0.365, 2000]]]],
    },
    "Class III Encapsulated": {
      figure: "f",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.242, 3000], [0.245, 2800], [0.249, 2550], [0.256, 2300], [0.266, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.273, 3050], [0.278, 2750], [0.284, 2500], [0.292, 2250], [0.302, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.293, 3000], [0.297, 2800], [0.303, 2550], [0.311, 2250], [0.322, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.332, 3000], [0.337, 2800], [0.343, 2500], [0.352, 2250], [0.363, 2000]]]],
    },
    "Class IV Encapsulated": {
      figure: "g",
      A: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.242, 3000], [0.247, 2750], [0.253, 2500], [0.261, 2250], [0.273, 2000]]]],
      B: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "8 ft aisles", [[0.281, 3000], [0.288, 2800], [0.297, 2500], [0.309, 2200], [0.327, 2000]]]],
      C: [["High-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.308, 3000], [0.314, 2750], [0.322, 2500], [0.332, 2250], [0.347, 2000]]]],
      D: [["Ordinary-temperature ceiling sprinklers and ordinary-temperature in-rack sprinklers", "4 ft aisles", [[0.358, 3000], [0.366, 2750], [0.377, 2450], [0.392, 2200], [0.412, 2000]]]],
    },
  };

  const dom = {
    edition: document.getElementById("editionInput"),
    commodity: document.getElementById("commodityInput"),
    arrangement: document.getElementById("arrangementInput"),
    storageHeight: document.getElementById("storageHeightInput"),
    ceilingHeight: document.getElementById("ceilingHeightInput"),
    aisleWidth: document.getElementById("aisleWidthInput"),
    rackGeometry: document.getElementById("rackGeometryInput"),
    ceilingSystem: document.getElementById("ceilingSystemInput"),
    encapsulated: document.getElementById("encapsulatedInput"),
    tableBody: document.getElementById("criteriaTableBody"),
    candidateCount: document.getElementById("candidateCount"),
    criteriaPager: document.getElementById("criteriaPager"),
    criteriaPrev: document.getElementById("criteriaPrevButton"),
    criteriaNext: document.getElementById("criteriaNextButton"),
    criteriaPageStatus: document.getElementById("criteriaPageStatus"),
    sourcePreview: document.getElementById("sourcePreview"),
    sourcePreviewTitle: document.getElementById("sourcePreviewTitle"),
    totalDemandLabel: document.getElementById("totalDemandLabel"),
    sprinklerDemandLabel: document.getElementById("sprinklerDemandLabel"),
    hoseAllowanceLabel: document.getElementById("hoseAllowanceLabel"),
    lowestDemand: document.getElementById("lowestDemandValue"),
    sprinklerDemand: document.getElementById("sprinklerDemandValue"),
    addons: document.getElementById("addonsValue"),
    trace: document.getElementById("calculationTrace"),
    sourceMap: document.getElementById("sourceMap"),
    datasetStatus: document.getElementById("datasetStatus"),
    systemFilterButtons: Array.from(document.querySelectorAll("[data-system-filter]")),
    inRackFilterButtons: Array.from(document.querySelectorAll("[data-in-rack-filter]")),
    copySummary: document.getElementById("copySummaryButton"),
    reset: document.getElementById("resetButton"),
  };

  let dataset = DEFAULT_DATASET;
  let latestSummary = "";
  let activeSystemFilter = "all";
  let activeInRackFilter = "all";
  let selectedCandidateId = "";
  let activeResultPage = 0;
  const DISPLAY_OPTION_LIMIT = 5;
  const RECOMMENDED_SYSTEM_TYPES = ["ESFR", "CMSA", "CMDA", "In-Rack"];
  const SYSTEM_LABELS = {
    CMDA: "CMDA",
    CMSA: "CMSA",
    ESFR: "ESFR",
    "In-Rack": "In-Rack / Combined",
  };
  const FILTER_LABELS = {
    all: "All",
    CMDA: "CMDA",
    CMSA: "CMSA",
    ESFR: "ESFR",
    "In-Rack": "In-Rack",
  };
  const IN_RACK_FILTER_LABELS = {
    all: "All",
    with: "with in-rack sprinklers",
    without: "without in-rack sprinklers",
  };

  function numberValue(input, fallback = null) {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? value : fallback;
  }

  function formatGpm(value) {
    if (!Number.isFinite(value)) return "-";
    return `${Math.round(value).toLocaleString()} gpm`;
  }

  function formatOptionalGpm(value) {
    return value > 0 ? formatGpm(value) : "-";
  }

  function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return "-";
    const fixed = value.toFixed(digits);
    return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  }

  function uses2022StorageTables(edition) {
    return edition === "2022" || edition === "2025";
  }

  function is2025Edition(inputs) {
    return inputs.edition === "2025";
  }

  function getModernHoseSource(inputs) {
    return is2025Edition(inputs) || inputs.edition === "2022" ? "20.15.2.6" : "20.12.2.6";
  }

  function getModernCmdaSolidPileSource(inputs) {
    return is2025Edition(inputs)
      ? { tableTitle: "Table 21.2.2.1.1", source: "21.2.2.1.1 / 21.2.2.1.2 / 21.1.8.3 / 20.15.2.6" }
      : { tableTitle: "Table 21.2.2.2.1", source: "21.2.2.2.1 / 21.2.2.2.2 / 21.1.10.4 / 20.15.2.6" };
  }

  function getModernRackTableTitle(inputs, tableTitle) {
    if (!is2025Edition(inputs)) return tableTitle;
    return tableTitle.replace("21.4.1.2.1.1", "21.4.1.2.1").replace("21.4.1.3.1.1", "21.4.1.3.1");
  }

  function getModernIndependentInRackSources(inputs) {
    return is2025Edition(inputs)
      ? {
          tableTitle: "Tables 25.7.2.2, 25.7.2.3.1, 25.7.2.4.1, and 25.7.3.1",
          source: "25.7.2.2 / 25.7.2.3.1 / 25.7.2.4.1 / 25.7.3.1 / 20.15.2.6",
          sectionLabel: "Section 25.7",
        }
      : {
          tableTitle: "Tables 25.6.2.2, 25.6.2.3.1, and 25.6.3.1",
          source: "25.6.2.2 / 25.6.2.3.1 / 25.6.2.4.1 / 25.6.2.5 / 25.6.3.1 / 20.15.2.6",
          sectionLabel: "Section 25.6",
        };
  }

  function parseDensityArea(candidate) {
    const match = candidate.basis?.match(/([0-9.]+)\s*gpm\/ft2 over\s*([0-9,]+)\s*ft2/i);
    if (!match) return null;
    const density = Number.parseFloat(match[1]);
    const area = Number.parseFloat(match[2].replace(/,/g, ""));
    if (!Number.isFinite(density) || !Number.isFinite(area)) return null;
    return { density, area };
  }

  function sameSourceFamily(candidate, selected) {
    if (!candidate || !selected) return false;
    if (candidate.systemType !== selected.systemType) return false;
    if (candidate.tableTitle !== selected.tableTitle) return false;
    if (candidate.name !== selected.name) return false;
    return true;
  }

  function getCurvePreviewPoints(selected, candidates) {
    const pointMap = new Map();
    candidates
      .filter((candidate) => sameSourceFamily(candidate, selected))
      .forEach((candidate) => {
        const point = parseDensityArea(candidate);
        if (!point) return;
        const key = `${point.density}-${point.area}`;
        if (!pointMap.has(key) || candidate.id === selected.id) {
          pointMap.set(key, { ...point, id: candidate.id, selected: candidate.id === selected.id });
        }
      });
    return Array.from(pointMap.values()).sort((a, b) => a.density - b.density || b.area - a.area);
  }

  function buildCurvePreview(selected, candidates) {
    const points = getCurvePreviewPoints(selected, candidates);
    const selectedPoint = parseDensityArea(selected);
    if (!selectedPoint || points.length < 2) return "";

    const width = 760;
    const height = 340;
    const margin = { top: 28, right: 30, bottom: 58, left: 72 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const densities = points.map((point) => point.density);
    const areas = points.map((point) => point.area);
    const xMin = Math.min(...densities) * 0.94;
    const xMax = Math.max(...densities) * 1.06;
    const yMin = Math.min(...areas) * 0.94;
    const yMax = Math.max(...areas) * 1.06;
    const xScale = (density) => margin.left + ((density - xMin) / (xMax - xMin || 1)) * plotWidth;
    const yScale = (area) => margin.top + plotHeight - ((area - yMin) / (yMax - yMin || 1)) * plotHeight;
    const path = points.map((point, index) => `${index ? "L" : "M"} ${xScale(point.density).toFixed(1)} ${yScale(point.area).toFixed(1)}`).join(" ");
    const selectedX = xScale(selectedPoint.density);
    const selectedY = yScale(selectedPoint.area);
    const xTicks = [xMin, (xMin + xMax) / 2, xMax];
    const yTicks = [yMin, (yMin + yMax) / 2, yMax];

    return `
      <div class="curve-card">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Redrawn density area curve with selected point">
          <defs>
            <pattern id="curve-grid" width="42" height="32" patternUnits="userSpaceOnUse">
              <path d="M 42 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
            </pattern>
          </defs>
          <rect x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" fill="url(#curve-grid)" stroke="rgba(255,255,255,0.22)" />
          ${xTicks.map((tick) => `
            <line x1="${xScale(tick)}" y1="${margin.top}" x2="${xScale(tick)}" y2="${margin.top + plotHeight}" stroke="rgba(255,255,255,0.14)" />
            <text x="${xScale(tick)}" y="${height - 24}" text-anchor="middle">${formatNumber(tick, 3)}</text>
          `).join("")}
          ${yTicks.map((tick) => `
            <line x1="${margin.left}" y1="${yScale(tick)}" x2="${margin.left + plotWidth}" y2="${yScale(tick)}" stroke="rgba(255,255,255,0.14)" />
            <text x="${margin.left - 12}" y="${yScale(tick) + 4}" text-anchor="end">${formatNumber(tick, 0)}</text>
          `).join("")}
          <path d="${path}" fill="none" stroke="#36aeca" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          ${points.map((point) => `
            <circle cx="${xScale(point.density)}" cy="${yScale(point.area)}" r="${point.id === selected.id ? 7 : 4}" fill="${point.id === selected.id ? "#f2b849" : "#9fdff0"}" stroke="#0f1418" stroke-width="2" />
          `).join("")}
          <line x1="${selectedX}" y1="${selectedY}" x2="${selectedX}" y2="${margin.top + plotHeight}" stroke="#f2b849" stroke-dasharray="5 5" />
          <line x1="${margin.left}" y1="${selectedY}" x2="${selectedX}" y2="${selectedY}" stroke="#f2b849" stroke-dasharray="5 5" />
          <text x="${margin.left + plotWidth / 2}" y="${height - 6}" text-anchor="middle">Sprinkler density (gpm/ft2)</text>
          <text transform="translate(18 ${margin.top + plotHeight / 2}) rotate(-90)" text-anchor="middle">Area of sprinkler operation (ft2)</text>
          <text x="${Math.min(selectedX + 12, width - 250)}" y="${Math.max(selectedY - 12, 18)}" class="selected-label">
            ${formatNumber(selectedPoint.density, 3)} gpm/ft2 @ ${formatNumber(selectedPoint.area, 0)} ft2
          </text>
        </svg>
      </div>
    `;
  }

  function buildTablePreview(selected, candidates) {
    const nfpaStylePreview = buildNfpaStyleTablePreview(selected, candidates);
    if (nfpaStylePreview) return nfpaStylePreview;

    const sameTableRows = candidates
      .filter((candidate) => candidate.systemType === selected.systemType && candidate.tableTitle === selected.tableTitle)
      .sort(compareCandidates);
    const selectedIndex = sameTableRows.findIndex((candidate) => candidate.id === selected.id);
    const windowStart = Math.max(0, Math.min(selectedIndex - 3, Math.max(0, sameTableRows.length - 8)));
    const previewRows = sameTableRows.slice(windowStart, windowStart + 8);
    return buildNfpaSourceTablePreview({
      caption: selected.tableTitle || selected.name || "Source table",
      headerRows: [[
        { label: "Applicable Row" },
        { label: "Basis" },
        { label: "Ceiling Demand" },
        { label: "In-Rack Demand" },
        { label: "Total" },
      ]],
      rows: previewRows.map((candidate) => ({
        selected: candidate.id === selected.id,
        cells: [
          candidate.name,
          candidate.basis,
          formatGpm(candidate.sprinklerDemand),
          formatOptionalGpm(candidate.inRackDemand),
          `<strong>${formatGpm(candidate.total)}</strong>`,
        ],
      })),
      minWidth: 860,
      notes: selected.notes?.filter(Boolean),
    });
  }

  function buildNfpaSourceTablePreview({ caption, headerRows, rows, minWidth = 820, notes = [] }) {
    const cssWidth = Number.isFinite(minWidth) ? ` style="--nfpa-min-width: ${minWidth}px"` : "";
    const headerMarkup = headerRows.map((headerRow) => `
      <tr>
        ${headerRow.map((cell) => {
          const rowspan = cell.rowspan ? ` rowspan="${cell.rowspan}"` : "";
          const colspan = cell.colspan ? ` colspan="${cell.colspan}"` : "";
          return `<th${rowspan}${colspan}>${cell.label}</th>`;
        }).join("")}
      </tr>
    `).join("");
    const rowMarkup = rows.map((row) => `
      <tr class="${row.selected ? "preview-selected" : ""}">
        ${row.cells.map((cell) => `<td>${cell}</td>`).join("")}
      </tr>
    `).join("");
    const noteMarkup = notes.length
      ? `<div class="nfpa-table-notes">${notes.map((note) => `<div>${note}</div>`).join("")}</div>`
      : "";

    return `
      <div class="nfpa-preview-card">
        <div class="nfpa-table-caption">${caption}</div>
        <div class="preview-table-wrap nfpa-table-wrap">
          <table class="nfpa-preview-table"${cssWidth}>
            <thead>${headerMarkup}</thead>
            <tbody>${rowMarkup}</tbody>
          </table>
        </div>
        ${noteMarkup}
      </div>
    `;
  }

  function parsePreviewLimit(candidate, label) {
    const notes = (candidate.notes || []).join(" ");
    const pattern = new RegExp(`${label}\\s+([0-9.]+)\\s*ft`, "i");
    const match = notes.match(pattern);
    return match ? Number.parseFloat(match[1]) : null;
  }

  function parsePreviewKPressure(candidate) {
    const match = candidate.basis?.match(/K\s*([0-9.]+)\s*@\s*([0-9.]+)\s*psi/i);
    if (!match) return { kFactor: null, pressure: null };
    return {
      kFactor: Number.parseFloat(match[1]),
      pressure: Number.parseFloat(match[2]),
    };
  }

  function getPreviewOrientation(candidate) {
    const orientation = (candidate.notes || []).find((note) =>
      /pendent|upright/i.test(note) &&
      !/storage|ceiling-only|sprinklers required/i.test(note)
    );
    return orientation || "-";
  }

  function getEsfrPreviewCommodity(candidate) {
    const name = candidate.name || "";
    if (/exposed expanded group a/i.test(name)) return "Exposed expanded Group A plastic";
    if (/exposed nonexpanded group a/i.test(name)) return "Exposed nonexpanded Group A plastic";
    if (/cartoned expanded group a/i.test(name)) return "Cartoned expanded Group A plastic";
    if (/cartoned group a/i.test(name)) return "Cartoned nonexpanded Group A plastic";
    if (/class i-iv/i.test(name)) return "Class I through Class IV";
    if (/rubber tires/i.test(name)) return "Rubber tires";
    if (/roll paper/i.test(name)) return "Roll paper";
    return candidate.name.replace(/^ESFR\s+/i, "").replace(/\s+option$/i, "");
  }

  function getEsfrPreviewArrangement(candidate) {
    const name = candidate.name || "";
    if (/palletized\/solid-piled|solid-piled/i.test(name)) return "Palletized and solid-piled storage";
    if (/rack/i.test(name)) return "Single-, double-, and multiple-row racks";
    return "-";
  }

  function buildNfpaStyleTablePreview(selected, candidates) {
    if (/^Table\s+25\.4\.1\.1\s+\+\s+Table\s+25\.4\./i.test(selected.tableTitle || "")) {
      const sameTableRows = candidates
        .filter((candidate) => candidate.systemType === selected.systemType && candidate.tableTitle === selected.tableTitle)
        .sort(compareCandidates)
        .slice(0, 18);

      return buildNfpaSourceTablePreview({
        caption: selected.tableTitle,
        minWidth: 1180,
        headerRows: [
          [
            { label: "Commodity<br>Class", rowspan: 2 },
            { label: "Storage<br>Arrangement", rowspan: 2 },
            { label: "Maximum<br>Storage Height", colspan: 2 },
            { label: "Maximum<br>Ceiling/Roof Height", colspan: 2 },
            { label: "Ceiling Sprinkler Water Demand", colspan: 3 },
            { label: "In-Rack Sprinkler Water Demand", colspan: 2 },
            { label: "Total", rowspan: 2 },
          ],
          [
            { label: "ft" },
            { label: "m" },
            { label: "ft" },
            { label: "m" },
            { label: "Sprinkler<br>Temperature" },
            { label: "Density<br>gpm/ft2" },
            { label: "Area<br>ft2" },
            { label: "IRAS<br>Arrangement" },
            { label: "Demand" },
          ],
        ],
        rows: sameTableRows.map((candidate) => {
          const temperature = (candidate.notes || []).find((note) => /temperature-rated/i.test(note)) || "-";
          const level = (candidate.notes || []).find((note) => /in-rack sprinklers.*represented/i.test(note)) || "-";
          return {
            selected: candidate.id === selected.id,
            cells: [
              candidate.preview?.commodity || "-",
              candidate.preview?.arrangement || "-",
              Number.isFinite(candidate.preview?.maxStorage) ? formatNumber(candidate.preview.maxStorage, 0) : "-",
              Number.isFinite(candidate.preview?.maxStorage) ? formatNumber(candidate.preview.maxStorage * 0.3048, 1) : "-",
              Number.isFinite(candidate.preview?.maxCeiling) ? formatNumber(candidate.preview.maxCeiling, 0) : "-",
              Number.isFinite(candidate.preview?.maxCeiling) ? formatNumber(candidate.preview.maxCeiling * 0.3048, 1) : "-",
              temperature.replace("-rated", ""),
              Number.isFinite(candidate.preview?.density) ? formatNumber(candidate.preview.density, 3) : "-",
              Number.isFinite(candidate.preview?.area) ? formatNumber(candidate.preview.area, 0) : "-",
              level,
              Number.isFinite(candidate.preview?.inRackSprinklers) && Number.isFinite(candidate.preview?.inRackFlow)
                ? `${formatNumber(candidate.preview.inRackSprinklers, 0)} @ ${formatNumber(candidate.preview.inRackFlow, 0)} gpm`
                : formatOptionalGpm(candidate.inRackDemand),
              `<strong>${formatGpm(candidate.total)}</strong>`,
            ],
          };
        }),
        notes: selected.notes?.filter(Boolean),
      });
    }

    if (selected.systemType !== "ESFR") return "";
    if (!/^Table\s+(14\.4\.1|15\.4\.1|16\.2\.3\.1|17\.2\.3\.1|23\.3\.1|23\.4\.2|23\.5\.1|23\.6\.1|23\.5|23\.6)/i.test(selected.tableTitle || "")) return "";

    const sameTableRows = candidates
      .filter((candidate) => candidate.systemType === selected.systemType && candidate.tableTitle === selected.tableTitle)
      .map((candidate) => {
        const parsed = parsePreviewKPressure(candidate);
        return {
          candidate,
          maxStorage: candidate.preview?.maxStorage ?? parsePreviewLimit(candidate, "Maximum storage"),
          maxCeiling: candidate.preview?.maxCeiling ?? parsePreviewLimit(candidate, "maximum ceiling"),
          kFactor: candidate.preview?.kFactor ?? parsed.kFactor,
          pressure: candidate.preview?.pressure ?? parsed.pressure,
          orientation: candidate.preview?.orientation ?? getPreviewOrientation(candidate),
          commodity: candidate.preview?.commodity ?? getEsfrPreviewCommodity(candidate),
          arrangement: candidate.preview?.arrangement ?? getEsfrPreviewArrangement(candidate),
        };
      })
      .sort((a, b) =>
        (a.arrangement || "").localeCompare(b.arrangement || "") ||
        (a.commodity || "").localeCompare(b.commodity || "") ||
        (a.maxStorage ?? 999) - (b.maxStorage ?? 999) ||
        (a.maxCeiling ?? 999) - (b.maxCeiling ?? 999) ||
        (a.kFactor ?? 999) - (b.kFactor ?? 999) ||
        (a.pressure ?? 999) - (b.pressure ?? 999)
      );

    if (!sameTableRows.length) return "";

    return buildNfpaSourceTablePreview({
      caption: selected.tableTitle,
      minWidth: 1040,
      headerRows: [
        [
          { label: "Storage<br>Arrangement", rowspan: 2 },
          { label: "Commodity", rowspan: 2 },
          { label: "Maximum<br>Storage Height", colspan: 2 },
          { label: "Maximum<br>Ceiling/Roof Height", colspan: 2 },
          { label: "Nominal<br>K-Factor", rowspan: 2 },
          { label: "Orientation", rowspan: 2 },
          { label: "Minimum<br>Operating Pressure", colspan: 2 },
        ],
        [
          { label: "ft" },
          { label: "m" },
          { label: "ft" },
          { label: "m" },
          { label: "psi" },
          { label: "bar" },
        ],
      ],
      rows: sameTableRows.map((row) => ({
        selected: row.candidate.id === selected.id,
        cells: [
          row.arrangement,
          row.commodity,
          Number.isFinite(row.maxStorage) ? formatNumber(row.maxStorage, 0) : "-",
          Number.isFinite(row.maxStorage) ? formatNumber(row.maxStorage * 0.3048, 1) : "-",
          Number.isFinite(row.maxCeiling) ? formatNumber(row.maxCeiling, 0) : "-",
          Number.isFinite(row.maxCeiling) ? formatNumber(row.maxCeiling * 0.3048, 1) : "-",
          Number.isFinite(row.kFactor) ? formatNumber(row.kFactor, 1) : "-",
          row.orientation,
          Number.isFinite(row.pressure) ? formatNumber(row.pressure, 0) : "NA",
          Number.isFinite(row.pressure) ? formatNumber(row.pressure * 0.0689476, 1) : "NA",
        ],
      })),
    });
  }

  function calcHeadFlow(kFactor, pressure) {
    if (!(kFactor > 0) || !(pressure > 0)) return 0;
    return kFactor * Math.sqrt(pressure);
  }

  function normalizeCommodity(value) {
    if (value === "Cartoned Group A") return "Group A Plastics";
    if (value === "Cartoned Expanded Group A") return "Group A Plastics";
    if (value === "Nonexpanded Unstable Group A") return "Group A Plastics";
    if (value === "Nonexpanded Solid Unit Load Group A") return "Group A Plastics";
    if (value === "Expanded Exposed Unstable Group A") return "Group A Plastics";
    if (value === "Expanded Cartoned Unstable Group A") return "Group A Plastics";
    if (value === "Exposed Nonexpanded Group A") return "Group A Plastics";
    if (value === "Exposed Expanded Group A") return "Group A Plastics";
    return value;
  }

  function getInputs() {
    const storageHeight = numberValue(dom.storageHeight);
    const ceilingHeight = numberValue(dom.ceilingHeight);
    const aisleWidth = numberValue(dom.aisleWidth);
    const missingInputs = [];
    if (!Number.isFinite(storageHeight)) missingInputs.push("storage height");
    if (!Number.isFinite(ceilingHeight)) missingInputs.push("ceiling / roof height");
    if (!Number.isFinite(aisleWidth)) missingInputs.push("aisle width");
    return {
      edition: dom.edition.value,
      commodity: dom.commodity.value,
      commodityFamily: normalizeCommodity(dom.commodity.value),
      arrangement: dom.arrangement.value,
      storageHeight,
      ceilingHeight,
      clearance: Number.isFinite(storageHeight) && Number.isFinite(ceilingHeight) ? Math.max(0, ceilingHeight - storageHeight) : null,
      aisleWidth,
      rackGeometry: dom.rackGeometry?.value || "unknown",
      ceilingSystem: dom.ceilingSystem.value,
      encapsulated: dom.encapsulated.checked,
      missingInputs,
    };
  }

  function matchesAny(value, accepted) {
    if (!accepted || accepted.length === 0) return true;
    return accepted.includes(value);
  }

  function rowMatchesInputs(row, inputs) {
    const when = row.when || {};
    const editions = row.editions || (row.edition ? [row.edition] : []);
    if (!matchesAny(inputs.edition, editions)) return false;
    if (!matchesAny(inputs.systemType, when.systemTypes || (row.systemType ? [row.systemType] : []))) return false;
    if (!matchesAny(inputs.arrangement, when.arrangements)) return false;
    const hasCommodityFilter = Boolean(when.commodities?.length || when.commodityFamilies?.length);
    const commodityMatch = when.commodities?.length ? when.commodities.includes(inputs.commodity) : false;
    const commodityFamilyMatch = when.commodityFamilies?.length ? when.commodityFamilies.includes(inputs.commodityFamily) : false;
    if (
      hasCommodityFilter &&
      !commodityMatch &&
      !commodityFamilyMatch
    ) {
      return false;
    }
    if (when.encapsulated !== undefined && inputs.encapsulated !== when.encapsulated) return false;
    if (when.storageHeightMinExclusive !== undefined && !(inputs.storageHeight > when.storageHeightMinExclusive)) return false;
    if (when.storageHeightMaxInclusive !== undefined && !(inputs.storageHeight <= when.storageHeightMaxInclusive)) return false;
    if (when.ceilingHeightMaxInclusive !== undefined && !(inputs.ceilingHeight <= when.ceilingHeightMaxInclusive)) return false;
    if (when.clearanceMaxInclusive !== undefined && !(inputs.clearance <= when.clearanceMaxInclusive)) return false;
    if (when.aisleWidthMaxInclusive !== undefined && !(inputs.aisleWidth <= when.aisleWidthMaxInclusive)) return false;
    if (when.aisleWidthMinInclusive !== undefined && !(inputs.aisleWidth >= when.aisleWidthMinInclusive)) return false;
    return true;
  }

  function resolveArea(row, inputs) {
    if (row.dryDesignArea && (inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction")) {
      return row.dryDesignArea;
    }
    return row.designArea;
  }

  function buildCandidateFromCriteriaRow(row, inputs) {
    let basis = "";
    let sprinklerDemand = 0;

    if (row.calculation === "density-area") {
      const minimums = row.systemType === "CMDA" ? getClassSolidShelfCmdaMinimums(inputs) : null;
      const designArea = resolveArea(row, inputs);
      if (minimums && designArea < minimums.areaMin) return null;
      const notes = [];
      const density = applyDensityFloor(row.density, minimums, notes);
      sprinklerDemand = density * designArea;
      basis = `${formatNumber(density, 3)} gpm/ft2 over ${formatNumber(designArea, 0)} ft2`;
      row = {
        ...row,
        note: [row.note, ...notes, minimums ? `Design area minimum ${formatNumber(minimums.areaMin, 0)} ft2 checked per ${minimums.source}` : ""].filter(Boolean).join("; "),
      };
    } else if (row.calculation === "kfactor-pressure") {
      const headFlow = calcHeadFlow(row.kFactor, row.pressure);
      sprinklerDemand = headFlow * row.operatingSprinklers;
      basis = `${row.operatingSprinklers} sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head`;
    } else {
      return null;
    }

    const hoseAllowance = row.hoseAllowance || 0;
    const inRackDemand = row.inRackDemand || 0;
    const total = sprinklerDemand + inRackDemand + hoseAllowance;
    return {
      id: row.id,
      name: row.label,
      basis,
      sprinklerDemand,
      hoseAllowance,
      inRackDemand,
      total,
      source: row.source || "-",
      tableTitle: row.tableTitle || "",
      confidence: row.confidence || "criteria-row",
      notes: [row.note].filter(Boolean),
    };
  }

  function buildLegacySeedCandidates(inputs) {
    const candidates = [];
    for (const rule of dataset.seedCriteria || []) {
      if (rule.edition !== inputs.edition) continue;
      if (rule.systemType !== inputs.systemType) continue;
      if (rule.systemType === "CMDA" && isRackArrangement(inputs.arrangement)) continue;
      if (rule.systemType === "CMDA" && inputs.storageHeight > (rule.appliesWhen?.storageHeightMinExclusive || 0)) {
        const isDryLike = inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction";
        const area = isDryLike ? rule.dryAreaMin : rule.wetAreaMin;
        const hoseAllowance = rule.hoseAllowance || (inputs.storageHeight > 12 ? 500 : 250);
        const sprinklerDemand = rule.densityMin * area;
        candidates.push({
          id: rule.id,
          name: rule.label,
          basis: `Minimum ${formatNumber(rule.densityMin, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: rule.source,
          confidence: rule.confidence,
          tableTitle: rule.tableTitle || "",
          notes: [rule.note].filter(Boolean),
        });
      }
      if (rule.systemType === "ESFR") {
        const headFlow = calcHeadFlow(rule.kFactor || 25.2, rule.pressure || 15);
        const sprinklers = rule.operatingSprinklers || 12;
        const hoseAllowance = rule.hoseAllowance || 250;
        const sprinklerDemand = headFlow * sprinklers;
        candidates.push({
          id: rule.id,
          name: rule.label,
          basis: `${sprinklers} sprinklers, K${formatNumber(rule.kFactor || 25.2, 1)} @ ${formatNumber(rule.pressure || 15, 0)} psi = ${formatNumber(headFlow)} gpm/head`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: rule.source,
          confidence: rule.confidence,
          tableTitle: rule.tableTitle || "",
          notes: [rule.note].filter(Boolean),
        });
      }
    }
    return candidates;
  }

  function isRackArrangement(arrangement) {
    return arrangement === "Single-Row Rack" || arrangement === "Double-Row Rack" || arrangement === "Multiple-Row Rack";
  }

  function isGroupAPlasticCommodity(commodity) {
    return commodity === "Cartoned Group A" ||
      commodity === "Cartoned Expanded Group A" ||
      commodity === "Nonexpanded Unstable Group A" ||
      commodity === "Nonexpanded Solid Unit Load Group A" ||
      commodity === "Expanded Exposed Unstable Group A" ||
      commodity === "Expanded Cartoned Unstable Group A" ||
      commodity === "Exposed Nonexpanded Group A" ||
      commodity === "Exposed Expanded Group A";
  }

  function getCmdaGroupAColumn(inputs) {
    if (inputs.commodity === "Cartoned Group A") {
      return { column: "C", description: "Column C: nonexpanded, stable, cartoned" };
    }
    if (inputs.commodity === "Cartoned Expanded Group A") {
      return { column: "E", description: "Column E: expanded, cartoned, stable" };
    }
    if (inputs.commodity === "Nonexpanded Unstable Group A") {
      return { column: "A", description: "Column A: nonexpanded, unstable" };
    }
    if (inputs.commodity === "Nonexpanded Solid Unit Load Group A") {
      return { column: "A", description: "Column A: nonexpanded, stable, solid unit load" };
    }
    if (inputs.commodity === "Expanded Exposed Unstable Group A") {
      return { column: "C", description: "Column C: expanded, exposed, unstable" };
    }
    if (inputs.commodity === "Expanded Cartoned Unstable Group A") {
      return { column: "D", description: "Column D: expanded, cartoned, unstable" };
    }
    if (inputs.commodity === "Exposed Nonexpanded Group A") {
      return { column: "E", description: "Column E: nonexpanded, stable, exposed" };
    }
    if (inputs.commodity === "Exposed Expanded Group A") {
      return { column: "B", description: "Column B: expanded, exposed, stable" };
    }
    return null;
  }

  function getCmdaGroupASource(inputs) {
    if (inputs.edition === "2016") {
      return { tableTitle: "Table 15.2.2.5(a)", source: "15.2.2.5 / 15.2.2.7 / 15.2.2.8.1 / 12.8.6" };
    }
    if (uses2022StorageTables(inputs.edition)) {
      return { tableTitle: "Table 21.3.3(a)", source: "21.3.3 / 21.3.3.1 / 20.15.2.6" };
    }
    return { tableTitle: "Table 21.3.3(a)", source: "21.3.3 / 21.3.3.1 / 20.12.2.6" };
  }

  function getHoseAllowanceForCmdaArea(area) {
    if (area <= 1200) return { hoseAllowance: 250, duration: 60 };
    if (area <= 1500) return { hoseAllowance: 500, duration: 90 };
    if (area <= 2600) return { hoseAllowance: 500, duration: 120 };
    return { hoseAllowance: 500, duration: 150 };
  }

  function isDryLikeSystem(inputs) {
    return inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction";
  }

  function getClassSolidShelfCmdaMinimums(inputs) {
    if (inputs.storageHeight <= 12) return null;
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return null;
    if (!["Palletized / Solid-Piled", "Shelf", "Back-to-Back Shelf"].includes(inputs.arrangement)) return null;
    return {
      densityMin: 0.15,
      areaMin: isDryLikeSystem(inputs) ? 2600 : 2000,
      source: inputs.edition === "2016" ? "14.2.4.5" : is2025Edition(inputs) ? "21.1.8.3 / 21.2.2.1.1" : inputs.edition === "2022" ? "21.1.10.4 / 21.2.2.2.1" : "21.2.2.5",
    };
  }

  function applyDensityFloor(density, minimums, notes) {
    if (!minimums || density >= minimums.densityMin) return density;
    notes.push(`Density floor ${formatNumber(minimums.densityMin, 2)} gpm/ft2 applied per ${minimums.source}`);
    return minimums.densityMin;
  }

  function getHoseAllowanceForSprinklerCount(count) {
    if (count <= 12) return { hoseAllowance: 250, duration: 60 };
    if (count <= 15) return { hoseAllowance: 500, duration: 90 };
    if (count <= 25) return { hoseAllowance: 500, duration: 120 };
    return { hoseAllowance: 500, duration: 150 };
  }

  function getRackStorageHeightDensityFactor(storageHeight) {
    if (storageHeight <= 12) return 0.6;
    if (storageHeight <= 15) return 0.6 + ((storageHeight - 12) / 3) * 0.15;
    if (storageHeight <= 20) return 0.75 + ((storageHeight - 15) / 5) * 0.25;
    if (storageHeight <= 25) return 1 + ((storageHeight - 20) / 5) * 0.25;
    return null;
  }

  function getRackWithInRackStorageHeightDensityFactor(storageHeight) {
    if (storageHeight <= 20) return getRackStorageHeightDensityFactor(storageHeight);
    if (storageHeight <= 25) return 1;
    return null;
  }

  function getSolidPileStorageHeightDensityFactor(storageHeight) {
    if (storageHeight <= 12) return 0.6;
    if (storageHeight <= 15) return 0.6 + ((storageHeight - 12) / 3) * 0.1;
    if (storageHeight <= 20) return 0.7 + ((storageHeight - 15) / 5) * 0.3;
    if (storageHeight <= 25) return 1 + ((storageHeight - 20) / 5) * 0.35;
    return null;
  }

  function getClassRackCurveKey(inputs) {
    return inputs.encapsulated ? `${inputs.commodity} Encapsulated` : inputs.commodity;
  }

  function getRackCurveIdsForInputs(inputs) {
    if (inputs.arrangement === "Multiple-Row Rack") {
      return ["C", "D"];
    }
    if (inputs.commodity === "Class I") {
      return inputs.aisleWidth >= 8 ? ["A", "C"] : ["B", "D"];
    }
    return inputs.aisleWidth >= 8 ? ["A", "B"] : ["C", "D"];
  }

  function getCmdaClassCurveSource(inputs, family, figureSuffix, temperatureKey = "") {
    if (family === "solid") {
      if (inputs.edition === "2016") {
        return {
          tableTitle: temperatureKey === "ordinary" ? "Figure 14.2.4.1" : "Figure 14.2.4.2",
          source: "14.2.4.1 / 14.2.4.2 / 14.2.4.3 / 12.8.6",
        };
      }
      if (inputs.edition === "2022") {
        return {
          tableTitle: temperatureKey === "ordinary" ? "Figure 21.2.2.3.1" : "Figure 21.2.2.3.2",
          source: "21.2.2.3.1 / 21.2.2.3.2 / 21.2.2.3.3 / 20.15.2.6",
        };
      }
      if (is2025Edition(inputs)) {
        return {
          tableTitle: "Table 21.2.2.1.1",
          source: "21.2.2.1.1 / 21.1.8.3 / 20.15.2.6",
        };
      }
      return {
        tableTitle: temperatureKey === "ordinary" ? "Figure 21.2.2.1" : "Figure 21.2.2.2",
        source: "21.2.2.1 / 21.2.2.2 / 21.2.2.3 / 20.12.2.6",
      };
    }
    if (family === "rack-inrack") {
      if (inputs.edition === "2016") {
        return {
          tableTitle: `Figure 16.2.1.3.2(${figureSuffix})`,
          source: "16.2.1.3.2 / 16.2.1.4.3.1 / 16.2.1.4.4 / 12.8.6",
        };
      }
      if (inputs.edition === "2022") {
        return {
          tableTitle: `Figure 25.3.2.3.1(${figureSuffix})`,
          source: "25.3.2.3.1 / 25.3.2.4 / 25.12.2.1 / 25.12.3.1 / 20.15.2.6",
        };
      }
      if (is2025Edition(inputs)) {
        return {
          tableTitle: `Figure 25.4.2.3.1.1(${figureSuffix})`,
          source: "25.4.2.3.1.1 / 25.4.2.4.1 / Chapter 25 / 20.15.2.6",
        };
      }
      return {
        tableTitle: `Figure 25.2.3.2.3.1(${figureSuffix})`,
        source: "25.2.3.2.3.1 / 25.2.3.2.4 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6",
      };
    }
    if (inputs.edition === "2016") {
      return {
        tableTitle: `Figure 16.2.1.3.2(${figureSuffix})`,
        source: "16.2.1.3.2 / 16.2.1.3.2.1 / 16.2.1.3.4.1 / 12.8.6",
      };
    }
    if (inputs.edition === "2022") {
      return {
        tableTitle: `Figure 21.4.1.2.2.1(${figureSuffix})`,
        source: "Table 21.4.1.2.1.1 / 21.4.1.2.2.1 / Figure 21.4.1.2.2.1 / 20.15.2.6",
      };
    }
    if (is2025Edition(inputs)) {
      return {
        tableTitle: `Table 21.4.1.2.1(${figureSuffix})`,
        source: "Table 21.4.1.2.1 / 21.4.1.4 / 20.15.2.6",
      };
    }
    return {
      tableTitle: `Figure 21.4.1.2(${figureSuffix})`,
      source: "Table 21.4.1.2 / 21.4.1.2 / 21.4.1.2.1 / 21.4.1.4.1 / 20.12.2.6",
    };
  }

  const CMDA_CLASS_2022_TABLE_ROWS = [
    { minExclusive: 12, max: 15, densities: { "Class I": { high: 0.15, ordinary: 0.15 }, "Class II": { high: 0.15, ordinary: 0.16 }, "Class III": { high: 0.2, ordinary: 0.2 }, "Class IV": { high: 0.21, ordinary: 0.27 } } },
    { minExclusive: 15, max: 18, densities: { "Class I": { high: 0.15, ordinary: 0.19 }, "Class II": { high: 0.15, ordinary: 0.21 }, "Class III": { high: 0.2, ordinary: 0.26 }, "Class IV": { high: 0.27, ordinary: 0.35 } } },
    { minExclusive: 18, max: 20, densities: { "Class I": { high: 0.15, ordinary: 0.21 }, "Class II": { high: 0.17, ordinary: 0.23 }, "Class III": { high: 0.21, ordinary: 0.29 }, "Class IV": { high: 0.3, ordinary: 0.39 } } },
    { minExclusive: 20, max: 22, densities: { "Class I": { high: 0.17, ordinary: 0.23 }, "Class II": { high: 0.19, ordinary: 0.25 }, "Class III": { high: 0.23, ordinary: 0.32 }, "Class IV": { high: 0.33, ordinary: 0.43 } } },
    { minExclusive: 22, max: 25, densities: { "Class I": { high: 0.2, ordinary: 0.28 }, "Class II": { high: 0.23, ordinary: 0.31 }, "Class III": { high: 0.28, ordinary: 0.39 }, "Class IV": { high: 0.41, ordinary: 0.53 } } },
    { minExclusive: 25, max: 28, densities: { "Class I": { high: 0.25, ordinary: 0.35 }, "Class II": { high: 0.28, ordinary: 0.38 }, "Class III": { high: 0.35, ordinary: 0.48 }, "Class IV": { high: 0.5, ordinary: 0.64 } } },
    { minExclusive: 28, max: 30, densities: { "Class I": { high: 0.29, ordinary: 0.4 }, "Class II": { high: 0.32, ordinary: 0.44 }, "Class III": { high: 0.4, ordinary: 0.55 }, "Class IV": { high: 0.57, ordinary: 0.74 } } },
  ];

  const rackPoint = (highDensity, ordinaryDensity, highArea = 2000, ordinaryArea = 2000) => ({
    high: { density: highDensity, area: highArea },
    ordinary: { density: ordinaryDensity, area: ordinaryArea },
  });

  const chapter25RackPoint = { chapter25: true };

  const CMDA_CLASS_2022_SINGLE_DOUBLE_RACK_TABLES = [
    {
      suffix: "a",
      minExclusive: 12,
      max: 15,
      title: "Table 21.4.1.2.1.1(a)",
      values: {
        "Class I": { no: { mandatory: false, aisles: { 4: rackPoint(0.19, 0.22), 8: rackPoint(0.17, 0.20) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.33, 0.33, 2400, 4000), 8: rackPoint(0.28, 0.32) } } },
        "Class II": { no: { mandatory: false, aisles: { 4: rackPoint(0.23, 0.26), 8: rackPoint(0.20, 0.22) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.33, 0.33, 2400, 4000), 8: rackPoint(0.28, 0.32) } } },
        "Class III": { no: { mandatory: false, aisles: { 4: rackPoint(0.26, 0.29), 8: rackPoint(0.22, 0.25) } }, yes: chapter25RackPoint },
        "Class IV": { no: { mandatory: false, aisles: { 4: { high: { density: 0.35, area: 2000 }, ordinary: { density: 0.36, area: 3000 } }, 8: rackPoint(0.30, 0.34) } }, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "b",
      minExclusive: 15,
      max: 18,
      title: "Table 21.4.1.2.1.1(b)",
      values: {
        "Class I": { no: { mandatory: false, aisles: { 4: rackPoint(0.27, 0.31), 8: rackPoint(0.25, 0.28) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.47, 0.47, 2400, 4000), 8: rackPoint(0.40, 0.46) } } },
        "Class II": { no: { mandatory: false, aisles: { 4: rackPoint(0.32, 0.37), 8: rackPoint(0.28, 0.31) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.47, 0.47, 2400, 4000), 8: rackPoint(0.40, 0.46) } } },
        "Class III": { no: { mandatory: false, aisles: { 4: rackPoint(0.37, 0.42), 8: rackPoint(0.31, 0.36) } }, yes: chapter25RackPoint },
        "Class IV": { no: { mandatory: false, aisles: { 4: { high: { density: 0.49, area: 2000 }, ordinary: { density: 0.51, area: 3000 } }, 8: rackPoint(0.42, 0.48) } }, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "c",
      minExclusive: 18,
      max: 20,
      title: "Table 21.4.1.2.1.1(c)",
      values: {
        "Class I": { no: { mandatory: false, aisles: { 4: rackPoint(0.32, 0.37), 8: rackPoint(0.29, 0.33) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.55, 0.55, 2400, 4000), 8: rackPoint(0.47, 0.54) } } },
        "Class II": { no: { mandatory: false, aisles: { 4: rackPoint(0.38, 0.44), 8: rackPoint(0.33, 0.37) } }, yes: { mandatory: false, aisles: { 4: rackPoint(0.55, 0.55, 2400, 4000), 8: rackPoint(0.47, 0.54) } } },
        "Class III": { no: { mandatory: false, aisles: { 4: rackPoint(0.43, 0.49), 8: rackPoint(0.37, 0.42) } }, yes: chapter25RackPoint },
        "Class IV": { no: { mandatory: false, aisles: { 4: { high: { density: 0.58, area: 2000 }, ordinary: { density: 0.60, area: 3000 } }, 8: rackPoint(0.50, 0.57) } }, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "d",
      minExclusive: 20,
      max: 22,
      title: "Table 21.4.1.2.1.1(d)",
      values: {
        "Class I": { no: { mandatory: false, aisles: { 4: rackPoint(0.42, 0.48), 8: rackPoint(0.38, 0.43) } }, yes: chapter25RackPoint },
        "Class II": { no: { mandatory: false, aisles: { 4: rackPoint(0.49, 0.57), 8: rackPoint(0.43, 0.48) } }, yes: chapter25RackPoint },
        "Class III": { no: { mandatory: false, aisles: { 4: rackPoint(0.56, 0.64), 8: rackPoint(0.48, 0.55) } }, yes: chapter25RackPoint },
        "Class IV": { no: { mandatory: false, aisles: { 4: { high: { density: 0.75, area: 2000 }, ordinary: { density: 0.78, area: 3000 } }, 8: rackPoint(0.65, 0.74) } }, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "e",
      minExclusive: 22,
      max: 25,
      title: "Table 21.4.1.2.1.1(e)",
      values: {
        "Class I": { no: { mandatory: false, aisles: { 4: rackPoint(0.56, 0.65), 8: rackPoint(0.51, 0.58) } }, yes: chapter25RackPoint },
        "Class II": { no: { mandatory: false, aisles: { 4: rackPoint(0.67, 0.77), 8: rackPoint(0.58, 0.65) } }, yes: chapter25RackPoint },
        "Class III": { no: { mandatory: false, aisles: { 4: rackPoint(0.75, 0.86), 8: rackPoint(0.65, 0.74) } }, yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
  ];

  const CMDA_CLASS_2022_MULTIPLE_RACK_TABLES = [
    {
      suffix: "a",
      minExclusive: 12,
      max: 15,
      title: "Table 21.4.1.3.1.1(a)",
      values: {
        "Class I": { no: rackPoint(0.22, 0.25), yes: rackPoint(0.28, 0.31) },
        "Class II": { no: rackPoint(0.25, 0.28), yes: rackPoint(0.32, 0.35) },
        "Class III": { no: rackPoint(0.28, 0.31), yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "b",
      minExclusive: 15,
      max: 18,
      title: "Table 21.4.1.3.1.1(b)",
      values: {
        "Class I": { no: rackPoint(0.31, 0.35), yes: rackPoint(0.39, 0.44) },
        "Class II": { no: rackPoint(0.36, 0.40), yes: rackPoint(0.45, 0.50) },
        "Class III": { no: rackPoint(0.40, 0.44), yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "c",
      minExclusive: 18,
      max: 20,
      title: "Table 21.4.1.3.1.1(c)",
      values: {
        "Class I": { no: rackPoint(0.37, 0.41), yes: rackPoint(0.46, 0.51) },
        "Class II": { no: rackPoint(0.42, 0.47), yes: rackPoint(0.53, 0.59) },
        "Class III": { no: rackPoint(0.47, 0.52), yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "d",
      minExclusive: 20,
      max: 22,
      title: "Table 21.4.1.3.1.1(d)",
      values: {
        "Class I": { no: rackPoint(0.48, 0.53), yes: chapter25RackPoint },
        "Class II": { no: chapter25RackPoint, yes: chapter25RackPoint },
        "Class III": { no: chapter25RackPoint, yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
    {
      suffix: "e",
      minExclusive: 22,
      max: 25,
      title: "Table 21.4.1.3.1.1(e)",
      values: {
        "Class I": { no: rackPoint(0.65, 0.72), yes: chapter25RackPoint },
        "Class II": { no: chapter25RackPoint, yes: chapter25RackPoint },
        "Class III": { no: chapter25RackPoint, yes: chapter25RackPoint },
        "Class IV": { no: chapter25RackPoint, yes: chapter25RackPoint },
      },
    },
  ];

  const cmda25_4 = (packaging, commodity, tableTitle, maxStorage, maxCeiling, arrangement, aisle, levelKey, high, ordinary) => ({
    packaging,
    commodity,
    tableTitle,
    maxStorage,
    maxCeiling,
    arrangement,
    aisle,
    levelKey,
    high,
    ordinary,
  });

  const CMDA_2025_25_4_CLASS_RACK_ROWS = [
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 8, "one", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 8, "more", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 8, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 4, "one", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 4, "more", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "singleDouble", 4, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "multiple", "any", "one", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "multiple", "any", "more", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 15, 35, "multiple", "any", "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 8, "one", 0.16, 0.18),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 8, "more", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 8, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 4, "one", 0.20, 0.22),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 4, "more", 0.16, 0.17),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "singleDouble", 4, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "multiple", "any", "one", 0.20, 0.22),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "multiple", "any", "more", 0.16, 0.18),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 18, 38, "multiple", "any", "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 8, "one", 0.19, 0.22),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 8, "more", 0.15, 0.17),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 8, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 4, "one", 0.23, 0.26),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 4, "more", 0.18, 0.20),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "singleDouble", 4, "every", 0.15, 0.15),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "multiple", "any", "one", 0.23, 0.26),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "multiple", "any", "more", 0.18, 0.20),
    cmda25_4("exposed", "Class I", "Table 25.4.2.1.2.1(A)(a)", 25, 45, "multiple", "any", "every", 0.15, 0.15),
  ];

  const CMDA_2025_25_4_CLASS_RACK_DATA = {
    exposed: {
      "Class II": [
        [15, 35, "singleDouble", 8, [["one", 0.15, 0.15], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.15, 0.18], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "multiple", "any", [["one", 0.15, 0.18], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 8, [["one", 0.18, 0.20], ["more", 0.15, 0.16], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 4, [["one", 0.21, 0.26], ["more", 0.17, 0.20], ["every", 0.15, 0.15]]],
        [18, 38, "multiple", "any", [["one", 0.21, 0.26], ["more", 0.17, 0.20], ["every", 0.15, 0.15]]],
        [25, 45, "singleDouble", 8, [["one", 0.21, 0.24], ["more", 0.17, 0.19], ["every", 0.15, 0.15]]],
        [25, 45, "singleDouble", 4, [["one", 0.25, 0.30], ["more", 0.20, 0.24], ["every", 0.15, 0.18]]],
        [25, 45, "multiple", "any", [["one", 0.25, 0.30], ["more", 0.20, 0.24], ["every", 0.15, 0.18]]],
      ],
      "Class III": [
        [15, 35, "singleDouble", 8, [["one", 0.15, 0.17], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.17, 0.20], ["more", 0.15, 0.16], ["every", 0.15, 0.15]]],
        [15, 35, "multiple", "any", [["one", 0.17, 0.20], ["more", 0.15, 0.16], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 8, [["one", 0.21, 0.23], ["more", 0.17, 0.19], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 4, [["one", 0.24, 0.28], ["more", 0.19, 0.22], ["every", 0.15, 0.17]]],
        [18, 38, "multiple", "any", [["one", 0.24, 0.28], ["more", 0.19, 0.22], ["every", 0.15, 0.17]]],
        [25, 45, "singleDouble", 8, [["one", 0.25, 0.28], ["more", 0.20, 0.22], ["every", 0.15, 0.17]]],
        [25, 45, "singleDouble", 4, [["one", 0.29, 0.33], ["more", 0.23, 0.26], ["every", 0.17, 0.20]]],
        [25, 45, "multiple", "any", [["one", 0.29, 0.33], ["more", 0.23, 0.26], ["every", 0.17, 0.20]]],
      ],
      "Class IV": [
        [15, 35, "singleDouble", 8, [["one", 0.19, 0.22], ["more", 0.15, 0.18], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.23, 0.27], ["more", 0.18, 0.21], ["every", 0.15, 0.16]]],
        [15, 35, "multiple", "any", [["one", 0.23, 0.27], ["more", 0.18, 0.21], ["every", 0.15, 0.16]]],
        [18, 38, "singleDouble", 8, [["one", 0.27, 0.31], ["more", 0.22, 0.25], ["every", 0.16, 0.19]]],
        [18, 38, "singleDouble", 4, [["one", 0.33, 0.38], ["more", 0.26, 0.30], ["every", 0.20, 0.23]]],
        [18, 38, "multiple", "any", [["one", 0.33, 0.38], ["more", 0.26, 0.30], ["every", 0.20, 0.23]]],
        [25, 45, "singleDouble", 8, [["one", 0.32, 0.37], ["more", 0.26, 0.30], ["every", 0.19, 0.22]]],
        [25, 45, "singleDouble", 4, [["one", 0.39, 0.45], ["more", 0.31, 0.36], ["every", 0.23, 0.27]]],
        [25, 45, "multiple", "any", [["two", 0.39, 0.45], ["moreThanTwo", 0.31, 0.36], ["every", 0.23, 0.27]]],
      ],
    },
    cartonedOrEncap: {
      "Class I": [
        [15, 35, "singleDouble", 8, [["one", 0.15, 0.17], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.18, 0.21], ["more", 0.15, 0.17], ["every", 0.15, 0.15]]],
        [15, 35, "multiple", "any", [["one", 0.17, 0.20], ["more", 0.15, 0.16], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 8, [["one", 0.21, 0.23], ["more", 0.17, 0.19], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 4, [["one", 0.26, 0.30], ["more", 0.20, 0.24], ["every", 0.15, 0.18]]],
        [18, 38, "multiple", "any", [["one", 0.24, 0.28], ["more", 0.20, 0.22], ["every", 0.15, 0.17]]],
        [25, 45, "singleDouble", 8, [["one", 0.25, 0.28], ["more", 0.20, 0.22], ["every", 0.15, 0.17]]],
        [25, 45, "singleDouble", 4, [["one", 0.30, 0.35], ["more", 0.24, 0.28], ["every", 0.18, 0.21]]],
        [25, 45, "multiple", "any", [["one", 0.29, 0.33], ["more", 0.23, 0.26], ["every", 0.17, 0.20]]],
      ],
      "Class II": [
        [15, 35, "singleDouble", 8, [["one", 0.15, 0.17], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.18, 0.21], ["more", 0.15, 0.17], ["every", 0.15, 0.15]]],
        [15, 35, "multiple", "any", [["one", 0.19, 0.23], ["more", 0.15, 0.18], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 8, [["one", 0.21, 0.23], ["more", 0.17, 0.19], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 4, [["one", 0.26, 0.30], ["more", 0.20, 0.24], ["every", 0.15, 0.18]]],
        [18, 38, "multiple", "any", [["one", 0.27, 0.32], ["more", 0.21, 0.26], ["every", 0.16, 0.19]]],
        [25, 45, "singleDouble", 8, [["one", 0.25, 0.28], ["more", 0.20, 0.22], ["every", 0.15, 0.17]]],
        [25, 45, "singleDouble", 4, [["one", 0.30, 0.35], ["more", 0.24, 0.28], ["every", 0.18, 0.21]]],
        [25, 45, "multiple", "any", [["one", 0.31, 0.38], ["more", 0.25, 0.30], ["every", 0.19, 0.23]]],
      ],
      "Class III": [
        [15, 35, "singleDouble", 8, [["one", 0.17, 0.19], ["more", 0.15, 0.15], ["every", 0.15, 0.15]]],
        [15, 35, "singleDouble", 4, [["one", 0.21, 0.23], ["more", 0.17, 0.19], ["every", 0.15, 0.15]]],
        [15, 35, "multiple", "any", [["one", 0.22, 0.25], ["more", 0.17, 0.20], ["every", 0.15, 0.15]]],
        [18, 38, "singleDouble", 8, [["one", 0.24, 0.27], ["more", 0.19, 0.22], ["every", 0.15, 0.16]]],
        [18, 38, "singleDouble", 4, [["one", 0.29, 0.33], ["more", 0.23, 0.27], ["every", 0.18, 0.20]]],
        [18, 38, "multiple", "any", [["one", 0.31, 0.35], ["more", 0.25, 0.28], ["every", 0.18, 0.21]]],
        [25, 45, "singleDouble", 8, [["one", 0.28, 0.32], ["more", 0.22, 0.26], ["every", 0.17, 0.19]]],
        [25, 45, "singleDouble", 4, [["one", 0.35, 0.39], ["more", 0.28, 0.31], ["every", 0.21, 0.23]]],
        [25, 45, "multiple", "any", [["one", 0.36, 0.41], ["more", 0.29, 0.33], ["every", 0.22, 0.25]]],
      ],
      "Class IV": [
        [15, 35, "singleDouble", 8, [["one", 0.23, 0.27], ["more", 0.19, 0.22], ["every", 0.15, 0.16]]],
        [15, 35, "singleDouble", 4, [["one", 0.29, 0.33], ["more", 0.23, 0.26], ["every", 0.17, 0.20]]],
        [15, 35, "multiple", "gte8", [["one", 0.29, 0.33], ["more", 0.23, 0.27], ["every", 0.17, 0.20]]],
        [15, 35, "multiple", "lt8", [["one", 0.35, 0.40], ["more", 0.28, 0.32], ["every", 0.21, 0.24]]],
        [18, 38, "singleDouble", 8, [["one", 0.33, 0.39], ["more", 0.27, 0.31], ["every", 0.20, 0.23]]],
        [18, 38, "singleDouble", 4, [["one", 0.40, 0.47], ["more", 0.32, 0.37], ["every", 0.24, 0.28]]],
        [18, 38, "multiple", "gte8", [["one", 0.41, 0.47], ["more", 0.33, 0.38], ["every", 0.24, 0.28]]],
        [18, 38, "multiple", "lt8", [["one", 0.50, 0.56], ["more", 0.40, 0.45], ["every", 0.30, 0.34]]],
        [25, 45, "singleDouble", 8, [["one", 0.39, 0.46], ["more", 0.31, 0.36], ["every", 0.23, 0.27]]],
        [25, 45, "singleDouble", 4, [["one", 0.48, 0.55], ["more", 0.38, 0.44], ["every", 0.29, 0.33]]],
        [25, 45, "multiple", "gte8", [["two", 0.48, 0.56], ["moreThanTwo", 0.38, 0.44], ["every", 0.29, 0.33]]],
        [25, 45, "multiple", "lt8", [["two", 0.59, 0.66], ["moreThanTwo", 0.47, 0.53], ["every", 0.35, 0.40]]],
      ],
    },
  };

  const CMDA_2025_25_4_CLASS_RACK_TABLE_TITLES = {
    exposed: {
      "Class I": "Table 25.4.2.1.2.1(A)(a)",
      "Class II": "Table 25.4.2.1.2.1(A)(b)",
      "Class III": "Table 25.4.2.1.2.1(A)(c)",
      "Class IV": "Table 25.4.2.1.2.1(A)(d)",
    },
    cartonedOrEncap: {
      "Class I": "Table 25.4.2.2.2.1(A)(a)",
      "Class II": "Table 25.4.2.2.2.1(A)(b)",
      "Class III": "Table 25.4.2.2.2.1(A)(c)",
      "Class IV": "Table 25.4.2.2.2.1(A)(d)",
    },
  };

  for (const [packaging, commodities] of Object.entries(CMDA_2025_25_4_CLASS_RACK_DATA)) {
    for (const [commodity, bands] of Object.entries(commodities)) {
      for (const [maxStorage, maxCeiling, arrangement, aisle, levelRows] of bands) {
        for (const [levelKey, high, ordinary] of levelRows) {
          CMDA_2025_25_4_CLASS_RACK_ROWS.push(cmda25_4(
            packaging,
            commodity,
            CMDA_2025_25_4_CLASS_RACK_TABLE_TITLES[packaging][commodity],
            maxStorage,
            maxCeiling,
            arrangement,
            aisle,
            levelKey,
            high,
            ordinary,
          ));
        }
      }
    }
  }

  function getRack2022AislePoint(aisles, aisleWidth, temperatureKey) {
    const fourFoot = aisles[4]?.[temperatureKey];
    const eightFoot = aisles[8]?.[temperatureKey];
    if (!fourFoot || !eightFoot) return null;
    if (aisleWidth <= 4) return { ...fourFoot, aisleNote: "4 ft aisle value used" };
    if (aisleWidth >= 8) return { ...eightFoot, aisleNote: "8 ft aisle value used" };
    const ratio = (aisleWidth - 4) / 4;
    return {
      density: fourFoot.density + (eightFoot.density - fourFoot.density) * ratio,
      area: Math.max(fourFoot.area, eightFoot.area),
      aisleNote: `Density linearly interpolated for ${formatNumber(aisleWidth, 1)} ft aisle between 4 ft and 8 ft values`,
    };
  }

  function buildChapter25RackManualCandidate(inputs, source, tableTitle, reason) {
    return {
      id: `manual-${inputs.edition}-chapter-25-${inputs.commodity}-${inputs.arrangement}-${inputs.storageHeight}`,
      name: "Chapter 25 in-rack/combined design required",
      basis: reason,
      sprinklerDemand: Number.NaN,
      hoseAllowance: Number.NaN,
      inRackDemand: Number.NaN,
      total: Number.NaN,
      completeDesign: false,
      source,
      tableTitle,
      confidence: "manual-review",
      notes: [
        "NFPA 13 directs this branch to Chapter 25 instead of a ceiling-only new-system table row.",
        "Confirm rack dimensions, flue spaces, solid shelves, and in-rack layout before final design.",
      ],
    };
  }

  function build2022RackTableDensityCandidate(inputs, table, temperatureKey, point, source, notes = []) {
    const sprinklerDemand = point.density * point.area;
    const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(point.area);
    const temperatureLabel = temperatureKey === "high" ? "High-temperature-rated" : "Ordinary-temperature-rated";
    const tableTitle = getModernRackTableTitle(inputs, table.title);
    return {
      id: `generated-${inputs.edition}-cmda-rack-table-${inputs.arrangement}-${inputs.commodity}-${inputs.encapsulated ? "encap" : "nonencap"}-${table.suffix}-${temperatureKey}-${point.area}`,
      name: `${tableTitle} ${inputs.commodity}`,
      basis: `${formatNumber(point.density, 3)} gpm/ft2 over ${formatNumber(point.area, 0)} ft2`,
      sprinklerDemand,
      hoseAllowance,
      inRackDemand: 0,
      total: sprinklerDemand + hoseAllowance,
      source,
      tableTitle,
      confidence: "table-derived",
      notes: [
        `${inputs.edition} new-system CMDA rack table criteria; existing-system density/area curves are not used for this branch`,
        `${temperatureLabel} ceiling sprinklers`,
        `Storage height band over ${formatNumber(table.minExclusive, 0)} ft to ${formatNumber(table.max, 0)} ft`,
        point.aisleNote,
        ...notes,
        `Hose duration ${duration} min`,
      ].filter(Boolean),
    };
  }

  function get2025Cmda25_4PackagingKeys(inputs) {
    if (inputs.encapsulated) return ["cartonedOrEncap"];
    return ["exposed", "cartonedOrEncap"];
  }

  function get2025Cmda25_4ArrangementGroup(inputs) {
    if (inputs.aisleWidth < 3.5) return "multiple";
    if (inputs.arrangement === "Multiple-Row Rack") return "multiple";
    if (inputs.arrangement === "Single-Row Rack" || inputs.arrangement === "Double-Row Rack") return "singleDouble";
    return "";
  }

  function get2025Cmda25_4AisleRows(inputs, arrangementGroup) {
    if (arrangementGroup === "multiple") {
      return inputs.aisleWidth >= 8 ? ["any", "gte8"] : ["any", "lt8"];
    }
    if (inputs.aisleWidth <= 4) return [4];
    if (inputs.aisleWidth >= 8) return [8];
    return [4];
  }

  function get2025Cmda25_4LevelLabel(levelKey) {
    if (levelKey === "one") return "1 in-rack level";
    if (levelKey === "two") return "2 in-rack levels";
    if (levelKey === "more") return "more than 1 in-rack level";
    if (levelKey === "moreThanTwo") return "more than 2 in-rack levels";
    if (levelKey === "every") return "in-rack sprinklers at every tier";
    return "in-rack levels per selected row";
  }

  function get2025Cmda25_4InRackDemand(inputs, levelKey) {
    const solidShelves = inputs.arrangement === "Solid Shelf Rack";
    const moreThanOne = levelKey !== "one";
    if (inputs.commodity === "Class IV") {
      return {
        sprinklers: moreThanOne ? (solidShelves ? 14 : 10) : 8,
        flow: solidShelves || inputs.storageHeight > 25 ? 30 : 22,
      };
    }
    return {
      sprinklers: moreThanOne ? 10 : 6,
      flow: solidShelves || inputs.storageHeight > 25 ? 30 : 22,
    };
  }

  function buildGeneratedCmda2025ClassRack25_4Candidates(inputs) {
    if (!is2025Edition(inputs) || inputs.systemType !== "CMDA") return [];
    if (!["Single-Row Rack", "Double-Row Rack", "Multiple-Row Rack"].includes(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 25)) return [];

    const clearance = inputs.ceilingHeight - inputs.storageHeight;
    if (clearance > 20) {
      return [buildChapter25RackManualCandidate(
        inputs,
        "25.4.2.1.2.2 / 25.4.2.2.2.2 / Chapter 25 / 20.15.2.6",
        "NFPA 13 2025 Section 25.4",
        "Storage-to-ceiling clearance exceeds the 20 ft basis for the table rows; use the 2025 theoretical-height or supplemental in-rack provisions before selecting a density",
      )];
    }

    const arrangementGroup = get2025Cmda25_4ArrangementGroup(inputs);
    const aisleRows = get2025Cmda25_4AisleRows(inputs, arrangementGroup);
    if (!arrangementGroup || !aisleRows.length) return [];

    const candidates = [];
    for (const packaging of get2025Cmda25_4PackagingKeys(inputs)) {
      const applicable = CMDA_2025_25_4_CLASS_RACK_ROWS
        .filter((row) =>
          row.packaging === packaging &&
          row.commodity === inputs.commodity &&
          row.arrangement === arrangementGroup &&
          aisleRows.includes(row.aisle) &&
          inputs.storageHeight <= row.maxStorage &&
          inputs.ceilingHeight <= row.maxCeiling,
        )
        .sort((a, b) => (a.maxStorage - b.maxStorage) || (a.maxCeiling - b.maxCeiling));
      if (!applicable.length) continue;

      const selectedBand = applicable[0];
      for (const row of applicable.filter((candidate) => candidate.maxStorage === selectedBand.maxStorage && candidate.maxCeiling === selectedBand.maxCeiling)) {
        for (const temperatureKey of ["high", "ordinary"]) {
          const density = row[temperatureKey];
          const sprinklerDemand = density * 2000;
          const inRack = get2025Cmda25_4InRackDemand(inputs, row.levelKey);
          const inRackDemand = inRack.sprinklers * inRack.flow;
          const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(2000);
          const temperatureLabel = temperatureKey === "high" ? "High-temperature-rated" : "Ordinary-temperature-rated";
          const packagingLabel = packaging === "exposed"
            ? "exposed nonencapsulated"
            : inputs.encapsulated ? "encapsulated" : "cartoned or encapsulated";
          candidates.push({
            id: `generated-2025-cmda-25-4-${packaging}-${inputs.commodity}-${inputs.arrangement}-${row.maxStorage}-${row.maxCeiling}-${row.aisle}-${row.levelKey}-${temperatureKey}`,
            name: `Section 25.4 CMDA ${inputs.commodity} combined option`,
            basis: `${formatNumber(density, 3)} gpm/ft2 over 2000 ft2 ceiling + ${inRack.sprinklers} in-rack sprinklers @ ${formatNumber(inRack.flow, 0)} gpm`,
            sprinklerDemand,
            hoseAllowance,
            inRackDemand,
            total: sprinklerDemand + inRackDemand + hoseAllowance,
            source: `Table 25.4.1.1 + ${row.tableTitle} / 25.4.2.1.2.2 / 25.4.2.2.2.2 / 20.15.2.6`,
            tableTitle: `Table 25.4.1.1 + ${row.tableTitle}`,
            confidence: "table-derived",
            notes: [
              "2025 Chapter 25.4 CMDA ceiling-level sprinklers with in-rack sprinklers branch",
              `${packagingLabel} ${inputs.commodity}`,
              `${temperatureLabel} ceiling sprinklers`,
              `${get2025Cmda25_4LevelLabel(row.levelKey)} represented in the hydraulic in-rack sprinkler count`,
              arrangementGroup === "multiple" ? "Multiple-row rack row used" : `${inputs.arrangement} row used`,
              row.aisle === 4 && inputs.aisleWidth > 4 ? "Aisle is between 4 ft and 8 ft; 4 ft table row used as bounded conservative option until interpolation is explicitly selected" : "",
              inputs.aisleWidth < 3.5 ? "Aisle narrower than 3.5 ft treated as multiple-row rack condition" : "",
              !inputs.encapsulated && packaging === "cartonedOrEncap" ? "Class I-IV UI does not yet distinguish exposed vs cartoned storage; this is a bounded cartoned/nonexposed option" : "",
              `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
              `Hose duration ${duration} min`,
            ].filter(Boolean),
            preview: {
              commodity: inputs.commodity,
              arrangement: inputs.arrangement,
              density,
              area: 2000,
              inRackSprinklers: inRack.sprinklers,
              inRackFlow: inRack.flow,
              maxStorage: row.maxStorage,
              maxCeiling: row.maxCeiling,
            },
          });
        }
      }
    }
    return candidates;
  }

  // NFPA 13 (2025) Chapter 21 CMDA ceiling-only density/area for Group A plastic racks.
  // Table 21.5.1.1 (Group A plastic in cartons, up to 25 ft) and Table 21.5.2 (exposed
  // nonexpanded Group A). These replace the prior incorrect "25.9" figure references.
  const CMDA_2025_GROUP_A_CARTON_RACK_ROWS = [
    { sMin: 5, sMax: 10, clearMin: 0, clearMax: 5, clearMaxEx: true, ceilMax: 15, ceilMaxEx: true, density: 0.30 },
    { sMin: 5, sMax: 10, clearMin: 5, clearMax: 10, ceilMax: 20, density: 0.45 },
    { sMin: 10, sMinEx: true, sMax: 15, clearMin: 5, clearMax: 10, ceilMax: 22, density: 0.45 },
    { sMin: 10, sMinEx: true, sMax: 15, clearMin: 0, clearMax: 10, ceilMax: 25, density: 0.60 },
    { sMin: 15, sMinEx: true, sMax: 20, clearMin: 0, clearMax: 5, clearMaxEx: true, ceilMax: 25, ceilMaxEx: true, density: 0.60, footnotes: ["a"] },
    { sMin: 15, sMinEx: true, sMax: 20, clearMin: 5, clearMax: 10, ceilMax: 27, density: 0.60 },
    { sMin: 20, sMinEx: true, sMax: 25, clearMin: 0, clearMax: 10, ceilMax: 30, density: 0.80, footnotes: ["b", "c"] },
    { sMin: 20, sMinEx: true, sMax: 25, clearMin: 5, clearMax: 10, ceilMax: 35, density: null, seeChapter25: true },
  ];
  const CMDA_2025_GROUP_A_TABLE_FOOTNOTES = {
    a: "Table 21.5.1.1 note a: for single- and double-row racks only.",
    b: "Table 21.5.1.1 note b: ceiling-only protection is not permitted for this configuration except where K-16.8 (K-240) storage spray sprinklers are installed.",
    c: "Table 21.5.1.1 note c: for dry systems the operating area increases to 4500 ft2 (420 m2).",
  };
  const CMDA_2025_EXPOSED_NONEXP_GROUP_A_ROWS = [
    { sMin: 0, sMax: 10, clearMin: 0, clearMax: 999, ceilMax: 20, density: 0.80, area: 2500 },
  ];

  function cmda2025RowApplies(row, storage, clearance, ceiling) {
    const sOk = (row.sMinEx ? storage > row.sMin : storage >= row.sMin) && storage <= row.sMax;
    const cOk = clearance >= (row.clearMin || 0) && (row.clearMaxEx ? clearance < row.clearMax : clearance <= row.clearMax);
    const ceilOk = row.ceilMaxEx ? ceiling < row.ceilMax : ceiling <= row.ceilMax;
    return sOk && cOk && ceilOk;
  }

  function buildGeneratedCmda2025GroupAPlasticRackCeilingCandidates(inputs) {
    // Covers 2022 and 2025: NFPA 13 Table 21.5.1.1 and Table 21.5.2 are identical in both editions.
    if (!uses2022StorageTables(inputs.edition) || inputs.systemType !== "CMDA") return [];
    if (!["Single-Row Rack", "Double-Row Rack", "Multiple-Row Rack"].includes(inputs.arrangement)) return [];
    const isCarton = inputs.commodity === "Cartoned Group A";
    const isExposed = inputs.commodity === "Exposed Nonexpanded Group A";
    if (!isCarton && !isExposed) return [];

    const clearance = inputs.ceilingHeight - inputs.storageHeight;
    const candidates = [];

    if (isCarton) {
      for (const row of CMDA_2025_GROUP_A_CARTON_RACK_ROWS) {
        if (row.footnotes && row.footnotes.includes("a") && inputs.arrangement === "Multiple-Row Rack") continue;
        if (!cmda2025RowApplies(row, inputs.storageHeight, clearance, inputs.ceilingHeight)) continue;
        if (row.seeChapter25 || row.density == null) {
          candidates.push({
            id: `generated-2025-cmda-2151-seeCh25-${inputs.arrangement}-${row.ceilMax}`,
            name: "Table 21.5.1.1 - refers to Chapter 25 for in-rack",
            basis: "Ceiling-only density not tabulated for this storage/clearance; in-rack protection per Chapter 25 is required",
            completeDesign: false,
            sprinklerDemand: null,
            hoseAllowance: null,
            inRackDemand: 0,
            total: null,
            source: "Table 21.5.1.1 / 21.5.1.4 / Chapter 25",
            tableTitle: "Table 21.5.1.1",
            confidence: "table-derived",
            notes: ["NFPA 13 2025 Table 21.5.1.1 (Group A plastic in cartons, racks)", "This storage/clearance row directs you to Chapter 25 in-rack protection", "Hose and total depend on the selected Chapter 25 option"],
          });
          continue;
        }
        const area = 2000;
        const sprinklerDemand = row.density * area;
        const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
        const notesFoot = (row.footnotes || []).map((f) => CMDA_2025_GROUP_A_TABLE_FOOTNOTES[f]).filter(Boolean);
        candidates.push({
          id: `generated-2025-cmda-2151-${inputs.arrangement}-s${row.sMax}-c${row.ceilMax}-d${row.density}`,
          name: `Table 21.5.1.1 CMDA ceiling-only ${formatNumber(row.density, 2)} gpm/ft2`,
          basis: `${formatNumber(row.density, 2)} gpm/ft2 over ${area} ft2 ceiling-only (no in-rack)`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: "Table 21.5.1.1 / 21.5.1.2 / 21.5.1.4 / 20.15.2.6",
          tableTitle: "Table 21.5.1.1",
          confidence: "table-derived",
          notes: [
            `NFPA 13 ${inputs.edition} Table 21.5.1.1 (Group A plastic commodities in cartons, single/double/multiple-row racks, up to 25 ft)`,
            "Ceiling-only control mode density/area",
            `Storage up to ${row.sMax} ft; ceiling up to ${row.ceilMax} ft; clearance ${row.clearMaxEx ? "under" : "up to"} ${row.clearMax} ft`,
            "Linear interpolation of density/area between storage heights with the same clearance is permitted (21.5.1.2); no interpolation between clearance (21.5.1.3)",
            ...notesFoot,
            `Hose duration ${duration} min`,
          ],
          preview: { commodity: inputs.commodity, arrangement: inputs.arrangement, density: row.density, area },
        });
      }
    }

    if (isExposed) {
      for (const row of CMDA_2025_EXPOSED_NONEXP_GROUP_A_ROWS) {
        if (!cmda2025RowApplies(row, inputs.storageHeight, clearance, inputs.ceilingHeight)) continue;
        const area = row.area;
        const sprinklerDemand = row.density * area;
        const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
        candidates.push({
          id: `generated-2025-cmda-2152-${inputs.arrangement}-s${row.sMax}-c${row.ceilMax}`,
          name: `Table 21.5.2 CMDA ceiling-only ${formatNumber(row.density, 2)} gpm/ft2`,
          basis: `${formatNumber(row.density, 2)} gpm/ft2 over ${area} ft2 ceiling-only (no in-rack)`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: "Table 21.5.2 / 20.15.2.6",
          tableTitle: "Table 21.5.2",
          confidence: "table-derived",
          notes: [
            `NFPA 13 ${inputs.edition} Table 21.5.2 (Exposed nonexpanded Group A plastics)`,
            "Ceiling-only control mode density/area",
            `Storage up to ${row.sMax} ft; ceiling up to ${row.ceilMax} ft`,
            "Confirm against the full Table 21.5.2 for taller storage rows not yet encoded",
            `Hose duration ${duration} min`,
          ],
          preview: { commodity: inputs.commodity, arrangement: inputs.arrangement, density: row.density, area },
        });
      }
    }
    return candidates;
  }

  // NFPA 13 (2019) Chapter 21 CMDA ceiling-only density/area for Group A plastic racks (Table 21.5.1.1).
  // 2019's table DIFFERS from 2022/2025: different clearance bands and footnotes (a=requires K-11.2+,
  // b=single/double-row only, c=requires K-16.8; no "dry->4500" note). 2019 has no Table 21.5.2.
  const CMDA_2019_GROUP_A_CARTON_RACK_ROWS = [
    { sMin: 5, sMax: 10, clearMin: 0, clearMax: 5, clearMaxEx: true, ceilMax: 15, ceilMaxEx: true, density: 0.30 },
    { sMin: 5, sMax: 10, clearMin: 5, clearMax: 10, ceilMax: 20, density: 0.45 },
    { sMin: 10, sMinEx: true, sMax: 15, clearMin: 5, clearMax: 999, ceilMax: 22, density: 0.45 },
    { sMin: 10, sMinEx: true, sMax: 15, clearMin: 0, clearMax: 10, ceilMax: 25, density: 0.60 },
    { sMin: 15, sMinEx: true, sMax: 20, clearMin: 0, clearMax: 5, clearMaxEx: true, ceilMax: 25, ceilMaxEx: true, density: 0.60, footnotes: ["a", "b"] },
    { sMin: 15, sMinEx: true, sMax: 20, clearMin: 5, clearMax: 10, ceilMax: 27, density: 0.60, footnotes: ["a"] },
    { sMin: 20, sMinEx: true, sMax: 25, clearMin: 0, clearMax: 5, clearMaxEx: true, ceilMax: 30, density: 0.80, footnotes: ["c"] },
    // 20 ft / 5-10 clearance / 30 ft ceiling and 25 ft / 5-10 / 35 ft rows are blank (ceiling-only not
    // tabulated) -> covered by the in-rack Figure 25.9.x options, so no ceiling-only candidate is emitted.
  ];
  const CMDA_2019_GROUP_A_TABLE_FOOTNOTES = {
    a: "Table 21.5.1.1 (2019) note a: ceiling-only protection is not permitted for this configuration except where K-11.2 or larger spray sprinklers listed for storage use are installed.",
    b: "Table 21.5.1.1 (2019) note b: for the protection of single- and double-row racks only.",
    c: "Table 21.5.1.1 (2019) note c: ceiling-only protection is not permitted for this configuration except where K-16.8 spray sprinklers listed for storage use are installed.",
  };

  function buildGeneratedCmda2019GroupACartonRackCeilingCandidates(inputs) {
    if (inputs.edition !== "2019" || inputs.systemType !== "CMDA") return [];
    if (!["Single-Row Rack", "Double-Row Rack", "Multiple-Row Rack"].includes(inputs.arrangement)) return [];
    if (inputs.commodity !== "Cartoned Group A") return [];

    const clearance = inputs.ceilingHeight - inputs.storageHeight;
    const candidates = [];
    for (const row of CMDA_2019_GROUP_A_CARTON_RACK_ROWS) {
      // 2019 footnote b restricts the row to single- and double-row racks
      if (row.footnotes && row.footnotes.includes("b") && inputs.arrangement === "Multiple-Row Rack") continue;
      if (!cmda2025RowApplies(row, inputs.storageHeight, clearance, inputs.ceilingHeight)) continue;
      const area = 2000;
      const sprinklerDemand = row.density * area;
      const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
      const notesFoot = (row.footnotes || []).map((f) => CMDA_2019_GROUP_A_TABLE_FOOTNOTES[f]).filter(Boolean);
      candidates.push({
        id: `generated-2019-cmda-2151-${inputs.arrangement}-s${row.sMax}-c${row.ceilMax}-d${row.density}`,
        name: `Table 21.5.1.1 CMDA ceiling-only ${formatNumber(row.density, 2)} gpm/ft2`,
        basis: `${formatNumber(row.density, 2)} gpm/ft2 over ${area} ft2 ceiling-only (no in-rack)`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand: 0,
        total: sprinklerDemand + hoseAllowance,
        source: "Table 21.5.1.1 / 21.5.1.2 / 21.5.1.4 / 20.12.2.6",
        tableTitle: "Table 21.5.1.1",
        confidence: "table-derived",
        notes: [
          "NFPA 13 2019 Table 21.5.1.1 (Group A plastic commodities in cartons, single/double/multiple-row racks, up to 25 ft)",
          "Ceiling-only control mode density/area",
          `Storage up to ${row.sMax} ft; ceiling up to ${row.ceilMax} ft; clearance ${row.clearMaxEx ? "under" : "up to"} ${row.clearMax === 999 ? "5 ft or greater" : row.clearMax + " ft"}`,
          ...notesFoot,
          `Hose duration ${duration} min`,
        ],
        preview: { commodity: inputs.commodity, arrangement: inputs.arrangement, density: row.density, area },
      });
    }
    return candidates;
  }

  function buildGeneratedCmdaClassRack2022TableCandidates(inputs) {
    if (!uses2022StorageTables(inputs.edition) || inputs.systemType !== "CMDA") return [];
    if (!["Single-Row Rack", "Double-Row Rack", "Multiple-Row Rack"].includes(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 25)) return [];

    const generated2025Chapter25Rows = buildGeneratedCmda2025ClassRack25_4Candidates(inputs);
    const encapsulatedKey = inputs.encapsulated ? "yes" : "no";
    const candidates = [];
    if (inputs.arrangement === "Multiple-Row Rack") {
      if (inputs.aisleWidth < 8 || (inputs.rackGeometry && inputs.rackGeometry !== "unknown" && inputs.rackGeometry !== "multiple")) {
        if (generated2025Chapter25Rows.length) return generated2025Chapter25Rows;
        return [buildChapter25RackManualCandidate(
          inputs,
          is2025Edition(inputs) ? "21.4.1.4.1 / Chapter 25 / 20.15.2.6" : "21.4.1.4.1 / Chapter 25 / 20.15.2.6",
          is2025Edition(inputs) ? "Table 21.4.1.4.1" : "Section 21.4.1.4.1",
          "Multiple-row racks with aisles narrower than 8 ft, or rack depth outside the Table 21.4.1.3.1.1 limits, require Chapter 25 selection",
        )];
      }

      const table = CMDA_CLASS_2022_MULTIPLE_RACK_TABLES.find((row) => inputs.storageHeight > row.minExclusive && inputs.storageHeight <= row.max);
      const commodityRow = table?.values[inputs.commodity]?.[encapsulatedKey];
      if (!table || !commodityRow) return [];
      if (commodityRow.chapter25) {
        if (generated2025Chapter25Rows.length) return generated2025Chapter25Rows;
        return [buildChapter25RackManualCandidate(
          inputs,
          is2025Edition(inputs) ? "21.4.1.3.1 / Chapter 25 / 20.15.2.6" : "21.4.1.3.1.1 / Chapter 25 / 20.15.2.6",
          getModernRackTableTitle(inputs, table.title),
          "The applicable new-system multiple-row rack table row directs this condition to Chapter 25",
        )];
      }
      for (const temperatureKey of ["high", "ordinary"]) {
        candidates.push(build2022RackTableDensityCandidate(
          inputs,
          table,
          temperatureKey,
          { ...commodityRow[temperatureKey], aisleNote: "Applies to multiple-row racks up to and including 16 ft deep with aisles 8 ft or wider" },
          is2025Edition(inputs) ? "21.4.1.1 / 21.4.1.3.1 / 21.4.1.3.3 / 20.15.2.6" : "21.4.1.1.1 / 21.4.1.3.1.1 / 21.4.1.3.1.3 / 20.15.2.6",
          inputs.rackGeometry === "unknown" ? ["Rack depth must be confirmed as up to and including 16 ft for this table branch"] : [],
        ));
      }
      if (inputs.rackGeometry === "unknown" && inputs.storageHeight > 15) {
        candidates.push(buildChapter25RackManualCandidate(
          inputs,
          is2025Edition(inputs) ? "21.4.1.4.2 / Chapter 25 / 20.15.2.6" : "21.4.1.4.1.2 / Chapter 25 / 20.15.2.6",
          is2025Edition(inputs) ? "Section 21.4.1.4.2" : "Section 21.4.1.4.1.2",
          `If multiple-row rack depth is over 16 ft, ${inputs.edition} new-system criteria direct storage over 15 ft to Chapter 25`,
        ));
      }
      return [...candidates, ...generated2025Chapter25Rows];
    }

    const table = CMDA_CLASS_2022_SINGLE_DOUBLE_RACK_TABLES.find((row) => inputs.storageHeight > row.minExclusive && inputs.storageHeight <= row.max);
    const commodityRow = table?.values[inputs.commodity]?.[encapsulatedKey];
    if (!table || !commodityRow) return [];
    if (commodityRow.chapter25) {
      if (generated2025Chapter25Rows.length) return generated2025Chapter25Rows;
      return [buildChapter25RackManualCandidate(
        inputs,
        is2025Edition(inputs) ? "21.4.1.2.1 / Chapter 25 / 20.15.2.6" : "21.4.1.2.1.1 / Chapter 25 / 20.15.2.6",
        getModernRackTableTitle(inputs, table.title),
        "The applicable new-system single-/double-row rack table row directs this condition to Chapter 25",
      )];
    }

    for (const temperatureKey of ["high", "ordinary"]) {
      const point = getRack2022AislePoint(commodityRow.aisles, inputs.aisleWidth, temperatureKey);
      if (!point) continue;
      candidates.push(build2022RackTableDensityCandidate(
        inputs,
        table,
        temperatureKey,
        point,
        is2025Edition(inputs) ? "21.4.1.1 / 21.4.1.2.1 / 21.4.1.2.3 / 20.15.2.6" : "21.4.1.1.1 / 21.4.1.2.1.1 / 21.4.1.2.1.3 / 21.4.1.2.3 / 20.15.2.6",
      ));
    }
    return [...candidates, ...generated2025Chapter25Rows];
  }

  function buildGeneratedCmdaClassSolidPile2022TableCandidates(inputs) {
    if (!uses2022StorageTables(inputs.edition) || inputs.systemType !== "CMDA") return [];
    if (!["Palletized / Solid-Piled", "Shelf", "Back-to-Back Shelf"].includes(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 30)) return [];
    if (inputs.arrangement === "Shelf" && inputs.storageHeight > 15) return [];
    if (inputs.encapsulated && inputs.storageHeight > 20) return [];
    if (inputs.encapsulated && inputs.arrangement === "Shelf" && inputs.storageHeight > 15) return [];

    const row = inputs.arrangement === "Back-to-Back Shelf" && inputs.storageHeight > 12 && inputs.storageHeight <= 15
      ? CMDA_CLASS_2022_TABLE_ROWS.find((candidate) => candidate.minExclusive === 18)
      : CMDA_CLASS_2022_TABLE_ROWS.find((candidate) => inputs.storageHeight > candidate.minExclusive && inputs.storageHeight <= candidate.max);
    if (!row) return [];

    const designArea = isDryLikeSystem(inputs) ? 2600 : 2000;
    const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(designArea);
    const sources = getModernCmdaSolidPileSource(inputs);
    return ["high", "ordinary"].map((temperatureKey) => {
      const density = row.densities[inputs.commodity][temperatureKey];
      const sprinklerDemand = density * designArea;
      const temperatureLabel = temperatureKey === "high" ? "High-temperature-rated" : "Ordinary-temperature-rated";
      return {
        id: `generated-${inputs.edition}-cmda-table-${inputs.commodity}-${temperatureKey}-${row.max}`,
        name: `${inputs.edition} CMDA ${inputs.commodity} ${temperatureLabel}`,
        basis: `${formatNumber(density, 3)} gpm/ft2 over ${formatNumber(designArea, 0)} ft2`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand: 0,
        total: sprinklerDemand + hoseAllowance,
        source: sources.source,
        tableTitle: sources.tableTitle,
        confidence: "table-derived",
        notes: [
          `${inputs.edition} new-system CMDA table criteria`,
          `${temperatureLabel} ceiling sprinklers`,
          `Storage height band over ${formatNumber(row.minExclusive, 0)} ft to ${formatNumber(row.max, 0)} ft`,
          inputs.arrangement === "Back-to-Back Shelf" ? `Back-to-back shelf over 12 ft to 15 ft uses the over 18 ft to 20 ft ordinary-temperature row per ${is2025Edition(inputs) ? "21.2.2.1.2" : "21.2.2.2.2"}` : "",
          isDryLikeSystem(inputs) ? "Dry/preaction minimum design area 2600 ft2" : "Wet system minimum design area 2000 ft2",
          `Hose duration ${duration} min`,
        ].filter(Boolean),
      };
    });
  }

  function buildGeneratedCmdaClassSolidPileCurveCandidates(inputs) {
    if (inputs.systemType !== "CMDA") return [];
    if (!["Palletized / Solid-Piled", "Shelf", "Back-to-Back Shelf"].includes(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 25)) return [];

    const backToBackShelfNoReduction =
      inputs.arrangement === "Back-to-Back Shelf" &&
      inputs.storageHeight > 12 &&
      inputs.storageHeight <= 15;
    if (inputs.arrangement === "Back-to-Back Shelf" && !backToBackShelfNoReduction) return [];

    const densityFactor = backToBackShelfNoReduction ? 1 : getSolidPileStorageHeightDensityFactor(inputs.storageHeight);
    if (!densityFactor) return [];

    const candidates = [];
    const temperatureKeys = backToBackShelfNoReduction ? ["ordinary"] : ["ordinary", "high"];
    const minimums = getClassSolidShelfCmdaMinimums(inputs);
    for (const temperatureKey of temperatureKeys) {
      const points = CMDA_CLASS_SOLID_PILE_CURVES[temperatureKey][inputs.commodity] || [];
      const { tableTitle, source } = getCmdaClassCurveSource(inputs, "solid", "", temperatureKey);
      for (const [baseDensity, area] of points) {
        if (minimums && area < minimums.areaMin) continue;
        const notes = [];
        const density = applyDensityFloor(baseDensity * densityFactor, minimums, notes);
        const sprinklerDemand = density * area;
        const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
        candidates.push({
          id: `generated-${inputs.edition}-cmda-solid-${inputs.commodity}-${temperatureKey}-${area}-${baseDensity}`,
          name: `${tableTitle} ${inputs.commodity}`,
          basis: `${formatNumber(density, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source,
          tableTitle,
          confidence: "curve-derived",
          notes: [
            temperatureKey === "ordinary" ? "Ordinary-temperature ceiling sprinklers" : "High-temperature ceiling sprinklers",
            `Base curve point ${formatNumber(baseDensity, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
            "Density/area point sampled from the PDF vector curve",
            backToBackShelfNoReduction
              ? `Back-to-back shelf density reduction not applied per ${inputs.edition === "2016" ? "14.2.4.7" : "21.2.2.7"}`
              : `Storage-height density factor ${formatNumber(densityFactor * 100, 0)}%`,
            minimums ? `Design area minimum ${formatNumber(minimums.areaMin, 0)} ft2 checked per ${minimums.source}` : "",
            ...notes,
            `Hose duration ${duration} min`,
          ].filter(Boolean),
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmdaGroupACandidates(inputs) {
    if (inputs.systemType !== "CMDA") return [];
    if (!isGroupAPlasticCommodity(inputs.commodity)) return [];
    if (!["Palletized / Solid-Piled", "Shelf"].includes(inputs.arrangement)) return [];
    if (!(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];

    const columnInfo = getCmdaGroupAColumn(inputs);
    const storageBand = CMDA_GROUP_A_DENSITY_ROWS.find((row) => inputs.storageHeight <= row.maxStorage);
    const ceilingBand = storageBand?.ceilingBands.find((band) => inputs.ceilingHeight <= band.maxCeiling);
    if (!columnInfo || !storageBand || !ceilingBand) return [];

    const density = ceilingBand.densities[columnInfo.column];
    if (typeof density !== "number") {
      return [];
    }

    const designArea = 2500;
    const sprinklerDemand = density * designArea;
    const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(designArea);
    const { tableTitle, source } = getCmdaGroupASource(inputs);
    return [
      {
        id: `generated-cmda-group-a-${inputs.edition}-${inputs.commodity}-${inputs.arrangement}-${storageBand.maxStorage}-${ceilingBand.maxCeiling}`,
        name: "CMDA Group A plastic density/area",
        basis: `${formatNumber(density, 3)} gpm/ft2 over ${formatNumber(designArea, 0)} ft2`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand: 0,
        total: sprinklerDemand + hoseAllowance,
        source,
        tableTitle,
        confidence: "table-derived",
        notes: [
          columnInfo.description,
          `Maximum storage ${formatNumber(storageBand.maxStorage, 0)} ft; maximum ceiling ${formatNumber(ceilingBand.maxCeiling, 0)} ft`,
          `Hose duration ${duration} min`,
        ],
      },
    ];
  }

  function buildGeneratedCmdaClassRackCurveCandidates(inputs) {
    if (inputs.systemType !== "CMDA") return [];
    if (uses2022StorageTables(inputs.edition)) return [];
    if (!["Single-Row Rack", "Double-Row Rack"].includes(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (inputs.encapsulated && (inputs.commodity === "Class III" || inputs.commodity === "Class IV")) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 22)) return [];

    const densityFactor = getRackStorageHeightDensityFactor(inputs.storageHeight);
    if (!densityFactor) return [];

    const figure = CMDA_CLASS_RACK_20FT_CURVES[getClassRackCurveKey(inputs)];
    if (!figure) return [];

    const curveIds = getRackCurveIdsForInputs(inputs);
    const { tableTitle, source } = getCmdaClassCurveSource(inputs, "rack", figure.figure);
    const candidates = [];
    for (const curveId of curveIds) {
      const curveTuple = figure[curveId]?.[0];
      if (!curveTuple) continue;
      const [temperature, aisle, points] = curveTuple;
      for (const [baseDensity, area] of points) {
        const adjustedDensity = baseDensity * densityFactor;
        const sprinklerDemand = adjustedDensity * area;
        const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
        candidates.push({
          id: `generated-${inputs.edition}-cmda-${inputs.commodity}-rack-${curveId}-${area}`,
          name: `${tableTitle} Curve ${curveId}`,
          basis: `${formatNumber(adjustedDensity, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source,
          tableTitle,
          confidence: "curve-derived",
          notes: [
            temperature,
            aisle,
            `Base curve point ${formatNumber(baseDensity, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
            "Density/area point sampled from the PDF vector curve",
            `Storage-height density factor ${formatNumber(densityFactor * 100, 0)}%`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function getInRackDesignOptionsForClassRack(inputs, levels = 1) {
    const operatingSprinklers = levels > 1
      ? (inputs.commodity === "Class IV" ? 14 : 10)
      : (inputs.commodity === "Class IV" ? 8 : 6);
    return [5.6, 8].map((kFactor) => {
      const pressure = 15;
      return {
        kFactor,
        pressure,
        operatingSprinklers,
        demand: calcHeadFlow(kFactor, pressure) * operatingSprinklers,
      };
    });
  }

  function getGroupAInRackDesignOptions() {
    return [5.6, 8].map((kFactor) => {
      const pressure = 15;
      const operatingSprinklers = 8;
      return {
        kFactor,
        pressure,
        operatingSprinklers,
        demand: calcHeadFlow(kFactor, pressure) * operatingSprinklers,
      };
    });
  }

  function getGroupAOpenCmdaInRackOptions(levels, sprinklerOptions) {
    const operatingSprinklers = levels > 1 ? 14 : 8;
    return sprinklerOptions.map((option) => {
      const headFlow = calcHeadFlow(option.kFactor, option.pressure);
      return {
        ...option,
        operatingSprinklers,
        headFlow,
        demand: headFlow * operatingSprinklers,
      };
    });
  }

  function buildGeneratedCmdaClassRackInRackCurveCandidates(inputs) {
    const multipleRowClassRackOption = inputs.systemType === "CMDA" &&
      (inputs.edition === "2016" || inputs.edition === "2019" || inputs.edition === "2022") &&
      inputs.arrangement === "Multiple-Row Rack" &&
      ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity);
    if (inputs.edition === "2022" && multipleRowClassRackOption) return [];
    const mandatoryInRack = inputs.systemType === "CMDA" &&
      ((inputs.encapsulated &&
        (inputs.commodity === "Class III" || inputs.commodity === "Class IV")) ||
        multipleRowClassRackOption);
    const selectedInRackSystem = inputs.systemType === "In-Rack";
    if (!mandatoryInRack && !selectedInRackSystem) return [];
    if (!isRackArrangement(inputs.arrangement)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 12 && inputs.storageHeight <= 25)) return [];

    const densityFactor = getRackWithInRackStorageHeightDensityFactor(inputs.storageHeight);
    if (!densityFactor) return [];

    const curveKey = multipleRowClassRackOption ? inputs.commodity : getClassRackCurveKey(inputs);
    const densityMultiplier = multipleRowClassRackOption && inputs.encapsulated
      ? (inputs.commodity === "Class IV" ? 1.5 : 1.25)
      : 1;
    const figure = CMDA_CLASS_RACK_WITH_INRACK_CURVES[curveKey];
    if (!figure) return [];

    const curveIds = getRackCurveIdsForInputs(inputs);
    let { tableTitle, source } = getCmdaClassCurveSource(inputs, "rack-inrack", figure.figure);
    if (multipleRowClassRackOption) {
      tableTitle = inputs.edition === "2016"
        ? `Tables 16.2.1.3.3.1/16.2.1.3.3.2 + Figure 16.2.1.3.2(${figure.figure})`
        : inputs.edition === "2022"
          ? `Table 25.3.2.3.2 + Figure 25.3.2.3.1(${figure.figure})`
          : `Table 25.2.3.3.2 + Figure 25.2.3.2.3.1(${figure.figure})`;
      source = inputs.edition === "2016"
        ? "16.2.1.3.3.1 / 16.2.1.3.3.2 / 16.2.1.3.4 / 16.2.1.4 / 12.8.6"
        : inputs.edition === "2022"
          ? "25.3.2.3.2 / 25.3.2.3.1 / 25.3.2.4 / 25.5.2.2.1 / 25.5.2.2.2 / 20.15.2.6"
          : "25.2.3.3.2 / 25.2.3.2.3.1 / 25.2.3.2.4 / 25.5.2.2.1 / 25.5.2.2.2 / 20.12.2.6";
    }
    const inRackLevels = multipleRowClassRackOption && inputs.commodity === "Class IV" && inputs.storageHeight > 20 ? 2 : 1;
    const inRackOptions = getInRackDesignOptionsForClassRack(inputs, inRackLevels);
    const candidates = [];
    for (const curveId of curveIds) {
      const curveTuple = figure[curveId]?.[0];
      if (!curveTuple) continue;
      const [temperature, aisle, points] = curveTuple;
      for (const [baseDensity, area] of points) {
        const adjustedDensity = baseDensity * densityFactor * densityMultiplier;
        const sprinklerDemand = adjustedDensity * area;
        const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
        for (const inRack of inRackOptions) {
          const inRackHeadFlow = calcHeadFlow(inRack.kFactor, inRack.pressure);
          candidates.push({
            id: `generated-${inputs.edition}-cmda-inrack-${inputs.commodity}-${inputs.encapsulated ? "encap" : "nonencap"}-${curveId}-${area}-k${inRack.kFactor}`,
            name: `${tableTitle} Curve ${curveId}`,
            basis: `${formatNumber(adjustedDensity, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2 ceiling + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRackHeadFlow)} gpm/head`,
            sprinklerDemand,
            hoseAllowance,
            inRackDemand: inRack.demand,
            total: sprinklerDemand + inRack.demand + hoseAllowance,
            source,
            tableTitle,
          confidence: "curve-derived",
          notes: [
              multipleRowClassRackOption
                ? `Multiple-row rack option from the ${inputs.edition} multiple-row rack tables; verify rack depth and aisle condition for the final selection`
                : mandatoryInRack ? "In-rack sprinklers are required for this rack/commodity condition" : "Ceiling-level protection used in combination with in-rack sprinklers",
              temperature,
              aisle,
              `Base curve point ${formatNumber(baseDensity, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2`,
              densityMultiplier !== 1 ? `Encapsulation density multiplier ${formatNumber(densityMultiplier, 2)}` : "",
              "Density/area point sampled from the PDF vector curve",
              `Storage-height density factor ${formatNumber(densityFactor * 100, 0)}%`,
              inRackLevels > 1 ? `${inRackLevels} in-rack levels represented in the hydraulic in-rack sprinkler count` : "One in-rack level represented in the hydraulic in-rack sprinkler count",
              `Hose duration ${duration} min`,
            ].filter(Boolean),
          });
        }
      }
    }
    return candidates;
  }

  function buildGeneratedCmdaGroupARackCandidates(inputs) {
    if (inputs.systemType !== "CMDA") return [];
    if (!isRackArrangement(inputs.arrangement)) return [];
    if (inputs.commodity === "Exposed Nonexpanded Group A" && inputs.edition === "2016") return buildGeneratedCmdaExposedNonexpandedGroupARack2016Candidates(inputs);
    // 2022 Group A plastic racks are handled by buildGeneratedCmda2025GroupAPlasticRackCeilingCandidates
    // (Table 21.5.1.1 / 21.5.2 — identical to 2025). Only 2019 uses the legacy figure-based builder below.
    if (inputs.commodity === "Exposed Nonexpanded Group A" && inputs.edition === "2019") return buildGeneratedCmdaExposedNonexpandedGroupARack2019Candidates(inputs);
    if (inputs.commodity !== "Cartoned Group A") return [];
    if (inputs.edition === "2019") return buildGeneratedCmdaGroupARack2019Candidates(inputs);
    if (inputs.edition === "2016") return buildGeneratedCmdaGroupARack2016Candidates(inputs);
    return [];
  }

  function buildGeneratedCmdaExposedNonexpandedGroupARack2019Candidates(inputs) {
    if (!(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];
    const options = [];
    const addOption = (figure, maxStorage, maxCeiling, density, area, levels, flueNote) => {
      if (inputs.storageHeight <= maxStorage && inputs.ceilingHeight <= maxCeiling) {
        options.push({ figure, maxStorage, maxCeiling, density, area, levels, flueNote });
      }
    };

    addOption("Figure 25.9.3.3(a)", 10, 20, 0.45, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 25.9.3.3(b)", 10, 20, 0.3, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(c)", 15, 25, 0.45, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 25.9.3.3(d)", 15, 25, 0.3, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(e)", 20, 25, 0.6, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 25.9.3.3(f)", 20, 25, 0.45, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(g)", 20, 30, 0.8, 1500, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 25.9.3.3(h)", 20, 30, 0.6, 1500, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(i)", 20, 30, 0.3, 2000, 2, "Two levels of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(j)", 25, 35, 0.8, 1500, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 25.9.3.3(k)", 25, 35, 0.3, 2000, 2, "Two levels of in-rack sprinklers in every transverse flue");

    const source = inputs.edition === "2022" ? "25.9.3.3 / 25.12.2.1 / 25.12.3.1 / 20.15.2.6" : "25.9.3.3 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6";
    const candidates = [];
    for (const option of options) {
      const sprinklerDemand = option.density * option.area;
      const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(option.area);
      const inRackOptions = getGroupAOpenCmdaInRackOptions(option.levels, [{ kFactor: 5.6, pressure: 15 }, { kFactor: 8, pressure: 15 }]);
      for (const inRack of inRackOptions) {
        candidates.push({
          id: `generated-${inputs.edition}-cmda-exposed-group-a-rack-${option.figure}-${option.density}-${option.area}-${option.levels}-k${inRack.kFactor}`,
          name: `CMDA exposed nonexpanded Group A rack ${option.figure}`,
          basis: `${formatNumber(option.density, 3)} gpm/ft2 over ${formatNumber(option.area, 0)} ft2 ceiling + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRack.headFlow)} gpm/head`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source,
          tableTitle: option.figure,
          confidence: "figure-derived",
          notes: [
            `Maximum storage ${formatNumber(option.maxStorage, 0)} ft; maximum ceiling ${formatNumber(option.maxCeiling, 0)} ft`,
            option.flueNote,
            `${option.levels === 1 ? "One level" : "Two levels"} of in-rack sprinklers required by the selected figure option`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmdaExposedNonexpandedGroupARack2016Candidates(inputs) {
    if (!(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];
    const options = [];
    const addOption = (figure, maxStorage, maxCeiling, density, area, levels, flueNote) => {
      if (inputs.storageHeight <= maxStorage && inputs.ceilingHeight <= maxCeiling) {
        options.push({ figure, maxStorage, maxCeiling, density, area, levels, flueNote });
      }
    };

    addOption("Figure 17.2.1.4(a)", 10, 20, 0.8, 2500, 0, "Ceiling-only option");
    addOption("Figure 17.2.1.4(b)", 10, 20, 0.45, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 17.2.1.4(c)", 10, 20, 0.3, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(d)", 15, 25, 0.45, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 17.2.1.4(e)", 15, 25, 0.3, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(f)", 20, 25, 0.6, 2000, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 17.2.1.4(g)", 20, 25, 0.45, 2000, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(h)", 20, 30, 0.8, 1500, 1, "One level of in-rack sprinklers at alternate transverse flues");
    addOption("Figure 17.2.1.4(i)", 20, 30, 0.6, 1500, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(j)", 20, 30, 0.3, 2000, 2, "Two levels of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(k)", 25, 35, 0.8, 1500, 1, "One level of in-rack sprinklers in every transverse flue");
    addOption("Figure 17.2.1.4(l)", 25, 35, 0.3, 2000, 2, "Two levels of in-rack sprinklers in every transverse flue");

    const source = "17.2.1.4 / 17.2.1.5.6 / 17.2.1.5.7 / 12.8.6";
    const candidates = [];
    for (const option of options) {
      const sprinklerDemand = option.density * option.area;
      const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(option.area);
      const inRackOptions = option.levels ? getGroupAOpenCmdaInRackOptions(option.levels, [{ kFactor: 5.6, pressure: 15 }, { kFactor: 8, pressure: 15 }]) : [{ kFactor: 0, pressure: 0, operatingSprinklers: 0, headFlow: 0, demand: 0 }];
      for (const inRack of inRackOptions) {
        const inRackBasis = option.levels
          ? ` + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRack.headFlow)} gpm/head`
          : "";
        candidates.push({
          id: `generated-2016-cmda-exposed-group-a-rack-${option.figure}-${option.density}-${option.area}-${option.levels}-k${inRack.kFactor}`,
          name: `CMDA exposed nonexpanded Group A rack ${option.figure}`,
          basis: `${formatNumber(option.density, 3)} gpm/ft2 over ${formatNumber(option.area, 0)} ft2 ceiling${inRackBasis}`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source,
          tableTitle: option.figure,
          confidence: "figure-derived",
          notes: [
            `Maximum storage ${formatNumber(option.maxStorage, 0)} ft; maximum ceiling ${formatNumber(option.maxCeiling, 0)} ft`,
            option.flueNote,
            option.levels ? `${option.levels === 1 ? "One level" : "Two levels"} of in-rack sprinklers required by the selected figure option` : "No in-rack sprinklers required by this figure option",
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmdaGroupARack2016Candidates(inputs) {
    if (inputs.edition !== "2016") return [];
    if (!(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];
    if (!(inputs.clearance > 0 && inputs.clearance <= 10)) return [];

    const standardInRack = [
      { kFactor: 5.6, pressure: 15 },
      { kFactor: 8, pressure: 15 },
    ];
    const closeSpacingInRack = [
      { kFactor: 8, pressure: 15 },
      { kFactor: 5.6, pressure: 30 },
    ];
    const options = [];
    const addOption = (figure, label, density, area, levels, sprinklerOptions, layoutNote) => {
      options.push({ figure, label, density, area, levels, sprinklerOptions, layoutNote });
    };
    const addCeilingOnlyOption = (figure, label, density, area, note) => {
      options.push({ figure, label, density, area, levels: 0, sprinklerOptions: [{ kFactor: 0, pressure: 0 }], layoutNote: note });
    };

    if (inputs.storageHeight <= 10 && inputs.clearance < 5) {
      addOption(
        "Figure 17.2.1.2.1(a)",
        "5 ft to 10 ft storage, less than 5 ft clearance",
        0.3,
        2000,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
    } else if (inputs.storageHeight <= 10 && inputs.clearance <= 10) {
      addOption(
        "Figure 17.2.1.2.1(a)",
        "5 ft to 10 ft storage, 5 ft to 10 ft clearance",
        0.45,
        2000,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
    } else if (inputs.storageHeight <= 15) {
      addOption(
        "Figure 17.2.1.2.1(b)",
        "15 ft storage, up to 10 ft clearance",
        0.3,
        2000,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
      if (inputs.ceilingHeight <= 22 && inputs.clearance >= 5) {
        addCeilingOnlyOption(
          "Figure 17.2.1.2.1(b)",
          "15 ft storage ceiling-only exception",
          0.45,
          2000,
          "Ceiling-only exception for listed storage sprinklers where ceiling height does not exceed 22 ft and clearance is at least 5 ft",
        );
      }
    } else if (inputs.storageHeight <= 20 && inputs.clearance < 5) {
      addOption(
        "Figure 17.2.1.2.1(c)",
        "20 ft storage, less than 5 ft clearance",
        0.45,
        2000,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
      addOption(
        "Figure 17.2.1.2.1(c)",
        "20 ft storage, less than 5 ft clearance close-spaced option",
        0.3,
        2000,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
      addCeilingOnlyOption(
        "Figure 17.2.1.2.1(c)",
        "20 ft storage ceiling-only exception",
        0.6,
        2000,
        "Ceiling-only exception requires K-11.2 or larger listed storage sprinklers",
      );
    } else if (inputs.storageHeight <= 20 && inputs.clearance <= 10) {
      addOption(
        "Figure 17.2.1.2.1(d)",
        "20 ft storage, 5 ft to 10 ft clearance",
        0.45,
        2000,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
      addOption(
        "Figure 17.2.1.2.1(d)",
        "20 ft storage, 5 ft to 10 ft clearance two-level option",
        0.3,
        2000,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
      addOption(
        "Figure 17.2.1.2.1(d)",
        "20 ft storage, 5 ft to 10 ft clearance alternate two-level option",
        0.3,
        2000,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
      addOption(
        "Figure 17.2.1.2.1(d)",
        "20 ft storage, 5 ft to 10 ft clearance close-spaced option",
        0.3,
        2000,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
      if (inputs.ceilingHeight <= 27) {
        addCeilingOnlyOption(
          "Figure 17.2.1.2.1(d)",
          "20 ft storage ceiling-only exception",
          0.6,
          2000,
          "Ceiling-only exception requires K-11.2 or larger listed storage sprinklers and ceiling height not exceeding 27 ft",
        );
      }
    } else if (inputs.storageHeight <= 25 && inputs.clearance < 5) {
      addOption(
        "Figure 17.2.1.2.1(e)",
        "25 ft storage, less than 5 ft clearance",
        0.45,
        2000,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
      addOption(
        "Figure 17.2.1.2.1(e)",
        "25 ft storage, less than 5 ft clearance two-level option",
        0.3,
        2000,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
      addCeilingOnlyOption(
        "Figure 17.2.1.2.1(e)",
        "25 ft storage ceiling-only exception",
        0.8,
        inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction" ? 4500 : 2000,
        "Ceiling-only exception requires K-16.8 listed storage sprinklers",
      );
    } else if (inputs.storageHeight <= 25 && inputs.clearance <= 10) {
      addOption(
        "Figure 17.2.1.2.1(f)",
        "25 ft storage, 5 ft to 10 ft clearance",
        0.3,
        2000,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
      addCeilingOnlyOption(
        "Figure 17.2.1.2.1(f)",
        "25 ft storage ceiling-only exception",
        0.8,
        inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction" ? 4500 : 2000,
        "Ceiling-only exception requires K-16.8 listed storage sprinklers",
      );
    }

    const source = "17.2.1.2.1 / 17.2.1.2.4 / 17.2.1.5.6 / 17.2.1.5.7 / 12.8.6";
    const candidates = [];
    for (const [index, option] of options.entries()) {
      const sprinklerDemand = option.density * option.area;
      const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(option.area);
      const inRackOptions = option.levels ? getGroupAOpenCmdaInRackOptions(option.levels, option.sprinklerOptions) : [{ kFactor: 0, pressure: 0, operatingSprinklers: 0, headFlow: 0, demand: 0 }];
      for (const inRack of inRackOptions) {
        const inRackBasis = option.levels
          ? ` + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRack.headFlow)} gpm/head`
          : "";
        candidates.push({
          id: `generated-2016-cmda-group-a-rack-${index}-${option.density}-${option.area}-${option.levels}-k${inRack.kFactor}-p${inRack.pressure}`,
          name: `CMDA Group A rack ${option.figure}`,
          basis: `${formatNumber(option.density, 3)} gpm/ft2 over ${formatNumber(option.area, 0)} ft2 ceiling${inRackBasis}`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source,
          tableTitle: option.figure,
          confidence: "figure-derived",
          notes: [
            option.label,
            option.layoutNote,
            option.levels ? `${option.levels === 1 ? "One level" : "Two levels"} of in-rack sprinklers required by the selected figure option` : "Ceiling-only figure-note exception",
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmdaGroupARack2019Candidates(inputs) {
    if (!(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];
    if (!(inputs.clearance > 0 && inputs.clearance <= 10)) return [];

    const standardInRack = [
      { kFactor: 5.6, pressure: 15 },
      { kFactor: 8, pressure: 15 },
    ];
    const closeSpacingInRack = [
      { kFactor: 8, pressure: 15 },
      { kFactor: 5.6, pressure: 30 },
    ];
    const figureOptions = [];

    const addFigureOption = (figure, label, density, levels, sprinklerOptions, layoutNote) => {
      figureOptions.push({ figure, label, density, levels, sprinklerOptions, layoutNote });
    };

    if (inputs.storageHeight <= 15) {
      addFigureOption(
        "Figure 25.9.3.1(a)",
        "Up to 15 ft storage, up to 10 ft clearance",
        0.3,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
    } else if (inputs.storageHeight <= 20 && inputs.clearance < 5) {
      addFigureOption(
        "Figure 25.9.3.1(b)",
        "Up to 20 ft storage, less than 5 ft clearance",
        0.45,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
      addFigureOption(
        "Figure 25.9.3.1(b)",
        "Up to 20 ft storage, less than 5 ft clearance alternate",
        0.3,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
    } else if (inputs.storageHeight <= 20 && inputs.clearance <= 10) {
      addFigureOption(
        "Figure 25.9.3.1(c)",
        "Up to 20 ft storage, 5 ft to 10 ft clearance",
        0.45,
        1,
        standardInRack,
        "Single level of in-rack sprinklers in transverse flue spaces",
      );
      addFigureOption(
        "Figure 25.9.3.1(c)",
        "Up to 20 ft storage, 5 ft to 10 ft clearance two-level option",
        0.3,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
      addFigureOption(
        "Figure 25.9.3.1(c)",
        "Up to 20 ft storage, 5 ft to 10 ft clearance close-spaced option",
        0.3,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
      addFigureOption(
        "Figure 25.9.3.1(c)",
        "Up to 20 ft storage, 5 ft to 10 ft clearance alternate two-level option",
        0.3,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
    } else if (inputs.storageHeight <= 25 && inputs.clearance < 5) {
      addFigureOption(
        "Figure 25.9.3.1(d)",
        "Up to 25 ft storage, less than 5 ft clearance",
        0.45,
        1,
        closeSpacingInRack,
        "Single level of close-spaced in-rack sprinklers at each transverse flue intersection",
      );
      addFigureOption(
        "Figure 25.9.3.1(d)",
        "Up to 25 ft storage, less than 5 ft clearance two-level option",
        0.3,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
    } else if (inputs.storageHeight <= 25 && inputs.clearance <= 10) {
      addFigureOption(
        "Figure 25.9.3.1(e)",
        "Up to 25 ft storage, 5 ft to 10 ft clearance",
        0.3,
        2,
        standardInRack,
        "Two staggered levels of in-rack sprinklers in transverse flue spaces",
      );
    }

    const area = 2000;
    const { hoseAllowance, duration } = getHoseAllowanceForCmdaArea(area);
    const source = inputs.edition === "2022" ? "25.2.3.4.1.1 / 25.9.3.1 / 25.12.2.1 / 25.12.3.1 / 20.15.2.6" : "25.2.3.4.1.1 / 25.9.3.1 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6";
    const candidates = [];
    for (const [index, option] of figureOptions.entries()) {
      const sprinklerDemand = option.density * area;
      for (const inRack of getGroupAOpenCmdaInRackOptions(option.levels, option.sprinklerOptions)) {
        candidates.push({
          id: `generated-${inputs.edition}-cmda-group-a-rack-${index}-${option.density}-${option.levels}-k${inRack.kFactor}-p${inRack.pressure}`,
          name: `CMDA Group A rack ${option.figure}`,
          basis: `${formatNumber(option.density, 3)} gpm/ft2 over ${formatNumber(area, 0)} ft2 ceiling + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRack.headFlow)} gpm/head`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source,
          tableTitle: option.figure,
          confidence: "figure-derived",
          notes: [
            option.label,
            option.layoutNote,
            `${option.levels === 1 ? "One level" : "Two levels"} of in-rack sprinklers required by the selected figure option`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function getEsfrSource(inputs, commodityGroup) {
    if (inputs.edition === "2016") {
      if (isRackArrangement(inputs.arrangement)) return commodityGroup === "class" ? "16.2.3.1 / 12.7.6.3 / 12.8.6" : "17.2.3.1 / 12.7.6.3 / 12.8.6";
      return commodityGroup === "class" ? "14.4.1 / 12.7.6.3 / 12.8.6" : "15.4.1 / 12.7.6.3 / 12.8.6";
    }
    if (uses2022StorageTables(inputs.edition)) return "23.3.1 / 23.2.2 / 20.15.2.6";
    if (isRackArrangement(inputs.arrangement)) return commodityGroup === "class" ? "23.5.1 / 27.2.4.4.1 / 20.12.2.6" : "23.6.1 / 27.2.4.4.1 / 20.12.2.6";
    return commodityGroup === "class" ? "23.3.1 / 27.2.4.4.1 / 20.12.2.6" : "23.4.2 / 27.2.4.4.1 / 20.12.2.6";
  }

  function getEsfrTableTitle(inputs, commodityGroup) {
    if (inputs.edition === "2016") {
      if (isRackArrangement(inputs.arrangement)) return commodityGroup === "class" ? "Table 16.2.3.1" : "Table 17.2.3.1";
      return commodityGroup === "class" ? "Table 14.4.1" : "Table 15.4.1";
    }
    if (uses2022StorageTables(inputs.edition)) return "Table 23.3.1";
    if (isRackArrangement(inputs.arrangement)) return commodityGroup === "class" ? "Table 23.5.1" : "Table 23.6.1";
    return commodityGroup === "class" ? "Table 23.3.1" : "Table 23.4.2";
  }

  function isEsfrGroupACommodity(commodity) {
    return commodity === "Cartoned Group A" ||
      commodity === "Cartoned Expanded Group A" ||
      commodity === "Exposed Nonexpanded Group A" ||
      commodity === "Exposed Expanded Group A";
  }

  function getEsfrCommodityLabel(inputs, commodityGroup) {
    if (commodityGroup === "class") return "Class I-IV";
    if (inputs.commodity === "Exposed Nonexpanded Group A") return "Exposed nonexpanded Group A";
    if (inputs.commodity === "Cartoned Expanded Group A") return "Cartoned expanded Group A";
    if (inputs.commodity === "Exposed Expanded Group A") return "Exposed expanded Group A";
    return "Cartoned Group A";
  }

  function buildEsfrPressureCandidate(inputs, row, commodityGroup, tableTitle, source) {
    const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(12);
    const labelCommodity = getEsfrCommodityLabel(inputs, commodityGroup);
    const arrangementLabel = inputs.arrangement === "Palletized / Solid-Piled" ? "palletized/solid-piled" : "rack";
    const inRackDemand = row.inRackRequired ? 8 * 60 : 0;
    const finitePressure = Number.isFinite(row.pressure);
    const headFlow = finitePressure ? calcHeadFlow(row.kFactor, row.pressure) : 0;
    const sprinklerDemand = finitePressure ? headFlow * 12 : 0;
    const total = finitePressure ? sprinklerDemand + inRackDemand + hoseAllowance : Number.POSITIVE_INFINITY;
    return {
      id: `generated-esfr-${inputs.edition}-${commodityGroup}-${inputs.arrangement}-${row.maxStorage}-${row.maxCeiling}-k${row.kFactor}-p${finitePressure ? row.pressure : "na"}-ir${row.inRackRequired ? 1 : 0}`,
      name: `ESFR ${labelCommodity} ${arrangementLabel} option`,
      basis: finitePressure
        ? `12 ceiling sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head${row.inRackRequired ? " + 8 in-rack sprinklers @ 60 gpm" : ""}`
        : `K${formatNumber(row.kFactor, 1)} ${row.orientation}; ceiling pressure is NA in table, in-rack sprinklers required by Chapter 25`,
      sprinklerDemand,
      hoseAllowance,
      inRackDemand,
      total,
      source,
      tableTitle,
      confidence: row.inRackRequired ? "table-derived in-rack-required" : "table-derived",
      preview: {
        kind: "esfr-pressure-table",
        arrangement: isRackArrangement(inputs.arrangement) ? "Single-, double-, and multiple-row racks" : "Palletized and solid-piled storage",
        commodity: labelCommodity === "Class I-IV" ? "Class I through Class IV" : `${labelCommodity} plastic`,
        maxStorage: row.maxStorage,
        maxCeiling: row.maxCeiling,
        kFactor: row.kFactor,
        pressure: finitePressure ? row.pressure : null,
        orientation: row.orientation,
      },
      notes: [
        `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
        row.orientation,
        ...(row.notes || []),
        row.note || "",
        row.inRackRequired ? "In-rack sprinklers required; design shown as 8 in-rack sprinklers at 60 gpm where pressure is available for the ceiling row" : "Ceiling-only ESFR row",
        finitePressure ? `Hose duration ${duration} min` : `NA pressure row cannot produce a complete ceiling sprinkler demand from ${tableTitle} alone`,
      ].filter(Boolean),
    };
  }

  function buildGeneratedEsfr2019GroupARackCandidates(inputs) {
    if (!["2019", "2022", "2025"].includes(inputs.edition)) return [];
    if (!isRackArrangement(inputs.arrangement)) return [];
    if (!["Cartoned Group A", "Cartoned Expanded Group A", "Exposed Nonexpanded Group A", "Exposed Expanded Group A"].includes(inputs.commodity)) return [];

    const rows = [];
    const add = (commodity, maxStorage, maxCeiling, kFactor, pressure, orientation = "Pendent", inRackRequired = false, notes = []) => {
      if (inputs.commodity !== commodity) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      rows.push({ maxStorage, maxCeiling, kFactor, pressure, orientation, inRackRequired, notes });
    };
    const addOptions = (commodity, maxStorage, maxCeiling, options) => {
      for (const option of options) add(commodity, maxStorage, maxCeiling, option.k, option.p, option.o || "Pendent", Boolean(option.ir), option.notes || []);
    };
    const common25 = [
      { k: 14, p: 50, o: "Upright/pendent" },
      { k: 16.8, p: 35, o: "Upright/pendent" },
      { k: 22.4, p: 25 },
      { k: 25.2, p: 15 },
    ];
    const common35 = [
      { k: 14, p: 75, o: "Upright/pendent" },
      { k: 16.8, p: 52, o: "Upright/pendent" },
      { k: 22.4, p: 35 },
      { k: 25.2, p: 20 },
    ];
    const common40 = [
      { k: 16.8, p: 52 },
      { k: 22.4, p: 40 },
      { k: 25.2, p: 25 },
    ];
    const common45 = [
      { k: 14, p: null, ir: true },
      { k: 16.8, p: null, ir: true },
      { k: 22.4, p: 40 },
      { k: 25.2, p: 40 },
    ];

    for (const commodity of ["Cartoned Group A"]) {
      addOptions(commodity, 20, 25, common25);
      addOptions(commodity, 20, 30, common25);
      addOptions(commodity, 20, 35, common35);
      addOptions(commodity, 20, 40, common40);
      addOptions(commodity, 20, 45, common45);
      addOptions(commodity, 25, 30, common25);
      addOptions(commodity, 25, 32, [{ k: 14, p: 60, o: "Upright/pendent" }, { k: 16.8, p: 42, o: "Upright/pendent" }]);
      addOptions(commodity, 25, 35, common35);
      addOptions(commodity, 25, 40, common40);
      addOptions(commodity, 25, 45, common45);
      addOptions(commodity, 30, 35, common35);
      addOptions(commodity, 30, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 40, ir: true }, { k: 25.2, p: 25, ir: true }]);
      addOptions(commodity, 30, 45, common45);
      addOptions(commodity, 35, 40, [{ k: 16.8, p: 52 }, { k: 25.2, p: 25 }]);
      addOptions(commodity, 35, 45, common45);
      addOptions(commodity, 40, 45, common45);
    }

    // NFPA 13 2022/2025 Table 23.3.1 ceiling-only ESFR for cartoned expanded Group A plastics
    // (same criteria as exposed nonexpanded: low rows all four K-factors, high rows K22.4@75 / K25.2@60).
    // 2019 retains its legacy K14/K16.8 rows in the else branch.
    if (uses2022StorageTables(inputs.edition)) {
      const cartExpLow = [{ k: 14, p: 50, o: "Upright/pendent" }, { k: 16.8, p: 35, o: "Upright/pendent" }, { k: 22.4, p: 35 }, { k: 25.2, p: 35 }];
      const cartExpHigh = [{ k: 22.4, p: 75 }, { k: 25.2, p: 60 }];
      addOptions("Cartoned Expanded Group A", 20, 25, cartExpLow);
      addOptions("Cartoned Expanded Group A", 25, 30, cartExpLow);
      addOptions("Cartoned Expanded Group A", 30, 35, cartExpHigh);
      addOptions("Cartoned Expanded Group A", 35, 40, cartExpHigh);
    } else {
      addOptions("Cartoned Expanded Group A", 20, 25, [{ k: 14, p: 50, o: "Upright/pendent" }, { k: 16.8, p: 35, o: "Upright/pendent" }]);
      addOptions("Cartoned Expanded Group A", 20, 30, [{ k: 14, p: 50, o: "Upright/pendent" }, { k: 16.8, p: 35, o: "Upright/pendent" }]);
      addOptions("Cartoned Expanded Group A", 25, 30, [{ k: 14, p: 50, o: "Upright/pendent" }, { k: 16.8, p: 35, o: "Upright/pendent" }]);
      addOptions("Cartoned Expanded Group A", 25, 32, [{ k: 14, p: 60 }, { k: 16.8, p: 42, o: "Upright/pendent" }]);
    }

    // NFPA 13 2022/2025 Table 23.3.1 ceiling-only ESFR for exposed nonexpanded Group A plastics.
    // Low rows (ceiling <= 30 ft): all four K-factors. High rows (ceiling 35-40 ft): K22.4 @ 75 /
    // K25.2 @ 60 only. Storage 40 / ceiling 45 requires in-rack sprinklers (K14/K16.8, NA ceiling).
    // 2019 (Table 23.6.1) retains its own legacy rows in the else branch.
    if (uses2022StorageTables(inputs.edition)) {
      const exposedLow = [{ k: 14, p: 50 }, { k: 16.8, p: 35 }, { k: 22.4, p: 35 }, { k: 25.2, p: 35 }];
      const exposedHigh = [{ k: 22.4, p: 75 }, { k: 25.2, p: 60 }];
      const exposedInRack = [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }];
      addOptions("Exposed Nonexpanded Group A", 20, 25, exposedLow);
      addOptions("Exposed Nonexpanded Group A", 25, 30, exposedLow);
      addOptions("Exposed Nonexpanded Group A", 30, 35, exposedHigh);
      addOptions("Exposed Nonexpanded Group A", 35, 40, exposedHigh);
      addOptions("Exposed Nonexpanded Group A", 40, 45, exposedInRack);
    } else {
      const exposed20Base = [{ k: 14, p: 50 }, { k: 16.8, p: 35 }];
      addOptions("Exposed Nonexpanded Group A", 20, 25, exposed20Base);
      addOptions("Exposed Nonexpanded Group A", 20, 30, exposed20Base);
      addOptions("Exposed Nonexpanded Group A", 20, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 20, 40, [{ k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 20, 45, [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }]);
      addOptions("Exposed Nonexpanded Group A", 25, 30, exposed20Base);
      addOptions("Exposed Nonexpanded Group A", 25, 32, [{ k: 14, p: 60 }, { k: 16.8, p: 42 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 45, [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }]);
      addOptions("Exposed Nonexpanded Group A", 30, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 30, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
      addOptions("Exposed Nonexpanded Group A", 30, 45, [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }]);
      addOptions("Exposed Nonexpanded Group A", 35, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
      addOptions("Exposed Nonexpanded Group A", 35, 45, [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }]);
      addOptions("Exposed Nonexpanded Group A", 40, 45, [{ k: 14, p: null, ir: true }, { k: 16.8, p: null, ir: true }]);
    }

    const exposedExpandedRackNotes = [
      "Section 23.4 exposed expanded Group A plastic rack branch",
      "Intermediate-temperature K25.2 pendent ESFR sprinklers are required",
      "Maximum sprinkler deflector distance below the ceiling is 14 in.",
      "Minimum aisle width 8 ft",
      "Solid vertical barriers are required from face of rack to face of rack at maximum 16.5 ft intervals",
      "Vertical barriers extend from a maximum of 4 in. above the floor to the maximum storage height and extend across the longitudinal flue",
      "Plan area of storage between vertical barriers and aisles cannot exceed 124 ft2",
      "Commodity can extend a nominal 4 in. beyond the vertical barrier at the aisle",
    ];
    if (uses2022StorageTables(inputs.edition) && inputs.aisleWidth >= 8) {
      addOptions("Exposed Expanded Group A", 25, 30, [{ k: 25.2, p: 30, notes: exposedExpandedRackNotes }]);
      addOptions("Exposed Expanded Group A", 35, 40, [{ k: 25.2, p: 60, notes: exposedExpandedRackNotes }]);
    }

    const isExposedExpandedRackModern = uses2022StorageTables(inputs.edition) && inputs.commodity === "Exposed Expanded Group A";
    const tableTitle = isExposedExpandedRackModern
      ? "Table 23.3.1 / Section 23.4"
      : uses2022StorageTables(inputs.edition) ? "Table 23.3.1" : "Table 23.6.1";
    const source = isExposedExpandedRackModern
      ? "23.3.1 / 23.4.1 through 23.4.7 / 23.2.2 / 20.15.2.6"
      : uses2022StorageTables(inputs.edition)
      ? "23.3.1 / 23.2.2 / Chapter 25 / 20.15.2.6"
      : "23.6.1 / 23.6.2 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6";
    return rows.map((row) => buildEsfrPressureCandidate(inputs, row, "cartoned-group-a", tableTitle, source));
  }

  function buildGeneratedEsfr2019GroupASolidCandidates(inputs) {
    if (!["2019", "2022", "2025"].includes(inputs.edition)) return [];
    if (inputs.arrangement !== "Palletized / Solid-Piled") return [];
    if (!["Cartoned Expanded Group A", "Exposed Nonexpanded Group A", "Exposed Expanded Group A"].includes(inputs.commodity)) return [];

    const rows = [];
    const add = (commodity, maxStorage, maxCeiling, kFactor, pressure, orientation = "Pendent", note = "") => {
      if (inputs.commodity !== commodity) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      rows.push({ maxStorage, maxCeiling, kFactor, pressure, orientation, note });
    };
    const addOptions = (commodity, maxStorage, maxCeiling, options) => {
      for (const option of options) {
        add(commodity, maxStorage, maxCeiling, option.k, option.p, option.o || "Pendent", option.note || "");
      }
    };

    // NFPA 13 2022/2025 Table 23.3.1 ceiling-only ESFR for cartoned expanded Group A plastics
    // (same criteria as exposed nonexpanded: low rows all four K-factors, high rows K22.4@75 / K25.2@60).
    // 2019 retains its legacy K14/K16.8 rows in the else branch.
    if (uses2022StorageTables(inputs.edition)) {
      const cartExpLow = [{ k: 14, p: 50, o: "Upright/pendent" }, { k: 16.8, p: 35, o: "Upright/pendent" }, { k: 22.4, p: 35 }, { k: 25.2, p: 35 }];
      const cartExpHigh = [{ k: 22.4, p: 75 }, { k: 25.2, p: 60 }];
      addOptions("Cartoned Expanded Group A", 20, 25, cartExpLow);
      addOptions("Cartoned Expanded Group A", 25, 30, cartExpLow);
      addOptions("Cartoned Expanded Group A", 30, 35, cartExpHigh);
      addOptions("Cartoned Expanded Group A", 35, 40, cartExpHigh);
    } else {
      addOptions("Cartoned Expanded Group A", 20, 25, [
        { k: 14, p: 50, o: "Upright/pendent" },
        { k: 16.8, p: 35, o: "Upright/pendent" },
      ]);
      addOptions("Cartoned Expanded Group A", 20, 30, [
        { k: 14, p: 50, o: "Upright/pendent" },
        { k: 16.8, p: 35, o: "Upright/pendent" },
      ]);
      addOptions("Cartoned Expanded Group A", 25, 30, [
        { k: 14, p: 50, o: "Upright/pendent" },
        { k: 16.8, p: 35, o: "Upright/pendent" },
      ]);
      addOptions("Cartoned Expanded Group A", 25, 32, [
        { k: 14, p: 60 },
        { k: 16.8, p: 42, o: "Upright/pendent" },
      ]);
    }

    // NFPA 13 2022/2025 Table 23.3.1 ceiling-only ESFR for exposed nonexpanded Group A plastics.
    // Low rows (ceiling <= 30 ft): all four K-factors at the table minimums.
    // High rows (ceiling 35-40 ft): K22.4 @ 75 / K25.2 @ 60 only (K14/K16.8 not permitted).
    // 2019 (Table 23.4.2) retains its own legacy rows in the else branch.
    if (uses2022StorageTables(inputs.edition)) {
      const exposedLow = [{ k: 14, p: 50 }, { k: 16.8, p: 35 }, { k: 22.4, p: 35 }, { k: 25.2, p: 35 }];
      const exposedHigh = [{ k: 22.4, p: 75 }, { k: 25.2, p: 60 }];
      addOptions("Exposed Nonexpanded Group A", 20, 25, exposedLow);
      addOptions("Exposed Nonexpanded Group A", 25, 30, exposedLow);
      addOptions("Exposed Nonexpanded Group A", 30, 35, exposedHigh);
      addOptions("Exposed Nonexpanded Group A", 35, 40, exposedHigh);
    } else {
      addOptions("Exposed Nonexpanded Group A", 20, 25, [{ k: 14, p: 50 }, { k: 16.8, p: 35 }]);
      addOptions("Exposed Nonexpanded Group A", 20, 30, [{ k: 14, p: 50 }, { k: 16.8, p: 35 }]);
      addOptions("Exposed Nonexpanded Group A", 20, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 20, 40, [{ k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 30, [{ k: 14, p: 50 }, { k: 16.8, p: 35 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 32, [{ k: 14, p: 60 }, { k: 16.8, p: 42 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 25, 40, [{ k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
      addOptions("Exposed Nonexpanded Group A", 30, 35, [{ k: 14, p: 75 }, { k: 16.8, p: 52 }]);
      addOptions("Exposed Nonexpanded Group A", 30, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
      addOptions("Exposed Nonexpanded Group A", 35, 40, [{ k: 16.8, p: 52 }, { k: 22.4, p: 50 }, { k: 25.2, p: 50 }]);
    }

    if (uses2022StorageTables(inputs.edition)) add("Exposed Expanded Group A", 25, 30, 25.2, 30, "Pendent", "Vertical barriers required by Section 23.4");
    add("Exposed Expanded Group A", 25, 40, 25.2, 60, "Pendent", uses2022StorageTables(inputs.edition) ? "Vertical barriers required by Section 23.4; closed array for palletized/solid pile" : "Applies to closed array storage only");

    const tableTitle = uses2022StorageTables(inputs.edition) ? "Table 23.3.1 / Section 23.4" : "Table 23.4.2";
    const source = uses2022StorageTables(inputs.edition) ? "23.3.1 / 23.4.2 through 23.4.7 / 23.2.2 / 20.15.2.6" : "23.4.2 / 27.2.4.4.1 / 20.12.2.6";
    return rows.map((row) => buildEsfrPressureCandidate(inputs, row, "cartoned-group-a", tableTitle, source));
  }

  function buildGeneratedEsfr2019ClassCandidates(inputs) {
    if (!["2019", "2022", "2025"].includes(inputs.edition)) return [];
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(isRackArrangement(inputs.arrangement) || inputs.arrangement === "Palletized / Solid-Piled")) return [];

    const rows = [];
    const add = (maxStorage, maxCeiling, kFactor, pressure, orientation = "Pendent") => {
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      rows.push({ maxStorage, maxCeiling, kFactor, pressure, orientation, inRackRequired: false });
    };
    const addOptions = (maxStorage, maxCeiling, options) => options.forEach((option) => add(maxStorage, maxCeiling, option.k, option.p, option.o || "Pendent"));
    const common25 = [
      { k: 14, p: 50, o: "Upright/pendent" },
      { k: 16.8, p: 35, o: "Upright/pendent" },
      { k: 22.4, p: 25 },
      { k: 25.2, p: 15 },
    ];
    const common32 = [
      { k: 14, p: 60, o: "Upright/pendent" },
      { k: 16.8, p: 42, o: "Upright/pendent" },
    ];
    const common35 = [
      { k: 14, p: 75, o: "Upright/pendent" },
      { k: 16.8, p: 52, o: "Upright/pendent" },
      { k: 22.4, p: 35 },
      { k: 25.2, p: 20 },
    ];
    const common40 = [
      { k: 16.8, p: 52 },
      { k: 22.4, p: 40 },
      { k: 25.2, p: 25 },
    ];
    const common45 = [
      { k: 22.4, p: 40 },
      { k: 25.2, p: 40 },
    ];

    addOptions(25, 25, common25);
    addOptions(25, 30, common25);
    addOptions(25, 32, common32);
    addOptions(25, 35, common35);
    addOptions(25, 40, common40);
    addOptions(25, 45, common45);
    addOptions(30, 35, common35);
    addOptions(35, 40, common40);
    addOptions(35, 45, common45);
    addOptions(40, 45, common45);

    const tableTitle = uses2022StorageTables(inputs.edition) ? "Table 23.3.1" : inputs.arrangement === "Palletized / Solid-Piled" ? "Table 23.3.1" : "Table 23.5.1";
    const source = uses2022StorageTables(inputs.edition)
      ? "23.3.1 / 23.2.2 / 20.15.2.6"
      : inputs.arrangement === "Palletized / Solid-Piled"
        ? "23.3.1 / 23.1.3 / 20.12.2.6"
        : "23.5.1 / 23.1.4 / 20.12.2.6";
    return rows.map((row) => buildEsfrPressureCandidate(inputs, row, "class", tableTitle, source));
  }

  function get2025CombinedInRackFlow(inputs, protectionType) {
    const solidShelves = inputs.arrangement === "Solid Shelf Rack";
    const classIToIII = ["Class I", "Class II", "Class III"].includes(inputs.commodity);
    const classIVOrGroupA = inputs.commodity === "Class IV" || isGroupAPlasticCommodity(inputs.commodity);

    if (protectionType === "ESFR") {
      if (!classIToIII && !classIVOrGroupA) return null;
      if (solidShelves) {
        return classIToIII
          ? { operatingSprinklers: 6, flow: 30, levels: 1, rackType: "Solid shelves" }
          : { operatingSprinklers: 8, flow: 30, levels: 1, rackType: "Solid shelves" };
      }
      return { operatingSprinklers: 8, flow: 60, levels: 1, rackType: "Open rack" };
    }

    if (protectionType === "CMSA") {
      if (["Class I", "Class II"].includes(inputs.commodity)) {
        return solidShelves
          ? { operatingSprinklers: 6, flow: 30, levels: 1, rackType: "Solid shelves" }
          : { operatingSprinklers: 8, flow: 22, levels: 1, rackType: "Open rack" };
      }
      if (inputs.commodity === "Class III") {
        return solidShelves
          ? { operatingSprinklers: 6, flow: 30, levels: 1, rackType: "Solid shelves" }
          : { operatingSprinklers: 8, flow: 22, levels: 1, rackType: "Open rack" };
      }
      if (classIVOrGroupA) {
        return solidShelves
          ? { operatingSprinklers: 8, flow: 30, levels: 1, rackType: "Solid shelves" }
          : { operatingSprinklers: 8, flow: 22, levels: 1, rackType: "Open rack" };
      }
    }

    return null;
  }

  function buildGeneratedEsfr2025CombinedInRackCandidates(inputs) {
    if (!is2025Edition(inputs) || inputs.systemType !== "ESFR") return [];
    if (!isRackArrangement(inputs.arrangement)) return [];
    if (inputs.ceilingSystem !== "wet") return [];
    if (inputs.storageHeight > 40 || inputs.ceilingHeight > 45) return [];
    if (!["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A", "Exposed Nonexpanded Group A"].includes(inputs.commodity)) return [];

    const inRack = get2025CombinedInRackFlow(inputs, "ESFR");
    if (!inRack) return [];
    const inRackDemand = inRack.operatingSprinklers * inRack.flow;
    const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(12);
    return [
      { kFactor: 14, pressure: 90 },
      { kFactor: 16.8, pressure: 63 },
    ].map((option) => {
      const headFlow = calcHeadFlow(option.kFactor, option.pressure);
      const sprinklerDemand = headFlow * 12;
      return {
        id: `generated-2025-esfr-combined-inrack-${inputs.commodity}-${inputs.arrangement}-k${option.kFactor}`,
        name: "2025 ESFR combined ceiling/in-rack option",
        basis: `12 ceiling sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head + ${inRack.operatingSprinklers} in-rack sprinklers @ ${formatNumber(inRack.flow, 0)} gpm`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand,
        total: sprinklerDemand + inRackDemand + hoseAllowance,
        source: "25.6.2.1 / 25.6.2.2 / Table 25.6.2.3 / Table 25.6.3.1 / 23.2 / 20.15.2.6",
        tableTitle: "Table 25.6.2.3 + Table 25.6.3.1",
        confidence: "table-derived",
        preview: {
          kind: "esfr-pressure-table",
          arrangement: "Single-, double-, and multiple-row racks",
          commodity: ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)
            ? "Class I through Class IV"
            : "Nonexpanded cartoned or exposed Group A plastics",
          maxStorage: 40,
          maxCeiling: 45,
          kFactor: option.kFactor,
          pressure: option.pressure,
          orientation: "Pendent",
        },
        notes: [
          "2025 Chapter 25 combined ceiling/in-rack ESFR branch; this is not the existing-system curve path",
          `${inRack.rackType}; one required IRAS level represented per Table 25.6.3.1`,
          `In-rack design from Table 25.6.2.3: ${inRack.operatingSprinklers} IRAS @ ${formatNumber(inRack.flow, 0)} gpm`,
          "Maximum horizontal spacing of in-rack sprinklers is checked by 25.6.2.2",
          `Hose duration ${duration} min`,
        ],
      };
    });
  }

  function buildGeneratedEsfrCandidates(inputs) {
    if (inputs.systemType !== "ESFR") return [];
    if (inputs.ceilingSystem !== "wet") return [];
    if (!(isRackArrangement(inputs.arrangement) || inputs.arrangement === "Palletized / Solid-Piled")) return [];

    const classCommodity = ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity);
    const groupACommodity = isEsfrGroupACommodity(inputs.commodity);
    if (!classCommodity && !groupACommodity) return [];

    const classRows2019 = buildGeneratedEsfr2019ClassCandidates(inputs);
    const combined2025Rows = buildGeneratedEsfr2025CombinedInRackCandidates(inputs);
    if (classRows2019.length || combined2025Rows.length) return [...classRows2019, ...combined2025Rows].sort(compareCandidates);

    const groupARackRows2019 = buildGeneratedEsfr2019GroupARackCandidates(inputs);
    if (groupARackRows2019.length || combined2025Rows.length) return [...groupARackRows2019, ...combined2025Rows].sort(compareCandidates);

    const groupASolidRows2019 = buildGeneratedEsfr2019GroupASolidCandidates(inputs);
    if (groupASolidRows2019.length) return groupASolidRows2019;

    const maxStorage = inputs.storageHeight <= 20 ? 20 : inputs.storageHeight <= 25 ? 25 : null;
    if (!maxStorage) return [];

    const ceilingBlock = ESFR_COMMON_OPTIONS.find((block) => inputs.ceilingHeight <= block.maxCeiling);
    if (!ceilingBlock) return [];

    const commodityGroup = classCommodity ? "class" : "cartoned-group-a";
    const source = getEsfrSource(inputs, commodityGroup);
    const tableTitle = getEsfrTableTitle(inputs, commodityGroup);
    const { hoseAllowance } = getHoseAllowanceForSprinklerCount(12);
    const candidates = ceilingBlock.options.map((option) => {
      const headFlow = calcHeadFlow(option.kFactor, option.pressure);
      const sprinklerDemand = headFlow * 12;
      const total = sprinklerDemand + hoseAllowance;
      const labelCommodity = getEsfrCommodityLabel(inputs, commodityGroup);
      return {
        id: `generated-esfr-${inputs.edition}-${commodityGroup}-${inputs.arrangement}-${maxStorage}-${ceilingBlock.maxCeiling}-k${option.kFactor}`,
        name: `ESFR ${labelCommodity} ${isRackArrangement(inputs.arrangement) ? "rack" : "solid-piled"} option`,
        basis: `12 sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand: 0,
        total,
        source,
        tableTitle,
        confidence: "table-derived",
        preview: {
          kind: "esfr-pressure-table",
          arrangement: isRackArrangement(inputs.arrangement) ? "Single-, double-, and multiple-row racks" : "Palletized and solid-piled storage",
          commodity: getEsfrCommodityLabel(inputs, commodityGroup) === "Class I-IV" ? "Class I through Class IV" : `${getEsfrCommodityLabel(inputs, commodityGroup)} plastic`,
          maxStorage,
          maxCeiling: ceilingBlock.maxCeiling,
          kFactor: option.kFactor,
          pressure: option.pressure,
          orientation: option.orientation,
        },
        notes: [
          `Maximum storage ${formatNumber(maxStorage, 0)} ft; maximum ceiling ${formatNumber(ceilingBlock.maxCeiling, 0)} ft`,
          option.orientation,
        ],
      };
    });
    if (
      isRackArrangement(inputs.arrangement) &&
      inputs.storageHeight <= 25 &&
      inputs.ceilingHeight <= 45 &&
      inputs.ceilingHeight > 40 &&
      (classCommodity || inputs.commodity === "Cartoned Group A")
    ) {
      const inRackSource = inputs.edition === "2016"
        ? (classCommodity ? "16.2.3.1 / 16.2.3.6.8 / 16.2.3.6.9 / 12.8.6" : "17.2.3.1 / 17.2.3.4.8 / 17.2.3.4.9 / 12.8.6")
        : "25.2.5.1.1 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6";
      const table = inputs.edition === "2016" ? getEsfrTableTitle(inputs, commodityGroup) : "Table 25.2.5.1.1";
      for (const option of [
        { kFactor: 14, pressure: 90, orientation: "Pendent" },
        { kFactor: 16.8, pressure: 63, orientation: "Pendent" },
      ]) {
        const headFlow = calcHeadFlow(option.kFactor, option.pressure);
        const sprinklerDemand = headFlow * 12;
        const inRackDemand = 8 * 60;
        candidates.push({
          id: `generated-esfr-inrack-${inputs.edition}-${commodityGroup}-${inputs.arrangement}-${maxStorage}-45-k${option.kFactor}`,
          name: `ESFR ${getEsfrCommodityLabel(inputs, commodityGroup)} rack with in-rack sprinklers`,
          basis: `12 ceiling sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head + 8 in-rack sprinklers @ 60 gpm`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand,
          total: sprinklerDemand + inRackDemand + hoseAllowance,
          source: inRackSource,
          tableTitle: table,
          confidence: "table-derived",
          notes: [
            "One level of in-rack sprinklers required",
            "Maximum storage 25 ft; maximum ceiling 45 ft",
            option.orientation,
          ],
        });
      }
    }
    return candidates;
  }

  function getAlternativeInRack2019CommodityOptions(inputs) {
    const classOrCartonedNonexpanded = ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A"].includes(inputs.commodity);
    const cartonedExpanded = inputs.commodity === "Cartoned Expanded Group A";
    const exposedGroupA = inputs.commodity === "Exposed Nonexpanded Group A" || inputs.commodity === "Exposed Expanded Group A";
    if (classOrCartonedNonexpanded) {
      return [
        { label: "30 ft vertical increment", kFactor: 14, flow: 65, verticalIncrement: 30 },
        { label: "40 ft vertical increment", kFactor: 22.4, flow: 120, verticalIncrement: 40 },
      ];
    }
    if (cartonedExpanded) {
      return [{ label: "30 ft vertical increment", kFactor: 14, flow: 100, verticalIncrement: 30 }];
    }
    if (exposedGroupA) {
      return [{ label: "30 ft vertical increment", kFactor: 22.4, flow: 120, verticalIncrement: 30 }];
    }
    return [];
  }

  function getAlternativeInRack2019ArrangementInfo(inputs, exposedGroupA) {
    if (inputs.arrangement === "Single-Row Rack") {
      return {
        operatingSprinklers: 4,
        figure: "Figure 25.8.2.4(a)",
        note: "Single-row rack option; rack depth must be verified against the applicable figure",
      };
    }
    if (inputs.arrangement === "Double-Row Rack" || inputs.arrangement === "Multiple-Row Rack") {
      return {
        operatingSprinklers: exposedGroupA ? 12 : 6,
        figure: "Figures 25.8.2.4(d)-25.8.2.4(f)",
        note: exposedGroupA
          ? "Exposed Group A double/multiple-row option includes 6 sprinklers in the remote rack plus 6 in the nearest adjacent rack"
          : "Double/multiple-row option includes 6 sprinklers in the hydraulically remote rack",
      };
    }
    return null;
  }

  function buildGeneratedAlternativeInRack2019Candidates(inputs) {
    if (!["2019", "2022"].includes(inputs.edition)) return [];
    if (inputs.systemType !== "In-Rack") return [];
    if (!isRackArrangement(inputs.arrangement)) return [];

    const exposedGroupA = inputs.commodity === "Exposed Nonexpanded Group A" || inputs.commodity === "Exposed Expanded Group A";
    const commodityOptions = getAlternativeInRack2019CommodityOptions(inputs);
    const arrangementInfo = getAlternativeInRack2019ArrangementInfo(inputs, exposedGroupA);
    if (!commodityOptions.length || !arrangementInfo) return [];

    const hoseAllowance = 250;
    return commodityOptions.map((option) => {
      const requiredPressure = Math.pow(option.flow / option.kFactor, 2);
      const inRackDemand = option.flow * arrangementInfo.operatingSprinklers;
      return {
        id: `generated-${inputs.edition}-alt-inrack-${inputs.commodity}-${inputs.arrangement}-k${option.kFactor}-f${option.flow}`,
        name: `${inputs.edition} alternative in-rack independent option`,
        basis: `${arrangementInfo.operatingSprinklers} in-rack sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(requiredPressure, 1)} psi = ${formatNumber(option.flow, 0)} gpm/head`,
        sprinklerDemand: 0,
        hoseAllowance,
        inRackDemand,
        total: inRackDemand + hoseAllowance,
        completeDesign: false,
        source: inputs.edition === "2022" ? "25.6 / 25.12.2.1 / 25.12.3.1 / 20.15.2.6" : "25.8.2.4 / 25.8.2.6 / 25.8.2.7 / 25.8.2.8 / 20.12.2.6",
        tableTitle: inputs.edition === "2022" ? `Alternative in-rack criteria / ${arrangementInfo.figure}` : `Table 25.8.2.6 / Table 25.8.2.7 / ${arrangementInfo.figure}`,
        confidence: "table-derived",
        notes: [
          option.label,
          arrangementInfo.note,
          "Alternative in-rack design is independent of the ceiling sprinkler hydraulic demand; ceiling protection still must be selected from the applicable ceiling chapter",
          "Wet in-rack system only",
          "Hose duration 60 min",
        ],
      };
    });
  }

  const NFPA_2022_25_6_INRACK_CHARACTERISTICS = {
    "1": {
      type: "CMDA",
      kFactor: 8,
      kLabel: "Minimum K8.0",
      coverage: "Standard-coverage",
      orientation: "Pendent or upright",
      response: "Quick-response",
      temperature: "Ordinary-temperature",
    },
    "2a": {
      type: "ESFR",
      kFactor: 14,
      kLabel: "Minimum K14.0",
      coverage: "Standard-coverage",
      orientation: "Pendent",
      response: "Fast-response",
      temperature: "Ordinary-temperature",
    },
    "2b": {
      type: "ESFR",
      kFactor: 22.4,
      kLabel: "Minimum K22.4",
      coverage: "Standard-coverage",
      orientation: "Pendent",
      response: "Fast-response",
      temperature: "Ordinary-temperature",
    },
    "3": {
      type: "CMDA",
      kFactor: 25.2,
      kLabel: "K25.2 EC",
      coverage: "Extended-coverage",
      orientation: "Pendent",
      response: "Fast-response",
      temperature: "Intermediate-temperature",
      notes: [
        "Option 3 uses K25.2 (K-360) extended-coverage pendent sprinklers; do not treat this as a standard K25.2 sprinkler",
        "Horizontal barriers are required with Option 3 in accordance with Section 25.6.2.4.1 and Section 25.6.2.5",
      ],
    },
  };

  const NFPA_2022_25_6_INRACK_SPACING = {
    "1": {
      singleSmall: "5 ft maximum horizontal spacing",
      singleDeep: "5 ft maximum horizontal spacing",
      double: "5 ft at each rack face; 10 ft within the longitudinal flue space",
      multiple: "5 ft at each rack face and at each alternating rack bay; 10 ft between in-rack sprinklers at every other rack bay",
    },
    "2a": {
      singleSmall: "4.5 ft maximum horizontal spacing",
      singleDeep: "4.5 ft maximum horizontal spacing",
      double: "4.5 ft at each rack face and within the longitudinal flue space",
      multiple: "8 ft 6 in. at each rack face; 4.5 ft in-between rack faces",
    },
    "2b": {
      singleSmall: "4.5 ft maximum horizontal spacing",
      singleDeep: "4.5 ft maximum horizontal spacing",
      double: "4.5 ft at each rack face and within the longitudinal flue space",
      multiple: "8 ft 6 in. at each rack face; 4.5 ft in-between rack faces",
    },
    "3": {
      singleSmall: "10 ft maximum horizontal spacing",
      singleDeep: "10 ft maximum horizontal spacing",
      double: "Not required at rack face; 10 ft within the longitudinal flue space",
      multiple: "10 ft at each rack face; 10 ft in-between rack faces",
    },
  };

  const NFPA_2022_25_6_GEOMETRIES = {
    singleSmall: { label: "single-row rack up to 3 ft deep", arrangements: ["Single-Row Rack"] },
    singleDeep: { label: "single-row rack over 3 ft and up to 6 ft deep", arrangements: ["Single-Row Rack"] },
    double: { label: "double-row rack", arrangements: ["Double-Row Rack"] },
    multiple: { label: "multiple-row rack", arrangements: ["Multiple-Row Rack"] },
  };

  const NFPA_2022_25_6_INRACK_ROWS = [
    {
      id: "option-1-all",
      option: "1",
      hazardLabel: "Class I-IV and Group A plastic commodities",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity) || isGroupAPlasticCommodity(inputs.commodity),
      verticalInterval: 12,
      counts: { singleSmall: 6, singleDeep: 6, double: 8, multiple: 8 },
      flow: 60,
    },
    {
      id: "option-2a-class-cartoned-nonexpanded",
      option: "2a",
      hazardLabel: "Class I-IV and cartoned nonexpanded Group A plastics",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A"].includes(inputs.commodity),
      verticalInterval: 30,
      counts: { singleSmall: 4, singleDeep: 5, double: 6, multiple: 6 },
      flow: 65,
    },
    {
      id: "option-2a-expanded",
      option: "2a",
      hazardLabel: "Cartoned expanded Group A plastics; also permitted for Class I-IV and cartoned nonexpanded Group A",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A", "Cartoned Expanded Group A"].includes(inputs.commodity),
      verticalInterval: 30,
      counts: { singleSmall: 4, singleDeep: 5, double: 6, multiple: 6 },
      flow: 100,
    },
    {
      id: "option-2b-exposed",
      option: "2b",
      hazardLabel: "Exposed Group A plastics; also permitted for Class I-IV and cartoned Group A plastics",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A", "Cartoned Expanded Group A", "Exposed Nonexpanded Group A", "Exposed Expanded Group A"].includes(inputs.commodity),
      verticalInterval: 30,
      counts: { singleSmall: 4, singleDeep: 5, double: 10, multiple: 10 },
      flow: 120,
      note: "Double-row and multiple-row entries are represented as 5 plus 5 operating IRAS from Table 25.6.3.1",
    },
    {
      id: "option-2b-class-cartoned-nonexpanded",
      option: "2b",
      hazardLabel: "Class I-IV and cartoned nonexpanded Group A plastics",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A"].includes(inputs.commodity),
      verticalInterval: 40,
      counts: { singleSmall: 4, singleDeep: 5, double: 6, multiple: 6 },
      flow: 120,
    },
    {
      id: "option-3-cartoned",
      option: "3",
      hazardLabel: "Class I-IV and cartoned Group A plastic commodities",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A", "Cartoned Expanded Group A"].includes(inputs.commodity),
      verticalInterval: 30,
      counts: { singleSmall: 4, singleDeep: 4, double: 4, multiple: 8 },
      flow: 138,
    },
    {
      id: "option-3-exposed",
      option: "3",
      hazardLabel: "Exposed Group A plastics; also permitted for Class I-IV and cartoned Group A plastics",
      applies: (inputs) => ["Class I", "Class II", "Class III", "Class IV", "Cartoned Group A", "Cartoned Expanded Group A", "Exposed Nonexpanded Group A", "Exposed Expanded Group A"].includes(inputs.commodity),
      verticalInterval: 20,
      counts: { singleSmall: 4, singleDeep: 4, double: 4, multiple: 8 },
      flow: 138,
    },
  ];

  function get25_6RackGeometries(inputs) {
    const selectedGeometry = inputs.rackGeometry || "unknown";
    const allGeometries = Object.entries(NFPA_2022_25_6_GEOMETRIES).map(([key, value]) => ({
      key,
      ...value,
    }));
    const applySelectedGeometry = (geometries) => {
      if (selectedGeometry === "unknown") return geometries;
      return geometries.filter((geometry) => geometry.key === selectedGeometry);
    };

    if (inputs.arrangement === "Solid Shelf Rack") {
      return applySelectedGeometry(allGeometries).map((value) => ({
        ...value,
        note: selectedGeometry === "unknown"
          ? "Solid shelf rack selected with unknown rack geometry; bounded alternatives are shown for each row/depth geometry"
          : "Solid shelf rack selected; verify the selected row/depth geometry matches the actual rack construction",
      }));
    }

    if (inputs.arrangement === "Single-Row Rack") {
      return applySelectedGeometry(allGeometries.filter((geometry) => geometry.arrangements.includes(inputs.arrangement)))
        .map((geometry) => ({
          ...geometry,
          note: selectedGeometry === "unknown"
            ? "Single-row rack selected with unknown rack depth; both Table 25.6.3.1 single-row depth branches are shown"
            : "",
        }));
    }

    return applySelectedGeometry(
      Object.entries(NFPA_2022_25_6_GEOMETRIES)
        .filter(([, value]) => value.arrangements.includes(inputs.arrangement))
        .map(([key, value]) => ({
        key,
        ...value,
      })),
    );
  }

  function buildGenerated25_6IndependentInRackCandidates(inputs) {
    if (!uses2022StorageTables(inputs.edition)) return [];
    if (inputs.systemType !== "In-Rack") return [];
    if (!(isRackArrangement(inputs.arrangement) || inputs.arrangement === "Solid Shelf Rack")) return [];

    const geometries = get25_6RackGeometries(inputs);
    if (!geometries.length) return [];

    const rows = NFPA_2022_25_6_INRACK_ROWS.filter((row) => row.applies(inputs));
    if (!rows.length) return [];

    const independentSources = getModernIndependentInRackSources(inputs);
    const sourceBase = is2025Edition(inputs)
      ? inputs.arrangement === "Solid Shelf Rack"
        ? isGroupAPlasticCommodity(inputs.commodity)
          ? `20.19 / 25.3.2.4 / ${independentSources.source}`
          : `21.4.1.4 / ${independentSources.source}`
        : independentSources.source
      : inputs.arrangement === "Solid Shelf Rack"
      ? isGroupAPlasticCommodity(inputs.commodity)
        ? "20.19 / 25.3.2.4 / 25.6.2.2 / 25.6.2.3.1 / 25.6.2.4.1 / 25.6.2.5 / 25.6.3.1 / 20.15.2.6"
        : "21.4.1.4 / 25.6.2.2 / 25.6.2.3.1 / 25.6.2.4.1 / 25.6.2.5 / 25.6.3.1 / 20.15.2.6"
      : "25.6.2.2 / 25.6.2.3.1 / 25.6.2.4.1 / 25.6.2.5 / 25.6.3.1 / 20.15.2.6";
    const candidates = [];
    for (const row of rows) {
      const characteristics = NFPA_2022_25_6_INRACK_CHARACTERISTICS[row.option];
      const spacing = NFPA_2022_25_6_INRACK_SPACING[row.option];
      for (const geometry of geometries) {
        const operatingSprinklers = row.counts[geometry.key];
        if (!operatingSprinklers) continue;
        const inRackDemand = operatingSprinklers * row.flow;
        const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(operatingSprinklers);
        const equivalentPressure = Math.pow(row.flow / characteristics.kFactor, 2);
        candidates.push({
          id: `generated-${inputs.edition}-independent-inrack-${row.id}-${geometry.key}-${inputs.commodity}`,
          name: `${inputs.edition} ${independentSources.sectionLabel} IRAS ${row.option} ${geometry.label}`,
          basis: `${operatingSprinklers} IRAS @ ${formatNumber(row.flow, 0)} gpm = ${formatNumber(inRackDemand, 0)} gpm; ${characteristics.kLabel}${row.option === "3" ? " extended-coverage pendent" : ""}`,
          sprinklerDemand: 0,
          hoseAllowance,
          inRackDemand,
          total: inRackDemand + hoseAllowance,
          completeDesign: false,
          source: sourceBase,
          tableTitle: independentSources.tableTitle,
          confidence: "table-derived independent in-rack",
          notes: [
            `Commodity hazard row: ${row.hazardLabel}`,
            `Maximum in-rack sprinkler vertical interval ${formatNumber(row.verticalInterval, 0)} ft`,
            `${characteristics.type}; ${characteristics.coverage}; ${characteristics.orientation}; ${characteristics.response}; ${characteristics.temperature}`,
            `Equivalent pressure ${formatNumber(equivalentPressure, 1)} psi at K${formatNumber(characteristics.kFactor, 1)}`,
            `Spacing: ${spacing[geometry.key]}`,
            ...(characteristics.notes || []),
            row.option === "3" && inputs.arrangement === "Solid Shelf Rack"
              ? "For solid shelf racks, horizontal barriers are installed at every tier level of the dedicated storage rack equipped with solid shelves"
              : "",
            row.option === "3" && inputs.arrangement !== "Solid Shelf Rack"
              ? "For open-frame racks, horizontal barriers are installed above every level of in-rack sprinklers for Option 3"
              : "",
            geometry.note || "",
            row.note || "",
            "In-rack design is independent of ceiling-level sprinkler demand; ceiling-only protection is not permitted where the applicable storage rule requires in-rack sprinklers",
            inputs.arrangement === "Solid Shelf Rack" ? `For solid shelf racks, verify shelf area, vertical shelf spacing, flue spaces, and Section 20.19/${independentSources.sectionLabel.replace("Section ", "")} installation requirements` : "",
            `Hose duration ${duration} min`,
          ].filter(Boolean),
        });
      }
    }
    return candidates;
  }

  function getSolidShelfRackSources(inputs) {
    if (inputs.edition === "2016") {
      if (isGroupAPlasticCommodity(inputs.commodity)) {
        return {
          tableTitle: "Section 17.1.5 / In-rack sprinkler criteria",
          source: "17.1.5 / 17.2.1.4 / 17.2.2.1.1 / 17.2.3.1.2 / 12.8.6",
          hose: "12.8.6",
        };
      }
      return {
        tableTitle: "Section 16.1.6 / Table 16.2.1.4.2.1",
        source: "16.1.6 / 16.2.1.4.2.1 / 16.2.1.4.2.2 / 12.8.6",
        hose: "12.8.6",
      };
    }
    if (uses2022StorageTables(inputs.edition)) {
      const independent = getModernIndependentInRackSources(inputs);
      if (isGroupAPlasticCommodity(inputs.commodity)) {
        return {
          tableTitle: `Section 25.3.2.4 / ${independent.sectionLabel} / ${independent.tableTitle}`,
          source: `20.19 / 25.3.2.4 / ${independent.source}`,
          hose: "20.15.2.6",
        };
      }
      return {
        tableTitle: `${independent.sectionLabel} / ${independent.tableTitle}`,
        source: `21.4.1.4 / ${independent.source}`,
        hose: "20.15.2.6",
      };
    }
    if (isGroupAPlasticCommodity(inputs.commodity)) {
      return {
        tableTitle: "Section 25.2.3.4 / Section 25.6 / Tables 25.12.2.1 and 25.12.3.1",
        source: "20.19 / 25.2.3.4 / 25.6 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6",
        hose: "20.12.2.6",
      };
    }
    return {
      tableTitle: "Section 25.6 / Tables 25.12.2.1 and 25.12.3.1",
      source: "21.4.1.4 / 25.6 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6",
      hose: "20.12.2.6",
    };
  }

  function buildGeneratedSolidShelfRackInRackCandidates(inputs) {
    if (inputs.arrangement !== "Solid Shelf Rack") return [];
    if (inputs.systemType !== "In-Rack") return [];
    const classCommodity = ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity);
    const groupACommodity = isGroupAPlasticCommodity(inputs.commodity);
    if (!classCommodity && !groupACommodity) return [];
    if (classCommodity && !(inputs.storageHeight > 12 && inputs.storageHeight <= 25)) return [];
    if (groupACommodity && !(inputs.storageHeight > 5 && inputs.storageHeight <= 25)) return [];
    if (classCommodity && inputs.ceilingHeight > 35) return [];
    if (groupACommodity && inputs.ceilingHeight > 30) return [];

    const sources = getSolidShelfRackSources(inputs);
    const hoseAllowance = 500;
    const highChallengeCommodity = inputs.commodity === "Class IV" || groupACommodity;
    const rows = [
      {
        id: "one-level",
        levelText: "One required in-rack level",
        operatingSprinklers: highChallengeCommodity ? 8 : 6,
      },
      {
        id: "multiple-levels",
        levelText: "More than one required in-rack level",
        operatingSprinklers: highChallengeCommodity ? 14 : 10,
      },
    ];

    return rows.map((row) => {
      const flowPerSprinkler = 30;
      const inRackDemand = row.operatingSprinklers * flowPerSprinkler;
      return {
        id: `generated-${inputs.edition}-solid-shelf-rack-${inputs.commodity}-${row.id}`,
        name: `${inputs.edition} ${inputs.commodity} solid shelf rack in-rack criteria`,
        basis: `${row.operatingSprinklers} in-rack sprinklers @ ${formatNumber(flowPerSprinkler, 0)} gpm each = ${formatNumber(inRackDemand, 0)} gpm`,
        sprinklerDemand: 0,
        hoseAllowance,
        inRackDemand,
        total: inRackDemand + hoseAllowance,
        completeDesign: false,
        source: sources.source,
        tableTitle: sources.tableTitle,
        confidence: "table-derived in-rack-required",
        notes: [
          row.levelText,
          groupACommodity
            ? "Group A plastic storage on solid shelf racks over 5 ft requires in-rack sprinkler protection; ceiling-only protection is not permitted for this configuration"
            : "Solid shelf rack storage over 12 ft requires in-rack sprinkler protection; final ceiling-level criteria must be selected from the applicable ceiling sprinkler chapter",
          "Flow/pressure basis uses the solid-shelf row from the in-rack flow/pressure table: 30 gpm per in-rack sprinkler",
          "Solid-shelf installation details depend on shelf area, shelf levels, and vertical spacing; verify Section 25.6 / applicable edition chapter before final design",
          groupACommodity ? "Section 20.19 shelf construction, flue space, and fire protection feature requirements must also be checked" : "",
          `Maximum storage 25 ft; maximum ceiling ${groupACommodity ? 30 : 35} ft for this built-in solid-shelf guidance`,
          `Hose allowance placeholder from storage hose table ${sources.hose}; verify final combined hose allowance with the completed ceiling design`,
        ].filter(Boolean),
      };
    });
  }

  function buildGeneratedCmsa2016RackCandidates(inputs) {
    if (!isRackArrangement(inputs.arrangement)) return [];
    if (inputs.commodity === "Cartoned Group A" || inputs.commodity === "Exposed Nonexpanded Group A") {
      return buildGeneratedCmsa2016GroupARackCandidates(inputs);
    }
    if (!["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity)) return [];
    if (!(inputs.storageHeight > 0 && inputs.storageHeight <= 25 && inputs.ceilingHeight <= 40)) return [];

    const rows = [];
    const dryLike = inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction";
    const add = (commodity, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure, inRack = false) => {
      if (inputs.commodity !== commodity) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      if (system === "Wet" && dryLike) return;
      if (system === "Dry" && !dryLike) return;
      rows.push({ maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure, inRack });
    };

    for (const commodity of ["Class I", "Class II"]) {
      add(commodity, 20, 30, 11.2, "Upright", "Wet", 15, 25);
      add(commodity, 20, 30, 11.2, "Upright", "Dry", 25, 25);
      add(commodity, 20, 30, 16.8, "Upright", "Wet", 15, 10);
      add(commodity, 20, 30, 16.8, "Upright", "Dry", 25, 15);
      add(commodity, 20, 30, 19.6, "Pendent", "Wet", 15, 16);
      add(commodity, 25, 30, 11.2, "Upright", "Wet", 20, 25);
      add(commodity, 25, 30, 11.2, "Upright", "Dry", 30, 25);
      add(commodity, 25, 30, 16.8, "Upright", "Wet", 15, 10);
      add(commodity, 25, 30, 16.8, "Upright", "Dry", 30, 15);
      add(commodity, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
    }

    add("Class III", 20, 30, 11.2, "Upright", "Wet", 15, 25);
    add("Class III", 20, 30, 11.2, "Upright", "Dry", 25, 25);
    add("Class III", 20, 30, 16.8, "Upright", "Wet", 15, 15);
    add("Class III", 20, 30, 16.8, "Upright", "Dry", 25, 15);
    add("Class III", 20, 30, 19.6, "Pendent", "Wet", 15, 16);
    add("Class III", 25, 30, 11.2, "Upright", "Wet", 15, 25, true);
    add("Class III", 25, 30, 11.2, "Upright", "Dry", 25, 25, true);
    add("Class III", 25, 30, 16.8, "Upright", "Wet", 15, 22);
    add("Class III", 25, 30, 16.8, "Upright", "Dry", 25, 15, true);
    add("Class III", 25, 30, 19.6, "Pendent", "Wet", 15, 16);
    add("Class III", 25, 35, 11.2, "Upright", "Wet", 15, 25, true);
    add("Class III", 25, 35, 11.2, "Upright", "Dry", 25, 25, true);
    add("Class III", 25, 35, 16.8, "Upright", "Wet", 15, 15, true);
    add("Class III", 25, 35, 16.8, "Upright", "Dry", 25, 15, true);
    add("Class III", 25, 35, 19.6, "Pendent", "Wet", 15, 25);
    add("Class III", 25, 40, 19.6, "Pendent", "Wet", 15, 30);

    add("Class IV", 20, 25, 11.2, "Upright", "Wet", 15, 50);
    add("Class IV", 20, 25, 16.8, "Upright", "Wet", 15, 22);
    add("Class IV", 20, 25, 19.6, "Pendent", "Wet", 15, 16);
    add("Class IV", 20, 30, 11.2, "Upright", "Wet", 20, 50);
    add("Class IV", 20, 30, 11.2, "Upright", "Wet", 15, 75);
    add("Class IV", 20, 30, 16.8, "Upright", "Wet", 15, 22);
    add("Class IV", 20, 30, 19.6, "Pendent", "Wet", 15, 16);
    add("Class IV", 25, 30, 11.2, "Upright", "Wet", 15, 50, true);
    add("Class IV", 25, 30, 16.8, "Upright", "Wet", 15, 22);
    add("Class IV", 25, 30, 19.6, "Pendent", "Wet", 15, 16);
    add("Class IV", 25, 35, 11.2, "Upright", "Wet", 20, 50, true);
    add("Class IV", 25, 35, 11.2, "Upright", "Wet", 15, 75, true);
    add("Class IV", 25, 35, 16.8, "Upright", "Wet", 20, 22, true);
    add("Class IV", 25, 35, 16.8, "Upright", "Wet", 15, 35, true);
    add("Class IV", 25, 35, 19.6, "Pendent", "Wet", 15, 25);
    add("Class IV", 25, 40, 19.6, "Pendent", "Wet", 15, 30);

    const candidates = [];
    for (const row of rows) {
      const headFlow = calcHeadFlow(row.kFactor, row.pressure);
      const sprinklerDemand = headFlow * row.sprinklers;
      const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(row.sprinklers);
      const inRackOptions = row.inRack ? getGroupAInRackDesignOptions() : [{ demand: 0, kFactor: 0, pressure: 0, operatingSprinklers: 0 }];
      for (const inRack of inRackOptions) {
        const inRackBasis = row.inRack
          ? ` + 8 in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ 15 psi = ${formatNumber(calcHeadFlow(inRack.kFactor, 15))} gpm/head`
          : "";
        candidates.push({
          id: `generated-cmsa-2016-rack-${inputs.commodity}-${row.kFactor}-${row.sprinklers}-${row.pressure}-${row.system}-ir${inRack.kFactor}`,
          name: `2016 CMSA rack ${row.orientation} K${formatNumber(row.kFactor, 1)}`,
          basis: `${row.sprinklers} ceiling sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head${inRackBasis}`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source: row.inRack ? "16.2.2.1 / 16.2.2.2 / 16.2.2.7.7 / 16.2.2.7.8 / 12.8.6" : "16.2.2.1 / 16.2.2.3 / 12.8.6",
          tableTitle: "Table 16.2.2.1",
          confidence: "table-derived",
          notes: [
            `${row.system} system`,
            row.inRack ? "One level of in-rack sprinklers required" : "Ceiling only",
            `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmsa2016GroupARackCandidates(inputs) {
    if (!(inputs.storageHeight > 0 && inputs.storageHeight <= 25 && inputs.ceilingHeight <= 35)) return [];
    if (inputs.ceilingSystem !== "wet") return [];

    const rows = [];
    const add = (commodity, maxStorage, maxCeiling, kFactor, orientation, sprinklers, pressure, inRack = false, minAisle = 0) => {
      if (inputs.commodity !== commodity) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      if (minAisle && inputs.aisleWidth < minAisle) return;
      rows.push({ maxStorage, maxCeiling, kFactor, orientation, sprinklers, pressure, inRack, minAisle });
    };

    add("Cartoned Group A", 20, 25, 11.2, "Upright", 15, 50);
    add("Cartoned Group A", 20, 25, 16.8, "Upright", 15, 22);
    add("Cartoned Group A", 20, 25, 19.6, "Pendent", 15, 16);
    add("Cartoned Group A", 20, 30, 11.2, "Upright", 30, 50);
    add("Cartoned Group A", 20, 30, 11.2, "Upright", 20, 75);
    add("Cartoned Group A", 20, 30, 16.8, "Upright", 15, 22, false, 8);
    add("Cartoned Group A", 20, 30, 19.6, "Pendent", 15, 16);
    add("Cartoned Group A", 25, 30, 11.2, "Upright", 15, 50, true);
    add("Cartoned Group A", 25, 30, 16.8, "Upright", 15, 22, false, 8);
    add("Cartoned Group A", 25, 30, 19.6, "Pendent", 15, 16);
    add("Cartoned Group A", 25, 35, 11.2, "Upright", 30, 50, true);
    add("Cartoned Group A", 25, 35, 11.2, "Upright", 20, 75, true);
    add("Cartoned Group A", 25, 35, 16.8, "Upright", 30, 22, true);
    add("Cartoned Group A", 25, 35, 16.8, "Upright", 20, 35, true);
    add("Cartoned Group A", 25, 35, 19.6, "Pendent", 15, 25);

    add("Exposed Nonexpanded Group A", 20, 25, 11.2, "Upright", 15, 50);
    add("Exposed Nonexpanded Group A", 20, 25, 16.8, "Upright", 15, 22);
    add("Exposed Nonexpanded Group A", 20, 30, 11.2, "Upright", 30, 50);
    add("Exposed Nonexpanded Group A", 20, 30, 11.2, "Upright", 20, 75);
    add("Exposed Nonexpanded Group A", 20, 30, 16.8, "Upright", 15, 22, false, 8);
    add("Exposed Nonexpanded Group A", 25, 30, 11.2, "Upright", 15, 50, true);
    add("Exposed Nonexpanded Group A", 25, 30, 16.8, "Upright", 15, 22, false, 8);
    add("Exposed Nonexpanded Group A", 25, 35, 11.2, "Upright", 30, 50, true);
    add("Exposed Nonexpanded Group A", 25, 35, 11.2, "Upright", 20, 75, true);
    add("Exposed Nonexpanded Group A", 25, 35, 16.8, "Upright", 30, 22, true);
    add("Exposed Nonexpanded Group A", 25, 35, 16.8, "Upright", 20, 35, true);

    const candidates = [];
    for (const row of rows) {
      const headFlow = calcHeadFlow(row.kFactor, row.pressure);
      const sprinklerDemand = headFlow * row.sprinklers;
      const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(row.sprinklers);
      const inRackOptions = row.inRack ? getGroupAInRackDesignOptions() : [{ demand: 0, kFactor: 0, pressure: 0, operatingSprinklers: 0 }];
      for (const inRack of inRackOptions) {
        const inRackBasis = row.inRack
          ? ` + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(calcHeadFlow(inRack.kFactor, inRack.pressure))} gpm/head`
          : "";
        candidates.push({
          id: `generated-cmsa-2016-group-a-rack-${inputs.commodity}-${row.kFactor}-${row.sprinklers}-${row.pressure}-ir${inRack.kFactor}`,
          name: `2016 CMSA Group A rack ${row.orientation} K${formatNumber(row.kFactor, 1)}`,
          basis: `${row.sprinklers} ceiling sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head${inRackBasis}`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: inRack.demand,
          total: sprinklerDemand + inRack.demand + hoseAllowance,
          source: row.inRack ? "17.2.2.1 / 17.2.2.2 / 17.2.2.6.7 / 17.2.2.6.8 / 12.8.6" : "17.2.2.1 / 17.2.2.2 / 12.8.6",
          tableTitle: "Table 17.2.2.1",
          confidence: "table-derived",
          notes: [
            "Wet system",
            row.inRack ? "One level of in-rack sprinklers required" : "Ceiling only",
            row.minAisle ? `Minimum aisle ${formatNumber(row.minAisle, 0)} ft` : "No special aisle minimum noted for this row",
            `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }
    return candidates;
  }

  function buildGeneratedCmsa2016SolidPileCandidates(inputs) {
    if (inputs.arrangement !== "Palletized / Solid-Piled") return [];
    if (!(inputs.storageHeight > 0 && inputs.ceilingHeight > 0)) return [];

    const rows = [];
    const dryLike = inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction";
    const add = (commodity, configuration, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure, tableTitle = "Table 14.3.1", source = "14.3.1 / 14.3.2 / 14.3.4 / 12.8.6") => {
      if (inputs.commodity !== commodity) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      if (system === "Wet" && dryLike) return;
      if (system === "Dry" && !dryLike) return;
      rows.push({ configuration, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure, tableTitle, source });
    };
    const addClassIOrII = (configuration, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure) => {
      add("Class I", configuration, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure);
      add("Class II", configuration, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure);
    };

    for (const configuration of ["Palletized"]) {
      addClassIOrII(configuration, 25, 30, 11.2, "Upright", "Wet", 15, 25);
      addClassIOrII(configuration, 25, 30, 11.2, "Upright", "Dry", 25, 25);
      addClassIOrII(configuration, 25, 30, 16.8, "Upright", "Wet", 15, 10);
      addClassIOrII(configuration, 25, 30, 16.8, "Upright", "Dry", 25, 15);
      addClassIOrII(configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      addClassIOrII(configuration, 25, 35, 11.2, "Upright", "Wet", 15, 25);
      addClassIOrII(configuration, 25, 35, 11.2, "Upright", "Dry", 25, 25);
      addClassIOrII(configuration, 25, 35, 16.8, "Upright", "Wet", 15, 15);
      addClassIOrII(configuration, 25, 35, 16.8, "Upright", "Dry", 25, 15);
      addClassIOrII(configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      addClassIOrII(configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);

      add("Class III", configuration, 25, 30, 11.2, "Upright", "Wet", 15, 25);
      add("Class III", configuration, 25, 30, 11.2, "Upright", "Dry", 25, 25);
      add("Class III", configuration, 25, 30, 16.8, "Upright", "Wet", 15, 15);
      add("Class III", configuration, 25, 30, 16.8, "Upright", "Dry", 25, 15);
      add("Class III", configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class III", configuration, 25, 35, 11.2, "Upright", "Wet", 15, 25);
      add("Class III", configuration, 25, 35, 11.2, "Upright", "Dry", 25, 25);
      add("Class III", configuration, 25, 35, 16.8, "Upright", "Wet", 15, 15);
      add("Class III", configuration, 25, 35, 16.8, "Upright", "Dry", 25, 15);
      add("Class III", configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      add("Class III", configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);

      add("Class IV", configuration, 20, 30, 11.2, "Upright", "Wet", 20, 25);
      add("Class IV", configuration, 20, 30, 11.2, "Upright", "Wet", 15, 50);
      add("Class IV", configuration, 20, 30, 16.8, "Upright", "Wet", 20, 15);
      add("Class IV", configuration, 20, 30, 16.8, "Upright", "Wet", 15, 22);
      add("Class IV", configuration, 20, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class IV", configuration, 25, 30, 16.8, "Upright", "Wet", 15, 22);
      add("Class IV", configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class IV", configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      add("Class IV", configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);
    }

    for (const configuration of ["Solid-piled"]) {
      addClassIOrII(configuration, 20, 30, 11.2, "Upright", "Wet", 15, 25);
      addClassIOrII(configuration, 20, 30, 11.2, "Upright", "Dry", 25, 25);
      addClassIOrII(configuration, 20, 30, 16.8, "Upright", "Wet", 15, 10);
      addClassIOrII(configuration, 20, 30, 16.8, "Upright", "Dry", 25, 15);
      addClassIOrII(configuration, 20, 30, 19.6, "Pendent", "Wet", 15, 16);
      addClassIOrII(configuration, 25, 30, 16.8, "Upright", "Wet", 15, 10);
      addClassIOrII(configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      addClassIOrII(configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      addClassIOrII(configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);

      add("Class III", configuration, 20, 30, 11.2, "Upright", "Wet", 15, 25);
      add("Class III", configuration, 20, 30, 11.2, "Upright", "Dry", 25, 25);
      add("Class III", configuration, 20, 30, 16.8, "Upright", "Wet", 15, 15);
      add("Class III", configuration, 20, 30, 16.8, "Upright", "Dry", 25, 15);
      add("Class III", configuration, 20, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class III", configuration, 25, 30, 16.8, "Upright", "Wet", 15, 22);
      add("Class III", configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class III", configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      add("Class III", configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);

      add("Class IV", configuration, 20, 30, 11.2, "Upright", "Wet", 15, 50);
      add("Class IV", configuration, 20, 30, 16.8, "Upright", "Wet", 15, 22);
      add("Class IV", configuration, 20, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class IV", configuration, 25, 30, 16.8, "Upright", "Wet", 15, 22);
      add("Class IV", configuration, 25, 30, 19.6, "Pendent", "Wet", 15, 16);
      add("Class IV", configuration, 30, 35, 19.6, "Pendent", "Wet", 15, 25);
      add("Class IV", configuration, 35, 40, 19.6, "Pendent", "Wet", 15, 30);
    }

    const groupASource = "15.3.1 / 15.3.2 / 12.8.6";
    const groupATable = "Table 15.3.1";
    add("Cartoned Group A", "Palletized", 20, 30, 11.2, "Upright", "Wet", 25, 25, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 20, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 20, 30, 19.6, "Pendent", "Wet", 15, 16, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 25, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 25, 30, 19.6, "Pendent", "Wet", 15, 16, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 30, 35, 19.6, "Pendent", "Wet", 15, 25, groupATable, groupASource);
    add("Cartoned Group A", "Palletized", 35, 40, 19.6, "Pendent", "Wet", 15, 30, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 20, 30, 11.2, "Upright", "Wet", 15, 50, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 20, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 20, 30, 19.6, "Pendent", "Wet", 15, 16, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 25, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 25, 30, 19.6, "Pendent", "Wet", 15, 16, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 30, 35, 19.6, "Pendent", "Wet", 15, 25, groupATable, groupASource);
    add("Cartoned Group A", "Solid-piled", 35, 40, 19.6, "Pendent", "Wet", 15, 30, groupATable, groupASource);
    add("Exposed Nonexpanded Group A", "Palletized", 20, 30, 11.2, "Upright", "Wet", 25, 25, groupATable, groupASource);
    add("Exposed Nonexpanded Group A", "Palletized", 20, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    add("Exposed Nonexpanded Group A", "Palletized", 25, 30, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    for (const commodity of ["Cartoned Expanded Group A", "Exposed Expanded Group A"]) {
      add(commodity, "Palletized", 18, 26, 11.2, "Upright", "Wet", 15, 50, groupATable, groupASource);
      add(commodity, "Palletized", 18, 26, 16.8, "Upright", "Wet", 15, 22, groupATable, groupASource);
    }

    return rows.map((row) => {
      const headFlow = calcHeadFlow(row.kFactor, row.pressure);
      const sprinklerDemand = headFlow * row.sprinklers;
      const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(row.sprinklers);
      return {
        id: `generated-cmsa-2016-solid-${row.configuration}-${inputs.commodity}-${row.kFactor}-${row.sprinklers}-${row.pressure}-${row.system}`,
        name: `2016 CMSA ${row.configuration} ${row.orientation} K${formatNumber(row.kFactor, 1)}`,
        basis: `${row.sprinklers} ceiling sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand: 0,
        total: sprinklerDemand + hoseAllowance,
        source: row.source,
        tableTitle: row.tableTitle,
        confidence: "table-derived",
        notes: [
          `${row.configuration} configuration`,
          `${row.system} system`,
          `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
          `Hose duration ${duration} min`,
        ],
      };
    });
  }

  function buildGeneratedCmsa2025CombinedInRackCandidates(inputs) {
    if (!is2025Edition(inputs) || inputs.systemType !== "CMSA") return [];
    if (!isRackArrangement(inputs.arrangement)) return [];

    const dryLike = inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction";
    const wet = inputs.ceilingSystem === "wet";
    const rows = [];
    const add = (commodities, maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure) => {
      if (!commodities.includes(inputs.commodity)) return;
      if (inputs.storageHeight > maxStorage || inputs.ceilingHeight > maxCeiling) return;
      if (system === "Wet" && !wet) return;
      if (system === "Dry" && !dryLike) return;
      rows.push({ maxStorage, maxCeiling, kFactor, orientation, system, sprinklers, pressure });
    };

    add(["Class I", "Class II"], 30, 35, 11.2, "Upright", "Wet", 20, 25);
    add(["Class I", "Class II"], 30, 35, 11.2, "Upright", "Dry", 30, 25);
    add(["Class I", "Class II"], 30, 35, 16.8, "Upright", "Wet", 20, 15);
    add(["Class I", "Class II"], 30, 35, 16.8, "Upright", "Dry", 30, 15);

    add(["Class III"], 25, 30, 11.2, "Upright", "Wet", 15, 25);
    add(["Class III"], 25, 30, 11.2, "Upright", "Dry", 25, 25);
    add(["Class III"], 25, 30, 16.8, "Upright", "Dry", 25, 15);
    add(["Class III"], 25, 35, 11.2, "Upright", "Wet", 15, 25);
    add(["Class III"], 25, 35, 11.2, "Upright", "Dry", 25, 25);
    add(["Class III"], 25, 35, 16.8, "Upright", "Wet", 15, 15);
    add(["Class III"], 25, 35, 16.8, "Upright", "Dry", 25, 15);

    add(["Class IV"], 25, 30, 11.2, "Upright", "Wet", 15, 50);
    add(["Class IV"], 25, 35, 11.2, "Upright", "Wet", 20, 50);
    add(["Class IV"], 25, 35, 11.2, "Upright", "Wet", 15, 75);
    add(["Class IV"], 25, 35, 16.8, "Upright", "Wet", 20, 22);
    add(["Class IV"], 25, 35, 16.8, "Upright", "Wet", 15, 22);

    add(["Cartoned Group A", "Exposed Nonexpanded Group A"], 25, 30, 11.2, "Upright", "Wet", 15, 50);
    add(["Cartoned Group A", "Exposed Nonexpanded Group A"], 25, 35, 11.2, "Upright", "Wet", 30, 50);
    add(["Cartoned Group A", "Exposed Nonexpanded Group A"], 25, 35, 11.2, "Upright", "Wet", 20, 75);
    add(["Cartoned Group A", "Exposed Nonexpanded Group A"], 25, 35, 16.8, "Upright", "Wet", 30, 22);
    add(["Cartoned Group A", "Exposed Nonexpanded Group A"], 25, 35, 16.8, "Upright", "Wet", 20, 35);

    const inRack = get2025CombinedInRackFlow(inputs, "CMSA");
    if (!inRack) return [];
    const inRackDemand = inRack.operatingSprinklers * inRack.flow;
    return rows.map((row) => {
      const headFlow = calcHeadFlow(row.kFactor, row.pressure);
      const sprinklerDemand = headFlow * row.sprinklers;
      const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(row.sprinklers);
      return {
        id: `generated-2025-cmsa-combined-inrack-${inputs.commodity}-${inputs.arrangement}-k${row.kFactor}-${row.sprinklers}-${row.pressure}`,
        name: "2025 CMSA combined ceiling/in-rack option",
        basis: `${row.sprinklers} ceiling sprinklers, K${formatNumber(row.kFactor, 1)} @ ${formatNumber(row.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head + ${inRack.operatingSprinklers} in-rack sprinklers @ ${formatNumber(inRack.flow, 0)} gpm`,
        sprinklerDemand,
        hoseAllowance,
        inRackDemand,
        total: sprinklerDemand + inRackDemand + hoseAllowance,
        source: "Table 25.5.1.3 / Table 25.5.2.1 / 25.5.2.2 / 20.15.2.6",
        tableTitle: "Table 25.5.1.3 + Table 25.5.2.1",
        confidence: "table-derived",
        notes: [
          "2025 Chapter 25 combined ceiling/in-rack CMSA branch",
          `${row.system} ceiling system`,
          `${inRack.rackType}; one required IRAS level represented by the ceiling design row`,
          `In-rack design from Table 25.5.1.3: ${inRack.operatingSprinklers} IRAS @ ${formatNumber(inRack.flow, 0)} gpm`,
          "Open wood joist construction and preaction system notes must be checked where applicable",
          `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`,
          `Hose duration ${duration} min`,
        ],
      };
    });
  }

  function buildGeneratedCmsaCandidates(inputs) {
    if (inputs.systemType !== "CMSA") return [];
    if (inputs.edition === "2016") {
      const solidRows = buildGeneratedCmsa2016SolidPileCandidates(inputs);
      if (solidRows.length) return solidRows;
      return buildGeneratedCmsa2016RackCandidates(inputs);
    }
    if (!["2019", "2022", "2025"].includes(inputs.edition)) return [];

    const candidates = [];
    candidates.push(...buildGeneratedCmsa2025CombinedInRackCandidates(inputs));
    const classCommodity = ["Class I", "Class II", "Class III", "Class IV"].includes(inputs.commodity);
    const cartonedNonexpanded = inputs.commodity === "Cartoned Group A";
    const exposedNonexpanded = inputs.commodity === "Exposed Nonexpanded Group A";
    const rack = isRackArrangement(inputs.arrangement);
    const solid = inputs.arrangement === "Palletized / Solid-Piled";

    if ((classCommodity || cartonedNonexpanded) && (rack || solid) && inputs.ceilingSystem === "wet" && inputs.storageHeight > 0 && inputs.storageHeight <= 25 && inputs.ceilingHeight <= 30) {
      for (const option of [
        { kFactor: 25.2, orientation: "Upright", pressure: 20, sprinklers: 12 },
        { kFactor: 25.2, orientation: "Pendent", pressure: 15, sprinklers: 12 },
      ]) {
        const headFlow = calcHeadFlow(option.kFactor, option.pressure);
        const sprinklerDemand = headFlow * option.sprinklers;
        const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(option.sprinklers);
        candidates.push({
          id: `generated-cmsa-2019-k25.2-${option.orientation}-${inputs.commodity}-${inputs.arrangement}`,
          name: `CMSA K25.2 ${option.orientation} standard coverage`,
          basis: `${option.sprinklers} ceiling sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: uses2022StorageTables(inputs.edition) ? "24.3.2 / 24.4.1 / 20.15.2.6" : "24.3.2 / 24.4.1 / 20.12.2.6",
          tableTitle: is2025Edition(inputs) ? "Table 24.3.2" : option.orientation === "Upright" ? "Table 24.3.2(a)" : "Table 24.3.2(b)",
          confidence: "table-derived",
          notes: [
            "Wet system only",
            "Maximum storage 25 ft; maximum ceiling 30 ft",
            `Hose duration ${duration} min`,
          ],
        });
      }
    }

    if (rack && ["Class I", "Class II", "Class III"].includes(inputs.commodity) && (inputs.ceilingSystem === "dry" || inputs.ceilingSystem === "preaction")) {
      const dryRows = [
        { maxStorage: 35, maxCeiling: 40, kFactor: 25.2, orientation: "Upright", pressure: 15, sprinklers: 24 },
        { maxStorage: 40, maxCeiling: 45, kFactor: 25.2, orientation: "Upright", pressure: 50, sprinklers: 12 },
      ].filter((row) => inputs.storageHeight <= row.maxStorage && inputs.ceilingHeight <= row.maxCeiling)
        .sort((a, b) => (a.maxStorage - b.maxStorage) || (a.maxCeiling - b.maxCeiling))
        .slice(0, 1);
      for (const option of dryRows) {
        const headFlow = calcHeadFlow(option.kFactor, option.pressure);
        const sprinklerDemand = headFlow * option.sprinklers;
        const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(option.sprinklers);
        candidates.push({
          id: `generated-cmsa-2019-dry-k25.2-${inputs.commodity}-${option.sprinklers}-${option.pressure}`,
          name: "CMSA dry rack K25.2 upright",
          basis: `${option.sprinklers} ceiling sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head`,
          sprinklerDemand,
          hoseAllowance,
          inRackDemand: 0,
          total: sprinklerDemand + hoseAllowance,
          source: uses2022StorageTables(inputs.edition) ? "24.3.3 / 24.4.1 / 20.15.2.6" : "24.3.3 / 24.4.1 / 20.12.2.6",
          tableTitle: "Table 24.3.3",
          confidence: "table-derived",
          notes: [
            "Dry/preaction system",
            "High-temperature-rated standard response upright sprinklers",
            `Maximum storage ${formatNumber(option.maxStorage, 0)} ft; maximum ceiling ${formatNumber(option.maxCeiling, 0)} ft`,
            `Hose duration ${duration} min`,
          ],
        });
      }
    }

    if ((cartonedNonexpanded || exposedNonexpanded) && rack && inputs.ceilingSystem === "wet" && inputs.storageHeight <= 25 && inputs.ceilingHeight <= 35) {
      const ceilingOptions = [];
      if (inputs.ceilingHeight <= 30) {
        ceilingOptions.push({ kFactor: 11.2, orientation: "Upright", pressure: 50, sprinklers: 15 });
      }
      if (inputs.ceilingHeight <= 35) {
        ceilingOptions.push(
          { kFactor: 11.2, orientation: "Upright", pressure: 50, sprinklers: 30 },
          { kFactor: 11.2, orientation: "Upright", pressure: 75, sprinklers: 20 },
          { kFactor: 16.8, orientation: "Upright", pressure: 22, sprinklers: 30 },
          { kFactor: 16.8, orientation: "Upright", pressure: 35, sprinklers: 20 },
        );
      }
      for (const option of ceilingOptions) {
        const headFlow = calcHeadFlow(option.kFactor, option.pressure);
        const sprinklerDemand = headFlow * option.sprinklers;
        const { hoseAllowance, duration } = getHoseAllowanceForSprinklerCount(option.sprinklers);
        for (const inRack of getGroupAInRackDesignOptions()) {
          const inRackHeadFlow = calcHeadFlow(inRack.kFactor, inRack.pressure);
          candidates.push({
            id: `generated-cmsa-2019-group-a-inrack-k${option.kFactor}-${option.sprinklers}-ir${inRack.kFactor}`,
            name: "CMSA Group A rack with in-rack sprinklers",
            basis: `${option.sprinklers} ceiling sprinklers, K${formatNumber(option.kFactor, 1)} @ ${formatNumber(option.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head + ${inRack.operatingSprinklers} in-rack sprinklers, K${formatNumber(inRack.kFactor, 1)} @ ${formatNumber(inRack.pressure, 0)} psi = ${formatNumber(inRackHeadFlow)} gpm/head`,
            sprinklerDemand,
            hoseAllowance,
            inRackDemand: inRack.demand,
            total: sprinklerDemand + inRack.demand + hoseAllowance,
            source: is2025Edition(inputs) ? "25.5.2.1 / Chapter 25 / 20.15.2.6" : inputs.edition === "2022" ? "25.3.4.3.1 / 25.12.2.1 / 25.12.3.1 / 20.15.2.6" : "25.2.4.3.1 / 25.12.2.1 / 25.12.3.1 / 20.12.2.6",
            tableTitle: is2025Edition(inputs) ? "Table 25.5.2.1" : inputs.edition === "2022" ? "Table 25.3.4.3.1" : "Table 25.2.4.3.1",
            confidence: "table-derived",
            notes: [
              "One level of in-rack sprinklers required",
              "Wet system only",
              `Hose duration ${duration} min`,
            ],
          });
        }
      }
    }
    return candidates;
  }

  function getSpecialStorageSources(inputs) {
    const byEdition = {
      "2016": {
        hose: "12.8.6",
        idleCmda: "Table 12.12.1.2(a)",
        idleCmsa: "Table 12.12.1.2(b)",
        idleEsfr: "Table 12.12.1.2(c)",
        idlePlasticEsfr: "Table 12.12.2.2.3",
        tireCmda: "Table 18.4(a) / Table 18.4(b)",
        tireCmsa: "Table 18.4(c)",
        tireEsfr: "Table 18.4(d)",
        rollCmda: "Table 19.1.2.1.3(a)",
        rollCmsa: "Table 19.1.2.2",
        rollEsfr: "Table 19.1.2.3",
      },
      "2019": {
        hose: "20.12.2.6",
        idleCmda: "Table 20.14.1.2(a)",
        idleCmsa: "Table 20.14.1.2(b)",
        idleEsfr: "Table 20.14.1.2(c)",
        idlePlasticEsfr: "Table 20.14.2.2.3",
        tireCmda: "Table 21.10.1",
        tireCmsa: "Table 22.6",
        tireEsfr: "Table 23.8",
        rollCmda: "Table 21.11.6.2",
        rollCmsa: "Table 22.7",
        rollEsfr: "Table 23.10",
      },
      "2022": {
        hose: "20.15.2.6",
        idleCmda: "Table 20.17.1.2(a)",
        idleCmsa: "Table 20.17.1.2(b)",
        idleEsfr: "Table 20.17.1.2(c)",
        idlePlasticEsfr: "Table 20.17.2.2.3",
        tireCmda: "Table 21.7.1(a) / Table 21.7.1(b)",
        tireCmsa: "Table 22.6",
        tireEsfr: "Table 23.5",
        rollCmda: "Table 21.8.3(a)",
        rollCmsa: "Table 22.7",
        rollEsfr: "Table 23.6",
      },
      "2025": {
        hose: "20.15.2.6",
        idleCmda: "Table 20.17.1.2(a)",
        idleCmsa: "Table 20.17.1.2(b)",
        idleEsfr: "Table 20.17.1.2(c)",
        idlePlasticEsfr: "Table 20.17.2.2.3",
        tireCmda: "Table 21.7.1(a) / Table 21.7.1(b)",
        tireCmsa: "Table 22.6",
        tireEsfr: "Table 23.5",
        rollCmda: "Table 21.8.3(a)",
        rollCmsa: "Table 22.7",
        rollEsfr: "Table 23.6",
      },
    };
    return byEdition[inputs.edition] || byEdition["2019"];
  }

  function getSpecialHose(inputs, family, systemType, size) {
    if (family === "rubber-tires") {
      if (systemType === "CMDA") {
        return inputs.storageHeight <= 5 ? { hoseAllowance: 250, duration: 120 } : { hoseAllowance: 750, duration: 180 };
      }
      if (systemType === "CMSA") return { hoseAllowance: 500, duration: 180 };
      if (systemType === "ESFR") return size <= 12 ? { hoseAllowance: 250, duration: 60 } : { hoseAllowance: 500, duration: 120 };
    }
    if (family === "roll-paper") {
      if (systemType === "ESFR") return { hoseAllowance: 250, duration: 60 };
      return { hoseAllowance: 500, duration: 120 };
    }
    if (family === "idle-pallets" && systemType === "CMDA") return getHoseAllowanceForCmdaArea(size);
    return getHoseAllowanceForSprinklerCount(size);
  }

  function buildSpecialDensityCandidate(inputs, options) {
    const sprinklerDemand = options.density * options.area;
    const { hoseAllowance, duration } = getSpecialHose(inputs, options.family, "CMDA", options.area);
    return {
      id: `generated-${inputs.edition}-special-density-${options.family}-${options.id}`,
      name: options.name,
      basis: `${formatNumber(options.density, 3)} gpm/ft2 over ${formatNumber(options.area, 0)} ft2`,
      sprinklerDemand,
      hoseAllowance,
      inRackDemand: 0,
      total: sprinklerDemand + hoseAllowance,
      source: `${options.source} / ${getSpecialStorageSources(inputs).hose}`,
      tableTitle: options.tableTitle,
      confidence: "table-derived",
      notes: [...options.notes, `Hose duration ${duration} min`].filter(Boolean),
    };
  }

  function buildSpecialPressureCandidate(inputs, options) {
    const headFlow = calcHeadFlow(options.kFactor, options.pressure);
    const sprinklerDemand = headFlow * options.sprinklers;
    const inRackDemand = options.inRackDemand || 0;
    const { hoseAllowance, duration } = getSpecialHose(inputs, options.family, options.systemType, options.sprinklers);
    return {
      id: `generated-${inputs.edition}-special-pressure-${options.family}-${options.id}`,
      name: options.name,
      basis: `${options.sprinklers} ${options.inRackOnly ? "in-rack" : "ceiling"} sprinklers, K${formatNumber(options.kFactor, 1)} @ ${formatNumber(options.pressure, 0)} psi = ${formatNumber(headFlow)} gpm/head${inRackDemand ? ` + ${formatNumber(inRackDemand, 0)} gpm in-rack demand` : ""}`,
      sprinklerDemand: options.inRackOnly ? 0 : sprinklerDemand,
      hoseAllowance,
      inRackDemand: options.inRackOnly ? sprinklerDemand : inRackDemand,
      total: sprinklerDemand + inRackDemand + hoseAllowance,
      source: `${options.source} / ${getSpecialStorageSources(inputs).hose}`,
      tableTitle: options.tableTitle,
      confidence: options.inRackDemand || options.inRackOnly ? "table-derived in-rack-required" : "table-derived",
      notes: [...options.notes, options.orientation || "", `Hose duration ${duration} min`].filter(Boolean),
    };
  }

  function buildGeneratedIdlePalletCandidates(inputs) {
    if (inputs.commodity !== "Idle Pallets") return [];
    const sources = getSpecialStorageSources(inputs);
    const candidates = [];
    if (inputs.systemType === "CMDA") {
      const rows = [
        { id: "wood-floor-6", maxStorage: 6, maxCeiling: 20, density: 0.2, area: 3000, note: "Indoor idle wood pallets on floor; K8.0 or larger" },
        { id: "wood-floor-8", maxStorage: 8, maxCeiling: 30, density: 0.45, area: 2500, note: "Indoor idle wood pallets on floor; K11.2 or larger" },
        { id: "wood-floor-rack-12", maxStorage: 12, maxCeiling: 30, density: 0.6, area: 3500, note: "Indoor idle wood pallets on floor or rack without solid shelves; K11.2 or larger" },
        { id: "wood-floor-rack-20", maxStorage: 20, maxCeiling: 30, density: 0.6, area: 4500, note: "Indoor idle wood pallets on floor or rack without solid shelves; K11.2 or larger" },
        { id: "wood-floor-k16-20", maxStorage: 20, maxCeiling: 30, density: 0.6, area: 2000, note: "Indoor idle wood pallets on floor; K16.8 or larger" },
      ];
      for (const row of rows) {
        if (inputs.storageHeight > row.maxStorage || inputs.ceilingHeight > row.maxCeiling) continue;
        if (isRackArrangement(inputs.arrangement) && !row.id.includes("rack")) continue;
        candidates.push(buildSpecialDensityCandidate(inputs, {
          family: "idle-pallets",
          id: row.id,
          name: `CMDA idle wood pallets ${row.id.includes("rack") ? "floor/rack" : "floor"} option`,
          density: row.density,
          area: row.area,
          source: sources.idleCmda,
          tableTitle: sources.idleCmda,
          notes: [row.note, `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`],
        }));
      }
    }
    if (inputs.systemType === "CMSA" && inputs.storageHeight <= 20 && inputs.ceilingHeight <= 30) {
      const dryLike = isDryLikeSystem(inputs);
      const rows = [
        { kFactor: 11.2, pressure: 25, sprinklers: dryLike ? 25 : 15, system: dryLike ? "Dry/preaction" : "Wet", orientation: "Upright" },
        { kFactor: 16.8, pressure: dryLike ? 15 : 15, sprinklers: dryLike ? 25 : 15, system: dryLike ? "Dry/preaction" : "Wet", orientation: "Upright" },
        { kFactor: 19.6, pressure: 16, sprinklers: 15, system: "Wet", orientation: "Pendent", wetOnly: true },
      ];
      for (const row of rows) {
        if (row.wetOnly && dryLike) continue;
        candidates.push(buildSpecialPressureCandidate(inputs, {
          family: "idle-pallets",
          systemType: "CMSA",
          id: `idle-cmsa-k${row.kFactor}-${row.sprinklers}-${row.pressure}`,
          name: `CMSA idle wood pallets K${formatNumber(row.kFactor, 1)}`,
          kFactor: row.kFactor,
          pressure: row.pressure,
          sprinklers: row.sprinklers,
          orientation: row.orientation,
          source: sources.idleCmsa,
          tableTitle: sources.idleCmsa,
          notes: [row.system, "Indoor idle wood pallets", "Maximum storage 20 ft; maximum ceiling 30 ft"],
        }));
      }
    }
    if (inputs.systemType === "ESFR" && inputs.ceilingSystem === "wet") {
      const woodRows = [
        { kFactor: 14, pressure: 50, maxStorage: 25, maxCeiling: 30, orientation: "Pendent" },
        { kFactor: 14, pressure: 60, maxStorage: 25, maxCeiling: 32, orientation: "Pendent" },
        { kFactor: 16.8, pressure: 35, maxStorage: 25, maxCeiling: 30, orientation: "Pendent" },
        { kFactor: 16.8, pressure: 42, maxStorage: 25, maxCeiling: 32, orientation: "Pendent" },
        { kFactor: 16.8, pressure: 52, maxStorage: 35, maxCeiling: 40, orientation: "Pendent" },
        { kFactor: 22.4, pressure: 25, maxStorage: 25, maxCeiling: 30, orientation: "Pendent" },
        { kFactor: 22.4, pressure: 35, maxStorage: 30, maxCeiling: 35, orientation: "Pendent" },
        { kFactor: 22.4, pressure: 40, maxStorage: 35, maxCeiling: 40, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 15, maxStorage: 25, maxCeiling: 30, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 20, maxStorage: 30, maxCeiling: 35, orientation: "Pendent" },
        { kFactor: 25.2, pressure: 25, maxStorage: 35, maxCeiling: 40, orientation: "Pendent" },
        { kFactor: 14, pressure: 50, maxStorage: 20, maxCeiling: 30, orientation: "Upright" },
        { kFactor: 14, pressure: 75, maxStorage: 20, maxCeiling: 35, orientation: "Upright" },
        { kFactor: 16.8, pressure: 35, maxStorage: 20, maxCeiling: 30, orientation: "Upright" },
        { kFactor: 16.8, pressure: 52, maxStorage: 20, maxCeiling: 35, orientation: "Upright" },
      ];
      for (const row of woodRows) {
        if (inputs.storageHeight > row.maxStorage || inputs.ceilingHeight > row.maxCeiling) continue;
        candidates.push(buildSpecialPressureCandidate(inputs, {
          family: "idle-pallets",
          systemType: "ESFR",
          id: `idle-esfr-wood-k${row.kFactor}-${row.maxStorage}-${row.maxCeiling}`,
          name: `ESFR idle wood pallets K${formatNumber(row.kFactor, 1)}`,
          kFactor: row.kFactor,
          pressure: row.pressure,
          sprinklers: 12,
          orientation: row.orientation,
          source: sources.idleEsfr,
          tableTitle: sources.idleEsfr,
          notes: ["Indoor idle wood pallets", `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft`],
        }));
      }
      const plasticRows = inputs.ceilingHeight <= 30
        ? [{ kFactor: 14, pressure: 50 }, { kFactor: 16.8, pressure: 35 }, { kFactor: 22.4, pressure: 35 }, { kFactor: 25.2, pressure: 35 }]
        : inputs.ceilingHeight <= 40
          ? [{ kFactor: 14, pressure: 75 }, { kFactor: 16.8, pressure: 60 }]
          : [];
      for (const row of plasticRows) {
        candidates.push(buildSpecialPressureCandidate(inputs, {
          family: "idle-pallets",
          systemType: "ESFR",
          id: `idle-esfr-plastic-k${row.kFactor}-${row.pressure}`,
          name: `ESFR idle plastic pallets K${formatNumber(row.kFactor, 1)}`,
          kFactor: row.kFactor,
          pressure: row.pressure,
          sprinklers: 12,
          orientation: "Pendent",
          source: sources.idlePlasticEsfr,
          tableTitle: sources.idlePlasticEsfr,
          notes: ["Indoor idle plastic pallets on floor or open-frame racks", "Plastic pallet equivalency/test data should be verified where available"],
        }));
      }
    }
    return candidates;
  }

  function buildGeneratedRubberTireCandidates(inputs) {
    if (inputs.commodity !== "Rubber Tires") return [];
    const sources = getSpecialStorageSources(inputs);
    const candidates = [];
    if (inputs.systemType === "CMDA") {
      if (inputs.storageHeight <= 5) {
        for (const row of [
          { id: "onfloor-ordinary", density: 0.19, area: 2000, temp: "Ordinary-temperature" },
          { id: "onfloor-high", density: 0.19, area: 2000, temp: "High-temperature" },
        ]) {
          candidates.push(buildSpecialDensityCandidate(inputs, {
            family: "rubber-tires",
            id: row.id,
            name: `CMDA rubber tires on-floor ${row.temp}`,
            density: row.density,
            area: row.area,
            source: sources.tireCmda,
            tableTitle: sources.tireCmda,
            notes: [row.temp, "On-floor rubber tire storage up to 5 ft", "Tire hose duration 120 min for on-floor storage up to 5 ft"],
          }));
        }
      }
      if (isRackArrangement(inputs.arrangement) || inputs.arrangement === "Palletized / Solid-Piled") {
        const band = [
          { min: 5, max: 10, high: [0.32, 2000], ordinary: [0.32, 2000] },
          { min: 10, max: 12, high: [0.39, 2000], ordinary: [0.39, 2600] },
          { min: 12, max: 14, high: [0.45, 2000], ordinary: [0.45, 3200] },
          { min: 14, max: 16, high: [0.5, 2300], ordinary: [0.5, 3700] },
          { min: 16, max: 18, high: [0.55, 2600], ordinary: [0.55, 4400] },
          { min: 18, max: 20, high: [0.6, 3000], ordinary: [0.6, 5000] },
        ].find((row) => inputs.storageHeight > row.min && inputs.storageHeight <= row.max);
        if (band) {
          for (const temperatureKey of ["high", "ordinary"]) {
            const [density, area] = band[temperatureKey];
            candidates.push(buildSpecialDensityCandidate(inputs, {
              family: "rubber-tires",
              id: `rack-${temperatureKey}-${band.max}`,
              name: `CMDA rubber tires rack ${temperatureKey}`,
              density,
              area,
              source: sources.tireCmda,
              tableTitle: sources.tireCmda,
              notes: [`${temperatureKey === "high" ? "High" : "Ordinary"}-temperature sprinklers`, "Palletized portable rack or fixed rack storage of rubber tires with pallets", `Storage band over ${band.min} ft to ${band.max} ft`, "Tire hose allowance 750 gpm for 180 min"],
            }));
          }
        }
      }
    }
    if (inputs.systemType === "CMSA" && inputs.ceilingSystem === "wet" && inputs.storageHeight <= 25 && inputs.ceilingHeight <= 32) {
      for (const row of [{ kFactor: 11.2, pressure: 75 }, { kFactor: 16.8, pressure: 35 }]) {
        candidates.push(buildSpecialPressureCandidate(inputs, {
          family: "rubber-tires",
          systemType: "CMSA",
          id: `tire-cmsa-k${row.kFactor}`,
          name: `CMSA rubber tires K${formatNumber(row.kFactor, 1)}`,
          kFactor: row.kFactor,
          pressure: row.pressure,
          sprinklers: 15,
          orientation: "Standard coverage",
          source: sources.tireCmsa,
          tableTitle: sources.tireCmsa,
          notes: ["Wet system only", "On-side or on-tread rubber tire storage in palletized portable racks, open portable racks, or fixed racks without solid shelves", "Maximum storage 25 ft; maximum ceiling 32 ft"],
        }));
      }
    }
    if (inputs.systemType === "ESFR" && inputs.ceilingSystem === "wet") {
      const rows = [
        { maxStorage: 25, maxCeiling: 30, kFactor: 14, pressure: 50, sprinklers: 12, orientation: "Upright/pendent", note: "On-side or on-tread in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 30, kFactor: 16.8, pressure: 35, sprinklers: 12, orientation: "Upright/pendent", note: "On-side or on-tread in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 30, kFactor: 22.4, pressure: 25, sprinklers: 12, orientation: "Pendent", note: "On-side or on-tread in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 30, kFactor: 25.2, pressure: 15, sprinklers: 12, orientation: "Pendent", note: "On-side or on-tread in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 35, kFactor: 14, pressure: 75, sprinklers: 12, orientation: "Upright/pendent", note: "On-side in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 35, kFactor: 16.8, pressure: 52, sprinklers: 12, orientation: "Pendent", note: "On-side in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 35, kFactor: 22.4, pressure: 35, sprinklers: 12, orientation: "Pendent", note: "On-side in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 35, kFactor: 25.2, pressure: 25, sprinklers: 12, orientation: "Pendent", note: "On-side in palletized/open/fixed racks without solid shelves" },
        { maxStorage: 25, maxCeiling: 30, kFactor: 14, pressure: 75, sprinklers: 20, orientation: "Pendent", note: "On-tread, on-side, and laced tires in open portable steel racks or palletized portable racks; control design; 1600 ft2 minimum operating area" },
        { maxStorage: 25, maxCeiling: 30, kFactor: 16.8, pressure: 52, sprinklers: 20, orientation: "Pendent", note: "On-tread, on-side, and laced tires in open portable steel racks or palletized portable racks; control design; 1600 ft2 minimum operating area" },
        { maxStorage: 25, maxCeiling: 40, kFactor: 16.8, pressure: 52, sprinklers: 12, orientation: "Pendent", note: "On-side in palletized portable racks" },
        { maxStorage: 25, maxCeiling: 40, kFactor: 25.2, pressure: 40, sprinklers: 12, orientation: "Pendent", note: "On-tread or laced in open portable steel racks" },
        { maxStorage: 30, maxCeiling: 40, kFactor: 25.2, pressure: 75, sprinklers: 12, orientation: "Pendent", note: "On-tread, on-side, and laced tires in open portable steel racks or palletized portable racks" },
      ];
      for (const row of rows) {
        if (inputs.storageHeight > row.maxStorage || inputs.ceilingHeight > row.maxCeiling) continue;
        candidates.push(buildSpecialPressureCandidate(inputs, {
          family: "rubber-tires",
          systemType: "ESFR",
          id: `tire-esfr-k${row.kFactor}-${row.pressure}-${row.sprinklers}-${row.maxCeiling}`,
          name: `ESFR rubber tires K${formatNumber(row.kFactor, 1)}`,
          kFactor: row.kFactor,
          pressure: row.pressure,
          sprinklers: row.sprinklers,
          orientation: row.orientation,
          source: sources.tireEsfr,
          tableTitle: sources.tireEsfr,
          notes: [row.note, `Maximum pile ${formatNumber(row.maxStorage, 0)} ft; maximum building ${formatNumber(row.maxCeiling, 0)} ft`],
        }));
      }
    }
    return candidates;
  }

  const ROLL_PAPER_CMDA_LABELS = [
    "Heavyweight closed array",
    "Heavyweight standard array banded",
    "Heavyweight standard array unbanded",
    "Heavyweight open array banded",
    "Heavyweight open array unbanded",
    "Mediumweight closed array",
    "Mediumweight standard array banded",
    "Mediumweight standard array unbanded",
    "Mediumweight open array",
    "Tissue all arrays",
  ];

  const ROLL_PAPER_CMDA_ROWS = [
    { maxStorage: 10, clearance: "lte5", values: ["0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.45/2000"] },
    { maxStorage: 10, clearance: "gt5", values: ["0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.3/2000", "0.45/2500"] },
    { maxStorage: 15, clearance: "lte5", values: ["0.3/2000", "0.3/2000", "0.3/2000", "0.3/2500", "0.3/3000", "0.3/2000", "0.3/2000", "0.45/2500", "0.45/2500", "0.60/2000"] },
    { maxStorage: 15, clearance: "gt5", values: ["0.3/2000", "0.3/2000", "0.3/2000", "0.3/3000", "0.3/3500", "0.3/2000", "0.3/2500", "0.45/3000", "0.45/3000", "0.60/3000"] },
    { maxStorage: 20, clearance: "lte5", values: ["0.3/2000", "0.3/2000", "0.3/2500", "0.45/3000", "0.45/3500", "0.3/2000", "0.45/2500", "0.6/2500", "0.6/2500", "0.75/2500"] },
    { maxStorage: 20, clearance: "gt5", values: ["0.3/2000", "0.3/2500", "0.3/3000", "0.45/3500", "0.45/4000", "0.3/2500", "0.45/3000", "0.6/3000", "0.6/3000", "0.75/3000"] },
    { maxStorage: 25, clearance: "lte5", values: ["0.45/2500", "0.45/3000", "0.45/3500", "0.6/2500", "0.6/3000", "0.45/3000", "0.6/3000", "0.75/2500", "0.75/2500", "na"] },
  ];

  function parseDensityAreaPair(pair) {
    if (!pair || pair === "na") return null;
    const [density, area] = pair.split("/").map(Number);
    return Number.isFinite(density) && Number.isFinite(area) ? { density, area } : null;
  }

  function buildGeneratedRollPaperCandidates(inputs) {
    if (inputs.commodity !== "Roll Paper") return [];
    const sources = getSpecialStorageSources(inputs);
    const candidates = [];
    if (inputs.systemType === "CMDA" && inputs.ceilingHeight <= 30 && inputs.storageHeight <= 25) {
      const clearance = inputs.ceilingHeight - inputs.storageHeight <= 5 ? "lte5" : "gt5";
      const row = ROLL_PAPER_CMDA_ROWS.find((candidate) => candidate.maxStorage >= inputs.storageHeight && candidate.clearance === clearance);
      if (row) {
        row.values.forEach((value, index) => {
          const parsed = parseDensityAreaPair(value);
          if (!parsed) return;
          candidates.push(buildSpecialDensityCandidate(inputs, {
            family: "roll-paper",
            id: `roll-cmda-${row.maxStorage}-${row.clearance}-${index}`,
            name: `CMDA roll paper ${ROLL_PAPER_CMDA_LABELS[index]}`,
            density: parsed.density,
            area: parsed.area,
            source: sources.rollCmda,
            tableTitle: sources.rollCmda,
            notes: [
              `Roof/ceiling up to 30 ft; storage band up to ${formatNumber(row.maxStorage, 0)} ft`,
              clearance === "lte5" ? "Ceiling clearance up to 5 ft" : "Ceiling clearance over 5 ft",
              row.maxStorage > inputs.storageHeight ? "Next higher 5 ft storage band selected; table interpolation is not performed by this tool" : "",
              "Roll paper hose allowance 500 gpm for 120 min",
            ],
          }));
        });
      }
    }
    if (inputs.systemType === "CMSA") {
      const dryLike = isDryLikeSystem(inputs);
      const labels20 = [0, 1, 2, 3, 5, 6, 7];
      const labels26 = [0, 1, 2, 3];
      const rows = [];
      if (inputs.storageHeight <= 20 && inputs.ceilingHeight <= 30) {
        rows.push({ maxStorage: 20, maxCeiling: 30, kFactor: 11.2, pressure: 50, sprinklers: dryLike ? 25 : 15, system: dryLike ? "Dry/preaction" : "Wet", labels: dryLike ? [0, 1, 2, 5, 6, 7] : labels20 });
        rows.push({ maxStorage: 20, maxCeiling: 30, kFactor: 16.8, pressure: 22, sprinklers: dryLike ? 25 : 15, system: dryLike ? "Dry/preaction" : "Wet", labels: dryLike ? [0, 1, 2, 5, 6, 7] : labels20 });
      }
      if (!dryLike && inputs.storageHeight <= 26 && inputs.ceilingHeight <= 60) {
        rows.push({ maxStorage: 26, maxCeiling: 60, kFactor: 11.2, pressure: 50, sprinklers: 15, system: "Wet", labels: labels26 });
        rows.push({ maxStorage: 26, maxCeiling: 60, kFactor: 16.8, pressure: 22, sprinklers: 15, system: "Wet", labels: labels26 });
      }
      for (const row of rows) {
        for (const labelIndex of row.labels) {
          candidates.push(buildSpecialPressureCandidate(inputs, {
            family: "roll-paper",
            systemType: "CMSA",
            id: `roll-cmsa-${row.maxStorage}-k${row.kFactor}-${row.sprinklers}-${labelIndex}`,
            name: `CMSA roll paper ${ROLL_PAPER_CMDA_LABELS[labelIndex]}`,
            kFactor: row.kFactor,
            pressure: row.pressure,
            sprinklers: row.sprinklers,
            orientation: "Standard coverage",
            source: sources.rollCmsa,
            tableTitle: sources.rollCmsa,
            notes: [row.system, `Maximum storage ${formatNumber(row.maxStorage, 0)} ft; maximum building ${formatNumber(row.maxCeiling, 0)} ft`, "Roll paper hose allowance 500 gpm for 120 min"],
          }));
        }
      }
    }
    if (inputs.systemType === "ESFR" && inputs.ceilingSystem === "wet") {
      const rows = [
        { maxCeiling: 30, allowedStorage: { 0: 25, 1: 25, 2: 25, 5: 25 }, options: [{ kFactor: 14, pressure: 50, orientation: "Upright/pendent" }, { kFactor: 16.8, pressure: 35, orientation: "Upright/pendent" }, { kFactor: 22.4, pressure: 25, orientation: "Pendent" }, { kFactor: 25.2, pressure: 15, orientation: "Pendent" }] },
        { maxCeiling: 35, allowedStorage: { 0: 30, 1: 30, 2: 30 }, options: [{ kFactor: 14, pressure: 75, orientation: "Upright/pendent" }, { kFactor: 16.8, pressure: 52, orientation: "Upright/pendent" }] },
        { maxCeiling: 40, allowedStorage: { 0: 30, 1: 30, 2: 30 }, options: [{ kFactor: 16.8, pressure: 52, orientation: "Pendent" }, { kFactor: 22.4, pressure: 40, orientation: "Pendent" }, { kFactor: 25.2, pressure: 25, orientation: "Pendent" }] },
        { maxCeiling: 45, allowedStorage: { 0: 30, 1: 30, 2: 30 }, options: [{ kFactor: 22.4, pressure: 50, orientation: "Pendent" }, { kFactor: 25.2, pressure: 50, orientation: "Pendent" }] },
      ].filter((row) => inputs.ceilingHeight <= row.maxCeiling);
      for (const row of rows) {
        for (const [labelIndex, maxStorage] of Object.entries(row.allowedStorage)) {
          if (inputs.storageHeight > maxStorage) continue;
          for (const option of row.options) {
            candidates.push(buildSpecialPressureCandidate(inputs, {
              family: "roll-paper",
              systemType: "ESFR",
              id: `roll-esfr-${row.maxCeiling}-${labelIndex}-k${option.kFactor}-${option.pressure}`,
              name: `ESFR roll paper ${ROLL_PAPER_CMDA_LABELS[Number(labelIndex)]}`,
              kFactor: option.kFactor,
              pressure: option.pressure,
              sprinklers: 12,
              orientation: option.orientation,
              source: sources.rollEsfr,
              tableTitle: sources.rollEsfr,
              notes: [`Maximum storage ${formatNumber(maxStorage, 0)} ft; maximum building ${formatNumber(row.maxCeiling, 0)} ft`, "Wet ESFR system only"],
            }));
          }
        }
      }
    }
    return candidates;
  }

  const OCCUPANCY_HAZARD_DENSITY_AREA = {
    LH: [
      { id: "lh-1500", density: 0.1, area: 1500, label: "Light hazard" },
      { id: "lh-3000", density: 0.07, area: 3000, label: "Light hazard" },
    ],
    OH1: [
      { id: "oh1-1500", density: 0.15, area: 1500, label: "Ordinary Hazard Group 1" },
      { id: "oh1-3000", density: 0.12, area: 3000, label: "Ordinary Hazard Group 1" },
    ],
    OH2: [
      { id: "oh2-1500", density: 0.2, area: 1500, label: "Ordinary Hazard Group 2" },
      { id: "oh2-3000", density: 0.17, area: 3000, label: "Ordinary Hazard Group 2" },
    ],
    EH1: [
      { id: "eh1-2500", density: 0.3, area: 2500, label: "Extra Hazard Group 1" },
      { id: "eh1-3000", density: 0.28, area: 3000, label: "Extra Hazard Group 1" },
    ],
    EH2: [
      { id: "eh2-2500", density: 0.4, area: 2500, label: "Extra Hazard Group 2" },
      { id: "eh2-3000", density: 0.38, area: 3000, label: "Extra Hazard Group 2" },
    ],
  };

  const MISC_STORAGE_TABLE_ROWS = [
    { id: "class-i-oh1", storedCommodity: "Class I", arrangementGroup: "all", maxStorage: 12, hazard: "OH1", hoseAllowance: 250, duration: 90 },
    { id: "class-ii-oh1", storedCommodity: "Class II", arrangementGroup: "all", maxStorage: 10, hazard: "OH1", hoseAllowance: 250, duration: 90 },
    { id: "class-ii-oh2", storedCommodity: "Class II", arrangementGroup: "all", minStorage: 10, maxStorage: 12, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "class-iii-oh2", storedCommodity: "Class III", arrangementGroup: "all", maxStorage: 12, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "class-iv-oh2-low", storedCommodity: "Class IV", arrangementGroup: "all", maxStorage: 10, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "class-iv-oh2-floor", storedCommodity: "Class IV", arrangementGroup: "floor-shelf", minStorage: 10, maxStorage: 12, maxCeiling: 32, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "class-iv-eh1-rack", storedCommodity: "Class IV", arrangementGroup: "rack-back-to-back", minStorage: 10, maxStorage: 12, maxCeiling: 32, hazard: "EH1", hoseAllowance: 500, duration: 120 },
    { id: "class-iv-inrack-rack", storedCommodity: "Class IV", arrangementGroup: "rack", minStorage: 10, maxStorage: 12, maxCeiling: 32, inRack: true, hoseAllowance: 250, duration: 90 },
    { id: "cartoned-group-a-oh2", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "all", maxStorage: 5, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "cartoned-group-a-eh1-15", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "all", minStorage: 5, maxStorage: 10, maxCeiling: 15, hazard: "EH1", hoseAllowance: 500, duration: 120 },
    { id: "cartoned-group-a-eh2-20", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "all", minStorage: 5, maxStorage: 10, maxCeiling: 20, hazard: "EH2", hoseAllowance: 500, duration: 120 },
    { id: "cartoned-group-a-eh2-17", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "all", minStorage: 10, maxStorage: 12, maxCeiling: 17, hazard: "EH2", hoseAllowance: 500, duration: 120 },
    { id: "cartoned-group-a-eh2-floor", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "floor-shelf", minStorage: 10, maxStorage: 12, maxCeiling: 32, hazard: "EH2", hoseAllowance: 500, duration: 120 },
    { id: "cartoned-group-a-inrack-rack", storedCommodity: "Cartoned Group A plastic", arrangementGroup: "rack", minStorage: 10, maxStorage: 12, maxCeiling: 32, inRack: true, hoseAllowance: 250, duration: 90 },
    { id: "exposed-group-a-oh2", storedCommodity: "Exposed Group A plastic", arrangementGroup: "all", maxStorage: 5, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "exposed-nonexpanded-eh2-floor", storedCommodity: "Exposed nonexpanded Group A plastic", arrangementGroup: "floor-shelf", minStorage: 5, maxStorage: 8, maxCeiling: 28, hazard: "EH2", hoseAllowance: 500, duration: 120 },
    { id: "exposed-expanded-inrack-rack-low", storedCommodity: "Exposed expanded Group A plastic", arrangementGroup: "rack", minStorage: 5, maxStorage: 10, maxCeiling: 20, inRack: true, hoseAllowance: 250, duration: 90 },
    { id: "exposed-group-a-eh2-17", storedCommodity: "Exposed Group A plastic", arrangementGroup: "all", minStorage: 10, maxStorage: 12, maxCeiling: 17, hazard: "EH2", hoseAllowance: 500, duration: 120 },
    { id: "exposed-group-a-inrack-rack", storedCommodity: "Exposed Group A plastic", arrangementGroup: "rack", minStorage: 10, maxStorage: 12, maxCeiling: 32, inRack: true, hoseAllowance: 250, duration: 90 },
    { id: "tires-floor-low-oh2", storedCommodity: "Tires on floor/on tread/on side", arrangementGroup: "floor", maxStorage: 5, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "tires-floor-eh1", storedCommodity: "Tires on floor/on side", arrangementGroup: "floor", minStorage: 5, maxStorage: 12, maxCeiling: 32, hazard: "EH1", hoseAllowance: 500, duration: 120 },
    { id: "tires-rack-low-oh2", storedCommodity: "Tires in rack on tread/on side", arrangementGroup: "rack", maxStorage: 5, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "tires-single-rack-eh1", storedCommodity: "Tires in single-row rack on tread/on side", arrangementGroup: "single-rack", minStorage: 5, maxStorage: 12, maxCeiling: 32, hazard: "EH1", hoseAllowance: 500, duration: 120 },
    { id: "tires-single-rack-inrack", storedCommodity: "Tires in single-row rack on tread/on side", arrangementGroup: "single-rack", minStorage: 5, maxStorage: 12, maxCeiling: 32, inRack: true, hoseAllowance: 250, duration: 90 },
    { id: "roll-paper-heavy-medium", storedCommodity: "Heavyweight and mediumweight roll paper on end", arrangementGroup: "floor", maxStorage: 10, maxCeiling: 30, hazard: "OH2", hoseAllowance: 250, duration: 90 },
    { id: "roll-paper-tissue-light", storedCommodity: "Tissue and lightweight roll paper on end", arrangementGroup: "floor", maxStorage: 10, maxCeiling: 30, hazard: "EH1", hoseAllowance: 250, duration: 120 },
  ];

  function getMiscStorageSources(inputs) {
    if (inputs.edition === "2016") {
      return {
        tableTitle: "Table 13.2.1",
        densityAreaSource: "Figure 13.2.1",
        source: "Chapter 13 / Table 13.2.1 / Figure 13.2.1",
        inRackSource: "13.3 / Chapter 16 or 17 in-rack criteria",
      };
    }
    if (inputs.edition === "2022") {
      return {
        tableTitle: "Table 4.3.1.7.1.1",
        densityAreaSource: "Table 19.2.3.1.1",
        source: "4.3.1.7.1.1 / 19.2.3.1.1 / 19.2.3.1.2",
        inRackSource: "4.3.1.7.1.2 / 25.2.1",
      };
    }
    if (inputs.edition === "2025") {
      return {
        tableTitle: "Table 4.3.1.7.1",
        densityAreaSource: "Table 19.2.3.1.1",
        source: "4.3.1.7.1 / 19.2.3.1.1 / 19.2.3.1.2",
        inRackSource: "4.3.1.7.2 / 25.2.1",
      };
    }
    return {
      tableTitle: "Table 4.3.1.7.1",
      densityAreaSource: "Figure 19.3.3.1.1",
      source: "4.3.1.7.1 / Figure 19.3.3.1.1 / 19.3.3.2",
      inRackSource: "4.3.1.7.1 / Chapter 25",
    };
  }

  function miscArrangementMatches(group, arrangement) {
    if (group === "all") return true;
    if (group === "floor-shelf") {
      return ["Palletized / Solid-Piled", "Shelf", "Back-to-Back Shelf", "Solid Shelf Rack"].includes(arrangement);
    }
    if (group === "floor") return arrangement === "Palletized / Solid-Piled";
    if (group === "single-rack") return arrangement === "Single-Row Rack";
    if (group === "rack") return isRackArrangement(arrangement);
    if (group === "rack-back-to-back") return isRackArrangement(arrangement) || arrangement === "Back-to-Back Shelf";
    return false;
  }

  function miscStorageRowMatches(row, inputs) {
    if (!miscArrangementMatches(row.arrangementGroup, inputs.arrangement)) return false;
    if (row.minStorage !== undefined && !(inputs.storageHeight > row.minStorage)) return false;
    if (row.maxStorage !== undefined && !(inputs.storageHeight <= row.maxStorage)) return false;
    if (row.maxCeiling !== undefined && !(inputs.ceilingHeight <= row.maxCeiling)) return false;
    return true;
  }

  function getOccupancyHazardDesignPoints(hazard) {
    const basePoints = OCCUPANCY_HAZARD_DENSITY_AREA[hazard] || [];
    const points = basePoints.map((point) => ({
      ...point,
      adjustment: "",
      confidence: "table-derived",
    }));
    if (hazard === "EH1" || hazard === "EH2") {
      for (const point of basePoints) {
        const adjustedArea = Math.max(2000, Math.round(point.area * 0.75));
        if (adjustedArea >= point.area) continue;
        points.push({
          ...point,
          id: `${point.id}-reduced-area`,
          area: adjustedArea,
          adjustment: "EH design area reduction option for K11.2 or larger / high-temperature sprinklers; not less than 2000 ft2",
          confidence: "table-derived adjusted",
        });
      }
    }
    return points;
  }

  function buildMiscStorageDensityCandidate(inputs, row, point, sources) {
    const sprinklerDemand = point.density * point.area;
    const limits = [
      `Table row: ${row.storedCommodity} miscellaneous storage mapped to ${row.hazard}`,
      `Maximum miscellaneous storage height ${formatNumber(row.maxStorage, 0)} ft${row.maxCeiling ? `; maximum ceiling ${formatNumber(row.maxCeiling, 0)} ft` : ""}`,
      uses2022StorageTables(inputs.edition) ? `Miscellaneous storage design area maximum 3000 ft2 per ${inputs.edition === "2025" ? "4.3.1.7.8" : "4.3.1.7.1.3"}` : "",
      "Miscellaneous storage area, pile size, and 25 ft separation limits must be verified",
      point.adjustment,
      `Hose duration ${row.duration} min`,
    ].filter(Boolean);
    return {
      id: `generated-${inputs.edition}-misc-${row.id}-${point.id}`,
      name: `Miscellaneous storage ${row.storedCommodity} ${row.hazard}`,
      basis: `${row.hazard}: ${formatNumber(point.density, 3)} gpm/ft2 over ${formatNumber(point.area, 0)} ft2`,
      sprinklerDemand,
      hoseAllowance: row.hoseAllowance,
      inRackDemand: 0,
      total: sprinklerDemand + row.hoseAllowance,
      source: `${sources.source} / ${sources.densityAreaSource}`,
      tableTitle: sources.tableTitle,
      confidence: point.confidence,
      notes: limits,
    };
  }

  function buildMiscStorageInRackCandidate(inputs, row, sources) {
    const kFactor = 5.6;
    const pressure = 15;
    const sprinklers = 4;
    const inRackDemand = calcHeadFlow(kFactor, pressure) * sprinklers;
    return {
      id: `generated-${inputs.edition}-misc-${row.id}-chapter-inrack`,
      name: `Miscellaneous storage ${row.storedCommodity} with in-rack sprinklers`,
      basis: `One level of in-rack sprinklers; ${sprinklers} sprinklers, K${formatNumber(kFactor, 1)} @ ${formatNumber(pressure, 0)} psi = ${formatNumber(calcHeadFlow(kFactor, pressure))} gpm/head`,
      sprinklerDemand: 0,
      hoseAllowance: row.hoseAllowance,
      inRackDemand,
      total: inRackDemand + row.hoseAllowance,
      source: `${sources.tableTitle} / ${sources.inRackSource}`,
      tableTitle: sources.tableTitle,
      confidence: "table-derived in-rack-required",
      completeDesign: false,
      notes: [
        `Table row: ${row.storedCommodity} miscellaneous rack storage requires Chapter 25 / in-rack protection coordination`,
        "+1 level of in-rack sprinklers indicated by the miscellaneous storage table",
        "Demand shown is the minimum in-rack row placeholder; ceiling and in-rack layout must be completed from the referenced chapter",
        `Hose duration ${row.duration} min`,
      ],
    };
  }

  function buildGeneratedMiscellaneousStorageCandidates(inputs) {
    if (inputs.commodity !== "Miscellaneous Storage") return [];
    if (inputs.storageHeight > 12) return [];
    const sources = getMiscStorageSources(inputs);
    const candidates = [];
    for (const row of MISC_STORAGE_TABLE_ROWS) {
      if (!miscStorageRowMatches(row, inputs)) continue;
      if (row.inRack) {
        if (inputs.systemType === "In-Rack") {
          candidates.push(buildMiscStorageInRackCandidate(inputs, row, sources));
        }
        continue;
      }
      if (inputs.systemType !== "CMDA") continue;
      for (const point of getOccupancyHazardDesignPoints(row.hazard)) {
        candidates.push(buildMiscStorageDensityCandidate(inputs, row, point, sources));
      }
    }
    return candidates;
  }

  function buildGeneratedSpecialStorageCandidates(inputs) {
    const candidates = [
      ...buildGeneratedMiscellaneousStorageCandidates(inputs),
      ...buildGeneratedIdlePalletCandidates(inputs),
      ...buildGeneratedRubberTireCandidates(inputs),
      ...buildGeneratedRollPaperCandidates(inputs),
    ];
    return candidates.sort(compareCandidates);
  }

  function compareCandidates(a, b) {
    const aComplete = a.completeDesign !== false && Number.isFinite(a.total);
    const bComplete = b.completeDesign !== false && Number.isFinite(b.total);
    if (aComplete !== bComplete) return aComplete ? -1 : 1;

    const aFinite = Number.isFinite(a.total);
    const bFinite = Number.isFinite(b.total);
    if (aFinite !== bFinite) return aFinite ? -1 : 1;
    if (aFinite && bFinite && a.total !== b.total) return a.total - b.total;

    const systemDelta = RECOMMENDED_SYSTEM_TYPES.indexOf(a.systemType) - RECOMMENDED_SYSTEM_TYPES.indexOf(b.systemType);
    if (systemDelta) return systemDelta;
    return a.name.localeCompare(b.name);
  }

  function buildCandidatesForSystem(inputs) {
    const ga2025CeilingRows = buildGeneratedCmda2025GroupAPlasticRackCeilingCandidates(inputs);
    const generatedSpecialRows = buildGeneratedSpecialStorageCandidates(inputs);
    if (generatedSpecialRows.length) {
      return generatedSpecialRows.sort(compareCandidates);
    }
    const generated25_6IndependentInRackRows = buildGenerated25_6IndependentInRackCandidates(inputs);
    if (generated25_6IndependentInRackRows.length) {
      return [...ga2025CeilingRows, ...generated25_6IndependentInRackRows].sort(compareCandidates);
    }
    const generatedAlternativeInRackRows = buildGeneratedAlternativeInRack2019Candidates(inputs);
    if (generatedAlternativeInRackRows.length) {
      return [...ga2025CeilingRows, ...generatedAlternativeInRackRows].sort(compareCandidates);
    }
    if (ga2025CeilingRows.length) {
      return ga2025CeilingRows.sort(compareCandidates);
    }
    const generatedCmdaClassRack2022TableRows = buildGeneratedCmdaClassRack2022TableCandidates(inputs);
    if (generatedCmdaClassRack2022TableRows.length) {
      return generatedCmdaClassRack2022TableRows.sort(compareCandidates);
    }
    const generatedCmdaClassRackInRackCurveRows = buildGeneratedCmdaClassRackInRackCurveCandidates(inputs);
    if (generatedCmdaClassRackInRackCurveRows.length) {
      return generatedCmdaClassRackInRackCurveRows.sort(compareCandidates);
    }
    const generatedCmdaClassRackCurveRows = buildGeneratedCmdaClassRackCurveCandidates(inputs);
    if (generatedCmdaClassRackCurveRows.length) {
      return generatedCmdaClassRackCurveRows.sort(compareCandidates);
    }
    const ga2019CeilingRows = buildGeneratedCmda2019GroupACartonRackCeilingCandidates(inputs);
    const generatedCmdaGroupARackRows = buildGeneratedCmdaGroupARackCandidates(inputs);
    if (generatedCmdaGroupARackRows.length || ga2019CeilingRows.length) {
      return [...ga2019CeilingRows, ...generatedCmdaGroupARackRows].sort(compareCandidates);
    }
    const generatedCmdaClassSolidPile2022TableRows = buildGeneratedCmdaClassSolidPile2022TableCandidates(inputs);
    if (generatedCmdaClassSolidPile2022TableRows.length) {
      return generatedCmdaClassSolidPile2022TableRows.sort(compareCandidates);
    }
    const generatedCmdaClassSolidPileCurveRows = buildGeneratedCmdaClassSolidPileCurveCandidates(inputs);
    if (generatedCmdaClassSolidPileCurveRows.length) {
      return generatedCmdaClassSolidPileCurveRows.sort(compareCandidates);
    }
    const generatedCmdaGroupARows = buildGeneratedCmdaGroupACandidates(inputs);
    if (generatedCmdaGroupARows.length) {
      return generatedCmdaGroupARows.sort(compareCandidates);
    }
    const generatedSolidShelfRackInRackRows = buildGeneratedSolidShelfRackInRackCandidates(inputs);
    if (generatedSolidShelfRackInRackRows.length) {
      return generatedSolidShelfRackInRackRows.sort(compareCandidates);
    }
    const generatedEsfrRows = buildGeneratedEsfrCandidates(inputs);
    if (generatedEsfrRows.length) {
      return generatedEsfrRows.sort(compareCandidates);
    }
    const generatedCmsaRows = buildGeneratedCmsaCandidates(inputs);
    if (generatedCmsaRows.length) {
      return generatedCmsaRows.sort(compareCandidates);
    }
    const criteriaRows = (dataset.criteriaRows || [])
      .filter((row) => rowMatchesInputs(row, inputs))
      .map((row) => buildCandidateFromCriteriaRow(row, inputs))
      .filter(Boolean);
    if (criteriaRows.length) {
      return criteriaRows.sort(compareCandidates);
    }
    return [];
  }

  function annotateSystemCandidates(candidates, systemType) {
    return candidates.map((candidate) => ({
      ...candidate,
      id: `${systemType}-${candidate.id}`,
      systemType,
      systemLabel: SYSTEM_LABELS[systemType] || systemType,
      completeDesign: candidate.completeDesign !== false,
    }));
  }

  function buildMissingInputCandidates(inputs) {
    if (!inputs.missingInputs?.length) return [];
    const missingText = inputs.missingInputs.join(", ");
    return [{
      id: `input-required-${inputs.missingInputs.join("-").replace(/\s+/g, "-")}`,
      name: "Required input missing",
      basis: `Enter ${missingText} before selecting NFPA 13 storage criteria`,
      sprinklerDemand: Number.NaN,
      hoseAllowance: Number.NaN,
      inRackDemand: 0,
      total: Number.NaN,
      completeDesign: false,
      systemType: "Manual",
      systemLabel: "Manual Review",
      source: "Input validation / NFPA 13 storage criteria branch selection",
      tableTitle: "Required inputs",
      confidence: "manual-review",
      notes: [
        "Unknown numeric inputs are not defaulted to zero.",
        "The tool cannot determine storage-height, ceiling-height, aisle-width, or clearance-dependent branches until these inputs are known.",
      ],
    }];
  }

  function buildCandidates(inputs) {
    const missingInputCandidates = buildMissingInputCandidates(inputs);
    if (missingInputCandidates.length) return missingInputCandidates;

    const candidates = RECOMMENDED_SYSTEM_TYPES.flatMap((systemType) =>
      annotateSystemCandidates(buildCandidatesForSystem({ ...inputs, systemType }), systemType),
    );
    return candidates.sort(compareCandidates);
  }

  function findRecommendedCandidate(candidates) {
    return candidates.find((candidate) => candidate.completeDesign !== false && Number.isFinite(candidate.total));
  }

  function candidateUsesInRackSprinklers(candidate) {
    if (candidate.systemType === "In-Rack") return true;
    if (Number.isFinite(candidate.inRackDemand) && candidate.inRackDemand > 0) return true;
    const searchableText = [
      candidate.name,
      candidate.basis,
      candidate.tableTitle,
      candidate.source,
      ...(candidate.notes || []),
    ].join(" ").toLowerCase();
    return searchableText.includes("in-rack sprinklers required") ||
      searchableText.includes("in-rack sprinkler") ||
      searchableText.includes("in-rack design");
  }

  function matchesSystemFilter(candidate) {
    return activeSystemFilter === "all" || candidate.systemType === activeSystemFilter;
  }

  function matchesInRackFilter(candidate) {
    if (activeInRackFilter === "all") return true;
    const usesInRack = candidateUsesInRackSprinklers(candidate);
    return activeInRackFilter === "with" ? usesInRack : !usesInRack;
  }

  function filterCandidates(candidates) {
    return candidates.filter((candidate) => matchesSystemFilter(candidate) && matchesInRackFilter(candidate));
  }

  function getPageCount(count) {
    return Math.max(1, Math.ceil(count / DISPLAY_OPTION_LIMIT));
  }

  function clampActiveResultPage(count) {
    const pageCount = getPageCount(count);
    activeResultPage = Math.max(0, Math.min(activeResultPage, pageCount - 1));
    return pageCount;
  }

  function renderPager(count, startIndex, endIndex, pageCount) {
    if (!dom.criteriaPager || !dom.criteriaPrev || !dom.criteriaNext || !dom.criteriaPageStatus) return;
    const hasPages = count > DISPLAY_OPTION_LIMIT;
    dom.criteriaPager.hidden = !count;
    dom.criteriaPrev.disabled = !hasPages || activeResultPage <= 0;
    dom.criteriaNext.disabled = !hasPages || activeResultPage >= pageCount - 1;
    dom.criteriaPageStatus.textContent = count
      ? `Showing ${startIndex + 1}-${endIndex} of ${count} option${count === 1 ? "" : "s"}`
      : "Showing 0 options";
  }

  function renderFilters(candidates) {
    const systemCountBase = candidates.filter((candidate) => matchesInRackFilter(candidate));
    const systemCounts = systemCountBase.reduce(
      (accumulator, candidate) => {
        accumulator.all += 1;
        accumulator[candidate.systemType] = (accumulator[candidate.systemType] || 0) + 1;
        return accumulator;
      },
      { all: 0 },
    );

    dom.systemFilterButtons.forEach((button) => {
      const filter = button.dataset.systemFilter;
      const count = systemCounts[filter] || 0;
      button.classList.toggle("active", filter === activeSystemFilter);
      button.setAttribute("aria-pressed", filter === activeSystemFilter ? "true" : "false");
      button.innerHTML = `${FILTER_LABELS[filter] || filter} <span>${count}</span>`;
    });

    const inRackCountBase = candidates.filter((candidate) => matchesSystemFilter(candidate));
    const withCount = inRackCountBase.filter((candidate) => candidateUsesInRackSprinklers(candidate)).length;
    const rackCounts = {
      all: inRackCountBase.length,
      with: withCount,
      without: inRackCountBase.length - withCount,
    };

    dom.inRackFilterButtons.forEach((button) => {
      const filter = button.dataset.inRackFilter;
      const count = rackCounts[filter] || 0;
      button.classList.toggle("active", filter === activeInRackFilter);
      button.setAttribute("aria-pressed", filter === activeInRackFilter ? "true" : "false");
      button.innerHTML = `${filter === "all" ? "All" : filter === "with" ? "With" : "Without"} <span>${count}</span>`;
    });
  }

  function renderTable(candidates, allCandidates = candidates) {
    const overallBestId = findRecommendedCandidate(allCandidates)?.id;
    const filteredBestId = findRecommendedCandidate(candidates)?.id;
    if (!candidates.length) {
      activeResultPage = 0;
      const filterName = FILTER_LABELS[activeSystemFilter] || activeSystemFilter;
      const inRackName = IN_RACK_FILTER_LABELS[activeInRackFilter] || activeInRackFilter;
      const activeFilterName = activeSystemFilter === "all" ? inRackName : `${filterName} ${inRackName}`;
      const message = activeSystemFilter === "all"
        ? `
            <strong>No options matched these inputs${activeInRackFilter === "all" ? " yet" : ` ${inRackName}`}.</strong>
            <div class="pill">${activeInRackFilter === "all" ? "Add the verified NFPA table row to data/storage_hazard_criteria.json" : "Switch the in-rack filter or protection option to review available criteria."}</div>
          `
        : `
            <strong>No ${activeFilterName} options matched these inputs.</strong>
            <div class="pill">Switch to All or another protection option to review available criteria.</div>
          `;
      dom.tableBody.innerHTML = `
        <tr>
          <td colspan="6">${message}</td>
        </tr>
      `;
      dom.candidateCount.textContent = activeSystemFilter === "all" && activeInRackFilter === "all"
        ? "0 rows"
        : `${activeFilterName}: 0 options`;
      renderPager(0, 0, 0, 1);
      return;
    }
    const pageCount = clampActiveResultPage(candidates.length);
    const startIndex = activeResultPage * DISPLAY_OPTION_LIMIT;
    const endIndex = Math.min(startIndex + DISPLAY_OPTION_LIMIT, candidates.length);
    const visibleCandidates = candidates.slice(startIndex, endIndex);
    dom.tableBody.innerHTML = visibleCandidates
      .map((candidate) => {
        const isOverallBest = candidate.id === overallBestId;
        const isFilteredBest = activeSystemFilter !== "all" && candidate.id === filteredBestId;
        const isBest = isOverallBest || isFilteredBest;
        const isSelected = candidate.id === selectedCandidateId;
        const statusText = isOverallBest
          ? "Recommended"
          : isFilteredBest
            ? `Lowest ${FILTER_LABELS[activeSystemFilter] || activeSystemFilter}`
            : candidate.completeDesign === false
              ? "coordination only"
              : candidate.confidence;
        const notes = candidate.notes.length
          ? `<div class="criteria-notes">${candidate.notes.map((note) => `<span>${note}</span>`).join("\n")}</div>`
          : "";
        const source = [candidate.tableTitle, candidate.source].filter(Boolean);
        const sourceNote = source.length
          ? `<div class="source-note"><strong>Source</strong>${source.map((item) => `<span>${item}</span>`).join("\n")}</div>`
          : "";
        return `
          <tr class="${isBest ? "best-row" : ""} ${isSelected ? "selected-row" : ""}" data-candidate-id="${candidate.id}" tabindex="0">
            <td class="option-cell">
              <strong>${candidate.name}</strong>
              <div class="tag-row">
                <span class="pill system">${candidate.systemLabel || candidate.systemType || "Option"}</span>
                <span class="pill ${isBest ? "best" : ""}">${statusText}</span>
              </div>
            </td>
            <td class="basis-cell"><strong>${candidate.basis}</strong>${notes}${sourceNote}</td>
            <td class="number-cell">${formatGpm(candidate.sprinklerDemand)}</td>
            <td class="number-cell">${formatOptionalGpm(candidate.inRackDemand)}</td>
            <td class="number-cell">${formatGpm(candidate.hoseAllowance)}</td>
            <td class="number-cell"><strong>${formatGpm(candidate.total)}</strong></td>
          </tr>
        `;
      })
      .join("");
    const filterName = FILTER_LABELS[activeSystemFilter] || activeSystemFilter;
    const pageText = candidates.length > DISPLAY_OPTION_LIMIT
      ? `Options ${startIndex + 1}-${endIndex} of ${candidates.length}`
      : `${candidates.length} option${candidates.length === 1 ? "" : "s"}`;
    if (activeSystemFilter === "all") {
      const inRackName = IN_RACK_FILTER_LABELS[activeInRackFilter] || activeInRackFilter;
      if (activeInRackFilter === "all") {
        dom.candidateCount.textContent = pageText;
      } else {
        dom.candidateCount.textContent = `${inRackName}: ${pageText.charAt(0).toLowerCase()}${pageText.slice(1)}`;
      }
      renderPager(candidates.length, startIndex, endIndex, pageCount);
      return;
    }
    const inRackSuffix = activeInRackFilter === "all" ? "" : ` ${IN_RACK_FILTER_LABELS[activeInRackFilter] || activeInRackFilter}`;
    dom.candidateCount.textContent = `${filterName}${inRackSuffix}: ${pageText.charAt(0).toLowerCase()}${pageText.slice(1)}`;
    renderPager(candidates.length, startIndex, endIndex, pageCount);
  }

  function renderSourcePreview(selected, candidates) {
    if (!dom.sourcePreview || !dom.sourcePreviewTitle) return;
    if (!selected) {
      dom.sourcePreviewTitle.textContent = "No selection";
      dom.sourcePreview.innerHTML = `
        <div class="empty-preview">
          <strong>No criteria selected.</strong>
          <span>Choose an available result row to preview its source table or curve.</span>
        </div>
      `;
      return;
    }

    const sourceTitle = [selected.tableTitle, selected.source].filter(Boolean).join(" / ");
    dom.sourcePreviewTitle.textContent = selected.tableTitle || "Selected criteria";
    const curveMarkup = selected.confidence === "curve-derived" ? buildCurvePreview(selected, candidates) : "";
    const bodyMarkup = curveMarkup || buildTablePreview(selected, candidates);
    dom.sourcePreview.innerHTML = `
      <div class="preview-summary">
        <div>
          <strong>${selected.tableTitle || selected.name}</strong>
          <span>${sourceTitle || "Built-in criteria"}</span>
        </div>
        <div class="preview-selected-values">
          <span>${selected.basis}</span>
          <span>Total: ${formatGpm(selected.total)}</span>
        </div>
      </div>
      ${bodyMarkup}
      <p class="preview-note">Preview is redrawn from the built-in criteria values for quick review; verify final design against the adopted NFPA 13 edition and sprinkler listings.</p>
    `;
  }

  function renderTrace(inputs, candidates, selectedCandidate = null) {
    const recommended = findRecommendedCandidate(candidates);
    const activeCandidate = selectedCandidate || recommended;
    if (!activeCandidate) {
      if (candidates.length) {
        latestSummary = [
          "Storage Hazard Analysis",
          `Edition: NFPA 13 ${inputs.edition}`,
          `Commodity: ${inputs.commodity}`,
          `Arrangement: ${inputs.arrangement}`,
          `Rack geometry/depth: ${inputs.rackGeometry === "unknown" ? "Unknown / bounded options" : inputs.rackGeometry}`,
          "",
          "Criteria rows matched these inputs, but no matched row provides a complete recommended ceiling design demand.",
          "Review the listed in-rack-required or coordination-only rows before calculating total water demand.",
        ].join("\n");
        dom.trace.textContent = latestSummary;
        return;
      }
      latestSummary = [
        "Storage Hazard Analysis",
        `Edition: NFPA 13 ${inputs.edition}`,
        `Commodity: ${inputs.commodity}`,
        `Arrangement: ${inputs.arrangement}`,
        "",
        "No built-in criteria row matched these inputs yet.",
        "Add or verify the applicable NFPA table row in data/storage_hazard_criteria.json.",
      ].join("\n");
      dom.trace.textContent = latestSummary;
      return;
    }
    const lines = [
      "Storage Hazard Analysis",
      `Edition: NFPA 13 ${inputs.edition}`,
      `Commodity: ${inputs.commodity}`,
      `Arrangement: ${inputs.arrangement}`,
      `Rack geometry/depth: ${inputs.rackGeometry === "unknown" ? "Unknown / bounded options" : inputs.rackGeometry}`,
      `Storage height: ${formatNumber(inputs.storageHeight, 1)} ft`,
      `Ceiling height: ${formatNumber(inputs.ceilingHeight, 1)} ft`,
      `Clearance: ${formatNumber(inputs.clearance, 1)} ft`,
      `Aisle width: ${formatNumber(inputs.aisleWidth, 1)} ft`,
      `Encapsulated: ${inputs.encapsulated ? "Yes" : "No"}`,
      "",
      `Recommended system: ${recommended ? (recommended.systemLabel || recommended.systemType) : "None"}`,
      `Displayed option: ${activeCandidate.name}`,
      `Displayed system: ${activeCandidate.systemLabel || activeCandidate.systemType}`,
      `Basis: ${activeCandidate.basis}`,
      `Ceiling sprinkler demand: ${formatGpm(activeCandidate.sprinklerDemand)}`,
      `In-rack sprinkler demand: ${formatGpm(activeCandidate.inRackDemand)}`,
      `Combined sprinkler demand: ${formatGpm(activeCandidate.sprinklerDemand + activeCandidate.inRackDemand)}`,
      `Outside hose allowance: ${formatGpm(activeCandidate.hoseAllowance)}`,
      `Total water demand: ${formatGpm(activeCandidate.total)}`,
      `Source reference(s): ${[activeCandidate.tableTitle, activeCandidate.source].filter(Boolean).join(" / ")}`,
      "",
      "Designer note: table-derived storage criteria must be verified against the adopted NFPA 13 edition, sprinkler listing, and AHJ requirements.",
    ];
    latestSummary = lines.join("\n");
    dom.trace.textContent = latestSummary;
  }

  function renderSourceMap(inputs) {
    if (!dom.sourceMap) return;
    const refs = dataset.references?.[inputs.edition] || {};
    const baseRefs = Object.entries(refs)
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase());
        return `<div class="source-item"><strong>${label}</strong><span>${value}</span></div>`;
      })
      .join("");
    const storageLog = STORAGE_REFERENCE_LOG[inputs.edition];
    const storageLogMarkup = storageLog
      ? `
        <details class="source-item reference-log" open>
          <summary>
            <strong>Storage Table / Curve Log</strong>
            <span>${storageLog.chapters} - ${storageLog.refs.length} logged references</span>
          </summary>
          <div class="reference-grid">
            ${storageLog.refs.map((ref) => `<span>${ref}</span>`).join("")}
          </div>
        </details>
      `
      : "";
    dom.sourceMap.innerHTML = `${baseRefs}${storageLogMarkup}`;
  }

  function recalc() {
    const inputs = getInputs();
    const candidates = buildCandidates(inputs);
    const visibleCandidates = filterCandidates(candidates);
    const best = findRecommendedCandidate(candidates);
    const selectedCandidate =
      visibleCandidates.find((candidate) => candidate.id === selectedCandidateId) ||
      findRecommendedCandidate(visibleCandidates) ||
      best ||
      visibleCandidates[0] ||
      candidates[0] ||
      null;
    selectedCandidateId = selectedCandidate?.id || "";
    const summaryCandidate = selectedCandidate || best;
    const showingRecommended = summaryCandidate && best && summaryCandidate.id === best.id;
    const partialDemand = summaryCandidate?.completeDesign === false;
    if (dom.totalDemandLabel) dom.totalDemandLabel.textContent = partialDemand ? "Selected Partial Demand" : showingRecommended ? "Recommended Total Demand" : "Selected Total Demand";
    if (dom.sprinklerDemandLabel) dom.sprinklerDemandLabel.textContent = partialDemand ? "Selected In-Rack / Sprinkler Demand" : showingRecommended ? "Sprinkler Demand" : "Selected Sprinkler Demand";
    if (dom.hoseAllowanceLabel) dom.hoseAllowanceLabel.textContent = showingRecommended ? "Hose Allowance" : "Selected Hose Allowance";
    dom.lowestDemand.textContent = summaryCandidate ? formatGpm(summaryCandidate.total) : "-";
    dom.sprinklerDemand.textContent = summaryCandidate ? formatGpm(summaryCandidate.sprinklerDemand + summaryCandidate.inRackDemand) : "-";
    dom.addons.textContent = summaryCandidate ? formatGpm(summaryCandidate.hoseAllowance) : "-";
    renderFilters(candidates);
    renderTable(visibleCandidates, candidates);
    renderSourcePreview(selectedCandidate, candidates);
    renderTrace(inputs, candidates, selectedCandidate);
    renderSourceMap(inputs);
  }

  function wireEvents() {
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => input.addEventListener("input", () => {
      selectedCandidateId = "";
      activeResultPage = 0;
      recalc();
    }));
    dom.tableBody.addEventListener("click", (event) => {
      const row = event.target.closest("[data-candidate-id]");
      if (!row) return;
      selectedCandidateId = row.dataset.candidateId || "";
      recalc();
    });
    dom.tableBody.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target.closest("[data-candidate-id]");
      if (!row) return;
      event.preventDefault();
      selectedCandidateId = row.dataset.candidateId || "";
      recalc();
    });
    dom.systemFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeSystemFilter = button.dataset.systemFilter || "all";
        activeResultPage = 0;
        recalc();
      });
    });
    dom.inRackFilterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeInRackFilter = button.dataset.inRackFilter || "all";
        activeResultPage = 0;
        recalc();
      });
    });
    dom.criteriaPrev?.addEventListener("click", () => {
      activeResultPage = Math.max(0, activeResultPage - 1);
      recalc();
    });
    dom.criteriaNext?.addEventListener("click", () => {
      activeResultPage += 1;
      recalc();
    });
    dom.copySummary.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(latestSummary);
        dom.copySummary.textContent = "Copied";
        window.setTimeout(() => {
          dom.copySummary.textContent = "Copy";
        }, 1200);
      } catch (error) {
        dom.copySummary.textContent = "Copy failed";
      }
    });
    dom.reset.addEventListener("click", () => {
      dom.edition.value = "2025";
      dom.commodity.value = "Class I";
      dom.arrangement.value = "Palletized / Solid-Piled";
      dom.storageHeight.value = 20;
      dom.ceilingHeight.value = 30;
      dom.aisleWidth.value = 8;
      if (dom.rackGeometry) dom.rackGeometry.value = "unknown";
      dom.ceilingSystem.value = "wet";
      dom.encapsulated.checked = false;
      activeSystemFilter = "all";
      activeInRackFilter = "all";
      activeResultPage = 0;
      recalc();
    });
  }

  async function loadDataset() {
    if (window.location.protocol === "file:") {
      dataset = DEFAULT_DATASET;
      if (dom.datasetStatus) dom.datasetStatus.textContent = "Using built-in criteria";
      recalc();
      return;
    }
    try {
      const response = await fetch("./data/storage_hazard_criteria.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      dataset = await response.json();
      if (dom.datasetStatus) dom.datasetStatus.textContent = `Criteria dataset v${dataset.version}`;
    } catch (error) {
      dataset = DEFAULT_DATASET;
      if (dom.datasetStatus) dom.datasetStatus.textContent = "Using built-in fallback criteria";
    }
    recalc();
  }

  wireEvents();
  loadDataset();
})();
