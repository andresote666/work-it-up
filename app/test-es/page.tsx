"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "../lib/i18n";

/**
 * /test-es — Spanish Test Launcher
 * Sets locale to 'es' and redirects to home screen.
 * Visit /test-es to switch to Spanish, then navigate normally.
 */
export default function TestEsPage() {
    const router = useRouter();

    useEffect(() => {
        setLocale("es");
        router.replace("/");
    }, [router]);

    return (
        <main
            style={{
                minHeight: "100vh",
                backgroundColor: "#0A0A0A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <span
                style={{
                    fontFamily: "'Rubik Mono One', monospace",
                    fontSize: 24,
                    color: "#CCFF00",
                }}
            >
                🌐 ESPAÑOL
            </span>
            <span
                style={{
                    fontFamily: "'Chakra Petch', sans-serif",
                    fontSize: 12,
                    color: "#666",
                }}
            >
                CARGANDO...
            </span>
        </main>
    );
}
