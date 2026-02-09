"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import exerciseData from "../data/exercises.json";
import { fetchExerciseGif } from "../lib/musclewiki";

interface Exercise {
    id: string;
    name: string;
    muscle: string;
    equipment: string;
    gifUrl: string;
}

interface ExerciseSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exercise: Exercise) => void;
}

export default function ExerciseSearch({ isOpen, onClose, onSelect }: ExerciseSearchProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
    const [gifUrls, setGifUrls] = useState<Record<string, string>>({});
    const [loadingGifs, setLoadingGifs] = useState<Set<string>>(new Set());

    const exercises = exerciseData.exercises as Exercise[];
    const muscles = exerciseData.muscles;
    const equipment = exerciseData.equipment;

    // Filter exercises based on search and filters
    const filteredExercises = useMemo(() => {
        return exercises.filter((ex) => {
            const matchesSearch = searchQuery === "" ||
                ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMuscle = !selectedMuscle || ex.muscle === selectedMuscle;
            const matchesEquipment = !selectedEquipment || ex.equipment === selectedEquipment;
            return matchesSearch && matchesMuscle && matchesEquipment;
        });
    }, [searchQuery, selectedMuscle, selectedEquipment, exercises]);

    const handleSelect = (exercise: Exercise) => {
        onSelect(exercise);
        onClose();
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedMuscle(null);
        setSelectedEquipment(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
            >
                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="relative flex flex-col"
                    style={{
                        width: 365,
                        height: 700,
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
                            padding: 16,
                            borderBottom: "1px solid #222222",
                        }}
                    >
                        <div className="flex flex-col" style={{ gap: 2 }}>
                            <span
                                style={{
                                    fontFamily: "'Rubik Mono One', monospace",
                                    fontSize: 16,
                                    color: "#FFFFFF",
                                }}
                            >
                                EXERCISE_DB
                            </span>
                            <span
                                style={{
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#555555",
                                }}
                            >
                                // SELECT_MOVEMENT
                            </span>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                width: 32,
                                height: 32,
                                backgroundColor: "#111111",
                                border: "1px solid #333333",
                                borderRadius: 4,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ color: "#888888", fontSize: 16 }}>✕</span>
                        </motion.button>
                    </div>

                    {/* Search Input */}
                    <div style={{ padding: "12px 16px" }}>
                        <motion.div
                            whileFocus={{ borderColor: "#CCFF00" }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 12px",
                                backgroundColor: "#111111",
                                border: "1px solid #333333",
                                borderRadius: 4,
                            }}
                        >
                            <span style={{ color: "#555555", fontSize: 14 }}>🔍</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="SEARCH_EXERCISE..."
                                style={{
                                    flex: 1,
                                    backgroundColor: "transparent",
                                    border: "none",
                                    outline: "none",
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 12,
                                    color: "#FFFFFF",
                                    letterSpacing: 1,
                                }}
                            />
                            {searchQuery && (
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSearchQuery("")}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#555555",
                                        fontSize: 12,
                                    }}
                                >
                                    ✕
                                </motion.button>
                            )}
                        </motion.div>
                    </div>

                    {/* Muscle Filter */}
                    <div style={{ padding: "0 16px 8px" }}>
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 9,
                                color: "#555555",
                                letterSpacing: 1,
                            }}
                        >
                            MUSCLE_GROUP
                        </span>
                        <div
                            className="flex flex-wrap"
                            style={{ gap: 6, marginTop: 6 }}
                        >
                            {muscles.map((muscle) => {
                                const isCardio = muscle === "CARDIO";
                                const isSelected = selectedMuscle === muscle;
                                const accentColor = isCardio ? "#00E5FF" : "#CCFF00";
                                return (
                                    <motion.button
                                        key={muscle}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedMuscle(
                                            selectedMuscle === muscle ? null : muscle
                                        )}
                                        style={{
                                            padding: "5px 10px",
                                            backgroundColor: isSelected ? accentColor : "#1A1A1A",
                                            border: isSelected ? "none" : isCardio ? "1px solid rgba(0, 229, 255, 0.4)" : "1px solid #333333",
                                            borderRadius: 3,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontFamily: "'Chakra Petch', sans-serif",
                                                fontSize: 9,
                                                color: isSelected ? "#000000" : isCardio ? "#00E5FF" : "#888888",
                                                letterSpacing: 1,
                                            }}
                                        >
                                            {isCardio ? "⚡ CARDIO" : muscle}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Equipment Filter */}
                    <div style={{ padding: "0 16px 12px" }}>
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 9,
                                color: "#555555",
                                letterSpacing: 1,
                            }}
                        >
                            EQUIPMENT
                        </span>
                        <div
                            className="flex flex-wrap"
                            style={{ gap: 6, marginTop: 6 }}
                        >
                            {equipment.map((eq) => (
                                <motion.button
                                    key={eq}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedEquipment(
                                        selectedEquipment === eq ? null : eq
                                    )}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: selectedEquipment === eq ? "#CCFF00" : "#1A1A1A",
                                        border: selectedEquipment === eq ? "none" : "1px solid #333333",
                                        borderRadius: 3,
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 9,
                                            color: selectedEquipment === eq ? "#000000" : "#888888",
                                            letterSpacing: 1,
                                        }}
                                    >
                                        {eq}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count & Clear */}
                    <div
                        className="flex items-center justify-between"
                        style={{
                            padding: "8px 16px",
                            borderTop: "1px solid #1A1A1A",
                            borderBottom: "1px solid #1A1A1A",
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 10,
                                color: "#555555",
                            }}
                        >
                            {filteredExercises.length} RESULTS
                        </span>
                        {(selectedMuscle || selectedEquipment || searchQuery) && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={clearFilters}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Chakra Petch', sans-serif",
                                    fontSize: 10,
                                    color: "#CCFF00",
                                }}
                            >
                                CLEAR_ALL
                            </motion.button>
                        )}
                    </div>

                    {/* Exercise Grid */}
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{
                            padding: 12,
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 10,
                            alignContent: "start",
                        }}
                    >
                        {filteredExercises.map((exercise, index) => (
                            <motion.div
                                key={exercise.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                whileHover={{
                                    scale: 1.02,
                                    backgroundColor: "#1A1A1A",
                                    boxShadow: "0 0 15px rgba(204, 255, 0, 0.15)",
                                }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelect(exercise)}
                                className="flex flex-col"
                                style={{
                                    backgroundColor: "#111111",
                                    borderRadius: 6,
                                    border: "1px solid #222222",
                                    padding: 12,
                                    cursor: "pointer",
                                    minHeight: 90,
                                }}
                            >
                                {/* Top Row: Icon + Name */}
                                <div className="flex items-start" style={{ gap: 10 }}>
                                    {/* Small Icon - GIF Thumbnail */}
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: "#0A0A0A",
                                            borderRadius: 4,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            overflow: "hidden",
                                        }}
                                        onMouseEnter={() => {
                                            // Lazy load GIF on hover if not loaded
                                            if (!gifUrls[exercise.id] && !loadingGifs.has(exercise.id)) {
                                                setLoadingGifs(prev => new Set(prev).add(exercise.id));
                                                fetchExerciseGif(exercise.name, exercise.muscle).then(url => {
                                                    if (url) {
                                                        setGifUrls(prev => ({ ...prev, [exercise.id]: url }));
                                                    }
                                                    setLoadingGifs(prev => {
                                                        const next = new Set(prev);
                                                        next.delete(exercise.id);
                                                        return next;
                                                    });
                                                });
                                            }
                                        }}
                                    >
                                        {gifUrls[exercise.id] ? (
                                            <img
                                                src={gifUrls[exercise.id]}
                                                alt={exercise.name}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    objectFit: "cover",
                                                    borderRadius: 2,
                                                }}
                                            />
                                        ) : loadingGifs.has(exercise.id) ? (
                                            <motion.div
                                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    backgroundColor: "#333333",
                                                    borderRadius: 2,
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: 16 }}>{exercise.muscle === "CARDIO" ? "🏃" : "🏋️"}</span>
                                        )}
                                    </div>
                                    {/* Exercise Name */}
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "#FFFFFF",
                                            letterSpacing: 0.3,
                                            lineHeight: 1.3,
                                            flex: 1,
                                        }}
                                    >
                                        {exercise.name}
                                    </span>
                                </div>

                                {/* Tags Row */}
                                <div
                                    className="flex items-center"
                                    style={{ gap: 6, marginTop: 10 }}
                                >
                                    <span
                                        style={{
                                            padding: "3px 6px",
                                            backgroundColor: exercise.muscle === "CARDIO" ? "#00E5FF" : "#CCFF00",
                                            borderRadius: 3,
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 8,
                                            fontWeight: 600,
                                            color: "#000000",
                                        }}
                                    >
                                        {exercise.muscle}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Chakra Petch', sans-serif",
                                            fontSize: 9,
                                            color: "#666666",
                                        }}
                                    >
                                        {exercise.equipment}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Hint */}
                    <div
                        style={{
                            padding: "12px 16px",
                            borderTop: "1px solid #222222",
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
                            TAP_TO_ADD // ESC_TO_CLOSE
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
