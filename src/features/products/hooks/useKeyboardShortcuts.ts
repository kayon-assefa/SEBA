import { useEffect } from "react";

// Feature #56 - keyboard-based quick actions
export function useKeyboardShortcuts(handlers: {
  onFocusSearch?: () => void;
  onAddProduct?: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      if (event.key === "/") {
        event.preventDefault();
        handlers.onFocusSearch?.();
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        handlers.onAddProduct?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
