"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DevNavigation from "../components/DevNavigation";

/**
 * Screen 4: Active Session / WORKOUT_SCREEN4
 * EXACT positions from WORK_IT_UP.pen:
 * - s4Header (ACTIVE + UPPER_POWER): x:24, y:48, gap:-5
 * - timerBox: x:250, y:55
 * - progBar: x:24, y:100, width:345, height:4, gap:4
 * - CURRENT_MOVE: x:24, y:120
 * - focusCard: x:24, y:140
 * - histContext: x:24, y:440
 * - UP_NEXT: x:24, y:490
 * - queueList: x:24, y:520
 * - finishLink: x:24, y:780
 */

interface WorkoutExercise {
    id: number;
    name: string;
    muscle?: string; // For heatmap tracking
    sets: number;
    weight: string;
    reps: string;
}

// Interface for exercise history lookup
interface ExerciseHistoryEntry {
    name: string;
    weight: string;
    reps: string;
    date: string;
}

const defaultExercises: WorkoutExercise[] = [
    { id: 1, name: "BENCH PRESS", sets: 4, weight: "100", reps: "8" },
    { id: 2, name: "INCLINE DB PRESS", sets: 3, weight: "32", reps: "10" },
    { id: 3, name: "CABLE FLYS", sets: 3, weight: "15", reps: "12" },
];

export default function ActiveScreen() {
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [weight, setWeight] = useState("0");
    const [reps, setReps] = useState("10");
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [showSetComplete, setShowSetComplete] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Superset mode state
    const [supersetMode, setSupersetMode] = useState(false);
    const [setTracker, setSetTracker] = useState<Record<number, number>>({}); // exerciseIndex -> completedSets

    // Exercise history from previous workouts
    const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoryEntry[]>([]);

    // Load workout history on mount to get last time data
    useEffect(() => {
        const storedHistory = localStorage.getItem("workoutHistory");
        if (storedHistory) {
            try {
                const history = JSON.parse(storedHistory);
                // Flatten all exercise details into a searchable array
                const allExercises: ExerciseHistoryEntry[] = [];
                history.forEach((workout: { date: string; exerciseDetails: { name: string; weight: string; reps: string }[] }) => {
                    workout.exerciseDetails?.forEach((ex: { name: string; weight: string; reps: string }) => {
                        allExercises.push({
                            name: ex.name.toUpperCase(),
                            weight: ex.weight,
                            reps: ex.reps,
                            date: workout.date,
                        });
                    });
                });
                setExerciseHistory(allExercises);
            } catch {
                // Ignore if parsing fails
            }
        }
    }, []);

    // Helper to find last time this exercise was performed
    const getLastTimeData = (exerciseName: string) => {
        const normalizedName = exerciseName.toUpperCase();
        const pastEntry = exerciseHistory.find(e => e.name === normalizedName);
        return pastEntry ? { weight: pastEntry.weight, reps: pastEntry.reps } : null;
    };

    // Load exercises from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("activeWorkout");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as WorkoutExercise[];
                if (parsed.length > 0) {
                    setExercises(parsed);
                    setWeight(parsed[0].weight);
                    setReps(parsed[0].reps);
                } else {
                    setExercises(defaultExercises);
                    setWeight(defaultExercises[0].weight);
                    setReps(defaultExercises[0].reps);
                }
            } catch {
                setExercises(defaultExercises);
                setWeight(defaultExercises[0].weight);
                setReps(defaultExercises[0].reps);
            }
        } else {
            setExercises(defaultExercises);
            setWeight(defaultExercises[0].weight);
            setReps(defaultExercises[0].reps);
        }

        // Load superset mode
        const storedSupersetMode = localStorage.getItem("supersetMode");
        if (storedSupersetMode) {
            try {
                setSupersetMode(JSON.parse(storedSupersetMode));
            } catch {
                // Ignore if parsing fails
            }
        }

        setIsLoaded(true);
    }, []);

    // Real-time session timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Rest timer countdown
    useEffect(() => {
        if (restTimer > 0) {
            const countdown = setInterval(() => {
                setRestTimer(prev => {
                    if (prev <= 1) {
                        setIsResting(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [restTimer]);

    const startRest = (seconds: number) => {
        setRestTimer(seconds);
        setIsResting(true);
    };

    const skipRest = () => {
        setRestTimer(0);
        setIsResting(false);
    };

    // Format seconds to HH:MM:SS
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Loading state - show nothing until exercises are loaded
    if (!isLoaded || exercises.length === 0) {
        return (
            <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div
                    className="relative overflow-hidden flex items-center justify-center"
                    style={{
                        width: 393,
                        height: 852,
                        borderRadius: 40,
                        backgroundColor: "#0A0A0A",
                    }}
                >
                    <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 16,
                            color: "#CCFF00",
                        }}
                    >
                        LOADING...
                    </motion.div>
                </div>
            </main>
        );
    }

    const activeExercise = exercises[currentIndex];
    const queue = exercises.slice(currentIndex + 1);

    const handleLogSet = () => {
        // Show set complete animation briefly
        setShowSetComplete(true);
        setTimeout(() => setShowSetComplete(false), 600);

        // Update the current exercise with the actual weight/reps used
        setExercises(prev => prev.map((ex, i) =>
            i === currentIndex
                ? { ...ex, weight: weight, reps: reps }
                : ex
        ));

        // Track completed sets for this exercise
        const newSetTracker = { ...setTracker };
        newSetTracker[currentIndex] = (newSetTracker[currentIndex] || 0) + 1;
        setSetTracker(newSetTracker);

        // Superset Logic
        if (supersetMode && exercises.length >= 2) {
            // Calculate pair info
            const pairStartIndex = Math.floor(currentIndex / 2) * 2;
            const partnerIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
            const isOddSolo = exercises.length % 2 !== 0 && currentIndex === exercises.length - 1;

            // Check if we're in a valid pair (not the solo odd exercise)
            if (!isOddSolo && partnerIndex < exercises.length && partnerIndex >= 0) {
                const partnerExercise = exercises[partnerIndex];
                const completedSetsThis = newSetTracker[currentIndex] || 0;
                const completedSetsPartner = newSetTracker[partnerIndex] || 0;

                // Check if partner still has sets to do in this round
                const partnerHasSetsRemaining = completedSetsPartner < partnerExercise.sets;
                const thisHasSetsRemaining = completedSetsThis < activeExercise.sets;

                // Determine if both have completed same number of sets (round complete)
                const roundNumber = Math.min(completedSetsThis, completedSetsPartner);
                const bothCompletedRound = completedSetsThis > roundNumber || completedSetsPartner > roundNumber;

                if (partnerHasSetsRemaining && completedSetsThis > completedSetsPartner) {
                    // Switch to partner immediately (no rest)
                    setCurrentIndex(partnerIndex);
                    setCurrentSet(completedSetsPartner + 1);
                    setWeight(partnerExercise.weight);
                    setReps(partnerExercise.reps);
                    return; // No rest between superset exercises
                } else if (thisHasSetsRemaining) {
                    // Both have same sets, continue with next set after rest
                    setCurrentSet(completedSetsThis + 1);
                    startRest(60); // Rest between rounds
                    return;
                } else if (partnerHasSetsRemaining) {
                    // This exercise is done but partner still has sets
                    setCurrentIndex(partnerIndex);
                    setCurrentSet(completedSetsPartner + 1);
                    setWeight(partnerExercise.weight);
                    setReps(partnerExercise.reps);
                    startRest(60);
                    return;
                }
                // Both exercises in pair are complete, move to next pair
                const nextPairStart = pairStartIndex + 2;
                if (nextPairStart < exercises.length) {
                    setCurrentIndex(nextPairStart);
                    setCurrentSet(1);
                    setWeight(exercises[nextPairStart].weight);
                    setReps(exercises[nextPairStart].reps);
                    startRest(90); // Rest between pairs
                    return;
                }
                // All pairs complete - fall through to workout complete logic
            }
        }

        // Normal (non-superset) logic
        if (currentSet < activeExercise.sets) {
            setCurrentSet(prev => prev + 1);
            // Start 60s rest timer between sets
            startRest(60);
        } else {
            if (currentIndex < exercises.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setCurrentSet(1);
                setWeight(exercises[currentIndex + 1].weight);
                setReps(exercises[currentIndex + 1].reps);
                // Start 90s rest timer between exercises
                startRest(90);
            } else {
                // Workout complete! Calculate muscle intensity for heatmap
                const muscleIntensity: Record<string, number> = {
                    CHEST: 0,
                    BACK: 0,
                    LEGS: 0,
                    SHOULDERS: 0,
                    ARMS: 0,
                    CORE: 0,
                };

                // Calculate intensity based on exercises and sets
                let totalSets = 0;
                exercises.forEach(ex => {
                    totalSets += ex.sets;
                    if (ex.muscle && muscleIntensity.hasOwnProperty(ex.muscle)) {
                        // Each set adds ~25% intensity, capped at 100
                        muscleIntensity[ex.muscle] = Math.min(100, muscleIntensity[ex.muscle] + (ex.sets * 25));
                    }
                });

                // Save muscle intensity for heatmap
                localStorage.setItem("muscleIntensity", JSON.stringify(muscleIntensity));

                // Save workout history entry for weekly volume and archive
                const workoutEntry = {
                    id: Date.now(), // Unique ID for React keys
                    date: new Date().toISOString(),
                    duration: elapsedSeconds,
                    exerciseCount: exercises.length,
                    totalSets: totalSets,
                    muscles: Object.entries(muscleIntensity)
                        .filter(([, intensity]) => intensity > 0)
                        .map(([muscle]) => muscle),
                    volume: totalSets * 10, // Simple volume score: sets × 10
                    // Detailed exercise list for Archive
                    exerciseDetails: exercises.map(ex => ({
                        name: ex.name,
                        muscle: ex.muscle || "GENERAL",
                        sets: ex.sets,
                        weight: ex.weight,
                        reps: ex.reps,
                    })),
                };

                // Get existing history or create new
                const existingHistory = localStorage.getItem("workoutHistory");
                let history = [];
                try {
                    history = existingHistory ? JSON.parse(existingHistory) : [];
                } catch {
                    history = [];
                }

                // Add new entry and keep last 30 days of data
                history.push(workoutEntry);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                history = history.filter((entry: { date: string }) =>
                    new Date(entry.date) > thirtyDaysAgo
                );

                localStorage.setItem("workoutHistory", JSON.stringify(history));
                localStorage.setItem("lastWorkoutTime", workoutEntry.date);

                // Show celebration then navigate
                setShowCelebration(true);
                setTimeout(() => {
                    window.location.href = "/lab";
                }, 2000);
            }
        }
    };

    const handleSurf = (indexInQueue: number) => {
        const realIndexToSwap = currentIndex + 1 + indexInQueue;
        const newExercises = [...exercises];
        [newExercises[currentIndex], newExercises[realIndexToSwap]] = [newExercises[realIndexToSwap], newExercises[currentIndex]];
        setExercises(newExercises);
        setCurrentSet(1);
        setWeight(newExercises[currentIndex].weight);
        setReps(newExercises[currentIndex].reps);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            {/* Phone Frame - 393x852 */}
            <div
                className="relative overflow-hidden"
                style={{
                    width: 393,
                    height: 852,
                    borderRadius: 40,
                    backgroundColor: "#0A0A0A",
                }}
            >
                {/* Dev Navigation - Hide Archive on Active screen to avoid collision */}
                <DevNavigation showArchiveButton={false} />

                {/* Set Complete Animation */}
                {showSetComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center justify-center"
                            style={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                backgroundColor: "rgba(204, 255, 0, 0.15)",
                                border: "3px solid #CCFF00",
                                boxShadow: "0 0 40px rgba(204, 255, 0, 0.4)",
                            }}
                        >
                            <motion.span
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.15, duration: 0.2 }}
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 48,
                                    color: "#CCFF00",
                                }}
                            >
                                ✓
                            </motion.span>
                        </motion.div>
                    </motion.div>
                )}

                {/* Rest Timer Overlay */}
                {isResting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex flex-col items-center justify-center"
                        style={{ backgroundColor: "rgba(10, 10, 10, 0.95)" }}
                    >
                        {/* Pulsing ring */}
                        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute rounded-full"
                                style={{
                                    width: 180,
                                    height: 180,
                                    border: "2px solid #CCFF00",
                                    boxShadow: "0 0 30px rgba(204, 255, 0, 0.3)",
                                }}
                            />
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute rounded-full"
                                style={{
                                    width: 160,
                                    height: 160,
                                    border: "4px solid #CCFF00",
                                }}
                            />
                            {/* Timer number */}
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 64,
                                    color: "#CCFF00",
                                    textShadow: "0 0 20px rgba(204, 255, 0, 0.5)",
                                }}
                            >
                                {restTimer}
                            </span>
                        </div>
                        {/* Label */}
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 14,
                                color: "#888888",
                                marginTop: 24,
                                letterSpacing: 2,
                            }}
                        >
                            REST_PERIOD
                        </span>
                        {/* Skip button */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={skipRest}
                            className="cursor-pointer"
                            style={{
                                marginTop: 32,
                                padding: "12px 32px",
                                border: "1px solid #555555",
                                borderRadius: 4,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 12,
                                    color: "#888888",
                                    letterSpacing: 1,
                                }}
                            >
                                SKIP →
                            </span>
                        </motion.div>
                    </motion.div>
                )}

                {/* Celebration Overlay */}
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                        style={{ backgroundColor: "rgba(10, 10, 10, 0.95)" }}
                    >
                        {/* Neon burst particles */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1, 0.5],
                                    x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                                    y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                                    opacity: [1, 1, 0],
                                }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                                className="absolute"
                                style={{
                                    width: 8,
                                    height: 8,
                                    backgroundColor: i % 2 === 0 ? "#CCFF00" : "#FFFFFF",
                                    borderRadius: "50%",
                                    boxShadow: `0 0 10px ${i % 2 === 0 ? "#CCFF00" : "#FFFFFF"}`,
                                }}
                            />
                        ))}
                        {/* Main text */}
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="text-center"
                        >
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 48,
                                    color: "#CCFF00",
                                    display: "block",
                                    textShadow: "0 0 20px rgba(204, 255, 0, 0.5)",
                                }}
                            >
                                CRUSHED IT!
                            </span>
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 14,
                                    color: "#888888",
                                    display: "block",
                                    marginTop: 8,
                                }}
                            >
                                WORKOUT COMPLETE
                            </motion.span>
                        </motion.div>
                    </motion.div>
                )}
                {/* s4Header at x:24, y:48 - ACTIVE + // UPPER_POWER with gap:-5 */}
                <div
                    className="absolute"
                    style={{ left: 24, top: 48, width: 345 }}
                >
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 32,
                            color: "#CCFF00",
                            display: "block",
                            lineHeight: "32px",
                        }}
                    >
                        ACTIVE
                    </span>
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#555555",
                            letterSpacing: 1,
                            display: "block",
                            marginTop: -5,
                        }}
                    >
            // UPPER_POWER
                    </span>
                </div>

                {/* timerBox at x:250, y:55 */}
                <div
                    className="absolute"
                    style={{ left: 250, top: 55, width: 120 }}
                >
                    <span
                        style={{
                            fontFamily: "'Rubik Mono One', monospace",
                            fontSize: 14,
                            color: "#FFFFFF",
                            letterSpacing: 1,
                            display: "block",
                        }}
                    >
                        {formatTime(elapsedSeconds)}
                    </span>
                    <span
                        style={{
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 8,
                            color: "#555555",
                            display: "block",
                            marginTop: 2,
                        }}
                    >
                        SESSION_TIME
                    </span>
                </div>

                {/* progBar at x:24, y:100, width:345, height:4, gap:4 */}
                {/* Dynamic progress based on sets completed */}
                {(() => {
                    // Calculate total sets in workout
                    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
                    // Calculate completed sets (all sets from completed exercises + sets done on current exercise)
                    const completedExerciseSets = exercises.slice(0, currentIndex).reduce((sum, ex) => sum + ex.sets, 0);
                    const completedSets = completedExerciseSets + (currentSet - 1);
                    // Progress percentage
                    const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

                    return (
                        <div
                            className="absolute"
                            style={{ left: 24, top: 100, width: 345, height: 4, backgroundColor: "#222222", borderRadius: 2 }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                style={{
                                    height: 4,
                                    backgroundColor: "#CCFF00",
                                    borderRadius: 2,
                                    boxShadow: progressPercent > 0 ? "0 0 8px rgba(204, 255, 0, 0.4)" : "none",
                                }}
                            />
                        </div>
                    );
                })()}

                {/* CURRENT_MOVE at x:24, y:120 */}
                <span
                    className="absolute"
                    style={{
                        left: 24,
                        top: 120,
                        fontFamily: "'Chakra Petch', sans-serif",
                        fontSize: 10,
                        color: "#888888",
                        letterSpacing: 1,
                    }}
                >
                    CURRENT_MOVE
                </span>

                {/* focusCard at x:24, y:140 */}
                <div
                    className="absolute"
                    style={{
                        left: 24,
                        top: 140,
                        width: 345,
                        backgroundColor: "#111111",
                        borderRadius: 4,
                        padding: 24,
                    }}
                >
                    {/* focusHead - BENCH PRESS + SET counter */}
                    <div className="flex items-center justify-between" style={{ width: "100%", marginBottom: 24 }}>
                        <div className="flex items-center" style={{ gap: 10 }}>
                            {/* Superset Badge */}
                            {supersetMode && exercises.length >= 2 && (() => {
                                const pairIndex = Math.floor(currentIndex / 2);
                                const pairLetter = String.fromCharCode(65 + pairIndex);
                                const isOddSolo = exercises.length % 2 !== 0 && currentIndex === exercises.length - 1;
                                if (isOddSolo) return null;
                                return (
                                    <div
                                        style={{
                                            padding: "4px 8px",
                                            backgroundColor: "rgba(204, 255, 0, 0.15)",
                                            border: "1px solid #CCFF00",
                                            borderRadius: 4,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "'Rubik Mono One', monospace",
                                                fontSize: 14,
                                                color: "#CCFF00",
                                            }}
                                        >
                                            {pairLetter}{currentIndex % 2 + 1}
                                        </span>
                                    </div>
                                );
                            })()}
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 24,
                                    color: "#FFFFFF",
                                }}
                            >
                                {activeExercise.name}
                            </span>
                        </div>
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 12,
                                color: "#CCFF00",
                            }}
                        >
                            SET {currentSet}/{activeExercise.sets}
                        </span>
                    </div>

                    {/* Input Row */}
                    <div className="flex" style={{ gap: 16, marginBottom: 24 }}>
                        {/* Weight Input */}
                        <div
                            className="flex flex-col items-center justify-center"
                            style={{
                                flex: 1,
                                height: 80,
                                backgroundColor: "#0A0A0A",
                                borderRadius: 4,
                            }}
                        >
                            <input
                                type="text"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    textAlign: "center",
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 32,
                                    color: "#FFFFFF",
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#555555",
                                }}
                            >
                                KG
                            </span>
                        </div>
                        {/* Reps Input */}
                        <div
                            className="flex flex-col items-center justify-center"
                            style={{
                                flex: 1,
                                height: 80,
                                backgroundColor: "#0A0A0A",
                                borderRadius: 4,
                            }}
                        >
                            <input
                                type="text"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                style={{
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    textAlign: "center",
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 32,
                                    color: "#CCFF00",
                                }}
                            />
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#555555",
                                }}
                            >
                                REPS
                            </span>
                        </div>
                    </div>

                    {/* LOG SET Button */}
                    <motion.div
                        whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(204, 255, 0, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center cursor-pointer"
                        style={{
                            width: "100%",
                            height: 60,
                            backgroundColor: "#CCFF00",
                            borderRadius: 4,
                        }}
                        onClick={handleLogSet}
                    >
                        <span
                            style={{
                                fontFamily: "'Rubik Mono One', monospace",
                                fontSize: 18,
                                color: "#000000",
                            }}
                        >
                            LOG SET ▶
                        </span>
                    </motion.div>
                </div>

                {/* histContext at x:24, y:440 - Dynamic data from workout history */}
                {(() => {
                    const lastTimeData = getLastTimeData(activeExercise.name);
                    const currentWeight = parseInt(weight) || 0;
                    const lastWeight = lastTimeData ? parseInt(lastTimeData.weight) || 0 : 0;
                    const progressDiff = lastTimeData ? currentWeight - lastWeight : 0;
                    const hasHistory = !!lastTimeData;

                    return (
                        <div
                            className="absolute flex items-center justify-between"
                            style={{ left: 24, top: 440, width: 345 }}
                        >
                            <div>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 12,
                                        color: "#888888",
                                        display: "block",
                                    }}
                                >
                                    {hasHistory
                                        ? `LAST_TIME: ${lastTimeData.weight}KG x ${lastTimeData.reps}`
                                        : "LAST_TIME: FIRST_SESSION"}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#555555",
                                        display: "block",
                                        marginTop: 4,
                                    }}
                                >
                                    {hasHistory ? "// PREVIOUS_REF" : "// NO_HISTORY"}
                                </span>
                            </div>
                            {hasHistory && progressDiff !== 0 && (
                                <div className="flex items-center" style={{ gap: 8 }}>
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 14,
                                            color: progressDiff > 0 ? "#CCFF00" : progressDiff < 0 ? "#FF6B6B" : "#888888",
                                        }}
                                    >
                                        {progressDiff > 0 ? `+${progressDiff}` : progressDiff}KG
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 8,
                                            color: progressDiff > 0 ? "#CCFF00" : progressDiff < 0 ? "#FF6B6B" : "#888888",
                                            opacity: 0.7,
                                        }}
                                    >
                                        {progressDiff > 0 ? "↑ PROGRESS" : progressDiff < 0 ? "↓ LIGHTER" : "SAME"}
                                    </span>
                                </div>
                            )}
                            {hasHistory && progressDiff === 0 && (
                                <div className="flex items-center" style={{ gap: 8 }}>
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 14,
                                            color: "#888888",
                                        }}
                                    >
                                        =
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 8,
                                            color: "#888888",
                                            opacity: 0.7,
                                        }}
                                    >
                                        SAME_WEIGHT
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* UP_NEXT at x:24, y:490 */}
                <span
                    className="absolute"
                    style={{
                        left: 24,
                        top: 490,
                        fontFamily: "'Chakra Petch', sans-serif",
                        fontSize: 10,
                        color: "#888888",
                        letterSpacing: 1,
                    }}
                >
                    UP_NEXT
                </span>

                {/* queueList at x:24, y:520 */}
                <div
                    className="absolute"
                    style={{ left: 24, top: 520, width: 345 }}
                >
                    {queue.map((ex, i) => (
                        <div
                            key={ex.id}
                            className="flex items-center justify-between"
                            style={{
                                width: "100%",
                                height: 56,
                                backgroundColor: "transparent",
                                borderBottom: "1px solid #333333",
                                padding: 16,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 14,
                                    color: i === 0 ? "#FFFFFF" : "#555555",
                                }}
                            >
                                {ex.name}
                            </span>
                            <div className="flex items-center" style={{ gap: 16 }}>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: "#555555",
                                    }}
                                >
                                    {ex.sets} SETS
                                </span>
                                <motion.span
                                    whileHover={{ scale: 1.1, color: "#FFFFFF" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="cursor-pointer"
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 10,
                                        color: "#CCFF00",
                                    }}
                                    onClick={() => handleSurf(i)}
                                >
                                    SURF ⇪
                                </motion.span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* finishLink - moved up to avoid nav collision */}
                <Link href="/lab">
                    <motion.span
                        whileHover={{ color: "#FFFFFF" }}
                        whileTap={{ scale: 0.98 }}
                        className="absolute cursor-pointer"
                        style={{
                            left: 24,
                            top: 750,
                            fontFamily: "'Chakra Petch', sans-serif",
                            fontSize: 12,
                            color: "#FF4444",
                            letterSpacing: 1,
                        }}
                    >
            /// FINISH_SESSION
                    </motion.span>
                </Link>
            </div>
        </main >
    );
}
