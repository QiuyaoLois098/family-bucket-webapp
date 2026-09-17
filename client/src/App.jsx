import { Navigate, Route, Routes } from "react-router-dom";
import ControlScreen from "./screens/ControlScreen.jsx";
import DisplayScreen from "./screens/DisplayScreen.jsx";
import PreviewScreen from "./screens/PreviewScreen.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PreviewScreen />} />
      <Route path="/control" element={<ControlScreen />} />
      <Route path="/display" element={<DisplayScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
