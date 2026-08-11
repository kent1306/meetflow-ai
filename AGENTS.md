# MeetFlow AI - Codex Instructions

## Project Context

This is a final-year university project called MeetFlow AI.

The project is being developed by two students who are still learning full-stack web development.

Prioritize:
- readable code
- simple architecture
- beginner-friendly implementations
- maintainability
- clear separation between frontend and backend

Avoid unnecessarily advanced patterns or abstractions.

---

## Current Technology Stack

Frontend:
- React
- Vite
- JavaScript
- React Router
- CSS

Backend:
- Python
- FastAPI

Future technologies may include:
- PostgreSQL
- FFmpeg
- OpenCV
- AI APIs
- Google Calendar API

Do not replace the existing technology stack unless explicitly requested.

---

## Do Not Introduce

Do not introduce any of the following unless explicitly requested:

- TypeScript
- Next.js
- Node.js backend
- Supabase
- Firebase
- new frontend frameworks
- microservices
- Docker
- Kubernetes
- Redis
- complex state-management libraries
- unnecessary dependencies

Do not replace FastAPI.

Do not migrate the React + Vite frontend to another framework.

---

## Scope Control

Only work on the feature requested.

Do not:
- implement unrelated features
- refactor unrelated files
- modify backend code during frontend-only tasks
- modify frontend code during backend-only tasks unless required
- redesign the entire project when asked for a small change

Prefer small, focused changes.

---

## Before Editing

Before making a significant change:

1. Inspect the relevant existing files.
2. Understand the current project structure.
3. Identify which files need to change.
4. Reuse existing components and styles when appropriate.

Do not create duplicate components or utilities if an existing implementation can be reused.

For larger tasks, briefly explain the planned changes before implementation.

---

## Frontend Rules

Use:
- React functional components
- JavaScript
- React hooks such as useState and useEffect when appropriate
- reusable components where there is a clear responsibility
- simple CSS
- React Router for navigation

Keep page-level components inside:

frontend/src/pages/

Keep reusable UI components inside:

frontend/src/components/

Keep backend API functions inside:

frontend/src/services/

Example:

frontend/src/services/meetingApi.js

Avoid placing API request logic throughout multiple page components.

Do not over-componentize.

Do not create separate components for trivial elements that are only used once.

A good rule:
- Page = full screen/page
- Component = meaningful reusable or independently managed section

---

## Backend Rules

Backend code uses Python and FastAPI.

Application code should remain inside:

backend/app/

Keep API routes, processing logic, and future services separated when complexity grows.

Do not put large amounts of processing logic directly inside main.py.

Do not introduce a second backend.

---

## API Rules

Frontend and backend communicate through REST APIs.

Current local development URLs:

Frontend:
http://localhost:5173

Backend:
http://localhost:8000

When adding frontend API integration:
- use a service file
- handle loading states
- handle errors
- do not hard-code secrets
- do not invent API endpoints without checking the backend first

If a required backend endpoint does not exist, explain that instead of silently creating an unrelated architecture.

---

## Code Style

Prefer straightforward code over clever code.

Use:
- descriptive variable names
- descriptive function names
- small focused functions
- readable JSX
- clear file names

Avoid:
- excessive abstraction
- deeply nested logic
- unnecessary design patterns
- overly compressed one-line code

The code should be understandable by a student who knows programming fundamentals, Python, OOP, and DSA but is still learning React and web development.

---

## Comments

Do not add comments explaining obvious syntax.

Add comments only when they clarify:
- non-obvious logic
- important architectural decisions
- API behaviour
- complex processing steps

---

## Dependencies

Do not install a new npm or Python package unless it is genuinely necessary.

Before adding a dependency:
1. Check whether the project already has a suitable solution.
2. Prefer built-in browser, React, Python, or existing project functionality.
3. Explain why the new dependency is needed.

If a frontend dependency is added:
- update package.json
- update package-lock.json

If a backend Python dependency is added:
- update requirements.txt

Never commit:
- node_modules/
- .venv/
- .env
- API keys
- passwords
- secrets

---

## Git Safety

Do not automatically commit or push changes unless explicitly requested.

Do not switch branches unless explicitly requested.

Do not modify main directly unless explicitly requested.

Before large changes, inspect:

git status

Avoid overwriting uncommitted user changes.

---

## Testing

After implementing a feature:

1. Check for obvious errors.
2. Run the relevant existing test/lint/build command when available.
3. Verify imports and file paths.
4. Explain how the user can manually test the feature.

For frontend work, verify that the project can still run with:

npm run dev

For backend work, verify the FastAPI application can run with:

uvicorn app.main:app --reload

Do not claim that something works unless it was actually tested or clearly state that it was not run.

---

## Communication

After completing a task, briefly report:

1. What was changed
2. Which files were modified or created
3. Any dependency that was added
4. How to test the result
5. Any important limitation or next step

When explaining code to the user, assume they understand programming fundamentals but are new to React/full-stack development.

Use simple explanations and connect unfamiliar JavaScript/React concepts to familiar programming concepts when helpful.

---

## MeetFlow AI Product Scope

The core intended flow is:

Upload meeting video
→ FastAPI receives video
→ FFmpeg extracts audio
→ Speech-to-text generates transcript
→ AI analyses meeting
→ Meeting dashboard displays:
   - summary
   - key decisions
   - action items
   - transcript
   - follow-up meeting suggestions

Optional advanced functionality:
- visual meeting analysis
- OCR
- frame detection
- Google Calendar integration
- meeting history

Do not implement advanced functionality before the core flow unless explicitly requested.