# The Family Bucket List

Two-screen interactive installation prototype. Screen A (`/control`) is the questionnaire and itinerary. Screen B (`/display`) is the cinematic image reveal and memory sequence. Both stay in sync through a shared Socket.IO session on the Node server.

## 1. Install

From the project root:

```bash
npm run install:all
```

Or install each package yourself:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

## 2. Put your OpenAI key in `.env`

Copy the example file and add your key:

```bash
cp .env.example .env
```

On Windows PowerShell: `Copy-Item .env.example .env`

Then set:

```
OPENAI_API_KEY=sk-...
```

All OpenAI calls run on the Node server only. The browser never receives the key.

Optional model overrides (same file):

```
OPENAI_TEXT_MODEL=gpt-4o-mini
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_IMAGE_SIZE=1024x1536
INACTIVITY_TIMEOUT_MS=120000
```

If the key is missing or a request fails, the installation keeps moving with local fallback images and itineraries.

## 3. Run locally (frontend + backend)

```bash
npm run dev
```

This starts:

- API / Socket.IO server: `http://localhost:3002`
- Vite client: `http://localhost:5188`

## 4. Open Screen A (interaction)

```
http://localhost:5188/control
```

## 5. Open Screen B (visual)

```
http://localhost:5188/display
```

## 6. Test both screens side-by-side

Easiest: open the preview page, which embeds both portrait screens:

```
http://localhost:5188/
```

For installation testing, open two browser windows:

1. Window 1 → `/control`
2. Window 2 → `/display`
3. Resize both toward 1080×1920 (Chrome DevTools device mode works well).
4. On Screen A, choose a destination, then answer 3 questions.

You should see Screen B blur-reveal in step with each answer, then switch into the memory sequence when the itinerary is ready.

### Debug overlay

Add `?debug=true` to either route:

```
http://localhost:5188/control?debug=true
http://localhost:5188/display?debug=true
```

The panel shows phase, destination, answers, image/itinerary status, and socket connection, plus skip / simulate / reset controls.

An unobtrusive **Reset** control sits in the lower-right of both screens and clears the shared session.

## Production-style run

```bash
npm run build
npm start
```

Then open:

- `http://localhost:3002/control`
- `http://localhost:3002/display`

## Vrbo group trip (`/vrbo`)

A second installation prototype that simulates five displays in one browser window: two large screens on top (group chat, group priorities) and three guest phones along the bottom.

```
http://localhost:5188/vrbo
```

Flow: the chat plays a scripted intro → each phone picks up to three preferences and submits → every pick animates into the chat → once all three submit, the right screen aggregates the preferences into a draggable ranked list (top = highest priority) → **Find Our Stay** scores the properties → pick one and **Send to Group Chat** for the reveal and celebration. **Restart demo** (top right) resets everything.

Rows can be reordered by dragging or with the `↑ ↓` buttons on each row, so the ranking works on a touchscreen without hover. Each row is also a little narrower than the one above it, so the priority order reads from across the room.

The palette lives in the `.vrbo-stage` custom properties at the top of `client/src/styles/vrbo.css`: warm cream page, brand blue (`#4169d8`) for the ranking and phone screens, sky blue (`#79cff3`) for selected states, warm white for the chat and property cards, and charcoal instead of pure black for type and device bezels.

All copy and content lives in `client/src/data/vrbo/`:

| File | What it controls |
| --- | --- |
| `users.json` | The three guests: name, colour, chat side, phone label |
| `preferences.json` | Selectable preferences and the chat line each one posts |
| `properties.json` | The six stays, including `features` used for scoring |
| `rankingWeights.json` | Scoring weights and how many results to show |
| `chatScript.json` | Intro conversation, finale messages, and all timings |
| `copy.json` | Headlines, button labels, and the per-guest selection limit |

Scoring lives in `client/src/utils/rankProperties.js`. `weightMode: "linear"` gives the top-ranked preference a weight equal to the number of ranked preferences and counts down from there (3, 2, 1 for three preferences). Switch to `"explicit"` to use the `explicitWeights` array verbatim.

Property images are hotlinked from Unsplash and fall back to the `gradient` field in `properties.json` if they fail to load. Swap the `image` values for files in `client/public/images/` to run fully offline.

## Notes

- Generated images are stored in `server/generated/` and served at `/generated/...`.
- One shared experience session is maintained on the server. Refreshing either browser restores the current state.
- After a period of inactivity (`INACTIVITY_TIMEOUT_MS`, default 2 minutes) both screens return to the destination picker.
