# AGENTS.md

Context for AI agents working on this repo.

## What this is

Pitch deck for **Avegenie**: scan a room with a phone camera, every piece of furniture becomes a
movable object, and new items come in from store integrations (Embawood, Saba, Pinterest…).
The team is Georgian (Tbilisi); the deck is in English. The logo artwork was drawn under the
working name "overfurn"; the product name is Avegenie.

Static [reveal.js](https://revealjs.com) deck. No build step, no package manager. 1920×1080 slides.

Live: https://askvernitel.github.io/BrainVestPres/ (GitHub Pages, deployed from `main` root on push).

## Files

| Path | What |
|---|---|
| `index.html` | All slides, one `<section>` each, marked `<!-- N · NAME ─── -->`. Speaker notes in `<aside class="notes">`. |
| `js/config.js` | **All editable content**: name, tagline, logo, prices, demo video, team, chart data + sources, grant split. Read via `window.DECK` (`D` in main.js) and `data-deck="key"` attributes. |
| `js/main.js` | Builds the dynamic parts: team portraits, market charts, grant donut, isometric rooms (problem bed tour, solution steps, close background), count-ups, demo videos (every `<video data-demo>` restarts when its slide opens), Reveal init and per-slide enter hooks. |
| `css/theme.css` | Design tokens at the top, then one block per slide. Motion primitives: `.rise`, `.pop`, `.flip`, `.draw` with `--d` (delay in s), replayed when a slide becomes `.present`. |
| `assets/` | `logo.svg` (transparent), `logo-bg.svg` (dark square, favicon), `demo.mp4` + `demo.jpg` poster (played on the close slide), `team/*.jpg` (600×600 face crops). |
| `tools/demo-video/scene.html` | Source of `assets/demo.mp4`. SVG animation driven by `window.renderAt(t)`; open in a browser to preview. |
| `vendor/reveal/` | Vendored reveal.js. Don't edit. |

Loose files in the root (`*.jpg`, `*.png`, `*.webp`, `overfurn*.svg`) are the user's originals; they are intentionally untracked.

## Slides (current order)

1. Logo (name only, no subtitle)
2. Problem: "Where would you fit this bed?" — bed tours the four corners of an isometric room
3. Solution: "Scan → Separate → Add & Rearrange". Scan starts on its own 250 ms after the slide opens (`SCAN_DELAY`); clicks reveal Separate, Rearrange, then store items (Embawood · Saba · Pinterest) dropping in. Keep this slide.
4. Market: three line charts — apartments sold (Tbilisi), housing permitted (Tbilisi, permits area), furniture & lighting sales (Georgia, US$)
5. Who needs this: hub diagram, logo in the centre, four audiences around it
6. Business model: free trial (6 scans) → Professional $10/mo → Business $100/mo (20 models included, then $10 per model)
7. Competition: no title; rows in this order: AI agents (ChatGPT, Claude), IKEA (Kreativ), Scaniverse, Human 3D modeler, then Avegenie; segmented bars over 3 capabilities (scans the room / moves your furniture / store integrations) → coverage %
8. Grant: donut of fund allocation
9. Team: three portraits on a line (no cards)
10. Close: logo, "Thank you.", tagline on the left, the demo video looping on the right (no QR, no email). There is no separate demo slide: the video lives only here.

## Style rules (the user has been explicit about these)

- Palette: background `#1e100a` (warm dark brown), amber `#ffb547` accent, teal `#5eead4` secondary, ink `#eef2fa`, muted `#8692b0`. Font: Space Grotesk.
- **No cards.** The user removed card layouts from business model, who-needs-this and team; use lines, rows, diagrams instead.
- Little text, motion graphics over bullet lists. Short headlines.
- Isometric room illustration (2:1 iso, `P(x, y, z)` helpers in main.js and scene.html) is the visual signature; reuse it rather than inventing new illustration styles.
- First person / story framing on the problem slide.

## Data and honesty

- Market figures come from Galt & Taggart reports (NAPR, TAS, Geostat, SARAS), TBC Capital, Colliers Georgia. Sources are noted in `js/config.js` and shown on the slide (`marketSource`). Don't add numbers without a source; there is no per-unit furniture sales figure for Georgia.
- Competition scores are judgement calls derived from the three capabilities (half points: AI agents "move" = can reimagine a photo, not to scale; IKEA "integrations" = own catalogue only; human modeler "scan" = measures by hand). Explain changes, don't inflate.

## Workflow

- Preview: `python3 -m http.server 8000` in the repo, or open `index.html` directly.
- Browsers cache aggressively (Firefox + Pages `max-age=600`): tell the user to hard-refresh (Ctrl+Shift+R) after changes.
- `index.html` loads `css/theme.css`, `js/config.js`, `js/main.js` with `?v=YYYYMMDD-N`. **Bump it on every push that changes any of them**, otherwise browsers can mix a new `index.html` with an old cached `main.js` and the deck crashes to a white screen.
- Verify visually: render slides headless (Playwright/Chromium at 1920×1080, `index.html#/N`, wait ~3–4 s for animations) and look at the screenshot before claiming a layout works.
- **Push only when the user says so.** Commit to `main` (that is what Pages serves), then confirm the Pages deploy finished (`gh api repos/Askvernitel/BrainVestPres/actions/runs`).

## Re-rendering the demo video

1. Edit `tools/demo-video/scene.html` (timeline is in `renderAt`; captions in `CAPS`; total `DURATION`).
2. Headless browser at 1920×1080 on `scene.html?render=1`, wait for `document.fonts.ready`, then for each frame `renderAt(i / 30)` + screenshot (JPEG).
3. Encode with the colour flags, or the background shifts darker/redder than the slide:
   ```
   ffmpeg -framerate 30 -i f%04d.jpg \
     -vf "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p" \
     -c:v libx264 -preset slow -crf 20 \
     -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
     -movflags +faststart assets/demo.mp4
   ```
4. Poster: export one frame to `assets/demo.jpg`.
