"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";

type Props = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  /** Wider dialog that scrolls inside, for long content like a sticker page. */
  wide?: boolean;
};

export function Modal({ open, onClose, title, children, wide = false }: Props) {
  const closeLabel = useTranslations("nav")("close");
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`card-chunky w-full p-5 sm:p-6 ${wide ? "max-h-[85dvh] max-w-2xl overflow-y-auto" : "max-w-md"}`}
            initial={{ y: 60, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {wide ? (
              <div className="sticky -top-5 z-10 -mx-5 -mt-5 mb-3 flex items-center gap-3 bg-surface px-5 py-3 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6">
                <h2 className="flex-1 text-2xl font-bold">{title}</h2>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-chunky btn-icon btn-header bg-surface-2 text-ink"
                    aria-label={closeLabel}
                  >
                    <Icon name="close" />
                  </button>
                )}
              </div>
            ) : (
              title && <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
