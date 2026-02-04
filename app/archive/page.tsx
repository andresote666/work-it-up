"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DevNavigation from "../components/DevNavigation";

/**
 * Screen 2: Archive / WORKOUT_SCREEN2
 * Now DYNAMIC - loads workout history from localStorage
 * Shows real completed workouts with filters by muscle group
 */

interface ExerciseDetail {
    name: string;
    muscle: string;
    sets: number;
    weight: string;
    reps: string;
}

interface WorkoutHistoryEntry {
    id: number;
    date: string;
    duration: number;
    exerciseCount: number;
    totalSets: number;
    muscles: string[];
    volume: number;
    exerciseDetails: ExerciseDetail[];
}

// Format duration from seconds to readable string
const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

// Format date to display string
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const day = date.getDate().toString().padStart(2, "0");
    return `${month} ${day}`;
};

// Get primary muscle group for workout title
const getPrimaryMuscle = (muscles: string[]): string => {
    if (muscles.length === 0) return "GENERAL";
    // Count occurrences if there are multiple
    const muscleMap: Record<string, number> = {
        CHEST: 0, BACK: 0, LEGS: 0, SHOULDERS: 0, ARMS: 0, CORE: 0
    };
    muscles.forEach(m => { if (muscleMap[m] !== undefined) muscleMap[m]++; });
    const sorted = Object.entries(muscleMap).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] || muscles[0];
};

// CountUp component for animated number
function CountUp({ target }: { target: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1500; // ms
        const steps = 30;
        const increment = target / steps;
        const stepDuration = duration / steps;

        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [target]);

    return <>{count}%</>;
}

export default function ArchiveScreen() {
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>("ALL");
    const [isLoaded, setIsLoaded] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Load workout history from localStorage
    useEffect(() => {
        const storedHistory = localStorage.getItem("workoutHistory");
        if (storedHistory) {
            try {
                const parsed = JSON.parse(storedHistory) as WorkoutHistoryEntry[];
                // Sort by date, most recent first
                parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setWorkoutHistory(parsed);
            } catch {
                // Use empty if parsing fails
            }
        }
        setIsLoaded(true);
    }, []);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Clear all workout history
    const handleClearArchive = () => {
        localStorage.removeItem("workoutHistory");
        setWorkoutHistory([]);
        setShowClearConfirm(false);
        setExpandedId(null);
        setActiveFilter("ALL");
    };

    // REDO: Load workout directly into Active screen
    const handleRedo = (workout: WorkoutHistoryEntry, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expand

        // Transform exercise details into Active workout format
        const workoutExercises = workout.exerciseDetails.map((ex, idx) => ({
            id: idx + 1,
            name: ex.name,
            muscle: ex.muscle,
            sets: ex.sets,
            weight: ex.weight,
            reps: ex.reps,
        }));

        localStorage.setItem("activeWorkout", JSON.stringify(workoutExercises));
        window.location.href = "/active";
    };

    // EDIT: Load workout into Builder for modifications
    const handleEdit = (workout: WorkoutHistoryEntry, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card expand

        // Transform exercise details into Builder selected exercises format
        const selectedExercises = workout.exerciseDetails.map((ex, idx) => ({
            id: idx + 1,
            name: ex.name.toLowerCase().replace(/_/g, " "),
            muscle: ex.muscle,
            equipment: "barbell", // Default, will be shown in builder
        }));

        localStorage.setItem("builderPreload", JSON.stringify(selectedExercises));
        window.location.href = "/builder";
    };

    // Get unique muscle groups for filter
    const allMuscles = new Set<string>();
    workoutHistory.forEach(w => w.muscles.forEach(m => allMuscles.add(m)));
    const filterCategories = ["ALL", ...Array.from(allMuscles)];

    // Filter workouts based on selected muscle
    const filteredLogs = activeFilter === "ALL"
        ? workoutHistory
        : workoutHistory.filter(w => w.muscles.includes(activeFilter));

    // Calculate consistency stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const workoutsLast30Days = workoutHistory.filter(w => new Date(w.date) > thirtyDaysAgo).length;
    const targetSessions = 12; // Assume 3 per week target
    const consistencyPercent = Math.min(100, Math.round((workoutsLast30Days / targetSessions) * 100));
    const consistencyStatus = consistencyPercent >= 80 ? "ON_TRACK" : consistencyPercent >= 50 ? "BUILDING" : "START_NOW";

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            {/* Phone Frame - Responsive */}
            <div
                className="relative overflow-hidden w-full h-dvh max-w-md"
                style={{
                    borderRadius: 0,
                    backgroundColor: "#0A0A0A",
                }}
            >
                {/* Dev Navigation */}
                <DevNavigation showArchiveButton={false} />

                {/* Back to Builder Button */}
                <Link href="/builder">
                    <motion.div
                        whileHover={{ scale: 1.05, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute flex items-center cursor-pointer"
                        style={{
                            left: 24,
                            top: 24,
                            gap: 6,
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
                            BUILDER
                        </span>
                    </motion.div>
                </Link>

                {/* Header at x:24 y:48 */}
                <div
                    className="absolute flex flex-col"
                    style={{ left: 24, top: 48, width: 345, gap: -5 }}
                >
                    <div className="flex items-center justify-between">
                        <span
                            style={{
                                fontFamily: "'Rubik Mono One', monospace",
                                fontSize: 32,
                                color: "#FFFFFF",
                            }}
                        >
                            ARCHIVE
                        </span>
                        {/* Clear Archive Button - only show if there's history */}
                        {workoutHistory.length > 0 && (
                            <motion.button
                                onClick={() => setShowClearConfirm(true)}
                                whileHover={{ scale: 1.1, color: "#FF6B6B" }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#555555",
                                    background: "none",
                                    border: "1px solid #333333",
                                    padding: "6px 10px",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    letterSpacing: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <span style={{ fontSize: 12 }}>🗑</span>
                                CLEAR
                            </motion.button>
                        )}
                    </div>
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#555555",
                            letterSpacing: 1,
                        }}
                    >
            // HISTORY_LOG
                    </span>
                </div>

                {/* Consistency Monitor at x:24 y:120 - Animated */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="absolute flex flex-col"
                    style={{ left: 24, top: 120, width: 345, gap: 8 }}
                >
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 10,
                            color: "#888888",
                            letterSpacing: 1,
                        }}
                    >
                        CONSISTENCY(30D)
                    </span>
                    <div className="flex items-center" style={{ gap: 16 }}>
                        {/* Circular Progress Ring */}
                        <div style={{ position: "relative", width: 72, height: 72 }}>
                            <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                                {/* Background Ring */}
                                <circle
                                    cx="36"
                                    cy="36"
                                    r="30"
                                    stroke="#222222"
                                    strokeWidth="6"
                                    fill="none"
                                />
                                {/* Animated Progress Ring */}
                                <motion.circle
                                    cx="36"
                                    cy="36"
                                    r="30"
                                    stroke={consistencyStatus === "ON_TRACK" ? "#CCFF00" : consistencyStatus === "BUILDING" ? "#FFAA00" : "#FF4444"}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 188.5" }}
                                    animate={{ strokeDasharray: `${(consistencyPercent / 100) * 188.5} 188.5` }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            {/* Percentage inside ring */}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 16,
                                    color: "#FFFFFF",
                                }}
                            >
                                <CountUp target={consistencyPercent} />
                            </motion.span>
                        </div>
                        {/* Stats Column */}
                        <div className="flex flex-col" style={{ gap: 4 }}>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.2, duration: 0.4 }}
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 24,
                                    color: "#FFFFFF",
                                }}
                            >
                                {workoutsLast30Days}/{targetSessions}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 1.4, duration: 0.4 }}
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#888888",
                                }}
                            >
                                SESSIONS_COMPLETE
                            </motion.span>
                        </div>
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.6, duration: 0.3 }}
                            style={{
                                backgroundColor: consistencyStatus === "ON_TRACK"
                                    ? "rgba(204, 255, 0, 0.1)"
                                    : consistencyStatus === "BUILDING"
                                        ? "rgba(255, 170, 0, 0.1)"
                                        : "rgba(255, 68, 68, 0.1)",
                                borderRadius: 4,
                                padding: "4px 8px",
                                marginLeft: "auto",
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: consistencyStatus === "ON_TRACK"
                                        ? "#CCFF00"
                                        : consistencyStatus === "BUILDING"
                                            ? "#FFAA00"
                                            : "#FF4444",
                                    letterSpacing: 1,
                                }}
                            >
                                {consistencyStatus}
                            </motion.span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Filter Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="absolute flex items-center"
                    style={{ left: 24, top: 230, width: 345, gap: 8 }}
                >
                    {filterCategories.map((category) => (
                        <motion.button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: "6px 12px",
                                borderRadius: 4,
                                border: "none",
                                backgroundColor: activeFilter === category ? "#CCFF00" : "#1A1A1A",
                                cursor: "pointer",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: activeFilter === category ? "#000000" : "#666666",
                                    letterSpacing: 1,
                                }}
                            >
                                {category}
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* Logs Frame at x:24 y:270 (moved down for filters) */}
                <div
                    className="absolute flex flex-col"
                    style={{ left: 24, top: 270, width: 345, gap: 12 }}
                >
                    {/* Empty State */}
                    {isLoaded && filteredLogs.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center"
                            style={{
                                padding: 40,
                                backgroundColor: "#111111",
                                borderRadius: 8,
                                border: "1px dashed #333333",
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 32,
                                    color: "#333333",
                                    marginBottom: 16,
                                }}
                            >
                                📂
                            </motion.span>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 12,
                                    color: "#555555",
                                    textAlign: "center",
                                    letterSpacing: 1,
                                }}
                            >
                                {activeFilter === "ALL"
                                    ? "NO_SESSIONS_YET"
                                    : `NO_${activeFilter}_SESSIONS`}
                            </span>
                            <Link href="/builder">
                                <motion.span
                                    whileHover={{ scale: 1.05, color: "#CCFF00" }}
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#888888",
                                        marginTop: 8,
                                        cursor: "pointer",
                                    }}
                                >
                                    &gt; START_FIRST_WORKOUT
                                </motion.span>
                            </Link>
                        </motion.div>
                    )}

                    {filteredLogs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                height: expandedId === log.id ? "auto" : 64,
                            }}
                            transition={{
                                delay: 0.2 + index * 0.1,
                                duration: 0.4,
                                ease: "easeOut"
                            }}
                            whileHover={expandedId !== log.id ? {
                                scale: 1.02,
                                x: 4,
                                backgroundColor: "#161616",
                            } : {}}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleExpand(log.id)}
                            className="flex flex-col cursor-pointer overflow-hidden"
                            style={{
                                width: "100%",
                                minHeight: 64,
                                backgroundColor: expandedId === log.id ? "#141414" : "#111111",
                                borderRadius: 4,
                                padding: 16,
                                border: expandedId === log.id ? "1px solid #222222" : "1px solid transparent",
                            }}
                        >
                            {/* Header Row */}
                            <div className="flex items-center" style={{ gap: 16 }}>
                                {/* Accent Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 32 }}
                                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                                    style={{
                                        width: 4,
                                        backgroundColor: index === 0 ? "#CCFF00" : "#333333",
                                        borderRadius: 2,
                                    }}
                                />
                                {/* Log Meta */}
                                <div className="flex flex-col flex-1" style={{ gap: 4 }}>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 12,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        {formatDate(log.date)} // {getPrimaryMuscle(log.muscles)}_SESSION
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 10,
                                            color: "#555555",
                                        }}
                                    >
                                        VOL: {log.volume} • {formatDuration(log.duration)} • {log.exerciseCount} EX
                                    </span>
                                </div>
                                {/* Expand Indicator */}
                                <motion.span
                                    animate={{ rotate: expandedId === log.id ? 180 : 0 }}
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#555555",
                                    }}
                                >
                                    ▼
                                </motion.span>
                            </div>

                            {/* Expandable Details */}
                            <AnimatePresence>
                                {expandedId === log.id && log.exerciseDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col"
                                        style={{
                                            marginTop: 16,
                                            paddingTop: 16,
                                            borderTop: "1px solid #222222",
                                            gap: 8,
                                        }}
                                    >
                                        {log.exerciseDetails.map((ex: ExerciseDetail, exIndex: number) => (
                                            <motion.div
                                                key={exIndex}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: exIndex * 0.05 }}
                                                className="flex items-center justify-between"
                                                style={{ padding: "4px 0" }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "'Chakra Petch', sans-serif",
                                                        fontSize: 11,
                                                        color: "#888888",
                                                    }}
                                                >
                                                    {ex.name}
                                                </span>
                                                <div className="flex items-center" style={{ gap: 12 }}>
                                                    <span
                                                        style={{
                                                            fontFamily: "'Chakra Petch', sans-serif",
                                                            fontSize: 10,
                                                            color: "#CCFF00",
                                                        }}
                                                    >
                                                        {ex.sets}×{ex.reps}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontFamily: "'Chakra Petch', sans-serif",
                                                            fontSize: 10,
                                                            color: "#555555",
                                                        }}
                                                    >
                                                        {ex.weight}kg
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Action Buttons Row */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center"
                                            style={{
                                                marginTop: 16,
                                                paddingTop: 16,
                                                borderTop: "1px solid #1a1a1a",
                                                gap: 12,
                                            }}
                                        >
                                            {/* REDO Button - Primary Action */}
                                            <motion.button
                                                onClick={(e) => handleRedo(log, e)}
                                                whileHover={{
                                                    scale: 1.02,
                                                    backgroundColor: "#CCFF00",
                                                    boxShadow: "0 0 16px rgba(204, 255, 0, 0.4)",
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center justify-center"
                                                style={{
                                                    flex: 1,
                                                    height: 36,
                                                    backgroundColor: "rgba(204, 255, 0, 0.15)",
                                                    border: "1px solid #CCFF00",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                    gap: 8,
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                <span style={{ fontSize: 12 }}>▶</span>
                                                <span
                                                    style={{
                                                        fontFamily: "'Chakra Petch', sans-serif",
                                                        fontSize: 11,
                                                        color: "#CCFF00",
                                                        letterSpacing: 1,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    REDO
                                                </span>
                                            </motion.button>

                                            {/* EDIT Button - Secondary Action */}
                                            <motion.button
                                                onClick={(e) => handleEdit(log, e)}
                                                whileHover={{
                                                    scale: 1.02,
                                                    backgroundColor: "#2a2a2a",
                                                    borderColor: "#888888",
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center justify-center"
                                                style={{
                                                    flex: 1,
                                                    height: 36,
                                                    backgroundColor: "#1a1a1a",
                                                    border: "1px solid #333333",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                    gap: 8,
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 10,
                                                        color: "#666666",
                                                    }}
                                                >
                                                    ✎
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily: "'Chakra Petch', sans-serif",
                                                        fontSize: 11,
                                                        color: "#888888",
                                                        letterSpacing: 1,
                                                    }}
                                                >
                                                    EDIT
                                                </span>
                                            </motion.button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Back Link */}
                <Link href="/builder">
                    <span
                        className="absolute cursor-pointer hover:text-white transition-colors"
                        style={{
                            left: 24,
                            top: 780,
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#555555",
                            letterSpacing: 1,
                        }}
                    >
                        &gt; BUILDER
                    </span>
                </Link>

                {/* Clear Archive Confirmation Modal */}
                <AnimatePresence>
                    {showClearConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.85)",
                                zIndex: 100,
                                borderRadius: 40,
                            }}
                            onClick={() => setShowClearConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: 320,
                                    backgroundColor: "#111111",
                                    border: "1px solid #FF6B6B",
                                    borderRadius: 8,
                                    padding: 24,
                                }}
                            >
                                {/* Warning Header */}
                                <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
                                    <span style={{ fontSize: 24 }}>⚠️</span>
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 16,
                                            color: "#FF6B6B",
                                        }}
                                    >
                                        CLEAR_ALL
                                    </span>
                                </div>

                                {/* Warning Message */}
                                <p
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 12,
                                        color: "#AAAAAA",
                                        lineHeight: 1.6,
                                        marginBottom: 24,
                                    }}
                                >
                                    This will permanently delete <span style={{ color: "#FF6B6B", fontWeight: 600 }}>{workoutHistory.length}</span> workout{workoutHistory.length !== 1 ? "s" : ""} from your archive.
                                    Your streak and progress history will be reset.
                                </p>

                                {/* Session Count Preview */}
                                <div
                                    style={{
                                        backgroundColor: "#1A1A1A",
                                        borderRadius: 4,
                                        padding: "12px 16px",
                                        marginBottom: 20,
                                        border: "1px solid #333333",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 10,
                                            color: "#555555",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        SESSIONS_TO_DELETE:
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 20,
                                            color: "#FF6B6B",
                                            marginLeft: 12,
                                        }}
                                    >
                                        {workoutHistory.length}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex" style={{ gap: 12 }}>
                                    <motion.button
                                        onClick={() => setShowClearConfirm(false)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            height: 44,
                                            backgroundColor: "#1A1A1A",
                                            border: "1px solid #333333",
                                            borderRadius: 4,
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 11,
                                            color: "#888888",
                                            letterSpacing: 1,
                                            cursor: "pointer",
                                        }}
                                    >
                                        CANCEL
                                    </motion.button>
                                    <motion.button
                                        onClick={handleClearArchive}
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 0 16px rgba(255, 107, 107, 0.4)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            flex: 1,
                                            height: 44,
                                            backgroundColor: "#FF6B6B",
                                            border: "none",
                                            borderRadius: 4,
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 11,
                                            color: "#000000",
                                            letterSpacing: 1,
                                            cursor: "pointer",
                                        }}
                                    >
                                        CLEAR_ALL
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
