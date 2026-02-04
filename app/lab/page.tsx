"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DevNavigation from "../components/DevNavigation";
import BodyHeatmap from "../components/BodyHeatmap";

/**
 * Screen 5: The Lab / WORKOUT_SCREEN5
 * Now with DYNAMIC HEATMAP based on actual workout data!
 * FULLY RESPONSIVE with flex layout
 */

interface MuscleIntensity {
    CHEST: number;
    BACK: number;
    LEGS: number;
    SHOULDERS: number;
    ARMS: number;
    CORE: number;
}

const defaultMuscleIntensity: MuscleIntensity = {
    CHEST: 0,
    BACK: 0,
    LEGS: 0,
    SHOULDERS: 0,
    ARMS: 0,
    CORE: 0,
};

interface WorkoutHistoryEntry {
    date: string;
    duration: number;
    exercises: number;
    totalSets: number;
    muscles: string[];
    volume: number;
}

interface DayData {
    day: string;
    height: number;
    active: boolean;
    today?: boolean;
    volume?: number;
}

const energyRecommendations = [
    { level: 1, text: "REST_DAY. RECOVER." },
    { level: 2, text: "LIGHT_CARDIO ONLY." },
    { level: 3, text: "MODERATE_SESSION OK." },
    { level: 4, text: "GOOD_TO_GO. TRAIN HARD." },
    { level: 5, text: "BEAST_MODE. FRESH MUSCLES." },
    { level: 6, text: "PEAK_FORM. MAX OUT." },
];

// Calculate weekly data from workout history
const calculateWeeklyData = (history: WorkoutHistoryEntry[]): DayData[] => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const today = new Date();
    const todayDayIndex = today.getDay();

    // Get start of current week (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - todayDayIndex);
    weekStart.setHours(0, 0, 0, 0);

    return days.map((day, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);

        // Find workouts on this day
        const dayWorkouts = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.toDateString() === dayDate.toDateString();
        });

        // Sum volume for the day
        const totalVolume = dayWorkouts.reduce((sum, w) => sum + w.volume, 0);

        return {
            day,
            height: Math.min(60, Math.max(4, totalVolume)), // 4-60 range for bar height (reduced for flex)
            active: totalVolume > 0,
            today: index === todayDayIndex,
            volume: totalVolume,
        };
    });
};

// Calculate energy level based on workout patterns
const calculateEnergyLevel = (history: WorkoutHistoryEntry[], lastWorkoutTime: string | null): number => {
    if (!lastWorkoutTime) return 6; // No workout = fully rested

    const lastWorkout = new Date(lastWorkoutTime);
    const now = new Date();
    const hoursSinceWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

    // Get workouts in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentWorkouts = history.filter(entry => new Date(entry.date) > weekAgo);
    const weeklyVolume = recentWorkouts.reduce((sum, w) => sum + w.volume, 0);

    // Energy based on recovery time and weekly load
    if (hoursSinceWorkout < 12) return 1; // Just worked out, need rest
    if (hoursSinceWorkout < 24) return 2; // Still recovering
    if (hoursSinceWorkout < 36) return 3; // Moderate recovery
    if (hoursSinceWorkout < 48) return 4; // Good recovery
    if (weeklyVolume > 300) return 4; // High weekly volume, cap energy
    if (hoursSinceWorkout < 72) return 5; // Well rested
    return 6; // Fully recovered
};

export default function LabScreen() {
    const [muscleIntensity, setMuscleIntensity] = useState<MuscleIntensity>(defaultMuscleIntensity);
    const [lastWorkoutTime, setLastWorkoutTime] = useState<string | null>(null);
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistoryEntry[]>([]);
    const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
    const [energyLevel, setEnergyLevel] = useState(5);

    // Load workout data from localStorage on mount
    useEffect(() => {
        const storedIntensity = localStorage.getItem("muscleIntensity");
        const storedTime = localStorage.getItem("lastWorkoutTime");
        const storedHistory = localStorage.getItem("workoutHistory");

        if (storedIntensity) {
            try {
                const parsed = JSON.parse(storedIntensity) as MuscleIntensity;
                setMuscleIntensity(parsed);
            } catch {
                // Use default if parsing fails
            }
        }

        if (storedTime) {
            setLastWorkoutTime(storedTime);
        }

        let history: WorkoutHistoryEntry[] = [];
        if (storedHistory) {
            try {
                history = JSON.parse(storedHistory) as WorkoutHistoryEntry[];
                setWorkoutHistory(history);
            } catch {
                // Use empty if parsing fails
            }
        }

        // Calculate dynamic data
        setWeeklyData(calculateWeeklyData(history));
        setEnergyLevel(calculateEnergyLevel(history, storedTime));
    }, []);

    const recommendation = energyRecommendations.find(r => r.level === energyLevel)?.text || "";
    const energyPercent = Math.round((energyLevel / 6) * 100);
    const energyStatus = energyPercent >= 80 ? "CHARGED" : energyPercent >= 50 ? "STABLE" : "LOW";

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            {/* Phone Frame - Responsive with flex column layout */}
            <div
                className="relative overflow-hidden w-full h-dvh max-w-md flex flex-col"
                style={{
                    backgroundColor: "#0A0A0A",
                    padding: 24,
                    paddingTop: 48,
                }}
            >
                {/* Dev Navigation */}
                <DevNavigation />

                {/* Header */}
                <div className="flex flex-col shrink-0" style={{ gap: -5 }}>
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 32,
                            color: "#FFFFFF",
                        }}
                    >
                        THE_LAB
                    </span>
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#555555",
                            letterSpacing: 1,
                        }}
                    >
                        // DIAGNOSTICS
                    </span>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto" style={{ marginTop: 16 }}>
                    {/* "SYSTEM_HEATMAP" label */}
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 10,
                            color: "#888888",
                            letterSpacing: 1,
                        }}
                    >
                        SYSTEM_HEATMAP
                    </span>

                    {/* Dynamic Heatmap Frame */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        style={{
                            marginTop: 8,
                            width: "100%",
                            height: 260,
                            backgroundColor: "#0a0a0a",
                            borderRadius: 4,
                            overflow: "hidden",
                            border: "1px solid #222222",
                            position: "relative",
                        }}
                    >
                        {/* Dynamic Body Heatmap */}
                        <BodyHeatmap muscleIntensity={muscleIntensity} />

                        {/* Last workout indicator */}
                        {lastWorkoutTime && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute"
                                style={{
                                    left: 8,
                                    bottom: 8,
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 7,
                                    color: "#444444",
                                    letterSpacing: 0.5,
                                }}
                            >
                                LAST: {new Date(lastWorkoutTime).toLocaleDateString()}
                            </motion.span>
                        )}
                    </motion.div>

                    {/* "WEEKLY_VOLUME" */}
                    <span
                        style={{
                            display: "block",
                            marginTop: 24,
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 10,
                            color: "#888888",
                            letterSpacing: 1,
                        }}
                    >
                        WEEKLY_VOLUME
                    </span>

                    {/* Volume Bars - Animated */}
                    <div
                        className="flex items-end justify-between"
                        style={{ marginTop: 8, width: "100%", height: 80 }}
                    >
                        {weeklyData.map((d, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center"
                                style={{ gap: 8 }}
                            >
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: d.height }}
                                    transition={{
                                        delay: 0.5 + i * 0.1,
                                        duration: 0.6,
                                        ease: "easeOut"
                                    }}
                                    whileHover={{
                                        scale: 1.1,
                                        boxShadow: d.active
                                            ? "0 0 12px rgba(204, 255, 0, 0.5)"
                                            : "none"
                                    }}
                                    style={{
                                        width: 30,
                                        backgroundColor: d.today ? "#FFFFFF" : d.active ? "#CCFF00" : "#333333",
                                        borderRadius: 2,
                                    }}
                                />
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + i * 0.1 }}
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: d.today ? "#FFFFFF" : "#555555",
                                    }}
                                >
                                    {d.day}
                                </motion.span>
                            </div>
                        ))}
                    </div>

                    {/* Energy / Recommendation - Interactive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="flex flex-col"
                        style={{ marginTop: 24, width: "100%", gap: 12 }}
                    >
                        {/* Header Row */}
                        <div className="flex items-center justify-between" style={{ width: "100%" }}>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#888888",
                                    letterSpacing: 1,
                                }}
                            >
                                ENERGY_LEVEL // AUTO_RECOVERY
                            </span>
                            <motion.span
                                key={energyPercent}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 12,
                                    color: energyPercent >= 80 ? "#CCFF00" : energyPercent >= 50 ? "#FFAA00" : "#FF4444",
                                }}
                            >
                                {energyPercent}% // {energyStatus}
                            </motion.span>
                        </div>
                        {/* Automated Battery Bar - Display Only */}
                        <div className="flex" style={{ gap: 4, height: 24 }}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: 1.4 + i * 0.05, duration: 0.3 }}
                                    style={{
                                        flex: 1,
                                        height: 24,
                                        backgroundColor: i <= energyLevel
                                            ? (energyLevel >= 5 ? "#CCFF00" : energyLevel >= 3 ? "#FFAA00" : "#FF4444")
                                            : "#222222",
                                        borderRadius: 4,
                                        transformOrigin: "bottom",
                                        boxShadow: i <= energyLevel && i === energyLevel
                                            ? `0 0 8px ${energyLevel >= 5 ? "rgba(204, 255, 0, 0.5)" : energyLevel >= 3 ? "rgba(255, 170, 0, 0.5)" : "rgba(255, 68, 68, 0.5)"}`
                                            : "none",
                                    }}
                                />
                            ))}
                        </div>
                        {/* Dynamic Insight */}
                        <motion.span
                            key={recommendation}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 14,
                                color: "#FFFFFF",
                            }}
                        >
                            {recommendation}
                        </motion.span>
                    </motion.div>
                </div>

                {/* "< RETURN_TO_BASE" - fixed at bottom */}
                <Link href="/" className="shrink-0" style={{ marginTop: 16 }}>
                    <span
                        className="cursor-pointer hover:text-white transition-colors"
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#555555",
                            letterSpacing: 1,
                        }}
                    >
                        &lt; RETURN_TO_BASE
                    </span>
                </Link>
            </div>
        </main>
    );
}
