"use client";

import { motion } from "framer-motion";

/**
 * Template component for page transitions
 * This wraps all pages with enter/exit animations
 * Uses Framer Motion for smooth transitions
 */
export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
            }}
        >
            {children}
        </motion.div>
    );
}
