import { useEffect, useState } from "react";

export function useCrossfadeImage(url) {
  const [shown, setShown] = useState(url);
  const [next, setNext] = useState(null);
  const [nextVisible, setNextVisible] = useState(false);

  useEffect(() => {
    if (!url || url === shown) return undefined;
    let cancelled = false;
    setNext(url);
    setNextVisible(false);

    const image = new Image();
    image.src = url;
    image.onload = () => {
      if (cancelled) return;
      requestAnimationFrame(() => setNextVisible(true));
      window.setTimeout(() => {
        if (cancelled) return;
        setShown(url);
        setNext(null);
        setNextVisible(false);
      }, 1400);
    };
    image.onerror = () => {
      if (cancelled) return;
      setShown(url);
      setNext(null);
      setNextVisible(false);
    };

    return () => {
      cancelled = true;
    };
  }, [url, shown]);

  useEffect(() => {
    if (!shown && url) setShown(url);
  }, [shown, url]);

  return { shown, next, nextVisible };
}
