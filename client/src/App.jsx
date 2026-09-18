import { Navigate, Route, Routes } from "react-router-dom";
import ProjectMenu from "./components/ProjectMenu.jsx";
import ControlScreen from "./screens/ControlScreen.jsx";
import DisplayScreen from "./screens/DisplayScreen.jsx";
import NycMapScreen from "./screens/NycMapScreen.jsx";
import PreviewScreen from "./screens/PreviewScreen.jsx";
import VrboScreen from "./vrbo/VrboScreen.jsx";

export default function App() {
  return (
    <>
      <ProjectMenu />
      <Routes>
        <Route path="/" element={<PreviewScreen />} />
        <Route path="/map" element={<NycMapScreen />} />
        <Route path="/vrbo" element={<VrboScreen />} />
        <Route path="/control" element={<ControlScreen />} />
        <Route path="/display" element={<DisplayScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
