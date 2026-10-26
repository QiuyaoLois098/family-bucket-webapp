import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getSocket } from "../socket.js";

const MAX = 5;

/** Wipe the server's Hyperion log (every open log view empties). */
export function clearHyperionActivity() {
  getSocket().emit("hyperion:clear");
}

/**
 * Latest Hyperion custom-event logs when ?dev=1 (or `force`, e.g. the /vrbo-v2 log panel).
 * Server broadcasts via Socket.IO. `includeHeartbeats` also returns heartbeat entries (/logging).
 */
export default function useHyperionActivity({
  force = false,
  max = MAX,
  includeHeartbeats = false,
} = {}) {
  const [params] = useSearchParams();
  const enabled =
    force ||
    params.get("dev") === "1" ||
    params.get("dev") === "true" ||
    params.get("hyperion") === "1" ||
    params.get("hyperion") === "true";

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setEntries([]);
      return undefined;
    }

    const socket = getSocket();

    const wanted = (item) =>
      item?.kind === "event" || (includeHeartbeats && item?.kind === "heartbeat");

    const onList = (list) => {
      setEntries((Array.isArray(list) ? list : []).filter(wanted).slice(0, max));
    };

    const onItem = (item) => {
      if (!item?.id || !wanted(item)) return;
      setEntries((prev) => {
        if (prev.some((e) => e.id === item.id)) return prev;
        return [item, ...prev].slice(0, max);
      });
    };

    socket.on("hyperion:activity:list", onList);
    socket.on("hyperion:activity", onItem);
    socket.emit("hyperion:subscribe");

    const onConnect = () => socket.emit("hyperion:subscribe");
    socket.on("connect", onConnect);

    return () => {
      socket.off("hyperion:activity:list", onList);
      socket.off("hyperion:activity", onItem);
      socket.off("connect", onConnect);
    };
  }, [enabled, max, includeHeartbeats]);

  return enabled ? entries : [];
}
