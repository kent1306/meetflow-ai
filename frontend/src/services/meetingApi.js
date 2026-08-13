/**
 * All communication with the FastAPI backend lives here.
 *
 * Keeping it in one place means components never deal with URLs, HTTP status
 * codes or JSON parsing - they just call a function and get data back, or get
 * an Error whose message is already safe to show to the user.
 */

// Vite exposes any env var starting with VITE_ on import.meta.env. The fallback
// keeps local development working with no .env file at all.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const NETWORK_ERROR_MESSAGE =
  "Could not reach the server. Check that the backend is running on port 8000.";

/**
 * Turn a finished response into data, or throw an Error worth displaying.
 *
 * fetch() only rejects when the request never completes (server down, DNS
 * failure, CORS blocked). A 400 or 500 is still a "successful" request as far
 * as fetch is concerned, so status has to be checked by hand.
 */
async function readResponse(response, fallbackMessage) {
  if (!response.ok) {
    // FastAPI puts its error text in a "detail" field. If the body is missing
    // or is not JSON, fall back to a generic message rather than crashing here.
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.detail || `${fallbackMessage} (status ${response.status})`,
    );
  }

  return response.json();
}

/**
 * Wrap fetch so every network failure produces the same friendly message.
 *
 * A failed fetch throws a TypeError, which would otherwise reach the UI as
 * something unhelpful like "Failed to fetch".
 */
async function request(path, options, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  return readResponse(response, fallbackMessage);
}

/**
 * Upload one meeting recording plus its details.
 *
 * Returns the saved meeting: { meetingId, filename, sizeBytes, title,
 * meetingDate, notes, analysisMode }.
 */
export async function uploadMeeting({
  file,
  title,
  meetingDate,
  notes,
  analysisMode,
}) {
  // FormData sends the file as multipart/form-data. Never set a Content-Type
  // header by hand - the browser adds the boundary the server needs to split
  // the parts apart.
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("meetingDate", meetingDate);
  formData.append("notes", notes);
  formData.append("analysisMode", analysisMode);

  const result = await request(
    "/upload",
    { method: "POST", body: formData },
    "Upload failed.",
  );

  return result.meeting;
}

/** Fetch every meeting uploaded since the backend last started. */
export async function getMeetings() {
  const result = await request("/meetings", undefined, "Could not load meetings.");

  return result.meetings;
}

/** Check that the backend is awake. Returns true or false, never throws. */
export async function checkHealth() {
  try {
    const result = await request("/health", undefined, "Health check failed.");

    return result.status === "ok";
  } catch {
    return false;
  }
}
