import { useEffect } from "react";
import { getSocket } from "../socket.js";

/** Guest id → Hyperion phone device (matches /vrbo-ip1 · /vrbo-ip2 · /vrbo-ip3). */
export const VGC_PHONE_BY_GUEST = Object.freeze({
  sarah: "phone-1",
  alex: "phone-2",
  chris: "phone-3",
});

/**
 * Tell the server which Hyperion device this page is, so it can send that device's
 * vgc_device_joined / vgc_device_left / vgc_interaction / vgc_error events.
 * The token stays on the server; the browser only names its device.
 *
 * device: "organizer" (/vrbo-left) · "output" (/vrbo-right) · "phone-1".."phone-3"
 */
export default function useVrboHyperionDevice(device) {
  useEffect(() => {
    if (!device) return undefined;
    const socket = getSocket();

    const announce = () => socket.emit("vgc:device", { device });
    announce();

    let droppedAt = null;
    const onDisconnect = () => {
      droppedAt = Date.now();
    };
    const onConnect = () => {
      announce();
      if (droppedAt != null) {
        const seconds = Math.round((Date.now() - droppedAt) / 1000);
        droppedAt = null;
        socket.emit("vgc:error", {
          code: "SOCKET_DROP",
          message: `Connection to the server dropped for ${seconds}s`,
          severity: "warning",
        });
      }
    };

    const onWindowError = (event) => {
      socket.emit("vgc:error", {
        code: "JS_ERROR",
        message: event?.message || "Uncaught error",
        severity: "error",
      });
    };
    const onRejection = (event) => {
      const reason = event?.reason;
      socket.emit("vgc:error", {
        code: "UNHANDLED_REJECTION",
        message: reason?.message || String(reason ?? "Unhandled promise rejection"),
        severity: "error",
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    window.addEventListener("error", onWindowError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      window.removeEventListener("error", onWindowError);
      window.removeEventListener("unhandledrejection", onRejection);
      socket.emit("vgc:device", { device: null });
    };
  }, [device]);
}
