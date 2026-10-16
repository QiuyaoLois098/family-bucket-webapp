import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HyperionDevOverlay from "./components/HyperionDevOverlay.jsx";
import ProjectMenu from "./components/ProjectMenu.jsx";
import DebugHeightGuide from "./debug/DebugHeightGuide.jsx";
import { isDevComparePath } from "./config/vrboUi.js";
import ControlScreen from "./screens/ControlScreen.jsx";
import DisplayScreen from "./screens/DisplayScreen.jsx";
import ExpediaBaScreen from "./screens/ExpediaBaScreen.jsx";
import {
  ExpediaLeftPage,
  ExpediaRightPage,
} from "./screens/ExpediaPortraitScreens.jsx";
import PreviewScreen from "./screens/PreviewScreen.jsx";
import UdpScreen from "./screens/UdpScreen.jsx";
import VrboBaScreen from "./screens/VrboBaScreen.jsx";
import useHyperionHeartbeat from "./hooks/useHyperionHeartbeat.js";
import VrboV2Screen, {
  GuestPhonePage,
  VrboLeftPage,
  VrboRightPage,
} from "./screens/VrboV2Screen.jsx";

const DEVICE_PATHS = new Set([
  "/expedia-left",
  "/expedia-right",
  "/expedia-left-dev",
  "/expedia-right-dev",
  "/vrbo-left",
  "/vrbo-right",
  "/vrbo-left-dev",
  "/vrbo-right-dev",
  "/vrbo-ip1",
  "/vrbo-ip1-dev",
  "/vrbo-ip2",
  "/vrbo-ip3",
  "/vrbo-ba",
  "/expedia-ba",
  "/udp",
]);

export default function App() {
  const heartbeat = useHyperionHeartbeat();
  const { pathname } = useLocation();
  const heightGuide = isDevComparePath(pathname);

  return (
    <>
      <ProjectMenu hideOnPaths={DEVICE_PATHS} />
      <HyperionDevOverlay heartbeat={heartbeat} />
      <DebugHeightGuide enabled={heightGuide} />
      <Routes>
        <Route path="/" element={<PreviewScreen />} />
        <Route path="/expedia-left" element={<ExpediaLeftPage />} />
        <Route path="/expedia-right" element={<ExpediaRightPage />} />
        <Route
          path="/expedia-left-dev"
          element={<ExpediaLeftPage compareLayout />}
        />
        <Route
          path="/expedia-right-dev"
          element={<ExpediaRightPage compareLayout />}
        />
        <Route path="/vrbo-v2" element={<VrboV2Screen />} />
        <Route path="/vrbo-left" element={<VrboLeftPage />} />
        <Route path="/vrbo-right" element={<VrboRightPage />} />
        <Route path="/vrbo-left-dev" element={<VrboLeftPage compareLayout />} />
        <Route path="/vrbo-right-dev" element={<VrboRightPage compareLayout />} />
        <Route path="/vrbo-ip1" element={<GuestPhonePage guestId="sarah" />} />
        <Route
          path="/vrbo-ip1-dev"
          element={<GuestPhonePage guestId="sarah" compareLayout />}
        />
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
