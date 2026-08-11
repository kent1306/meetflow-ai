import { Navigate, Route, Routes } from "react-router-dom";
import UploadMeeting from "./pages/UploadMeeting";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<UploadMeeting />} />
      <Route path="*" element={<Navigate to="/upload" replace />} />
    </Routes>
  );
}

export default App;
