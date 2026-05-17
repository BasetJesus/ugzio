"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, type ReactNode } from "react"

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function BottomSheet({ open, onClose, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 200 }}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose() }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--bg-elevated)] pb-safe"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-[var(--text-muted)]/30" />
            </div>
            <div className="px-5 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
