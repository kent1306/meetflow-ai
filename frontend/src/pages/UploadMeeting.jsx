import { useState } from "react";

function UploadMeeting() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [visualAnalysis, setVisualAnalysis] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleAnalyse = () => {
    if (!selectedFile) {
      alert("Please select a meeting video first.");
      return;
    }

    alert(`Selected video: ${selectedFile.name}`);
  };

  return (
    <div>
      <h1>Upload Meeting</h1>

      <p>
        Upload your meeting recording and let AI generate a summary,
        decisions and action items.
      </p>

      <div>
        <label>Meeting video</label>
        <br />

        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>

      {selectedFile && (
        <p>Selected: {selectedFile.name}</p>
      )}

      <div>
        <label>
          <input
            type="checkbox"
            checked={visualAnalysis}
            onChange={(event) =>
              setVisualAnalysis(event.target.checked)
            }
          />

          Enable Visual Analysis
        </label>
      </div>

      <button onClick={handleAnalyse}>
        Analyse Meeting
      </button>
    </div>
  );
}

export default UploadMeeting;