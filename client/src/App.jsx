import { Navigate, Route, Routes } from "react-router-dom";
import ProjectMenu from "./components/ProjectMenu.jsx";
import ControlScreen from "./screens/ControlScreen.jsx";
import DisplayScreen from "./screens/DisplayScreen.jsx";
import ExpediaBaScreen from "./screens/ExpediaBaScreen.jsx";
import NycMapScreen from "./screens/NycMapScreen.jsx";
import PreviewScreen from "./screens/PreviewScreen.jsx";
import VrboScreen from "./screens/VrboScreen.jsx";
import VrboV2Screen, {
  GuestPhonePage,
  VrboLeftPage,
  VrboRightPage,
} from "./screens/VrboV2Screen.jsx";

const DEVICE_PATHS = new Set([
  "/vrbo-left",
  "/vrbo-right",
  "/sarah",
  "/alex",
  "/chris",
  "/expedia-ba",
]);

export default function App() {
  return (
    <>
      <ProjectMenu hideOnPaths={DEVICE_PATHS} />
      <Routes>
        <Route path="/" element={<PreviewScreen />} />
        <Route path="/map" element={<NycMapScreen />} />
        <Route path="/vrbo" element={<VrboScreen />} />
        <Route path="/vrbo-v2" element={<VrboV2Screen />} />
        <Route path="/vrbo-left" element={<VrboLeftPage />} />
        <Route path="/vrbo-right" element={<VrboRightPage />} />
        <Route path="/sarah" element={<GuestPhonePage guestId="sarah" />} />
        <Route path="/alex" element={<GuestPhonePage guestId="alex" />} />
        <Route path="/chris" element={<GuestPhonePage guestId="chris" />} />
        <Route path="/vrbo-v2/sarah" element={<Navigate to="/sarah" replace />} />
        <Route path="/expedia-ba" element={<ExpediaBaScreen />} />
        <Route path="/control" element={<ControlScreen />} />
        <Route path="/display" element={<DisplayScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
