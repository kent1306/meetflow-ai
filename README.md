# MeetFlow AI

MeetFlow AI is an AI-powered meeting assistant web application.

The current project uses:

- **Frontend:** React + Vite + JavaScript
- **Backend:** Python + FastAPI
- **API communication:** REST API
- **Version control:** Git + GitHub

The application is being developed so users can upload meeting videos, process meeting content, and later generate summaries, action items, key decisions, follow-up suggestions, and optional visual analysis.

---

## 1. Project Structure

```text
meetflow-ai/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── requirements.txt
│   └── .venv/              # Local only - not pushed to GitHub
│
├── docs/
├── .gitignore
└── README.md
```

> `node_modules/` and `.venv/` are intentionally excluded from GitHub.  
> Each developer must recreate them locally after cloning the repository.

---

# 2. Prerequisites

Before setting up the project, install:

- **Git**
- **Node.js and npm**
- **Python**
- **VS Code** (recommended)

Check that they are available:

```bash
git --version
node --version
npm --version
python --version
```

For Python on Windows, use the official Windows version of Python where possible.

A correct Windows virtual environment should normally contain:

```text
.venv/
├── Include/
├── Lib/
└── Scripts/
```

If the virtual environment contains `bin/` instead of `Scripts/`, Python may be coming from MSYS2/MinGW rather than the standard Windows Python installation.

---

# 3. Clone the Repository

Clone the project:

```bash
git clone <REPOSITORY_URL>
```

Then enter the project folder:

```bash
cd meetflow-ai
```

Example:

```bash
git clone https://github.com/<username>/meetflow-ai.git
cd meetflow-ai
```

---

# 4. Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install all frontend dependencies:

```bash
npm install
```

`npm install` reads:

```text
package.json
package-lock.json
```

and recreates the local `node_modules/` folder.

Start the frontend development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

Stop the frontend server with:

```text
Ctrl + C
```

---

# 5. Backend Setup

Open a new terminal and go to the backend folder:

```bash
cd backend
```

## 5.1 Create a Python Virtual Environment

On Windows:

```bash
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

After activation, the terminal should look similar to:

```text
(.venv) PS ...\meetflow-ai\backend>
```

If PowerShell blocks script execution, run this for the current terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

Then activate the environment again:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 5.2 Install Backend Dependencies

With `(.venv)` active, install all Python dependencies from:

```text
requirements.txt
```

Run:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Do **not** manually install every package if `requirements.txt` is available.

---

# 6. Run the FastAPI Backend

Make sure the terminal is inside:

```text
meetflow-ai/backend
```

and the virtual environment is active.

Run:

```bash
uvicorn app.main:app --reload
```

The backend normally runs at:

```text
http://127.0.0.1:8000
```

Test the backend health endpoint:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

FastAPI API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

Stop the backend server with:

```text
Ctrl + C
```

---

# 7. Run Frontend and Backend Together

For local development, use two terminals.

### Terminal 1 — Backend

```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The frontend communicates with the FastAPI backend using HTTP requests.

---

# 8. Updating Backend Dependencies

If a new Python package is installed, for example:

```bash
pip install <package-name>
```

update `requirements.txt`:

```bash
pip freeze > requirements.txt
```

Then commit the updated file to GitHub.

Example:

```bash
git add requirements.txt
git commit -m "chore: update backend requirements"
git push
```

Never push the `.venv/` folder.

---

# 9. Updating Frontend Dependencies

If a new frontend package is installed:

```bash
npm install <package-name>
```

npm automatically updates:

```text
package.json
package-lock.json
```

Commit both files when necessary.

Example:

```bash
git add package.json package-lock.json
git commit -m "chore: update frontend dependencies"
git push
```

Never push the `node_modules/` folder.

---

# 10. Git Workflow

Before starting work:

```bash
git status
git pull
```

Create or switch to a feature branch:

```bash
git checkout -b feature/example-feature
```

or, if the branch already exists:

```bash
git checkout feature/example-feature
git pull
```

After making changes:

```bash
git status
git add .
git commit -m "feat: describe the change"
git push
```

For the first push of a new branch:

```bash
git push -u origin feature/example-feature
```

Recommended workflow:

```text
main
  ↓
feature branch
  ↓
code
  ↓
test
  ↓
commit
  ↓
push
  ↓
Pull Request
  ↓
merge into main
```

Avoid developing directly on `main`.

---

# 11. Pulling an Existing Remote Branch

Fetch the latest branch information:

```bash
git fetch
```

View all branches:

```bash
git branch -a
```

If the branch exists on GitHub but not locally:

```bash
git checkout -b feature/example-feature origin/feature/example-feature
```

If it already exists locally:

```bash
git checkout feature/example-feature
git pull
```

---

# 12. Environment Files

Sensitive information such as API keys should later be stored in:

```text
backend/.env
```

Example:

```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url_here
```

`.env` must remain in `.gitignore`.

Never commit API keys, passwords, tokens, or secrets to GitHub.

---

# 13. Common Problems

## `py` is not recognized

Use:

```bash
python --version
```

instead.

The `py` launcher is not installed on every Windows computer.

---

## `.venv` contains `bin/` instead of `Scripts/`

Check which Python installation is being used:

```powershell
where.exe python
```

and:

```bash
python -c "import sys; print(sys.executable); print(sys.version)"
```

If the result points to something such as:

```text
C:\msys64\...
```

install or use the official Windows Python installation and recreate `.venv`.

---

## FastAPI cannot find `main`

From the `backend/` folder, use:

```bash
uvicorn app.main:app --reload
```

because the file is located at:

```text
backend/app/main.py
```

Do not use:

```bash
uvicorn main:app --reload
```

unless `main.py` is directly inside the backend folder.

---

## Frontend dependencies are missing

Run:

```bash
cd frontend
npm install
```

---

## Backend dependencies are missing

Activate `.venv`, then run:

```bash
pip install -r requirements.txt
```

---

# 14. Quick Setup for a New Machine

After cloning the repository:

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Open another terminal:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
API Docs: http://localhost:8000/docs
```

---

## Current Development Status

Current environment setup:

- React + Vite frontend
- FastAPI backend
- Frontend-to-backend connection
- Git/GitHub repository
- Feature branch workflow
- Upload Meeting page under development

Future functionality may include:

- Meeting video upload
- FFmpeg audio extraction
- Speech-to-text
- AI meeting summaries
- Action item extraction
- Meeting history
- Google Calendar integration
- Optional visual meeting analysis
