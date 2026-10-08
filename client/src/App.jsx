import { Navigate, Route, Routes } from "react-router-dom";
import ProjectMenu from "./components/ProjectMenu.jsx";
import ControlScreen from "./screens/ControlScreen.jsx";
import DisplayScreen from "./screens/DisplayScreen.jsx";
import ExpediaBaScreen from "./screens/ExpediaBaScreen.jsx";
import PreviewScreen from "./screens/PreviewScreen.jsx";
import UdpScreen from "./screens/UdpScreen.jsx";
import VrboBaScreen from "./screens/VrboBaScreen.jsx";
import VrboV2Screen, {
  GuestPhonePage,
  VrboLeftPage,
  VrboRightPage,
} from "./screens/VrboV2Screen.jsx";

const DEVICE_PATHS = new Set([
  "/vrbo-left",
  "/vrbo-right",
  "/vrbo-ip1",
  "/vrbo-ip2",
  "/vrbo-ip3",
  "/vrbo-ba",
  "/expedia-ba",
  "/udp",
]);

export default function App() {
  return (
    <>
      <ProjectMenu hideOnPaths={DEVICE_PATHS} />
      <Routes>
        <Route path="/" element={<PreviewScreen />} />
        <Route path="/vrbo-v2" element={<VrboV2Screen />} />
        <Route path="/vrbo-left" element={<VrboLeftPage />} />
        <Route path="/vrbo-right" element={<VrboRightPage />} />
        <Route path="/vrbo-ip1" element={<GuestPhonePage guestId="sarah" />} />
        <Route path="/vrbo-ip2" element={<GuestPhonePage guestId="alex" />} />
        <Route path="/vrbo-ip3" element={<GuestPhonePage guestId="chris" />} />
        <Route path="/sarah" element={<Navigate to="/vrbo-ip1" replace />} />
        <Route path="/alex" element={<Navigate to="/vrbo-ip2" replace />} />
        <Route path="/chris" element={<Navigate to="/vrbo-ip3" replace />} />
        <Route path="/vrbo-v2/sarah" element={<Navigate to="/vrbo-ip1" replace />} />
        <Route path="/vrbo-ba" element={<VrboBaScreen />} />
        <Route path="/expedia-ba" element={<ExpediaBaScreen />} />
        <Route path="/udp" element={<UdpScreen />} />
        <Route path="/control" element={<ControlScreen />} />
        <Route path="/display" element={<DisplayScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
