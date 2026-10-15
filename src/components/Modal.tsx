import { motion, usePresence, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  label?: string;
  /** Visual style of the entrance: a large sheet, or a small pop-up card. */
  variant?: "sheet" | "pop" | "fade";
  /** Where focus goes on close if the element that opened the dialog no longer exists. */
  returnFocus?: () => HTMLElement | null;
}

/**
 * A native <dialog> opened with showModal() (focus trap + Esc for free), with an
 * enter/exit animation. Render it inside <AnimatePresence> and unmount it to close.
 */
export function Modal({ onClose, children, className, labelledBy, label, variant = "sheet", returnFocus }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const returnFocusRef = useRef(returnFocus);
  returnFocusRef.current = returnFocus;
  const [isPresent, safeToRemove] = usePresence();
  const reduced = useReducedMotion();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    opener.current = document.activeElement;
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => dialog.setAttribute("data-shown", "true"));
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    if (isPresent) return;
    const dialog = ref.current;
    dialog?.setAttribute("data-shown", "false");
    const t = window.setTimeout(
      () => {
        dialog?.close();
        const opened = opener.current as HTMLElement | null;
        const target = opened && document.contains(opened) ? opened : (returnFocusRef.current?.() ?? null);
        if (target && (document.activeElement === document.body || !document.activeElement)) {
          target.focus({ preventScroll: true });
        }
        safeToRemove?.();
      },
      reduced ? 160 : 320,
    );
    return () => window.clearTimeout(t);
  }, [isPresent, safeToRemove, reduced]);

  const variants = {
    sheet: { initial: { opacity: 0, y: 36, scale: 0.97 }, shown: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 24, scale: 0.98 } },
    pop: { initial: { opacity: 0, scale: 0.86, y: 10 }, shown: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.92, y: 6 } },
    // Opacity only: a transform here would trap position:fixed children (lightbox controls).
    fade: { initial: { opacity: 0 }, shown: { opacity: 1 }, exit: { opacity: 0 } },
  }[variant];

  return (
    <dialog
      ref={ref}
      className={`modal modal--${variant} ${className ?? ""}`}
      aria-labelledby={labelledBy}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        if (e.target !== e.currentTarget) return; // a nested dialog's Esc, propagated through the React tree
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={contentRef}
        className="modal-content"
        initial={reduced ? { opacity: 0 } : variants.initial}
        animate={isPresent ? (reduced ? { opacity: 1 } : variants.shown) : reduced ? { opacity: 0 } : variants.exit}
        transition={
          isPresent
            ? reduced
              ? { duration: 0.3 }
              : { type: "spring", stiffness: 170, damping: 20, mass: 0.9 }
            : { duration: reduced ? 0.15 : 0.28, ease: [0.4, 0, 1, 1] }
        }
      >
        {children}
      </motion.div>
    </dialog>
  );
}
