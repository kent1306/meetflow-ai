import { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "./UploadMeeting.css";

const videoFileExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"];

function isVideoFile(file) {
  const fileName = file.name.toLowerCase();

  if (file.type) {
    return file.type.startsWith("video/");
  }

  return videoFileExtensions.some((extension) => fileName.endsWith(extension));
}

function UploadMeeting() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [analysisMode, setAnalysisMode] = useState("audio");
  const [fileError, setFileError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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
      setStatusMessage("");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setFileError("");
    setStatusMessage("");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
    setStatusMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setFileError("Please select a video before continuing.");
      return;
    }

    const meetingName = meetingTitle.trim() || selectedFile.name;
    setStatusMessage(
      `${meetingName} is ready for analysis. This demo did not upload or analyse your video.`,
    );
  };

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
        <div className="upload-layout">
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
                      onClick={handleChangeFile}
                    >
                      Change
                    </button>
                    <button
                      className="remove-file-button"
                      type="button"
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
                    onChange={(event) => setMeetingTitle(event.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="meeting-date">Meeting Date</label>
                  <input
                    id="meeting-date"
                    name="meetingDate"
                    type="date"
                    value={meetingDate}
                    onChange={(event) => setMeetingDate(event.target.value)}
                  />
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
                    onChange={(event) => setNotes(event.target.value)}
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
                    onChange={(event) => setAnalysisMode(event.target.value)}
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
                    onChange={(event) => setAnalysisMode(event.target.value)}
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

        <div className="status-region" role="status" aria-live="polite">
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>

        <footer className="form-actions">
          <p>
            {selectedFile
              ? "Your video is ready for this local demonstration."
              : "Select a video to enable analysis."}
          </p>
          <button
            className="analyse-button"
            type="submit"
            disabled={!selectedFile}
          >
            Analyse Meeting
          </button>
        </footer>
      </form>
      </main>
    </>
  );
}

export default UploadMeeting;
