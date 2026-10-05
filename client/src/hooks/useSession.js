import { useEffect, useMemo, useState } from "react";
import { INITIAL_STATE } from "@shared/index.js";
import { getSocket } from "../socket.js";

export function useSession({ syncOnly = false } = {}) {
  const [state, setState] = useState(INITIAL_STATE);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onState = (next) => setState(next);
    const onConnect = () => {
      setConnected(true);
      socket.emit(syncOnly ? "session:subscribe" : "session:join");
    };
    const onDisconnect = () => setConnected(false);

    socket.on("session:state", onState);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) onConnect();

    return () => {
      socket.off("session:state", onState);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [syncOnly]);

  const actions = useMemo(
    () => ({
      begin: () => getSocket().emit("experience:begin"),
      selectDestination: (destinationId) =>
        getSocket().emit("experience:selectDestination", { destinationId }),
      answer: (questionIndex, answerId, { advance = true } = {}) =>
        getSocket().emit("experience:answer", { questionIndex, answerId, advance }),
      goBack: () => getSocket().emit("experience:back"),
      shake: () => getSocket().emit("experience:shake"),
      reset: () => getSocket().emit("experience:reset"),
      debugSkip: () => getSocket().emit("debug:skip"),
      debugSimulateImage: () => getSocket().emit("debug:simulateImage"),
      debugSimulateItinerary: () => getSocket().emit("debug:simulateItinerary"),
    }),
    [],
  );

  return { state, connected, actions };
}
