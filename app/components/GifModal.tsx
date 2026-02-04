"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GifModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseName: string;
    gifUrl: string;
}

/**
 * GIF Preview Modal
 * Shows exercise demonstration GIF in a modal overlay
 * Matches existing Glitch Sport aesthetic
 */
export default function GifModal({ isOpen, onClose, exerciseName, gifUrl }: GifModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] flex items-center justify-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex flex-col"
                    style={{
                        width: 320,
                        backgroundColor: "#0A0A0A",
                        borderRadius: 8,
                        border: "1px solid #222222",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between"
                        style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #222222",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#FFFFFF",
                                letterSpacing: 1,
                            }}
                        >
                            {exerciseName}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                width: 28,
                                height: 28,
                                backgroundColor: "#111111",
                                border: "1px solid #333333",
                                borderRadius: 4,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ color: "#888888", fontSize: 14 }}>✕</span>
                        </motion.button>
                    </div>

                    {/* GIF Container */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            padding: 16,
                            backgroundColor: "#050505",
                        }}
                    >
                        {gifUrl ? (
                            <img
                                src={gifUrl}
                                alt={exerciseName}
                                style={{
                                    width: "100%",
                                    maxHeight: 280,
                                    objectFit: "contain",
                                    borderRadius: 4,
                                }}
                            />
                        ) : (
                            <div
                                className="flex items-center justify-center"
                                style={{
                                    width: "100%",
                                    height: 200,
                                    backgroundColor: "#111111",
                                    borderRadius: 4,
                                }}
                            >
                                <span style={{ fontSize: 48, opacity: 0.3 }}>🏋️</span>
                            </div>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div
                        style={{
                            padding: "10px 16px",
                            borderTop: "1px solid #1A1A1A",
                            textAlign: "center",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 9,
                                color: "#444444",
                            }}
                        >
                            TAP_OUTSIDE_TO_CLOSE
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
