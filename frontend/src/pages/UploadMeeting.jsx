import { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import RequestStatus from "../components/RequestStatus";
import { uploadMeeting } from "../services/meetingApi";
import "./UploadMeeting.css";

const videoFileExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];
const INITIAL_UPLOAD_STATE = { type: "idle", message: "" };

function isVideoFile(file) {
  const fileName = file.name.toLowerCase();

  if (file.type) {
    return file.type.startsWith("video/");
  }

  return videoFileExtensions.some((extension) => fileName.endsWith(extension));
}

function UploadMeeting() {
  const fileInputRef = useRef(null);
  const uploadInProgressRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [analysisMode, setAnalysisMode] = useState("audio");
  const [fileError, setFileError] = useState("");
  const [uploadState, setUploadState] = useState(INITIAL_UPLOAD_STATE);
  const [meetingDateError, setMeetingDateError] = useState("");
  const isUploading = uploadState.type === "loading";
  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const clearUploadStatus = () => {
    if (!uploadInProgressRef.current) {
      setUploadState((currentState) =>
        currentState.type === "idle" ? currentState : INITIAL_UPLOAD_STATE,
      );
    }
  };

  const handleMeetingDateChange = (event) => {
    const selectedDate = event.target.value;
    clearUploadStatus();

    if (!selectedDate) {
      setMeetingDate("");
      setMeetingDateError("");
      return;
    }

    if (selectedDate > todayString) {
      setMeetingDateError("Meeting date cannot be in the future.");
      return;
    }

    setMeetingDate(selectedDate);
    setMeetingDateError("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!isVideoFile(file)) {
      setSelectedFile(null);
      setFileError(
        "Please select a valid video file, such as MP4, MOV, AVI, MKV or WebM.",
      );
      clearUploadStatus();
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setFileError("");
    clearUploadStatus();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
    clearUploadStatus();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    // Stop the browser from doing its own form submission, which would reload
    // the page and throw away everything React is holding in state.
    event.preventDefault();

    if (uploadInProgressRef.current) {
      return;
    }

    if (!selectedFile) {
      setFileError("Please select a video before continuing.");
      return;
    }

    if (meetingDateError) {
      return;
    }

    const meetingName = meetingTitle.trim() || selectedFile.name;

    uploadInProgressRef.current = true;
    setUploadState({
      type: "loading",
      message: `Uploading ${meetingName}...`,
    });

    try {
      // meetingApi handles the request details. Anything it throws already has
      // a message that is safe to show the user.
      const meeting = await uploadMeeting({
        file: selectedFile,
        title: meetingName,
        meetingDate,
        notes,
        analysisMode,
      });

      setUploadState({
        type: "success",
        message: `${meeting.filename} was uploaded successfully. Analysis is not available yet.`,
      });
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Upload failed. Please try again.";

      setUploadState({ type: "error", message: errorMessage });
    } finally {
      uploadInProgressRef.current = false;
    }
  };

  let formActionMessage = "Select a video to enable analysis.";

  if (selectedFile) {
    formActionMessage = "Your video is ready to upload.";
  }

  if (isUploading) {
    formActionMessage = "Please wait while your video uploads.";
  }

  return (
    <>
      <Navbar />
      <main className="upload-page">
      <header className="upload-page__header">
        <h1>Upload Meeting</h1>
        <p className="upload-page__subtitle">
          Choose a meeting video and add some context. In a later version,
          MeetFlow AI will use AI to create a transcript, summary, decisions and
          action items.
        </p>
      </header>

      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="upload-layout" aria-busy={isUploading}>
          <div className="upload-form__sections">
            <section className="form-section" aria-labelledby="upload-heading">
              <div className="section-heading">
                <div>
                  <h2 id="upload-heading">Upload Video</h2>
                  <p>Select the meeting recording you want to analyse.</p>
                </div>
                <span className="required-label">Required</span>
              </div>

              <div
                className={`video-upload${fileError ? " video-upload--invalid" : ""}`}
              >
                <label htmlFor="meeting-video">Meeting video</label>
                <input
                  ref={fileInputRef}
                  id="meeting-video"
                  name="meetingVideo"
                  type="file"
                  accept="video/*"
                  required
                  disabled={isUploading}
                  aria-describedby={
                    fileError ? "video-help video-error" : "video-help"
                  }
                  aria-invalid={Boolean(fileError)}
                  onChange={handleFileChange}
                />
                <p id="video-help" className="field-help">
                  Choose a video file such as MP4, MOV, AVI, MKV or WebM.
                </p>
              </div>

              {fileError && (
                <p id="video-error" className="validation-message" role="alert">
                  {fileError}
                </p>
              )}

              {selectedFile && (
                <div className="selected-file" aria-live="polite">
                  <div className="selected-file__details">
                    <span>Selected video</span>
                    <strong>{selectedFile.name}</strong>
                  </div>
                  <div className="selected-file__actions">
                    <button
                      className="change-file-button"
                      type="button"
                      disabled={isUploading}
                      onClick={handleChangeFile}
                    >
                      Change
                    </button>
                    <button
                      className="remove-file-button"
                      type="button"
                      disabled={isUploading}
                      onClick={handleRemoveFile}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="form-section" aria-labelledby="details-heading">
              <div className="section-heading">
                <div>
                  <h2 id="details-heading">Meeting Details</h2>
                  <p>Add optional details to give the future analysis context.</p>
                </div>
              </div>

              <div className="meeting-fields">
                <div className="form-field">
                  <label htmlFor="meeting-title">Meeting Title</label>
                  <input
                    id="meeting-title"
                    name="meetingTitle"
                    type="text"
                    value={meetingTitle}
                    placeholder="For example, Weekly Project Check-in"
                    maxLength="100"
                    disabled={isUploading}
                    onChange={(event) => {
                      setMeetingTitle(event.target.value);
                      clearUploadStatus();
                    }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="meeting-date">
                    Meeting Date
                  </label>

                  <input
                    id="meeting-date"
                    name="meetingDate"
                    type="date"
                    value={meetingDate}
                    max={todayString}
                    disabled={isUploading}
                    aria-describedby={
                      meetingDateError ? "meeting-date-error" : undefined
                    }
                    aria-invalid={Boolean(meetingDateError)}
                    onChange={handleMeetingDateChange}
                  />

                  {meetingDateError && (
                    <p
                      id="meeting-date-error"
                      className="validation-message"
                      role="alert"
                    >
                      {meetingDateError}
                    </p>
                  )}
                </div>

                <div className="form-field form-field--full-width">
                  <label htmlFor="meeting-notes">Optional Notes</label>
                  <textarea
                    id="meeting-notes"
                    name="meetingNotes"
                    value={notes}
                    placeholder="Add an agenda, participant names or any useful context."
                    rows="4"
                    maxLength="500"
                    disabled={isUploading}
                    onChange={(event) => {
                      setNotes(event.target.value);
                      clearUploadStatus();
                    }}
                  />
                </div>
              </div>
            </section>

            <fieldset
              className="form-section analysis-mode"
              aria-describedby="visual-analysis-note"
            >
              <legend>Analysis Mode</legend>

              <div className="analysis-options">
                <label
                  className={`analysis-option${
                    analysisMode === "audio"
                      ? " analysis-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisMode"
                    value="audio"
                    checked={analysisMode === "audio"}
                    disabled={isUploading}
                    onChange={(event) => {
                      setAnalysisMode(event.target.value);
                      clearUploadStatus();
                    }}
                  />
                  <span>
                    <strong>Audio Analysis</strong>
                    <small>Analyse the spoken content of the meeting.</small>
                  </span>
                </label>

                <label
                  className={`analysis-option${
                    analysisMode === "audio-visual"
                      ? " analysis-option--selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="analysisMode"
                    value="audio-visual"
                    checked={analysisMode === "audio-visual"}
                    disabled={isUploading}
                    onChange={(event) => {
                      setAnalysisMode(event.target.value);
                      clearUploadStatus();
                    }}
                  />
                  <span>
                    <strong>Audio + Visual Analysis</strong>
                    <small>Include useful information from video frames.</small>
                  </span>
                </label>
              </div>

              <p id="visual-analysis-note" className="analysis-note">
                <strong>Visual Analysis may take longer and cost more</strong>
                because both the audio and video frames need to be processed.
              </p>
            </fieldset>
          </div>

          <aside className="how-it-works" aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading">How It Works</h2>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Choose a video</strong>
                  <p>Select a recording from your device.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Add context</strong>
                  <p>Enter any helpful meeting details.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Select a mode</strong>
                  <p>Choose audio-only or audio and visual analysis.</p>
                </div>
              </li>
            </ol>
            <p className="local-demo-note">
              This is the demo version without analysis.
            </p>
          </aside>
        </div>

        <RequestStatus type={uploadState.type} message={uploadState.message} />

        <footer className="form-actions">
          <p>
            {formActionMessage}
          </p>
          <button
            className="analyse-button"
            type="submit"
            disabled={!selectedFile || isUploading || Boolean(meetingDateError)}
          >
            {isUploading ? "Uploading..." : "Analyse Meeting"}
          </button>
        </footer>
      </form>
      </main>
    </>
  );
}

export default UploadMeeting;
