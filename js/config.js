// ─────────────────────────────────────────────────────────────
//  Everything you need to edit lives in this file.
// ─────────────────────────────────────────────────────────────
window.DECK = {
  name: "Avegenie",
  tagline: "Scan your room. Move anything.",
  logo: "assets/logo.svg",                     // TODO: replace with your logo file
  contact: "hello@yourdomain.ge",              // TODO: email / website

  // Closing slide QR code. Drop your generated image at this path (png/svg).
  // Until the file exists, a dashed placeholder is shown.
  qr: "assets/qr.png",                         // TODO: generate and add
  qrCaption: "Scan to try it",

  // Demo slide: drop a screen recording at this path (mp4).
  // Until the file exists, the slide shows a placeholder frame.
  demoVideo: "assets/demo.mp4",
  demoPoster: "assets/demo.jpg",

  // TODO: team members. `photo` is optional (path to an image); initials are used otherwise.
  team: [
    { name: "Name Surname", role: "Role", photo: "" },
    { name: "Name Surname", role: "Role", photo: "" },
    { name: "Name Surname", role: "Role", photo: "" },
  ],

  // Problem slide chart: apartments sold in Tbilisi per year.
  // 2021: TBC Capital · 2022–2023: Galt & Taggart (NAPR data) · 2024: market reports
  // 2025: Colliers Georgia · 2020: derived from the reported +35% growth into 2021.
  housing: [
    { year: 2020, value: 28700, approx: true },
    { year: 2021, value: 38700 },
    { year: 2022, value: 42974 },
    { year: 2023, value: 39949 },
    { year: 2024, value: 41284 },
    { year: 2025, value: 42267 },
  ],
  housingSource: "Apartments sold in Tbilisi. Sources: TBC Capital, Galt & Taggart (NAPR), Colliers Georgia. 2020 estimated.",

  // Grant split (no amount shown).
  grant: [
    { label: "Product & engineering", pct: 45, color: "var(--amber)" },
    { label: "Cloud & infrastructure", pct: 20, color: "var(--teal)" },
    { label: "Growth & partnerships", pct: 20, color: "var(--violet)" },
    { label: "Operations", pct: 15, color: "var(--sky)" },
  ],
};
