"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DevNavigation from "../components/DevNavigation";
import ExerciseSearch from "../components/ExerciseSearch";
import GifModal from "../components/GifModal";
import { fetchExerciseGif } from "../lib/musclewiki";

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
}

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

    // Load preloaded exercises from Archive (EDIT button)
    useEffect(() => {
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
            } catch {
                // Ignore if parsing fails
            }
        }
    }, []);

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
        // Transform exercises for Active screen format (add sets, weight, reps, muscle)
        const workoutExercises = selectedExercises.map((ex, idx) => ({
            id: idx + 1,
            name: ex.name.toUpperCase(),
            muscle: ex.muscle, // Include muscle for heatmap tracking
            sets: 3, // Default sets
            weight: "0", // User will adjust
            reps: "10", // Default reps
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
            {/* Phone Frame */}
            <div
                className="relative overflow-hidden"
                style={{
                    width: 393,
                    height: 852,
                    borderRadius: 40,
                    backgroundColor: "#0A0A0A",
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
                        BUILD
                    </span>
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 11,
                            color: "#555555",
                            letterSpacing: 2,
                            marginTop: -4,
                        }}
                    >
                        // CONFIGURE_SESSION
                    </span>
                </motion.div>

                {/* Preloaded from Archive Banner */}
                <AnimatePresence>
                    {preloadedFrom === "archive" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute flex items-center justify-between"
                            style={{
                                left: 24,
                                top: 104,
                                width: 345,
                                padding: "8px 12px",
                                backgroundColor: "rgba(204, 255, 0, 0.1)",
                                border: "1px solid rgba(204, 255, 0, 0.3)",
                                borderRadius: 6,
                            }}
                        >
                            <div className="flex items-center" style={{ gap: 8 }}>
                                <span style={{ fontSize: 12 }}>🔄</span>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#CCFF00",
                                        letterSpacing: 1,
                                    }}
                                >
                                    LOADED_FROM_ARCHIVE
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
                        top: preloadedFrom ? 148 : 120, // Shift down when banner visible
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
                        + ADD_EXERCISE
                    </span>
                </motion.div>

                {/* Selected Exercises Section */}
                <div
                    className="absolute flex flex-col"
                    style={{
                        left: 24,
                        top: preloadedFrom ? 228 : 200, // Shift down when banner visible
                        width: 345,
                        height: preloadedFrom ? 452 : 480, // Adjust height for banner space
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
                                QUEUE
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
                                    SUPERSET
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
                                CLEAR_ALL
                            </motion.button>
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
                                NO EXERCISES SELECTED
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
                                Tap + ADD_EXERCISE to build your session
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
                                                    {exercise.name}
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
                                                        {exercise.muscle}
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
                                START_SESSION →
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
                                SELECT EXERCISES TO START
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
            </div>
        </main>
    );
}
