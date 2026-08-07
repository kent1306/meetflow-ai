import { useState } from "react";

function App() {
  const [backendStatus, setBackendStatus] = useState("");

  const checkBackend = async () => {
    const response = await fetch("http://localhost:8000/health");
    const data = await response.json();

    setBackendStatus(data.status);
  };

  return (
    <div>
      <h1>MeetFlow AI</h1>

      <button onClick={checkBackend}>
        Check Backend
      </button>

      <p>Backend status: {backendStatus}</p>
    </div>
  );
}

export default App;