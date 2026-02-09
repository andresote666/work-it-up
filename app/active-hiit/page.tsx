"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import DevNavigation from "../components/DevNavigation";

/**
 * HIIT Session Active Screen
 * Dedicated timer-based workout with work/rest phases
 * 
 * Phases:
 *   1. SETUP — choose rounds, work time, rest time
 *   2. ACTIVE — countdown timer with phase switching
 *   3. COMPLETE — celebration + save
 */

type Phase = "SETUP" | "COUNTDOWN" | "WORK" | "REST" | "COMPLETE";

// Cyan accent for cardio
const CYAN = "#00E5FF";
const CYAN_DIM = "rgba(0, 229, 255, 0.15)";
const ORANGE = "#FF9800";
const ORANGE_DIM = "rgba(255, 152, 0, 0.15)";

export default function ActiveHIITScreen() {
    const router = useRouter();

    // Setup state
    const [rounds, setRounds] = useState(8);
    const [workTime, setWorkTime] = useState(30);
    const [restTime, setRestTime] = useState(15);

    // Active state
    const [phase, setPhase] = useState<Phase>("SETUP");
    const [currentRound, setCurrentRound] = useState(1);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalElapsed, setTotalElapsed] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Countdown state (3-2-1-GO)
    const [countdownValue, setCountdownValue] = useState(3);

    // Audio context ref
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Wake lock ref
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    // Timer ref
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    // Play beep sound
    const playBeep = useCallback((freq: number, duration: number) => {
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            gain.gain.value = 0.3;
            osc.start();
            osc.stop(ctx.currentTime + duration / 1000);
        } catch {
            // Silent fail on audio errors
        }
    }, []);

    // Play transition buzzer (work → rest)
    const playBuzzer = useCallback(() => {
        playBeep(400, 200);
        setTimeout(() => playBeep(400, 200), 250);
    }, [playBeep]);

    // Speak a voice announcement
    const speakVoice = useCallback((text: string) => {
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.2;
                utterance.pitch = 1.1;
                utterance.volume = 1;
                utterance.lang = 'en-US';
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }
        } catch {
            // Silent fail
        }
    }, []);

    // Wake Lock: keep screen on
    const requestWakeLock = useCallback(async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
        } catch {
            // Silent fail — user may have denied or not supported
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }, []);

    // Acquire wake lock when active, release on complete/unmount
    useEffect(() => {
        if (phase === "WORK" || phase === "REST" || phase === "COUNTDOWN") {
            requestWakeLock();
        } else if (phase === "COMPLETE" || phase === "SETUP") {
            releaseWakeLock();
        }
        return () => releaseWakeLock();
    }, [phase, requestWakeLock, releaseWakeLock]);

    // Total session time estimate
    const totalEstimate = rounds * workTime + (rounds - 1) * restTime;
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Start the session
    const handleStart = () => {
        setPhase("COUNTDOWN");
        setCountdownValue(3);
        startTimeRef.current = Date.now();
    };

    // Countdown effect (3-2-1-GO!)
    useEffect(() => {
        if (phase !== "COUNTDOWN") return;

        if (countdownValue <= 0) {
            // Start first work phase
            setPhase("WORK");
            setTimeLeft(workTime);
            setCurrentRound(1);
            playBeep(1200, 150);
            return;
        }

        playBeep(800, 80);
        const timer = setTimeout(() => {
            setCountdownValue(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [phase, countdownValue, workTime, playBeep]);

    // Main timer effect
    useEffect(() => {
        if (phase !== "WORK" && phase !== "REST") return;
        if (isPaused) return;

        if (timeLeft <= 0) {
            // Phase transition
            if (phase === "WORK") {
                if (currentRound >= rounds) {
                    // Session complete
                    setPhase("COMPLETE");
                    playBuzzer();
                    return;
                }
                // Transition to REST
                setPhase("REST");
                setTimeLeft(restTime);
                playBuzzer();
            } else {
                // REST → WORK (next round)
                setCurrentRound(prev => prev + 1);
                setPhase("WORK");
                setTimeLeft(workTime);
                playBeep(1200, 150);
            }
            return;
        }

        // Sound alerts for last 3 seconds
        if (timeLeft <= 3 && timeLeft > 1) {
            playBeep(800, 80);
        } else if (timeLeft === 1) {
            playBeep(1200, 150);
            // Voice announcement for phase transition
            if (phase === "WORK") {
                if (currentRound >= rounds) {
                    speakVoice("Done!");
                } else {
                    speakVoice("Rest!");
                }
            } else {
                speakVoice("Go!");
            }
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
            setTotalElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, timeLeft, isPaused, currentRound, rounds, restTime, workTime, playBeep, playBuzzer]);

    // Skip to next phase
    const handleSkip = () => {
        if (phase === "WORK") {
            if (currentRound >= rounds) {
                setPhase("COMPLETE");
                playBuzzer();
            } else {
                setPhase("REST");
                setTimeLeft(restTime);
                playBuzzer();
            }
        } else if (phase === "REST") {
            setCurrentRound(prev => prev + 1);
            setPhase("WORK");
            setTimeLeft(workTime);
            playBeep(1200, 150);
        }
    };

    // Save and finish
    const handleFinish = () => {
        // Build workout entry for archive
        const workoutEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            duration: totalElapsed,
            exercises: 1,
            totalSets: currentRound,
            muscles: ["CARDIO"],
            volume: 0,
            isCardio: true,
            isHIIT: true,
            hiitDetails: {
                rounds: currentRound,
                totalRounds: rounds,
                workTime,
                restTime,
                totalDuration: totalElapsed,
            },
            exerciseDetails: [{
                name: "HIIT SESSION",
                sets: currentRound,
                weight: "0",
                reps: "0",
            }],
        };

        // Save to workout history
        const stored = localStorage.getItem("workoutHistory");
        const history = stored ? JSON.parse(stored) : [];
        history.unshift(workoutEntry);
        localStorage.setItem("workoutHistory", JSON.stringify(history));
        localStorage.setItem("lastWorkoutTime", workoutEntry.date);

        // Clean up
        localStorage.removeItem("hiitMode");

        router.push("/lab");
    };

    // Circular progress calculation
    const getProgress = () => {
        if (phase === "WORK") {
            return 1 - timeLeft / workTime;
        } else if (phase === "REST") {
            return 1 - timeLeft / restTime;
        }
        return 0;
    };

    const overallProgress = () => {
        const completedRounds = currentRound - 1;
        const phaseProgress = phase === "WORK" ? (1 - timeLeft / workTime) : phase === "REST" ? (1 - timeLeft / restTime) : 0;
        return (completedRounds + phaseProgress * 0.5) / rounds;
    };

    // Motivational phrases
    const workPhrases = ["PUSH IT", "NO LIMITS", "STAY HARD", "FULL SEND", "BURN IT", "GO HARDER", "ALL OUT", "BEAST MODE", "MAX EFFORT", "DON'T QUIT"];
    const restPhrases = ["BREATHE", "RECOVER", "RELOAD", "RESET", "COOL DOWN", "STAY READY", "RECHARGE", "FOCUS UP", "STAY CALM", "PREPARE"];
    const currentMotivation = phase === "WORK"
        ? workPhrases[(currentRound - 1) % workPhrases.length]
        : restPhrases[(currentRound - 1) % restPhrases.length];

    // Circle params — BIGGER timer
    const circleSize = 280;
    const strokeWidth = 10;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = getProgress();
    const strokeDashoffset = circumference * (1 - progress);

    const phaseColor = phase === "WORK" ? CYAN : ORANGE;
    const phaseBg = phase === "WORK" ? CYAN_DIM : ORANGE_DIM;

    // Stepper component for setup
    const Stepper = ({ label, value, onChange, min, max, step, unit }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
        min: number;
        max: number;
        step: number;
        unit: string;
    }) => (
        <div
            className="flex items-center justify-between"
            style={{
                padding: "14px 16px",
                backgroundColor: "#111111",
                border: "1px solid #222222",
                borderRadius: 6,
            }}
        >
            <div className="flex flex-col" style={{ gap: 2 }}>
                <span
                    style={{
                        fontFamily: "'Chakra Petch', sans-serif",
                        fontSize: 9,
                        color: "#555555",
                        letterSpacing: 1.5,
                    }}
                >
                    {label}
                </span>
                <span
                    style={{
                        fontFamily: "'Rubik Mono One', monospace",
                        fontSize: 22,
                        color: CYAN,
                    }}
                >
                    {value}<span style={{ fontSize: 11, color: "#555555", marginLeft: 4 }}>{unit}</span>
                </span>
            </div>
            <div className="flex items-center" style={{ gap: 8 }}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(Math.max(min, value - step))}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        backgroundColor: "#0A0A0A",
                        border: "1px solid #333333",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: value <= min ? 0.3 : 1,
                    }}
                >
                    <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 18, color: "#888888" }}>−</span>
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onChange(Math.min(max, value + step))}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        backgroundColor: "#0A0A0A",
                        border: "1px solid #333333",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: value >= max ? 0.3 : 1,
                    }}
                >
                    <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 18, color: "#888888" }}>+</span>
                </motion.button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div
                className="relative overflow-hidden w-full h-dvh max-w-md flex flex-col"
                style={{
                    backgroundColor: "#0A0A0A",
                    padding: 24,
                    paddingTop: 48,
                    paddingBottom: 80,
                }}
            >
                <DevNavigation />

                {/* ─── SETUP PHASE ─── */}
                <AnimatePresence mode="wait">
                    {phase === "SETUP" && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col flex-1"
                            style={{ gap: 0 }}
                        >
                            {/* Header */}
                            <div className="flex flex-col shrink-0" style={{ gap: -5 }}>
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 28,
                                        color: "#FFFFFF",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    HIIT
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 10,
                                        color: CYAN,
                                        letterSpacing: 2,
                                        marginTop: 4,
                                    }}
                                >
                                    // CONFIGURE_SESSION
                                </span>
                            </div>

                            {/* Config Cards */}
                            <div className="flex flex-col" style={{ gap: 10, marginTop: 28 }}>
                                <Stepper
                                    label="ROUNDS"
                                    value={rounds}
                                    onChange={setRounds}
                                    min={1}
                                    max={20}
                                    step={1}
                                    unit="RDS"
                                />
                                <Stepper
                                    label="WORK_TIME"
                                    value={workTime}
                                    onChange={setWorkTime}
                                    min={5}
                                    max={120}
                                    step={5}
                                    unit="SEC"
                                />
                                <Stepper
                                    label="REST_TIME"
                                    value={restTime}
                                    onChange={setRestTime}
                                    min={5}
                                    max={120}
                                    step={5}
                                    unit="SEC"
                                />
                            </div>

                            {/* Session Preview */}
                            <div
                                className="flex items-center justify-between"
                                style={{
                                    padding: "12px 16px",
                                    backgroundColor: CYAN_DIM,
                                    border: `1px solid rgba(0, 229, 255, 0.25)`,
                                    borderRadius: 6,
                                    marginTop: 16,
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
                                    TOTAL_ESTIMATE
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 16,
                                        color: CYAN,
                                    }}
                                >
                                    {formatTime(totalEstimate)}
                                </span>
                            </div>

                            {/* Protocol Summary */}
                            <div
                                className="flex justify-between"
                                style={{
                                    marginTop: 12,
                                    padding: "10px 0",
                                }}
                            >
                                {[
                                    { label: "WORK", value: `${workTime}s`, color: CYAN },
                                    { label: "REST", value: `${restTime}s`, color: ORANGE },
                                    { label: "RATIO", value: `${(workTime / restTime).toFixed(1)}:1`, color: "#FFFFFF" },
                                ].map((item) => (
                                    <div key={item.label} className="flex flex-col items-center" style={{ gap: 4 }}>
                                        <span
                                            style={{
                                                fontFamily: "'Chakra Petch', sans-serif",
                                                fontSize: 9,
                                                color: "#555555",
                                                letterSpacing: 1,
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "'Rubik Mono One', monospace",
                                                fontSize: 14,
                                                color: item.color,
                                            }}
                                        >
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Start Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStart}
                                className="flex items-center justify-center cursor-pointer"
                                style={{
                                    width: "100%",
                                    height: 56,
                                    backgroundColor: CYAN,
                                    border: "none",
                                    borderRadius: 6,
                                    marginTop: "auto",
                                    marginBottom: 16,
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
                                    START HIIT ⚡
                                </span>
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ─── COUNTDOWN PHASE ─── */}
                    {phase === "COUNTDOWN" && (
                        <motion.div
                            key="countdown"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center flex-1"
                        >
                            <motion.span
                                key={countdownValue}
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: "spring", damping: 15 }}
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 120,
                                    color: CYAN,
                                    textShadow: `0 0 40px ${CYAN}40`,
                                }}
                            >
                                {countdownValue > 0 ? countdownValue : "GO!"}
                            </motion.span>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 12,
                                    color: "#555555",
                                    letterSpacing: 2,
                                    marginTop: 16,
                                }}
                            >
                                GET READY
                            </span>
                        </motion.div>
                    )}

                    {/* ─── ACTIVE PHASE (WORK / REST) ─── */}
                    {(phase === "WORK" || phase === "REST") && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center flex-1"
                            style={{ gap: 0 }}
                        >
                            {/* Phase Label */}
                            <motion.div
                                key={phase}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center"
                                style={{
                                    gap: 8,
                                    padding: "8px 20px",
                                    backgroundColor: phaseBg,
                                    borderRadius: 20,
                                    border: `1px solid ${phaseColor}30`,
                                    marginTop: 4,
                                }}
                            >
                                <span style={{ fontSize: 16 }}>
                                    {phase === "WORK" ? "🏃" : "⏸"}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 14,
                                        color: phaseColor,
                                        letterSpacing: 2,
                                    }}
                                >
                                    {phase}
                                </span>
                            </motion.div>

                            {/* Round Counter */}
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 11,
                                    color: "#888888",
                                    letterSpacing: 1.5,
                                    marginTop: 10,
                                }}
                            >
                                ROUND {currentRound}/{rounds}
                            </span>

                            {/* Circular Timer — BIGGER */}
                            <div
                                className="relative flex items-center justify-center"
                                style={{
                                    width: circleSize,
                                    height: circleSize,
                                    marginTop: 12,
                                }}
                            >
                                <svg
                                    viewBox={`0 0 ${circleSize} ${circleSize}`}
                                    width={circleSize}
                                    height={circleSize}
                                    style={{
                                        position: "absolute",
                                        transform: "rotate(-90deg)",
                                    }}
                                >
                                    {/* Background circle */}
                                    <circle
                                        cx={circleSize / 2}
                                        cy={circleSize / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="#1A1A1A"
                                        strokeWidth={strokeWidth}
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx={circleSize / 2}
                                        cy={circleSize / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={phaseColor}
                                        strokeWidth={strokeWidth}
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        style={{
                                            transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
                                            filter: `drop-shadow(0 0 8px ${phaseColor}60)`,
                                        }}
                                    />
                                </svg>

                                {/* Center Time + Motivation */}
                                <div className="flex flex-col items-center">
                                    <motion.span
                                        key={timeLeft}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 64,
                                            color: "#FFFFFF",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {timeLeft}
                                    </motion.span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 10,
                                            color: "#555555",
                                            letterSpacing: 1,
                                            marginTop: 4,
                                        }}
                                    >
                                        SECONDS
                                    </span>
                                </div>
                            </div>

                            {/* Motivational Banner */}
                            <motion.div
                                key={currentMotivation}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{ marginTop: 12 }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 20,
                                        color: phaseColor,
                                        letterSpacing: 4,
                                        textShadow: `0 0 20px ${phaseColor}40`,
                                    }}
                                >
                                    {currentMotivation}
                                </span>
                            </motion.div>

                            {/* Session Timeline Strip */}
                            <div
                                style={{
                                    width: "100%",
                                    marginTop: 20,
                                    padding: "12px 0",
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 8,
                                        color: "#444444",
                                        letterSpacing: 1.5,
                                        display: "block",
                                        marginBottom: 8,
                                    }}
                                >
                                    SESSION_TIMELINE
                                </span>
                                <div
                                    className="flex"
                                    style={{
                                        gap: 2,
                                        width: "100%",
                                        height: 28,
                                        borderRadius: 4,
                                        overflow: "hidden",
                                    }}
                                >
                                    {Array.from({ length: rounds }, (_, i) => {
                                        const roundNum = i + 1;
                                        const isCompleted = roundNum < currentRound;
                                        const isCurrent = roundNum === currentRound;
                                        const workFrac = workTime / (workTime + restTime);
                                        const isLastRound = roundNum === rounds;

                                        return (
                                            <div
                                                key={i}
                                                className="flex"
                                                style={{
                                                    flex: 1,
                                                    gap: 1,
                                                    height: "100%",
                                                }}
                                            >
                                                {/* Work block */}
                                                <div
                                                    style={{
                                                        flex: workFrac,
                                                        height: "100%",
                                                        borderRadius: 2,
                                                        backgroundColor: isCompleted
                                                            ? CYAN
                                                            : isCurrent && phase === "WORK"
                                                                ? CYAN
                                                                : isCurrent && phase === "REST"
                                                                    ? CYAN
                                                                    : "#1A1A1A",
                                                        opacity: isCompleted
                                                            ? 0.6
                                                            : isCurrent && phase === "WORK"
                                                                ? 1
                                                                : isCurrent && phase === "REST"
                                                                    ? 0.6
                                                                    : 0.3,
                                                        transition: "all 0.3s ease",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {/* Active fill for current work */}
                                                    {isCurrent && phase === "WORK" && (
                                                        <motion.div
                                                            animate={{ width: `${((workTime - timeLeft) / workTime) * 100}%` }}
                                                            style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                height: "100%",
                                                                backgroundColor: CYAN,
                                                                boxShadow: `0 0 6px ${CYAN}80`,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                {/* Rest block (skip for last round) */}
                                                {!isLastRound && (
                                                    <div
                                                        style={{
                                                            flex: 1 - workFrac,
                                                            height: "100%",
                                                            borderRadius: 2,
                                                            backgroundColor: isCompleted
                                                                ? ORANGE
                                                                : isCurrent && phase === "REST"
                                                                    ? ORANGE
                                                                    : "#1A1A1A",
                                                            opacity: isCompleted
                                                                ? 0.4
                                                                : isCurrent && phase === "REST"
                                                                    ? 1
                                                                    : 0.15,
                                                            transition: "all 0.3s ease",
                                                            position: "relative",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {/* Active fill for current rest */}
                                                        {isCurrent && phase === "REST" && (
                                                            <motion.div
                                                                animate={{ width: `${((restTime - timeLeft) / restTime) * 100}%` }}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    left: 0,
                                                                    height: "100%",
                                                                    backgroundColor: ORANGE,
                                                                    boxShadow: `0 0 6px ${ORANGE}80`,
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Timeline labels */}
                                <div
                                    className="flex items-center justify-between"
                                    style={{ width: "100%", marginTop: 6 }}
                                >
                                    <span style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 9,
                                        color: "#555555",
                                        letterSpacing: 1,
                                    }}>
                                        ELAPSED {formatTime(totalElapsed)}
                                    </span>
                                    <span style={{
                                        fontFamily: "'Chakra Petch', sans-serif",
                                        fontSize: 9,
                                        color: "#555555",
                                        letterSpacing: 1,
                                    }}>
                                        {Math.round(overallProgress() * 100)}%
                                    </span>
                                </div>
                            </div>

                            {/* Compact Stats Row */}
                            <div className="flex" style={{ gap: 8, width: "100%", marginTop: 8 }}>
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        flex: 1,
                                        padding: "10px 0",
                                        backgroundColor: "#111111",
                                        border: "1px solid #1A1A1A",
                                        borderRadius: 6,
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 14,
                                            color: CYAN,
                                        }}
                                    >
                                        {formatTime(Math.max(0, (currentRound - 1) * workTime + (phase === "WORK" ? workTime - timeLeft : 0)))}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 8,
                                            color: "#444444",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        WORK
                                    </span>
                                </div>
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        flex: 1,
                                        padding: "10px 0",
                                        backgroundColor: "#111111",
                                        border: "1px solid #1A1A1A",
                                        borderRadius: 6,
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Rubik Mono One', monospace",
                                            fontSize: 14,
                                            color: ORANGE,
                                        }}
                                    >
                                        {formatTime(Math.max(0, (currentRound - 1) * restTime + (phase === "REST" ? restTime - timeLeft : 0)))}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 8,
                                            color: "#444444",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        REST
                                    </span>
                                </div>
                                <div
                                    className="flex items-center justify-center"
                                    style={{
                                        flex: 1,
                                        padding: "10px 0",
                                        backgroundColor: "#0E0E0E",
                                        border: `1px solid ${phaseColor}15`,
                                        borderRadius: 6,
                                        gap: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 9,
                                            color: phase === "WORK"
                                                ? (currentRound >= rounds ? CYAN : ORANGE)
                                                : CYAN,
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {phase === "WORK"
                                            ? (currentRound >= rounds ? "✓ DONE" : `⏸ REST`)
                                            : `🏃 R${currentRound + 1}`}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 7,
                                            color: "#444444",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        NEXT
                                    </span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div
                                className="flex items-center"
                                style={{ gap: 8, marginTop: "auto", marginBottom: 16, width: "100%" }}
                            >
                                {/* Quit - compact */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        localStorage.removeItem("hiitMode");
                                        router.push("/builder");
                                    }}
                                    className="flex items-center justify-center cursor-pointer"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: "#111111",
                                        border: "1px solid #222222",
                                        borderRadius: 6,
                                        flexShrink: 0,
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: "#555555" }}>✕</span>
                                </motion.button>

                                {/* Pause/Resume */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsPaused(!isPaused)}
                                    className="flex items-center justify-center cursor-pointer"
                                    style={{
                                        flex: 1,
                                        height: 48,
                                        backgroundColor: "#111111",
                                        border: "1px solid #333333",
                                        borderRadius: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 11,
                                            color: "#FFFFFF",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                                    </span>
                                </motion.button>

                                {/* Skip */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSkip}
                                    className="flex items-center justify-center cursor-pointer"
                                    style={{
                                        flex: 1,
                                        height: 48,
                                        backgroundColor: phaseBg,
                                        border: `1px solid ${phaseColor}30`,
                                        borderRadius: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 11,
                                            color: phaseColor,
                                            letterSpacing: 1,
                                        }}
                                    >
                                        SKIP ⏭
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── COMPLETE PHASE ─── */}
                    {phase === "COMPLETE" && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center flex-1"
                            style={{ gap: 20 }}
                        >
                            {/* Celebration */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ duration: 0.8, repeat: 2 }}
                                style={{ fontSize: 64 }}
                            >
                                ⚡
                            </motion.div>

                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 28,
                                    color: "#FFFFFF",
                                    textAlign: "center",
                                    lineHeight: 1.2,
                                }}
                            >
                                HIIT<br />COMPLETE
                            </span>

                            {/* Stats Cards */}
                            <div className="flex flex-col" style={{ gap: 8, width: "100%" }}>
                                {[
                                    { label: "ROUNDS", value: `${currentRound}/${rounds}`, color: CYAN },
                                    { label: "DURATION", value: formatTime(totalElapsed), color: CYAN },
                                    { label: "WORK/REST", value: `${workTime}s / ${restTime}s`, color: ORANGE },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="flex items-center justify-between"
                                        style={{
                                            padding: "12px 16px",
                                            backgroundColor: "#111111",
                                            border: "1px solid #222222",
                                            borderRadius: 6,
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
                                            {stat.label}
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "'Rubik Mono One', monospace",
                                                fontSize: 14,
                                                color: stat.color,
                                            }}
                                        >
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Save Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFinish}
                                className="flex items-center justify-center cursor-pointer"
                                style={{
                                    width: "100%",
                                    height: 56,
                                    backgroundColor: CYAN,
                                    border: "none",
                                    borderRadius: 6,
                                    marginTop: 12,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: "'Rubik Mono One', monospace",
                                        fontSize: 14,
                                        color: "#000000",
                                        letterSpacing: 2,
                                    }}
                                >
                                    SAVE & VIEW LAB →
                                </span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
