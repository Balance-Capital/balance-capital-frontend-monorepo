import { RefObject, useEffect, useRef, useState } from "react";

function useElementHeight() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [elementHeight, setElementHeight] = useState<number>(0);

  useEffect(() => {
    if (elementRef.current) {
      const handleSizeChange = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          setElementHeight(entry.contentRect.height);
        }
      };
      const resizeObserver = new ResizeObserver(handleSizeChange);
      resizeObserver.observe(elementRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
    return;
  }, []);

  return [elementRef, elementHeight] as [RefObject<HTMLDivElement>, number];
}

export default useElementHeight;
