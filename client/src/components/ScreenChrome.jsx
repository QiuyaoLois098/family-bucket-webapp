import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import DebugPanel from "./DebugPanel.jsx";

export function useDebugMode() {
  const [params] = useSearchParams();
  return params.get("debug") === "true";
}

export function ScreenChrome({ role, children }) {
  const { state, connected, actions } = useSession();
  const debug = useDebugMode();

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
      {debug ? (
        <DebugPanel role={role} state={state} connected={connected} actions={actions} />
      ) : null}
    </>
  );
}
