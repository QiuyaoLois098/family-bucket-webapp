import { useEffect, useRef, useState } from "react";

const FROST_SRC = "/frost-reveal/index.html";

/**
 * Designer handoff v72 WebGL frost + zoom-out (iframe host of frostStudy).
 * Reports live once the GPU has the photo so the host can hide CSS fallback.
 */
export default function FrostReveal({ imageUrl, answerCount = 0, onLiveChange }) {
  const iframeRef = useRef(null);
  const readyRef = useRef(false);
  const loadedUrlRef = useRef("");
  const appliedAnswersRef = useRef(-1);
  const pendingImageRef = useRef(imageUrl);
  const pendingAnswersRef = useRef(answerCount);
  const onLiveChangeRef = useRef(onLiveChange);
  const [live, setLive] = useState(false);

  onLiveChangeRef.current = onLiveChange;

  const setLiveState = (next) => {
    setLive(next);
    onLiveChangeRef.current?.(next);
  };

  const post = (message) => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !readyRef.current) return false;
    win.postMessage(message, window.location.origin);
    return true;
  };

  const absoluteUrl = (raw) => {
    if (!raw) return "";
    try {
      return new URL(raw, window.location.origin).href;
    } catch {
      return "";
    }
  };

  const syncImage = () => {
    const url = absoluteUrl(pendingImageRef.current);
    if (!url || !readyRef.current) return;
    if (url === loadedUrlRef.current) {
      syncAnswers();
      return;
    }
    loadedUrlRef.current = url;
    appliedAnswersRef.current = -1;
    setLiveState(false);
    post({ type: "frost:setImage", url });
  };

  const syncAnswers = () => {
    const count = Math.max(0, Math.min(3, pendingAnswersRef.current | 0));
    if (!readyRef.current || !loadedUrlRef.current) return;
    if (count === appliedAnswersRef.current) return;
    appliedAnswersRef.current = count;
    post({ type: "frost:setAnswers", answerCount: count });
  };

  const markReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    loadedUrlRef.current = "";
    appliedAnswersRef.current = -1;
    syncImage();
  };

  useEffect(() => {
    pendingImageRef.current = imageUrl;
    pendingAnswersRef.current = answerCount;
    if (!readyRef.current) return;
    syncImage();
  }, [imageUrl, answerCount]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const type = event.data?.type;
      if (type === "frost:ready") {
        markReady();
      }
      if (type === "frost:imageReady") {
        setLiveState(true);
        syncAnswers();
      }
      if (type === "frost:imageError") {
        loadedUrlRef.current = "";
        appliedAnswersRef.current = -1;
        setLiveState(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => () => onLiveChangeRef.current?.(false), []);

  const onIframeLoad = () => {
    const study = iframeRef.current?.contentWindow?.frostStudy;
    if (study) markReady();
  };

  return (
    <iframe
      ref={iframeRef}
      className={`frost-reveal${live ? " is-live" : ""}`}
      title="Destination frost reveal"
      src={FROST_SRC}
      allow="fullscreen"
      onLoad={onIframeLoad}
    />
  );
}
