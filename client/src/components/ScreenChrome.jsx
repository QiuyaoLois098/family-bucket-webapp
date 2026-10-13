import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import DebugPanel from "./DebugPanel.jsx";
import ExpediaRestartButton from "./ExpediaRestartButton.jsx";

export function useDebugMode() {
  const [params] = useSearchParams();
  return params.get("debug") === "true";
}

export function ScreenChrome({ role, syncOnly = false, children }) {
  const { state, connected, actions } = useSession({ syncOnly });
  const debug = useDebugMode();
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    setStandalone(window.self === window.top);
  }, []);

  // Interactive display (/control · /expedia-left): any first click starts FBL session.
  useEffect(() => {
    if (role !== "control") return undefined;
    if (state.hyperionSessionId) return undefined;

    const onPointerDown = () => {
      actions.startSession();
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onPointerDown, { capture: true });
  }, [role, state.hyperionSessionId, actions]);

  const content = useMemo(() => children({ state, connected, actions, debug }), [
    children,
    state,
    connected,
    actions,
    debug,
  ]);

  return (
    <>
      {content}
      {standalone ? (
        <ExpediaRestartButton onRestart={actions.reset} />
      ) : null}
      {debug ? (
        <DebugPanel role={role} state={state} connected={connected} actions={actions} />
      ) : null}
    </>
  );
}
