"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function NavDropdown({ items, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2"
          role="menu"
        >
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_20px_45px_-15px_rgba(76,29,149,0.25)] backdrop-blur-2xl">
            <div className="p-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600 transition-transform duration-200 group-hover:scale-105">
                      <Icon size={16} strokeWidth={2} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-xs text-slate-500">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}