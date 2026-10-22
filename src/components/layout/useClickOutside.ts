import { useEffect } from "react";
import type { RefObject } from "react";

// Calls onOutside when the user clicks outside the element or presses Escape.
// Used to close dropdowns (search results, notifications, profile menu).
const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  isActive: boolean,
) => {
  useEffect(() => {
    // Only listen while the dropdown is open, so closed dropdowns cost nothing
    if (!isActive) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOutside();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    // Remove the listeners when the dropdown closes or the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, onOutside, isActive]);
};

export default useClickOutside;
