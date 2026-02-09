"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { t } from "../lib/i18n";

/**
 * DevNavigation - Development navigation component
 * Main workflow: Home → Builder → Active → Lab
 * Archive button centered in bottom navigation
 */

// Main workflow screens (in order) — labels resolved at render time via t()
const mainFlowPaths = [
    { path: "/", labelKey: "HOME" },
    { path: "/builder", labelKey: "NAV_BUILDER" },
    { path: "/active", labelKey: "ACTIVE" },
    { path: "/lab", labelKey: "NAV_LAB" },
];

interface DevNavigationProps {
    showArchiveButton?: boolean;
}

export default function DevNavigation({ showArchiveButton = true }: DevNavigationProps) {
    const pathname = usePathname();

    // Resolve labels at render time for i18n
    const mainFlow = mainFlowPaths.map(s => ({ ...s, label: t(s.labelKey) }));

    // Find current screen index in main flow
    // Treat /active-hiit the same as /active for navigation purposes
    const effectivePath = pathname === "/active-hiit" ? "/active" : pathname;
    const currentIndex = mainFlow.findIndex(s => s.path === effectivePath);
    const prevScreen = currentIndex > 0 ? mainFlow[currentIndex - 1] : null;
    const nextScreen = currentIndex < mainFlow.length - 1 ? mainFlow[currentIndex + 1] : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute flex items-center justify-between"
            style={{
                left: 24,
                right: 24,
                bottom: 20,
                zIndex: 100,
            }}
        >
            {/* Previous Button */}
            {prevScreen ? (
                <Link href={prevScreen.path}>
                    <motion.div
                        whileHover={{ scale: 1.05, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center cursor-pointer"
                        style={{
                            padding: "10px 14px",
                            backgroundColor: "rgba(17, 17, 17, 0.9)",
                            borderRadius: 6,
                            border: "1px solid #222222",
                            gap: 8,
                        }}
                    >
                        <span style={{ color: "#CCFF00", fontSize: 12 }}>◀</span>
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 10,
                                color: "#888888",
                                letterSpacing: 1,
                            }}
                        >
                            {prevScreen.label}
                        </span>
                    </motion.div>
                </Link>
            ) : (
                <div style={{ width: 90 }} />
            )}

            {/* Archive Button - Centered, compact */}
            {showArchiveButton && pathname !== "/archive" ? (
                <Link href="/archive">
                    <motion.div
                        whileHover={{
                            scale: 1.05,
                            borderColor: "#CCFF00",
                            boxShadow: "0 0 12px rgba(204, 255, 0, 0.2)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center cursor-pointer"
                        style={{
                            padding: "6px 14px",
                            backgroundColor: "rgba(17, 17, 17, 0.9)",
                            borderRadius: 4,
                            border: "1px solid #333333",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 9,
                                color: "#555555",
                                letterSpacing: 1.5,
                            }}
                        >
                            {t('ARCHIVE')}
                        </span>
                    </motion.div>
                </Link>
            ) : (
                <div style={{ width: 70 }} />
            )}

            {/* Next Button */}
            {nextScreen ? (
                <Link href={nextScreen.path}>
                    <motion.div
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center cursor-pointer"
                        style={{
                            padding: "10px 14px",
                            backgroundColor: "rgba(17, 17, 17, 0.9)",
                            borderRadius: 6,
                            border: "1px solid #222222",
                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 10,
                                color: "#888888",
                                letterSpacing: 1,
                            }}
                        >
                            {nextScreen.label}
                        </span>
                        <span style={{ color: "#CCFF00", fontSize: 12 }}>▶</span>
                    </motion.div>
                </Link>
            ) : (
                <div style={{ width: 90 }} />
            )}
        </motion.div>
    );
}
