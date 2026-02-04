"use client";

import { motion } from "framer-motion";

/**
 * BodyHeatmap - Dynamic SVG body outline that shows muscle group intensity
 * Colors based on workout data: gray (dormant) → blue (light) → orange (moderate) → red (critical)
 */

interface MuscleIntensity {
    CHEST: number;
    BACK: number;
    LEGS: number;
    SHOULDERS: number;
    ARMS: number;
    CORE: number;
}

interface BodyHeatmapProps {
    muscleIntensity: MuscleIntensity;
}

// Get color based on intensity (0-100)
const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return "#1a1a1a"; // Dormant - dark gray
    if (intensity < 25) return "#2d4a7c"; // Light - blue
    if (intensity < 50) return "#4a6fa5"; // Moderate blue
    if (intensity < 75) return "#ff8c42"; // Orange - warm
    return "#ff4444"; // Critical - red
};

const getIntensityLabel = (intensity: number): string => {
    if (intensity === 0) return "DORMANT";
    if (intensity < 30) return "LIGHT";
    if (intensity < 60) return "MODERATE";
    if (intensity < 85) return "ACTIVE";
    return "CRITICAL";
};

export default function BodyHeatmap({ muscleIntensity }: BodyHeatmapProps) {
    // Calculate upper body and lower body average
    const upperIntensity = Math.round(
        (muscleIntensity.CHEST + muscleIntensity.BACK + muscleIntensity.SHOULDERS + muscleIntensity.ARMS) / 4
    );
    const lowerIntensity = Math.round(
        (muscleIntensity.LEGS + muscleIntensity.CORE) / 2
    );

    return (
        <div className="relative" style={{ width: "100%", height: "100%" }}>
            {/* SVG Body Outline */}
            <svg
                viewBox="0 0 200 400"
                style={{ width: "100%", height: "100%" }}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Head - neutral */}
                <motion.ellipse
                    cx="100" cy="30" rx="25" ry="28"
                    fill="#333333"
                    stroke="#444444"
                    strokeWidth="1"
                />

                {/* Neck */}
                <motion.rect
                    x="90" y="55" width="20" height="15"
                    fill="#333333"
                />

                {/* Shoulders */}
                <motion.path
                    d="M 60,70 Q 60,85 45,90 L 45,100 L 60,100 L 60,70 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.SHOULDERS) }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M 140,70 Q 140,85 155,90 L 155,100 L 140,100 L 140,70 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.SHOULDERS) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Chest */}
                <motion.path
                    d="M 60,70 L 60,130 Q 80,140 100,140 Q 120,140 140,130 L 140,70 Q 120,80 100,80 Q 80,80 60,70 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.CHEST) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Upper Arms */}
                <motion.path
                    d="M 45,100 L 35,160 L 55,160 L 60,100 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.ARMS) }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M 155,100 L 165,160 L 145,160 L 140,100 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.ARMS) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Forearms */}
                <motion.path
                    d="M 35,160 L 25,220 L 45,220 L 55,160 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.ARMS) }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M 165,160 L 175,220 L 155,220 L 145,160 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.ARMS) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Hands */}
                <motion.ellipse cx="35" cy="230" rx="12" ry="15" fill="#333333" />
                <motion.ellipse cx="165" cy="230" rx="12" ry="15" fill="#333333" />

                {/* Core / Abs */}
                <motion.path
                    d="M 65,130 L 65,200 Q 80,210 100,210 Q 120,210 135,200 L 135,130 Q 120,140 100,140 Q 80,140 65,130 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.CORE) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Back representation (shown as overlay gradient) */}
                <motion.rect
                    x="70" y="90" width="60" height="60"
                    rx="5"
                    initial={{ fill: "#1a1a1a", opacity: 0.3 }}
                    animate={{
                        fill: getIntensityColor(muscleIntensity.BACK),
                        opacity: muscleIntensity.BACK > 0 ? 0.4 : 0
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* Upper Legs / Quads */}
                <motion.path
                    d="M 65,200 L 55,300 L 85,300 L 100,210 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.LEGS) }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M 135,200 L 145,300 L 115,300 L 100,210 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.LEGS) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Lower Legs / Calves */}
                <motion.path
                    d="M 55,300 L 50,380 L 80,380 L 85,300 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.LEGS) }}
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M 145,300 L 150,380 L 120,380 L 115,300 Z"
                    initial={{ fill: "#1a1a1a" }}
                    animate={{ fill: getIntensityColor(muscleIntensity.LEGS) }}
                    transition={{ duration: 0.5 }}
                />

                {/* Feet */}
                <motion.ellipse cx="65" cy="390" rx="18" ry="8" fill="#333333" />
                <motion.ellipse cx="135" cy="390" rx="18" ry="8" fill="#333333" />
            </svg>

            {/* Intensity Labels */}
            <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute"
                style={{
                    right: 8,
                    top: "20%",
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: 8,
                    color: getIntensityColor(upperIntensity),
                    textShadow: `0 0 8px ${getIntensityColor(upperIntensity)}40`,
                    letterSpacing: 1,
                }}
            >
                UPPER: {getIntensityLabel(upperIntensity)}
            </motion.div>

            <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute"
                style={{
                    right: 8,
                    top: "65%",
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: 8,
                    color: getIntensityColor(lowerIntensity),
                    textShadow: `0 0 8px ${getIntensityColor(lowerIntensity)}40`,
                    letterSpacing: 1,
                }}
            >
                LOWER: {getIntensityLabel(lowerIntensity)}
            </motion.div>

            {/* Muscle group legend on left */}
            <div
                className="absolute flex flex-col"
                style={{ left: 8, top: 16, gap: 6 }}
            >
                {Object.entries(muscleIntensity).map(([muscle, intensity]) => (
                    <div key={muscle} className="flex items-center" style={{ gap: 4 }}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                backgroundColor: getIntensityColor(intensity),
                            }}
                        />
                        <span
                            style={{
                                fontFamily: "'Chakra Petch', sans-serif",
                                fontSize: 7,
                                color: "#555555",
                                letterSpacing: 0.5,
                            }}
                        >
                            {muscle}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
