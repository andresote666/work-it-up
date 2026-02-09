"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { t, getLocale, setLocale } from "./lib/i18n";

/**
 * Screen 1: Splash / WORKOUT_HOME
 * Updated design from WORK_IT_UP.pen
 * Clean, minimal layout with centered elements - NOW FULLY RESPONSIVE
 */
export default function SplashScreen() {
  // Dynamic quote rotation
  const [quote, setQuote] = useState({ text: "", sub: "" });
  const [logoError, setLogoError] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");

  const quotesEn = [
    { text: "Show up, Log it.", sub: "Build momentum." },
    { text: "One rep at a time.", sub: "Consistency wins." },
    { text: "Sweat now.", sub: "Shine later." },
    { text: "No shortcuts.", sub: "Just hard work." },
    { text: "Push your limits.", sub: "Expand your world." },
    { text: "Today's pain.", sub: "Tomorrow's power." },
    { text: "Be unstoppable.", sub: "Start now." },
  ];

  const quotesEs = [
    { text: "Aparece, Regístralo.", sub: "Crea impulso." },
    { text: "Una rep a la vez.", sub: "La constancia gana." },
    { text: "Suda ahora.", sub: "Brilla después." },
    { text: "Sin atajos.", sub: "Solo trabajo duro." },
    { text: "Rompe tus límites.", sub: "Expande tu mundo." },
    { text: "El dolor de hoy.", sub: "La fuerza de mañana." },
    { text: "Sé imparable.", sub: "Empieza ya." },
  ];

  useEffect(() => {
    const locale = getLocale();
    setCurrentLocale(locale);
    const quotes = locale === 'es' ? quotesEs : quotesEn;
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const toggleLocale = () => {
    const newLocale = currentLocale === 'en' ? 'es' : 'en';
    setLocale(newLocale);
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      {/* Phone Frame - responsive with flex column layout */}
      <div
        className="relative overflow-hidden w-full h-dvh max-w-md flex flex-col"
        style={{
          backgroundColor: "#0A0A0A",
          padding: 32,
        }}
      >
        {/* Top Status Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-between w-full shrink-0"
          style={{ height: 20 }}
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
          {/* Right side: Status + Language Toggle */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <span
              style={{
                fontFamily: "'Chakra Petch', sans-serif",
                fontSize: 10,
                color: "#555555",
                letterSpacing: 1,
              }}
            >
              {t('SYSTEM_READY')}
            </span>
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLocale}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                padding: 0,
                backgroundColor: "transparent",
                border: "1px solid #333333",
                borderRadius: 2,
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: "'Chakra Petch', sans-serif",
                  fontSize: 9,
                  fontWeight: currentLocale === 'en' ? 700 : 400,
                  color: currentLocale === 'en' ? "#000000" : "#555555",
                  backgroundColor: currentLocale === 'en' ? "#CCFF00" : "transparent",
                  padding: "3px 6px",
                  letterSpacing: 0.5,
                  transition: "all 0.15s ease",
                }}
              >
                EN
              </span>
              <span
                style={{
                  fontFamily: "'Chakra Petch', sans-serif",
                  fontSize: 9,
                  fontWeight: currentLocale === 'es' ? 700 : 400,
                  color: currentLocale === 'es' ? "#000000" : "#555555",
                  backgroundColor: currentLocale === 'es' ? "#CCFF00" : "transparent",
                  padding: "3px 6px",
                  letterSpacing: 0.5,
                  transition: "all 0.15s ease",
                }}
              >
                ES
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Center Content - grows to fill available space */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* LOGO with striking entrance animation */}
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
            className="flex items-center justify-center"
            style={{ width: 291, height: 163 }}
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

          {/* Progress Bar - centered below logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              marginTop: 60,
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

          {/* Quote Section - centered below progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex flex-col items-center"
            style={{ marginTop: 16 }}
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
        </div>

        {/* ENTER Button - stays at bottom */}
        <Link href="/builder" className="w-full shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(204, 255, 0, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center cursor-pointer w-full"
            style={{
              height: 70,
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
              {t('ENTER')}
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
