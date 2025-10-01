# 1) Executive Summary
- This document outlines the development plan for a FastAPI backend to support the Samsung Notes web application. The backend will provide persistent storage and API endpoints for all CRUD (Create, Read, Update, Delete) operations currently handled by the frontend's `localStorage`.
- Constraints honored: FastAPI (Python 3.12, async), MongoDB Atlas with Motor/Pydantic, no Docker, frontend-driven manual testing, and a `main`-only Git workflow.
- The sprint count is dynamic and will cover all features identified in the frontend audit.

# 2) In-scope & Success Criteria
- **In-scope:**
  - User authentication (signup, login, logout).
  - Full CRUD functionality for notes.
  - API endpoints to list, search, and sort notes.
  - Secure data storage in MongoDB Atlas.
- **Success criteria:**
  - All frontend features are fully supported by the backend API.
  - Each sprint's functionality passes manual tests conducted through the user interface.
  - The application is successfully deployed and accessible.
  - Code is pushed to the `main` branch on GitHub after each successful sprint.

# 3) API Design
- **Conventions:**
  - Base path: `/api/v1`
  - Errors will return a consistent JSON object: `{ "detail": "Error message" }`
- **Endpoints:**
  - **Auth**
    - `POST /api/v1/auth/signup` - Register a new user.
      - Request: `{ "email": "user@example.com", "password": "password123" }`
      - Response: `{ "access_token": "...", "token_type": "bearer" }`
    - `POST /api/v1/auth/login` - Authenticate a user.
      - Request: `{ "username": "user@example.com", "password": "password123" }` (Note: using form data for OAuth2PasswordRequestForm)
      - Response: `{ "access_token": "...", "token_type": "bearer" }`
    - `GET /api/v1/auth/me` - Get current user details.
      - Response: `{ "id": "...", "email": "user@example.com" }`
  - **Notes**
    - `GET /api/v1/notes` - List, search, and sort notes for the authenticated user.
      - Query Params: `search_query` (string), `sort_by` ('newest' | 'oldest' | 'title')
      - Response: `[{ "id": "...", "title": "...", "content": "...", "createdAt": "...", "updatedAt": "..." }]`
    - `POST /api/v1/notes` - Create a new note.
      - Request: `{ "title": "New Note", "content": "" }`
      - Response: `{ "id": "...", "title": "New Note", "content": "", "createdAt": "...", "updatedAt": "..." }`
    - `GET /api/v1/notes/{note_id}` - Get a single note by ID.
      - Response: `{ "id": "...", "title": "...", "content": "...", "createdAt": "...", "updatedAt": "..." }`
    - `PUT /api/v1/notes/{note_id}` - Update a note.
      - Request: `{ "title": "Updated Title", "content": "Updated content" }`
      - Response: `{ "id": "...", "title": "Updated Title", "content": "Updated content", "createdAt": "...", "updatedAt": "..." }`
    - `DELETE /api/v1/notes/{note_id}` - Delete a note.
      - Response: `204 No Content`

# 4) Data Model (MongoDB Atlas)
- **Collections:**
  - **users**
    - `_id`: ObjectId (Primary Key)
    - `email`: string, required, unique
    - `hashed_password`: string, required
  - **notes**
    - `_id`: ObjectId (Primary Key)
    - `owner_id`: ObjectId, required (reference to `users._id`)
    - `title`: string, required
    - `content`: string, required
    - `createdAt`: datetime, required
    - `updatedAt`: datetime, required
- **Example Document (`notes`):**
  ```json
  {
    "_id": "635f8f3b9b5a2b1e7a3e7b2a",
    "owner_id": "635f8f1a9b5a2b1e7a3e7b29",
    "title": "My First Note",
    "content": "<h1>Hello World</h1><p>This is a rich text note.</p>",
    "createdAt": "2025-09-30T18:00:00.000Z",
    "updatedAt": "2025-09-30T18:05:00.000Z"
  }
  ```

# 5) Frontend Audit & Feature Map
- **`pages/Index.tsx` (Main View)**
  - **Purpose:** Main application layout, orchestrates `NotesList` and `NoteEditor`.
  - **Backend Capability:** Requires all note-related endpoints (`/api/v1/notes/*`).
- **`components/NotesList.tsx`**
  - **Purpose:** Displays a searchable and sortable list of notes. Handles note creation and deletion triggers.
  - **Backend Capability:**
    - `GET /api/v1/notes`: To display the list.
    - `POST /api/v1/notes`: To create a new note.
    - `DELETE /api/v1/notes/{note_id}`: To delete a note.
- **`components/NoteEditor.tsx`**
  - **Purpose:** Provides a rich text editor for creating and updating note content. Includes auto-save functionality.
  - **Backend Capability:** `PUT /api/v1/notes/{note_id}` for saving updates.
- **`hooks/useNotes.ts`**
  - **Purpose:** Contains all frontend logic for note state management (currently using `localStorage`).
  - **Backend Capability:** This hook will be refactored to make API calls to the backend instead of using `localStorage`.

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: Environment name (e.g., `development`)
- `PORT`: HTTP port (e.g., `8000`)
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: Secret key for signing JWTs.
- `JWT_EXPIRES_IN`: Access token lifetime in seconds (e.g., `3600`).
- `CORS_ORIGINS`: Allowed frontend origins (e.g., `http://localhost:5173`).

# 7) Testing Strategy (Manual via Frontend)
- **Policy:** All backend features will be validated by interacting with the connected frontend UI. Network tab in browser DevTools can be used to inspect API requests and responses.
- **Post-sprint:** If all manual tests for a sprint pass, the code will be committed and pushed to the `main` branch on GitHub.

# 8) Dynamic Sprint Plan & Backlog (S0…Sn)

- **S0 - Environment Setup & Frontend Connection**
  - **Objectives:**
    - Create a skeleton FastAPI application with a `/api/v1` base path.
    - Implement a `/healthz` endpoint that checks database connectivity.
    - Configure environment variables and CORS.
    - Initialize a Git repository and push it to GitHub.
  - **Definition of Done:**
    - The FastAPI server runs locally.
    - The `/healthz` endpoint returns a `200 OK` status and indicates DB connection status.
    - The frontend can successfully make a request to the backend.
    - The project is on GitHub with `main` as the default branch.
  - **Manual Test Checklist (Frontend):**
    - Start the backend server.
    - Open the frontend application.
    - Verify in the browser's Network tab that a call to `/healthz` is successful.
  - **User Test Prompt:**
    - "Please run the backend and frontend. Open the web app and confirm there are no connection errors in the browser console."
  - **Post-sprint:** Commit and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives:**
    - Implement user signup, login, and current user (`/me`) endpoints.
    - Hash passwords using Argon2.
    - Issue JWTs upon successful login.
    - Create a dependency to protect note-related endpoints.
  - **Definition of Done:**
    - Users can be created via the API.
    - Users can log in and receive a JWT.
    - Protected endpoints return a 401 Unauthorized error without a valid token.
  - **Manual Test Checklist (Frontend):**
    - (Assuming temporary UI for login/signup) Create a new user.
    - Log in with the new user.
    - Attempt to access a protected notes endpoint and verify success.
    - Log out and attempt to access the same endpoint, verifying failure.
  - **User Test Prompt:**
    - "Test the user registration and login flow. Ensure you can access your notes only when logged in."
  - **Post-sprint:** Commit and push to `main`.

- **S2 - Notes CRUD Implementation**
  - **Objectives:**
    - Implement all CRUD endpoints for notes (`GET`, `POST`, `PUT`, `DELETE`).
    - Associate notes with the authenticated user (`owner_id`).
    - Refactor the `useNotes.ts` hook in the frontend to use the new API endpoints instead of `localStorage`.
  - **Definition of Done:**
    - A logged-in user can create, view, update, and delete their own notes through the frontend.
    - Notes are correctly persisted in the MongoDB database.
    - Users cannot access or modify notes belonging to other users.
  - **Manual Test Checklist (Frontend):**
    - Log in to the application.
    - Create a new note and verify it appears in the list.
    - Select the note and edit its title and content; verify the changes are saved.
    - Search for the note using the search bar.
    - Delete the note and confirm it is removed from the list.
  - **User Test Prompt:**
    - "Log in and test all note-taking features. Can you create, edit, search, and delete notes successfully? Ensure everything saves correctly after you refresh the page."
  - **Post-sprint:** Commit and push to `main`.