"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DevNavigation from "../components/DevNavigation";
import ExerciseSearch from "../components/ExerciseSearch";
import GifModal from "../components/GifModal";
import { fetchExerciseGif } from "../lib/musclewiki";
import { t, translateExercise, translateMuscle, getLocale } from "../lib/i18n";

/**
 * Screen 3: Builder / WORKOUT_BUILDER
 * Redesigned for exercise selection and workout creation
 * Following Glitch Sport aesthetic: industrial, neon accents, kinetic
 */

interface Exercise {
    id: string;
    name: string;
    muscle: string;
    equipment: string;
    gifUrl: string;
    // Saved routine workout data
    savedSets?: number;
    savedWeight?: string;
    savedReps?: string;
}

// Day-based saved routines
type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
interface WeeklyRoutines {
    [key: string]: Exercise[] | undefined;
}

const DAYS_EN: { key: DayOfWeek; label: string }[] = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
];
const DAYS_ES: { key: DayOfWeek; label: string }[] = [
    { key: 'sun', label: 'D' },
    { key: 'mon', label: 'L' },
    { key: 'tue', label: 'M' },
    { key: 'wed', label: 'X' },
    { key: 'thu', label: 'J' },
    { key: 'fri', label: 'V' },
    { key: 'sat', label: 'S' },
];

export default function BuilderScreen() {
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [preloadedFrom, setPreloadedFrom] = useState<string | null>(null);
    const [supersetMode, setSupersetMode] = useState(false);

    // GIF Modal state
    const [gifModalOpen, setGifModalOpen] = useState(false);
    const [gifModalExercise, setGifModalExercise] = useState<string>("");
    const [gifModalUrl, setGifModalUrl] = useState<string>("");
    const [loadingGif, setLoadingGif] = useState<string | null>(null);

    // Weekly routines state
    const [weeklyRoutines, setWeeklyRoutines] = useState<WeeklyRoutines>({});
    const [saveToDayModalOpen, setSaveToDayModalOpen] = useState(false);
    const [deleteConfirmDay, setDeleteConfirmDay] = useState<DayOfWeek | null>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Get today's day key
    const getTodayKey = (): DayOfWeek => {
        const dayIndex = new Date().getDay();
        return DAYS_EN[dayIndex].key;
    };

    // Load weekly routines from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("weeklyRoutines");
        if (stored) {
            try {
                setWeeklyRoutines(JSON.parse(stored));
            } catch {
                // Ignore if parsing fails
            }
        }
    }, []);

    // Load routine for a specific day
    const loadRoutine = (day: DayOfWeek) => {
        const routine = weeklyRoutines[day];
        if (routine && routine.length > 0) {
            setSelectedExercises(routine);
            setPreloadedFrom(`routine_${day}`);
        }
    };

    // Save current exercises to a specific day
    const saveRoutineToDay = (day: DayOfWeek) => {
        if (selectedExercises.length === 0) return;

        const updated = { ...weeklyRoutines, [day]: selectedExercises };
        setWeeklyRoutines(updated);
        localStorage.setItem("weeklyRoutines", JSON.stringify(updated));
        setSaveToDayModalOpen(false);
    };

    // Delete routine from a specific day
    const deleteRoutineFromDay = (day: DayOfWeek) => {
        const updated = { ...weeklyRoutines };
        delete updated[day];
        setWeeklyRoutines(updated);
        localStorage.setItem("weeklyRoutines", JSON.stringify(updated));
        setDeleteConfirmDay(null);
    };

    // Long-press handlers for day buttons
    const longPressTriggeredRef = useRef(false);

    const handleDayPointerDown = (day: DayOfWeek) => {
        const hasRoutine = weeklyRoutines[day] && weeklyRoutines[day]!.length > 0;
        if (!hasRoutine) return;
        longPressTriggeredRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            setDeleteConfirmDay(day);
            longPressTriggeredRef.current = true;
        }, 500);
    };

    const handleDayPointerUp = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    // Load preloaded exercises from Archive (EDIT button) OR restore previous session
    useEffect(() => {
        // First check for preload from Archive (higher priority)
        const preload = localStorage.getItem("builderPreload");
        if (preload) {
            try {
                const exercises = JSON.parse(preload) as { id: number; name: string; muscle: string; equipment: string }[];
                // Transform to Builder format with unique string IDs
                const formatted: Exercise[] = exercises.map((ex, idx) => ({
                    id: `preload-${idx}`,
                    name: ex.name,
                    muscle: ex.muscle,
                    equipment: ex.equipment || "barbell",
                    gifUrl: "", // Not needed for display
                }));
                setSelectedExercises(formatted);
                setPreloadedFrom("archive");
                // Clear the preload after loading
                localStorage.removeItem("builderPreload");
                return; // Exit early, preload takes precedence
            } catch {
                // Ignore if parsing fails
            }
        }

        // Otherwise, restore any previously selected exercises (session persistence)
        const savedExercises = localStorage.getItem("builderExercises");
        if (savedExercises) {
            try {
                const parsed = JSON.parse(savedExercises);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSelectedExercises(parsed);
                }
            } catch {
                // Ignore if parsing fails
            }
        }
    }, []);

    // Persist selected exercises to localStorage whenever they change
    useEffect(() => {
        if (selectedExercises.length > 0) {
            localStorage.setItem("builderExercises", JSON.stringify(selectedExercises));
        } else {
            // Clear storage when empty (user cleared all exercises)
            localStorage.removeItem("builderExercises");
        }
    }, [selectedExercises]);

    const handleSelectExercise = (exercise: Exercise) => {
        // Prevent duplicates
        if (!selectedExercises.find(e => e.id === exercise.id)) {
            setSelectedExercises(prev => [...prev, exercise]);
        }
    };

    const removeExercise = (id: string) => {
        setSelectedExercises(prev => prev.filter(e => e.id !== id));
    };

    const handleStartSession = () => {
        // Check if HIIT Session is in the queue
        const hiitExercise = selectedExercises.find(ex => ex.id === "hiit_session");
        if (hiitExercise) {
            // Route to dedicated HIIT screen
            localStorage.setItem("hiitMode", "true");
            router.push("/active-hiit");
            return;
        }

        // Transform exercises for Active screen format (add sets, weight, reps, muscle)
        const workoutExercises = selectedExercises.map((ex, idx) => ({
            id: idx + 1,
            name: ex.name.toUpperCase(),
            muscle: ex.muscle, // Include muscle for heatmap tracking
            isCardio: ex.muscle === "CARDIO", // Flag cardio exercises
            sets: ex.savedSets || (ex.muscle === "CARDIO" ? 1 : 3), // Cardio default: 1 "set"
            weight: ex.savedWeight || "0",
            reps: ex.savedReps || "10",
        }));

        // Save workout and superset mode to localStorage
        localStorage.setItem("activeWorkout", JSON.stringify(workoutExercises));
        localStorage.setItem("supersetMode", JSON.stringify(supersetMode));

        // Navigate to Active screen
        router.push("/active");
    };

    const canStart = selectedExercises.length >= 1;

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            {/* Phone Frame - Responsive */}
            <div
                className="relative overflow-hidden w-full h-dvh max-w-md"
                style={{
                    borderRadius: 0,
                    backgroundColor: "#0A0A0A",
                }}
                onClick={() => {
                    if (deleteConfirmDay) {
                        setDeleteConfirmDay(null);
                    }
                }}
            >
                {/* Dev Navigation */}
                <DevNavigation />

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute flex flex-col"
                    style={{ left: 24, top: 48, width: 345 }}
                >
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 28,
                            color: "#FFFFFF",
                            letterSpacing: -1,
                        }}
                    >
                        {t('BUILDER')}
                    </span>
                </motion.div>

                {/* MY_ROUTINES - 7 Day Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="absolute flex flex-col"
                    style={{ left: 24, top: 95, width: 345, gap: 6 }}
                >
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 10,
                            color: "#888888",
                            letterSpacing: 1,
                        }}
                    >
                        {t('MY_ROUTINES')}
                    </span>
                    <div className="flex justify-between" style={{ gap: 8 }}>
                        {(getLocale() === 'es' ? DAYS_ES : DAYS_EN).map((day) => {
                            const hasRoutine = weeklyRoutines[day.key] && weeklyRoutines[day.key]!.length > 0;
                            const isToday = getTodayKey() === day.key;

                            return (
                                <button
                                    key={day.key}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (longPressTriggeredRef.current) {
                                            // Skip the click that fires right after long-press
                                            longPressTriggeredRef.current = false;
                                            return;
                                        }
                                        if (deleteConfirmDay === day.key) {
                                            // Tap on ✕ day = delete
                                            deleteRoutineFromDay(day.key);
                                            return;
                                        }
                                        if (deleteConfirmDay) {
                                            // Tap on another day = cancel
                                            setDeleteConfirmDay(null);
                                            return;
                                        }
                                        loadRoutine(day.key);
                                    }}
                                    onPointerDown={() => handleDayPointerDown(day.key)}
                                    onPointerUp={handleDayPointerUp}
                                    onPointerLeave={handleDayPointerUp}
                                    className="flex flex-col items-center justify-center"
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 6,
                                        backgroundColor: deleteConfirmDay === day.key
                                            ? "rgba(255, 107, 107, 0.15)"
                                            : isToday && hasRoutine ? "#0A0A0A" : "#1A1A1A",
                                        border: deleteConfirmDay === day.key
                                            ? "1px solid #FF6B6B"
                                            : hasRoutine
                                                ? isToday
                                                    ? "2px solid #CCFF00"
                                                    : "1px solid #CCFF00"
                                                : "1px solid #333333",
                                        cursor: hasRoutine ? "pointer" : "default",
                                        opacity: hasRoutine ? 1 : 0.6,
                                        position: "relative",
                                        transition: "background-color 0.15s ease, border-color 0.15s ease",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 14,
                                            color: deleteConfirmDay === day.key
                                                ? "#FF6B6B"
                                                : hasRoutine ? "#CCFF00" : "#555555",
                                            transition: "color 0.15s ease",
                                        }}
                                    >
                                        {deleteConfirmDay === day.key ? "✕" : day.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                </motion.div>

                <AnimatePresence>
                    {preloadedFrom && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute flex items-center justify-between"
                            style={{
                                left: 24,
                                top: 160,
                                width: 345,
                                padding: "10px 16px",
                                backgroundColor: "rgba(204, 255, 0, 0.1)",
                                border: "1px solid rgba(204, 255, 0, 0.3)",
                                borderRadius: 6,
                            }}
                        >
                            <div className="flex items-center" style={{ gap: 8 }}>
                                <span style={{ fontSize: 12 }}>
                                    {preloadedFrom === "archive" ? "🔄" : "📅"}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#CCFF00",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {preloadedFrom === "archive"
                                        ? t('LOADED_ARCHIVE')
                                        : `LOADED_${preloadedFrom.replace("routine_", "").toUpperCase()}_ROUTINE`}
                                </span>
                            </div>
                            <motion.button
                                onClick={() => setPreloadedFrom(null)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#888888",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                ✕
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Exercise Count Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute flex items-center justify-center"
                    style={{
                        right: 24,
                        top: 52,
                        width: 48,
                        height: 48,
                        backgroundColor: selectedExercises.length > 0 ? "#CCFF00" : "#1A1A1A",
                        borderRadius: 8,
                        border: selectedExercises.length > 0 ? "none" : "1px solid #333333",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 20,
                            color: selectedExercises.length > 0 ? "#000000" : "#555555",
                        }}
                    >
                        {selectedExercises.length}
                    </span>
                </motion.div>

                {/* Add Exercise Button - Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 30px rgba(204, 255, 0, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="absolute flex items-center justify-center cursor-pointer"
                    style={{
                        left: 24,
                        top: preloadedFrom ? 198 : 170, // Shift down when banner visible
                        width: 345,
                        height: 56,
                        background: "linear-gradient(135deg, #CCFF00 0%, #9BCC00 100%)",
                        borderRadius: 6,
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 13,
                            color: "#000000",
                            letterSpacing: 1,
                        }}
                    >
                        + {t('ADD_EXERCISES')}
                    </span>
                </motion.div>

                {/* Selected Exercises Section */}
                <div
                    className="absolute flex flex-col"
                    style={{
                        left: 24,
                        top: preloadedFrom ? 278 : 250, // Shift down when banner visible
                        width: 345,
                        height: preloadedFrom ? 390 : 418, // Adjusted for MY_ROUTINES section
                        gap: 12,
                    }}
                >
                    {/* Section Label with Superset Toggle */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center" style={{ gap: 12 }}>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#555555",
                                    letterSpacing: 2,
                                }}
                            >
                                {t('QUEUE')}
                            </span>
                            {/* Superset Toggle */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSupersetMode(!supersetMode)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "4px 8px",
                                    backgroundColor: supersetMode ? "rgba(204, 255, 0, 0.15)" : "#1A1A1A",
                                    border: supersetMode ? "1px solid #CCFF00" : "1px solid #333333",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 8,
                                        fontWeight: 600,
                                        color: supersetMode ? "#CCFF00" : "#555555",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t('SUPERSET')}
                                </span>
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 2,
                                        backgroundColor: supersetMode ? "#CCFF00" : "#333333",
                                    }}
                                />
                            </motion.button>
                        </div>
                        {selectedExercises.length > 0 && (
                            <div className="flex items-center" style={{ gap: 12 }}>
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSaveToDayModalOpen(true)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 9,
                                        color: "#CCFF00",
                                        letterSpacing: 1,
                                    }}
                                >
                                    💾 {t('SAVE')}
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedExercises([])}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 9,
                                        color: "#FF4444",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t('CLEAR_ALL')}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Empty State */}
                    {selectedExercises.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col items-center justify-center"
                            style={{
                                flex: 1,
                                backgroundColor: "#0D0D0D",
                                borderRadius: 8,
                                border: "1px dashed #222222",
                                padding: 40,
                            }}
                        >
                            <motion.span
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ fontSize: 48, marginBottom: 16 }}
                            >
                                🏋️
                            </motion.span>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 12,
                                    color: "#444444",
                                    textAlign: "center",
                                    letterSpacing: 1,
                                }}
                            >
                                {t('NO_EXERCISES')}
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#333333",
                                    textAlign: "center",
                                    marginTop: 8,
                                }}
                            >
                                {t('TAP_ADD')}
                            </span>
                        </motion.div>
                    )}

                    {/* Exercise List */}
                    {selectedExercises.length > 0 && (
                        <div
                            className="flex flex-col overflow-y-auto"
                            style={{ gap: 8, flex: 1 }}
                        >
                            <AnimatePresence mode="popLayout">
                                {selectedExercises.map((exercise, index) => {
                                    // Calculate superset pair (A=0, B=1, etc.)
                                    const pairIndex = Math.floor(index / 2);
                                    const pairLetter = String.fromCharCode(65 + pairIndex); // A, B, C...
                                    const isFirstInPair = index % 2 === 0;
                                    const isLastExercise = index === selectedExercises.length - 1;
                                    const isOddSolo = isLastExercise && selectedExercises.length % 2 !== 0;

                                    return (
                                        <motion.div
                                            key={exercise.id}
                                            layout
                                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                            transition={{
                                                type: "spring",
                                                damping: 20,
                                                stiffness: 300,
                                            }}
                                            whileHover={{
                                                backgroundColor: "#161616",
                                                x: 4,
                                            }}
                                            className="flex items-center"
                                            style={{
                                                backgroundColor: "#111111",
                                                borderRadius: 6,
                                                padding: 14,
                                                gap: 14,
                                                border: "1px solid #1A1A1A",
                                                // Superset visual: left accent border
                                                borderLeft: supersetMode && !isOddSolo
                                                    ? `3px solid ${isFirstInPair ? "#CCFF00" : "#9BCC00"}`
                                                    : "1px solid #1A1A1A",
                                            }}
                                        >
                                            {/* Superset Pair Badge */}
                                            {supersetMode && !isOddSolo && (
                                                <div
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: 2,
                                                        backgroundColor: "rgba(204, 255, 0, 0.15)",
                                                        border: "1px solid rgba(204, 255, 0, 0.3)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontFamily: "'Rubik Mono One', monospace",
                                                            fontSize: 8,
                                                            color: "#CCFF00",
                                                        }}
                                                    >
                                                        {pairLetter}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Order Number */}
                                            <div
                                                className="flex items-center justify-center"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    backgroundColor: index === 0 ? "#CCFF00" : "#222222",
                                                    borderRadius: 4,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "'Rubik Mono One', monospace",
                                                        fontSize: 11,
                                                        color: index === 0 ? "#000000" : "#666666",
                                                    }}
                                                >
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Exercise Info */}
                                            <div className="flex flex-col flex-1" style={{ gap: 4 }}>
                                                <span
                                                    style={{
                                                        fontFamily: "'Chakra Petch', sans-serif",
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: "#FFFFFF",
                                                        letterSpacing: 0.5,
                                                    }}
                                                >
                                                    {translateExercise(exercise.name)}
                                                </span>
                                                <div className="flex items-center" style={{ gap: 8 }}>
                                                    <span
                                                        style={{
                                                            padding: "2px 6px",
                                                            backgroundColor: "#CCFF00",
                                                            borderRadius: 2,
                                                            fontFamily: "'Chakra Petch', sans-serif",
                                                            fontSize: 8,
                                                            color: "#000000",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {translateMuscle(exercise.muscle)}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontFamily: "'Chakra Petch', sans-serif",
                                                            fontSize: 9,
                                                            color: "#555555",
                                                        }}
                                                    >
                                                        {exercise.equipment}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Watch Demo Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: "#222222" }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    setLoadingGif(exercise.id);
                                                    const url = await fetchExerciseGif(exercise.name, exercise.muscle);
                                                    setLoadingGif(null);
                                                    if (url) {
                                                        setGifModalExercise(exercise.name);
                                                        setGifModalUrl(url);
                                                        setGifModalOpen(true);
                                                    }
                                                }}
                                                disabled={loadingGif === exercise.id}
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    backgroundColor: "#1A1A1A",
                                                    border: "1px solid #333333",
                                                    borderRadius: 4,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginRight: 8,
                                                }}
                                            >
                                                {loadingGif === exercise.id ? (
                                                    <motion.div
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            backgroundColor: "#CCFF00",
                                                            borderRadius: 2,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            color: "#CCFF00",
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        ▶
                                                    </span>
                                                )}
                                            </motion.button>

                                            {/* Remove Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.1, color: "#FF4444" }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeExercise(exercise.id)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#444444",
                                                    fontSize: 16,
                                                    padding: 4,
                                                }}
                                            >
                                                ✕
                                            </motion.button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Start Workout Button - moved up to avoid nav collision */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute"
                    style={{ left: 24, bottom: 80, width: 345 }}
                >
                    {canStart ? (
                        <motion.div
                            whileHover={{
                                scale: 1.02,
                                boxShadow: "0 0 40px rgba(204, 255, 0, 0.4)",
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleStartSession}
                            className="flex items-center justify-center cursor-pointer"
                            style={{
                                width: "100%",
                                height: 64,
                                background: "linear-gradient(135deg, #CCFF00 0%, #88CC00 100%)",
                                borderRadius: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 16,
                                    color: "#000000",
                                    letterSpacing: 2,
                                }}
                            >
                                {t('START_SESSION')} <span style={{ display: 'inline-block', transform: 'translateY(-1px)', marginLeft: 4 }}>→</span>
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="flex items-center justify-center"
                            style={{
                                width: "100%",
                                height: 64,
                                backgroundColor: "#1A1A1A",
                                borderRadius: 8,
                                border: "1px solid #222222",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 12,
                                    color: "#444444",
                                    letterSpacing: 1,
                                }}
                            >
                                {t('TAP_ADD')}
                            </span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Exercise Search Modal */}
                <ExerciseSearch
                    isOpen={isSearchOpen}
                    onClose={() => setIsSearchOpen(false)}
                    onSelect={handleSelectExercise}
                />

                {/* GIF Preview Modal */}
                <GifModal
                    isOpen={gifModalOpen}
                    onClose={() => setGifModalOpen(false)}
                    exerciseName={gifModalExercise}
                    gifUrl={gifModalUrl}
                />

                {/* Save to Day Modal */}
                <AnimatePresence>
                    {saveToDayModalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 flex items-center justify-center z-50"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
                            onClick={() => setSaveToDayModalOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="flex flex-col items-center"
                                style={{
                                    backgroundColor: "#1A1A1A",
                                    borderRadius: 12,
                                    padding: 24,
                                    width: 320,
                                    gap: 16,
                                    border: "1px solid #333333",
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 14,
                                        color: "#FFFFFF",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t('SAVE_TO_DAY')}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 11,
                                        color: "#888888",
                                        textAlign: "center",
                                    }}
                                >
                                    {t('PICK_DAY')}
                                </span>
                                <div className="flex justify-between w-full" style={{ gap: 8 }}>
                                    {(getLocale() === 'es' ? DAYS_ES : DAYS_EN).map((day) => {
                                        const hasRoutine = weeklyRoutines[day.key] && weeklyRoutines[day.key]!.length > 0;

                                        return (
                                            <motion.button
                                                key={day.key}
                                                onClick={() => saveRoutineToDay(day.key)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col items-center justify-center"
                                                style={{
                                                    width: 36,
                                                    height: 48,
                                                    borderRadius: 6,
                                                    backgroundColor: hasRoutine ? "rgba(204, 255, 0, 0.1)" : "#0A0A0A",
                                                    border: hasRoutine ? "1px solid #CCFF00" : "1px solid #333333",
                                                    cursor: "pointer",
                                                    gap: 2,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "'Rubik Mono One', monospace",
                                                        fontSize: 12,
                                                        color: hasRoutine ? "#CCFF00" : "#888888",
                                                    }}
                                                >
                                                    {day.label}
                                                </span>
                                                {hasRoutine && (
                                                    <span style={{ fontSize: 6, color: "#CCFF00" }}>●</span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <motion.button
                                    onClick={() => setSaveToDayModalOpen(false)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        width: "100%",
                                        padding: "10px 16px",
                                        backgroundColor: "transparent",
                                        border: "1px solid #333333",
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 11,
                                        color: "#888888",
                                        letterSpacing: 1,
                                    }}
                                >
                                    {t('CANCEL')}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
