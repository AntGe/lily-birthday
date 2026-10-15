import { useEffect, useRef } from "react";

/** When a scene mounts after the previous one left (focus fell to <body>), focus its heading. */
export function useSceneFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const active = document.activeElement;
    if (!active || active === document.body) ref.current?.focus({ preventScroll: true });
  }, []);
  return ref;
}
