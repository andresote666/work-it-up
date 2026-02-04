"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Screen 1: Splash / WORKOUT_HOME
 * Updated design from WORK_IT_UP.pen
 * Clean, minimal layout with centered elements
 */
export default function SplashScreen() {
  // Dynamic quote rotation
  const [quote, setQuote] = useState({ text: "Show up, Log it.", sub: "Build momentum." });
  const [logoError, setLogoError] = useState(false);

  const quotes = [
    { text: "Show up, Log it.", sub: "Build momentum." },
    { text: "One rep at a time.", sub: "Consistency wins." },
    { text: "Sweat now.", sub: "Shine later." },
    { text: "No shortcuts.", sub: "Just hard work." },
    { text: "Push your limits.", sub: "Expand your world." },
    { text: "Today's pain.", sub: "Tomorrow's power." },
    { text: "Be unstoppable.", sub: "Start now." },
  ];

  useEffect(() => {
    // Random quote on load
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      {/* Phone Frame - now responsive */}
      <div
        className="relative overflow-hidden w-full h-dvh max-w-md"
        style={{
          borderRadius: 0,
          backgroundColor: "#0A0A0A",
        }}
      >
        {/* Top Status Bar - x:32 y:32 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute flex items-center justify-between"
          style={{ left: 32, top: 32, width: 329, height: 20 }}
        >
          {/* Pulse Dot */}
          <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full"
              style={{ width: 20, height: 20, backgroundColor: "transparent", border: "1px solid #CCFF00" }}
            />
            <div
              className="rounded-full"
              style={{ width: 8, height: 8, backgroundColor: "#CCFF00" }}
            />
          </div>
          {/* SYSTEM_READY text */}
          <span
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 10,
              color: "#555555",
              letterSpacing: 1,
            }}
          >
            SYSTEM_READY
          </span>
        </motion.div>

        {/* LOGO - x:51 y:263 with striking entrance animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 50 }}
          animate={{
            opacity: 1,
            scale: [0.3, 1.15, 0.95, 1.02, 1],
            y: [50, -15, 5, -3, 0],
          }}
          transition={{
            delay: 0.3,
            duration: 0.9,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.4, 0.6, 0.8, 1]
          }}
          className="absolute flex items-center justify-center"
          style={{ left: 51, top: 263, width: 291, height: 163 }}
        >
          {/* Glitch shake effect */}
          <motion.div
            animate={{
              x: [0, -4, 4, -3, 0, 3, -1, 0],
            }}
            transition={{
              delay: 1.2,
              duration: 0.25,
              ease: "easeInOut",
            }}
            style={{ position: "relative" }}
          >
            {/* Neon glow pulse wrapper */}
            <motion.div
              initial={{ filter: "drop-shadow(0 0 0px rgba(204, 255, 0, 0))" }}
              animate={{
                filter: [
                  "drop-shadow(0 0 0px rgba(204, 255, 0, 0))",
                  "drop-shadow(0 0 30px rgba(204, 255, 0, 0.9))",
                  "drop-shadow(0 0 15px rgba(204, 255, 0, 0.5))",
                  "drop-shadow(0 0 8px rgba(204, 255, 0, 0.3))",
                ],
              }}
              transition={{
                delay: 1.45,
                duration: 0.8,
                times: [0, 0.3, 0.6, 1],
              }}
            >
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="WORK IT UP"
                  width={291}
                  height={163}
                  style={{ objectFit: "contain" }}
                  onError={() => setLogoError(true)}
                  priority
                />
              ) : (
                /* Fallback text logo if image not found */
                <div className="flex flex-col items-center">
                  <span
                    style={{
                      fontFamily: "'Rubik Mono One', monospace",
                      fontSize: 48,
                      color: "#FFFFFF",
                      lineHeight: 1.1,
                    }}
                  >
                    WORK
                  </span>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span
                      style={{
                        fontFamily: "'Rubik Mono One', monospace",
                        fontSize: 48,
                        color: "#CCFF00",
                      }}
                    >
                      IT
                    </span>
                    <span
                      style={{
                        fontFamily: "'Rubik Mono One', monospace",
                        fontSize: 48,
                        color: "#FFFFFF",
                      }}
                    >
                      UP
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Progress Bar - x:117 y:565, centered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute"
          style={{
            left: 117,
            top: 565,
            width: 160,
            height: 4,
            backgroundColor: "#1A1A1A",
            borderRadius: 2,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.0, duration: 1.5, ease: "easeOut" }}
            style={{
              height: 4,
              backgroundColor: "#CCFF00",
              borderRadius: 2,
            }}
          />
        </motion.div>

        {/* Quote Section - x:124 y:580, centered */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute flex flex-col"
          style={{ left: 124, top: 580, width: 146 }}
        >
          <span
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 14,
              color: "#FFFFFF",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            {quote.text}
          </span>
          <span
            style={{
              fontFamily: "'Chakra Petch', sans-serif",
              fontSize: 14,
              color: "#888888",
              letterSpacing: 1,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {quote.sub}
          </span>
        </motion.div>

        {/* ENTER Button - x:32 y:740 */}
        <Link href="/builder">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(204, 255, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              left: 32,
              top: 740,
              width: 329,
              height: 80,
              backgroundColor: "#CCFF00",
              borderRadius: 0,
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'Rubik Mono One', monospace",
                fontSize: 20,
                color: "#000000",
                letterSpacing: 2,
              }}
            >
              ENTER
            </span>
            <div
              style={{
                width: 8,
                height: 8,
                backgroundColor: "#000000",
              }}
            />
          </motion.div>
        </Link>
      </div>
    </main>
  );
}
