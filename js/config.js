// ─────────────────────────────────────────────────────────────
//  Everything you need to edit lives in this file.
// ─────────────────────────────────────────────────────────────
window.DECK = {
  name: "Avegenie",
  tagline: "Scan your room. Move anything.",
  presenter: "Nikoloz Ejibadze",                // title slide: "Presented by …"
  logo: "assets/logo.svg",                     // Avegenie genie lamp, transparent; assets/logo-bg.svg = same on a dark square (favicon)

  // Business model slide prices (include the currency, e.g. "₾29").
  pricePro: "$10",                              // Professional plan
  priceBusiness: "$100",                        // Business plan
  businessNote: "20 models included\nthen $10 per extra model",
  pricePeriod: "/ month",

  // Demo slide: drop a screen recording at this path (mp4).
  // Until the file exists, the slide shows a placeholder frame.
  demoVideo: "assets/demo.mp4",
  demoPoster: "assets/demo.jpg",

  // Team. `photo` is a square crop in assets/team; initials are used if it's empty.
  team: [
    { name: "Nikoloz Ejibadze", role: "Mechanical engineer", photo: "assets/team/nikoloz.jpg" },
    { name: "Daniel Kolotashvili", role: "Embedded developer", photo: "assets/team/daniel.jpg" },
    { name: "Irakli Gudiashvili", role: "Full stack developer", photo: "assets/team/irakli.jpg" },
  ],

  // Market slide: three small charts. Keep the sources line in sync if you change data.
  // Apartments sold in Tbilisi. 2021: TBC Capital · 2022–2023: Galt & Taggart (NAPR data)
  // 2024: market reports · 2025: Colliers Georgia · 2020: derived from the reported +35% into 2021.
  apartments: [
    { year: 2020, value: 28700, approx: true },
    { year: 2021, value: 38700 },
    { year: 2022, value: 42974 },
    { year: 2023, value: 39949 },
    { year: 2024, value: 41284 },
    { year: 2025, value: 42267 },
  ],
  // Area of residential construction permits issued in Tbilisi, '000 m² (TAS via Galt & Taggart, Oct 2025, Fig. 8).
  permits: [
    { year: 2018, value: 913 },
    { year: 2019, value: 1204 },
    { year: 2020, value: 1374 },
    { year: 2021, value: 1530 },
    { year: 2022, value: 1422 },
    { year: 2023, value: 1940 },
    { year: 2024, value: 1810 },
  ],
  // Furniture & lighting sector revenue in Georgia, US$ mn (Geostat, SARAS via Galt & Taggart, Jun 2025). 2024 estimated.
  furniture: [
    { year: 2018, value: 327 },
    { year: 2019, value: 306 },
    { year: 2020, value: 270 },
    { year: 2021, value: 295 },
    { year: 2022, value: 430 },
    { year: 2023, value: 504 },
    { year: 2024, value: 511, approx: true },
  ],
  marketSource: "Sources: NAPR, TBC Capital, Colliers Georgia (apartments) · TAS (permits) · Geostat, SARAS (furniture & lighting, 2024 estimated) · via Galt & Taggart.",

  // Grant split (no amount shown).
  grant: [
    { label: "Product & engineering", pct: 45, color: "var(--amber)" },
    { label: "Cloud & infrastructure", pct: 20, color: "var(--teal)" },
    { label: "Growth & partnerships", pct: 20, color: "var(--violet)" },
    { label: "Operations", pct: 15, color: "var(--sky)" },
  ],
};
