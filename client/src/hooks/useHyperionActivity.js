import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getSocket } from "../socket.js";

const MAX = 24;

/**
 * Live Hyperion request log (heartbeats + custom events) when ?dev=1.
 * Server broadcasts via Socket.IO.
 */
export default function useHyperionActivity() {
  const [params] = useSearchParams();
  const enabled =
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

    const onList = (list) => {
      setEntries(Array.isArray(list) ? list.slice(0, MAX) : []);
    };

    const onItem = (item) => {
      if (!item?.id) return;
      setEntries((prev) => {
        if (prev.some((e) => e.id === item.id)) return prev;
        return [item, ...prev].slice(0, MAX);
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
  }, [enabled]);

  return enabled ? entries : [];
}
