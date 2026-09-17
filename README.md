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

## Notes

- Generated images are stored in `server/generated/` and served at `/generated/...`.
- One shared experience session is maintained on the server. Refreshing either browser restores the current state.
- After a period of inactivity (`INACTIVITY_TIMEOUT_MS`, default 2 minutes) both screens return to the destination picker.
