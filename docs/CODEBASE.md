# MeetFlow AI — Codebase Guide

A plain-English tour of what is actually in this repository, written for someone who is new to the
project (and fairly new to React and FastAPI).

If you are looking for **how to install and run** the project, read the main [README](../README.md).
This document explains **what the code does** once it is running.

---

## 1. The one-paragraph summary

MeetFlow AI is planned as an AI meeting assistant: you upload a meeting recording, and the app gives
you back a transcript, a summary, decisions and action items.

**Right now, none of the AI exists yet.** What has been built is the front door: a single web page
where a user picks a video file, fills in some details, and presses a button. The backend exists but
is almost empty. Think of the current state as *a finished, polished form with nothing wired behind
it* — which is a completely normal place to be at this stage.

---

## 2. The two halves

The project is split into two independent programs that you run at the same time in two terminals.

| | Frontend | Backend |
|---|---|---|
| Folder | `frontend/` | `backend/` |
| Language | JavaScript (React) | Python |
| Framework | React 19 + Vite | FastAPI |
| Runs at | http://localhost:5173 | http://127.0.0.1:8000 |
| Job | Draw the user interface in the browser | Receive files, run AI, return results |

They are meant to talk to each other over HTTP (the frontend sends a request, the backend answers).

> **Important:** they do **not** talk to each other yet. There is not a single network call in the
> frontend code today. See [section 6](#6-what-is-real-and-what-is-a-placeholder).

---

## 3. Every file, and what it is for

```text
meetflow-ai/
├── README.md                     Setup instructions (install, run, git workflow)
├── AGENTS.md                     Notes for AI coding assistants
├── .gitignore                    Files git must never upload (.venv, node_modules, .env, uploads)
│
├── backend/
│   ├── requirements.txt          List of Python packages to install
│   └── app/
│       └── main.py               ⭐ The whole backend. 13 lines.
│
├── docs/
│   └── CODEBASE.md               This file
│
└── frontend/
    ├── package.json              List of JavaScript packages + the npm commands
    ├── vite.config.js            Build tool config (just "use React", nothing custom)
    ├── eslint.config.js          Code-style checker config
    ├── index.html                The single HTML page the browser loads first
    ├── public/                   Images served as-is (favicon.svg, icons.svg)
    └── src/
        ├── main.jsx              ⭐ Entry point — starts React
        ├── App.jsx               ⭐ The router — decides which page to show
        ├── index.css             Global styles + the colour palette (light & dark)
        ├── App.css               ⚠️ Leftover from the Vite starter. Unused — nothing imports it.
        ├── assets/               ⚠️ hero.png, react.svg, vite.svg — also leftovers, unused
        ├── components/
        │   ├── Navbar.jsx        The top navigation bar (reused on every page)
        │   └── Navbar.css
        └── pages/
            ├── UploadMeeting.jsx ⭐ The only real page. Everything happens here.
            └── UploadMeeting.css
```

The four files marked ⭐ are the entire application. If you read those, you have read the project.

---

## 4. The frontend, step by step

### 4.1 How the app starts

When the browser opens http://localhost:5173, this chain happens:

```text
index.html
   │  contains an empty <div id="root"></div>
   │  and loads /src/main.jsx
   ▼
main.jsx
   │  finds that empty div and tells React to fill it
   │  wraps everything in <BrowserRouter> (enables page URLs)
   ▼
App.jsx
   │  looks at the URL and picks a page
   ▼
UploadMeeting.jsx
      draws the actual page (and includes <Navbar /> at the top)
```

**`main.jsx`** is only 13 lines. Two things in it are worth knowing:

- `<StrictMode>` — a development-only helper. It deliberately runs some of your code **twice** to
  expose bugs. If you ever see something happen twice in development but once in production, this is
  why. It is not a bug.
- `<BrowserRouter>` — turns on client-side routing, so changing the URL swaps the page *without* the
  browser doing a full reload.

### 4.2 Routing (`App.jsx`)

```jsx
<Routes>
  <Route path="/"       element={<Navigate to="/upload" replace />} />
  <Route path="/upload" element={<UploadMeeting />} />
  <Route path="*"       element={<Navigate to="/upload" replace />} />
</Routes>
```

Read it as three rules:

1. Visit `/` → get bounced to `/upload`.
2. Visit `/upload` → show the Upload Meeting page.
3. Visit **anything else** (`*` is the catch-all) → also bounced to `/upload`.

So every possible URL lands on the same page. That is intentional — there is only one page so far.

### 4.3 The navigation bar (`components/Navbar.jsx`)

The nav links are not hard-coded in the HTML. They come from a plain array at the top of the file:

```js
const navigationItems = [
  { label: "Dashboard",       path: "/dashboard", available: false },
  { label: "Upload Meeting",  path: "/upload",    available: true  },
  { label: "Meeting History", path: "/history",   available: false },
];
```

The component loops over that array with `.map()` and, for each item, checks `available`:

- `available: true` → renders a real `<NavLink>` you can click. `NavLink` is special: it knows
  whether its URL is the current one, which is how the active tab gets highlighted.
- `available: false` → renders a greyed-out `<span>` with `title="Coming soon"`. Not clickable.

**This is the pattern to follow when you build Dashboard or Meeting History:** build the page, add
the route in `App.jsx`, then flip `available` to `true`. Nothing else needs to change.

### 4.4 The upload page (`pages/UploadMeeting.jsx`)

This is the biggest file (~350 lines) and where you will spend most of your time. It is one React
component that holds all its data in **state**.

#### State: the component's memory

`useState` gives a component a piece of memory that, when changed, redraws the screen automatically.

```js
const [meetingTitle, setMeetingTitle] = useState("");
//     ↑ current value   ↑ function to change it   ↑ starting value
```

The page keeps eight pieces of state:

| State | Holds |
|---|---|
| `selectedFile` | The video file the user picked (or `null`) |
| `meetingTitle` | Text from the title box |
| `meetingDate` | The chosen date |
| `notes` | The free-text notes box |
| `analysisMode` | `"audio"` or `"audio-visual"` |
| `fileError` | Error message about the file, if any |
| `meetingDateError` | Error message about the date, if any |
| `statusMessage` | The confirmation shown after submitting |

There is also one **ref**:

```js
const fileInputRef = useRef(null);
```

A ref is an escape hatch that gives you the real DOM element. It is used here because file inputs
cannot be controlled with state like a text box can. Two things need it:

- **Clearing the file** (`handleRemoveFile`) — `fileInputRef.current.value = ""` is the only way to
  make the browser forget the selected file.
- **The "Change" button** (`handleChangeFile`) — `fileInputRef.current?.click()` programmatically
  clicks the hidden file input, so the user gets the file picker from a nicer-looking button.

#### Validation rule 1: it must be a video

```js
function isVideoFile(file) {
  if (file.type) return file.type.startsWith("video/");
  return videoFileExtensions.some((ext) => fileName.endsWith(ext));
}
```

Two attempts, in order. Normally the browser tells you the file's MIME type (`video/mp4`), so the
first line answers it. But `file.type` is sometimes an empty string for unusual formats, so the
fallback checks the filename ending against a list (`.mp4 .mov .avi .mkv .webm .m4v`).

If it is not a video: clear the selection, show an error, and reset the input.

#### Validation rule 2: the date cannot be in the future

You will notice the file computes today's date **twice**, in two different ways:

```js
const now = new Date();
const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-...`;
const today = new Date().toISOString().split("T")[0];   // ← declared, never used
```

`todayString` is the one that is actually used (both for the `max` attribute on the input and for the
comparison). `today` is dead code left over from an earlier attempt — **safe to delete.**

The difference matters and is worth understanding: `toISOString()` converts to UTC first, so for
someone in Australia it can return *yesterday's* date. The manual version uses local time, which is
what a user means by "today". The correct one was kept.

The check itself works because ISO dates (`2026-08-13`) sort correctly as plain strings, so
`selectedDate > todayString` is a valid comparison — no date library needed.

Note the defence in depth: `max={todayString}` on the input stops most users at the browser level,
and `handleMeetingDateChange` catches anyone who gets past it.

#### Submitting

```js
const handleSubmit = (event) => {
  event.preventDefault();            // stop the browser's default full-page reload
  if (!selectedFile) { ...error...; return; }
  const meetingName = meetingTitle.trim() || selectedFile.name;
  setStatusMessage(`${meetingName} is ready for analysis. This demo did not upload...`);
};
```

That is the whole thing. **It shows a message and stops.** No file is uploaded, no request is sent.

The `||` on the third line is a common shortcut: if the trimmed title is an empty string (which
JavaScript treats as false), fall back to the filename.

#### Accessibility

The page is unusually careful about this, and it is worth copying the pattern:

- `aria-live="polite"` on the status region — a screen reader announces new messages without
  interrupting whatever it is currently reading.
- `role="alert"` on the file error — this one *does* interrupt, because it is urgent.
- `aria-describedby` links each input to its help text and error text, so a screen reader reads them
  together with the field.
- `aria-invalid` marks a field as bad, `aria-disabled` marks the unavailable nav links.
- Every `<input>` has a matching `<label htmlFor="...">`.

### 4.5 Styling

Plain CSS — no Tailwind, no styled-components. Each component has a `.css` file next to it that the
component imports directly.

All colours come from CSS variables defined once in `index.css`:

```css
:root {
  --accent: #7c3aed;     /* purple */
  --bg: #f7f6f9;
  --surface: #ffffff;
  /* ...and ~20 more */
}

@media (prefers-color-scheme: dark) {
  :root { --accent: #b794f6; --bg: #121016; /* same names, dark values */ }
}
```

This is why dark mode works "for free": the dark block redefines the *same variable names*, so every
rule that says `color: var(--accent)` follows automatically.

**Rule of thumb: never write a raw hex colour in a component's CSS.** Use a variable, or add a new
one to both blocks in `index.css`.

Class names follow BEM-ish naming — `block__element--modifier`, e.g. `navbar__link--active`,
`upload-page__subtitle`, `video-upload--invalid`.

---

## 5. The backend

This is the entire file, `backend/app/main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
def upload():
    return {"status": "ok"}
```

- `@app.get("/health")` — a **decorator** that registers the function below it as the handler for
  `GET /health`. Used to confirm the server is alive.
- `@app.post("/upload")` — registers `POST /upload`. **It takes no parameters and ignores the
  request entirely.** It is a placeholder that always replies `{"status": "ok"}`.

FastAPI turns the returned dictionary into JSON automatically, and generates interactive API docs at
http://127.0.0.1:8000/docs where you can try both endpoints in the browser.

`requirements.txt` lists FastAPI, Uvicorn (the server that runs it), Pydantic (data validation) and
`python-multipart` — that last one is specifically for receiving uploaded files, so it was installed
in anticipation of real upload handling.

---

## 6. What is real, and what is a placeholder

Knowing the difference will save you an afternoon of confusion.

**Works today:**

- The full Upload Meeting page: file picking, change/remove, title, date, notes, mode selection
- Video-file validation and future-date validation
- Routing and the navigation bar
- Light/dark theming and responsive layout
- The two backend endpoints (they return `{"status": "ok"}` and nothing more)

**Does not exist yet:**

- ❌ **Any connection between frontend and backend.** Grep for `fetch` or `axios` in `frontend/src/` —
  zero results. The two halves have never spoken.
- ❌ Actual file upload or storage
- ❌ Audio extraction, transcription, AI summarising — none of it
- ❌ The Dashboard and Meeting History pages (nav entries only)
- ❌ Any database, login, or user accounts
- ❌ Any tests, anywhere in the repo
- ❌ CORS setup on the backend (see below)

The UI is honest about this — the page literally says *"This demo did not upload or analyse your
video."*

---

## 7. Gotchas you will hit

**1. `App.css` and `src/assets/` are leftovers.** They came with the Vite starter template. `App.css`
styles a `.counter` and a `.hero` that no longer exist, and nothing imports it. Don't waste time
trying to understand them; they can be deleted.

**2. `requirements.txt` is UTF-16 encoded.** It was created by `pip freeze > requirements.txt` in
PowerShell, which writes UTF-16 by default. Windows pip copes, but on macOS or Linux
`pip install -r requirements.txt` may fail with an encoding error. Fix by re-saving the file as
UTF-8, or on Windows use `pip freeze | Out-File -Encoding utf8 requirements.txt`.

**3. You will need CORS before the frontend can call the backend.** Browsers block requests from
`localhost:5173` to `localhost:8000` because the ports differ. The backend currently has no CORS
middleware, so the first `fetch` you write will fail with a confusing browser error. The fix is
`CORSMiddleware` in `main.py`, allowing the Vite origin.

**4. Run the backend from the right folder.** From `backend/`, use `uvicorn app.main:app --reload` —
`app.main` is the *path* `app/main.py`, and the second `app` is the `FastAPI()` variable inside it.

**5. `const today` in `UploadMeeting.jsx` is unused.** Explained in [4.4](#validation-rule-2-the-date-cannot-be-in-the-future).

---

## 8. If you are picking up the next task

The obvious next step is **connecting the two halves**. Roughly:

1. **Backend** — make `/upload` actually accept a file:
   `def upload(file: UploadFile = File(...), title: str = Form(...))`. FastAPI fills those in from the
   request for you. Save to an `uploads/` folder (already in `.gitignore`).
2. **Backend** — add `CORSMiddleware` so the browser will allow the request.
3. **Frontend** — in `handleSubmit`, build a `FormData`, append the file and fields, and
   `await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData })`.
4. **Frontend** — add `isUploading` state so the button can show a loading state and be disabled
   mid-request, and handle the failure case in `statusMessage`.

Test the backend side first at http://127.0.0.1:8000/docs — you can upload a file there without
writing any frontend code, which tells you which half is broken when something goes wrong.

**Branching:** work on a feature branch (`feature/your-thing`), never directly on `main`. The full git
workflow is in section 10 of the [main README](../README.md).
