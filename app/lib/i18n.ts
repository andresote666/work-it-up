/**
 * i18n — Internationalization for Work It Up
 * 
 * Supports: en (English), es (Spanish)
 * Default: en
 * 
 * Usage:
 *   import { t, useLocale } from '../lib/i18n';
 *   const { locale, setLocale } = useLocale();
 *   t('KEY')  // Returns string for current locale
 */

// ─── Locale State ───────────────────────────────────────────────
let currentLocale: 'en' | 'es' = 'en';

export function getLocale(): 'en' | 'es' {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('appLocale');
        if (stored === 'es' || stored === 'en') {
            currentLocale = stored;
        }
    }
    return currentLocale;
}

export function setLocale(locale: 'en' | 'es') {
    currentLocale = locale;
    if (typeof window !== 'undefined') {
        localStorage.setItem('appLocale', locale);
    }
}

// ─── Translation function ───────────────────────────────────────
export function t(key: string): string {
    const locale = getLocale();
    const map = locale === 'es' ? es : en;
    return map[key] || en[key] || key;
}

// ─── React Hook ─────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function useLocale() {
    const [locale, setLocaleState] = useState<'en' | 'es'>('en');

    useEffect(() => {
        setLocaleState(getLocale());
    }, []);

    const changeLocale = (newLocale: 'en' | 'es') => {
        setLocale(newLocale);
        setLocaleState(newLocale);
    };

    return { locale, setLocale: changeLocale, t };
}

// ═══════════════════════════════════════════════════════════════
// ENGLISH TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const en: Record<string, string> = {
    // ─── Home Screen ────────────────────────────────────────────
    "APP_TITLE": "WORK IT UP",
    "TAGLINE": "// TRAIN_HARD, STAY_HARD",
    "READY_QUERY": "READY?",
    "ENTER": "ENTER ▶",
    "VERSION": "V.2.0",
    "SYSTEM": "SYSTEM://",
    "SYSTEM_READY": "SYSTEM_READY",
    "STATUS_ONLINE": "STATUS: ONLINE",
    "MODULES_LOADED": "MODULES: LOADED",

    // ─── Builder Screen ───────────────────────────────────────
    "BUILDER": "BUILDER",
    "BUILD_SUBTITLE": "// WORKOUT_CONSTRUCTOR",
    "MY_ROUTINES": "MY_ROUTINES",
    "ADD_EXERCISES": "ADD EXERCISES",
    "SELECTED": "SELECTED",
    "YOUR_ROSTER": "// YOUR_ROSTER",
    "SAVE_TO_DAY": "SAVE ▶ DAY",
    "START_SESSION": "START_SESSION",
    "SEARCH_EXERCISES": "SEARCH_EXERCISES",
    "PRELOADED": "PRELOADED",
    "FROM": "FROM",
    "NO_EXERCISES": "NO EXERCISES SELECTED",
    "TAP_ADD": "TAP + TO ADD EXERCISES",
    "SETS": "SETS",
    "SET": "SET",

    // ─── Exercise Search ────────────────────────────────────────
    "EXERCISE_DB": "EXERCISE_DB",
    "SEARCH_PLACEHOLDER": "SEARCH...",
    "ALL": "ALL",
    "FAVORITES": "FAVORITES",
    "RESULTS": "RESULTS",
    "NO_RESULTS": "NO RESULTS",
    "NO_FAVORITES": "NO FAVORITES YET",
    "TAP_STAR": "TAP ★ ON ANY EXERCISE",
    "EQUIPMENT": "EQUIPMENT",
    "MUSCLE_GROUP": "MUSCLE_GROUP",

    // ─── Muscle Groups ──────────────────────────────────────────
    "CHEST": "CHEST",
    "BACK": "BACK",
    "LEGS": "LEGS",
    "SHOULDERS": "SHOULDERS",
    "ARMS": "ARMS",
    "CORE": "CORE",
    "CARDIO": "CARDIO",

    // ─── Active Screen ──────────────────────────────────────────
    "ACTIVE": "ACTIVE",
    "SESSION_SUBTITLE": "// SESSION_LIVE",
    "CURRENT_MOVE": "CURRENT_MOVE",
    "LOG_SET": "LOG SET ▶",
    "LOG_CARDIO": "LOG CARDIO ⚡",
    "UP_NEXT": "UP_NEXT",
    "LAST": "LAST",
    "FINISH_WORKOUT": "FINISH_WORKOUT ▶",
    "REST_TIMER": "REST",
    "SKIP_REST": "SKIP ▶",
    "KG": "KG",
    "REPS": "REPS",
    "MIN": "MIN",
    "KM": "KM",
    "JUMPS": "JUMPS",
    "LAPS": "LAPS",
    "STEPS": "STEPS",
    "ADD_SET": "+SET",
    "REMOVE_SET": "-SET",
    "QUEUE": "QUEUE",
    "SUPERSET": "SUPERSET",
    "CLEAR_ALL": "CLEAR_ALL",
    "LOADED_ARCHIVE": "LOADED_FROM_ARCHIVE",
    "LOADED_ROUTINE": "LOADED_ROUTINE",
    "SESSION_TIME": "SESSION_TIME",
    "REST_PERIOD": "REST_PERIOD",
    "CRUSHED": "CRUSHED IT!",
    "WORKOUT_COMPLETE": "WORKOUT COMPLETE",
    "LAST_TIME": "LAST_TIME",
    "FIRST_SESSION": "FIRST_SESSION",
    "PREVIOUS_REF": "// PREVIOUS_REF",
    "NO_HISTORY": "// NO_HISTORY",
    "PROGRESS": "PROGRESS",
    "LIGHTER": "LIGHTER",
    "SAME_WEIGHT": "SAME_WEIGHT",
    "SURF": "SURF ⇪",
    "FINISH_SESSION": "/// FINISH_SESSION",
    "LOADING": "LOADING...",
    "DONE_EMOJI": "DONE! 🎉",
    "SESSION_COMPLETE": "SESSION_COMPLETE",
    "GREAT_WORK": "GREAT WORK!",
    "TOTAL_TIME": "TOTAL_TIME",
    "EXERCISES_DONE": "EXERCISES",
    "SETS_DONE": "SETS",
    "VIEW_STATS": "VIEW STATS ▶",

    // ─── Active HIIT Screen ─────────────────────────────────────
    "HIIT_TITLE": "HIIT",
    "HIIT_SUBTITLE": "// INTERVAL_TRAINING",
    "ROUNDS": "ROUNDS",
    "WORK_TIME": "WORK_TIME",
    "REST_TIME": "REST_TIME",
    "ESTIMATED_TIME": "ESTIMATED_TIME",
    "LAUNCH": "LAUNCH ▶",
    "ROUND": "ROUND",
    "WORK": "WORK",
    "REST": "REST",
    "SKIP_PHASE": "SKIP ▶▶",
    "SESSION_TIMELINE": "SESSION_TIMELINE",
    "TOTAL_WORK": "TOTAL_WORK",
    "TOTAL_REST": "TOTAL_REST",
    "NEXT_LABEL": "NEXT",
    "HIIT_COMPLETE": "HIIT_COMPLETE",
    "ROUNDS_DONE": "ROUNDS",
    "SAVE_EXIT": "SAVE + EXIT ▶",
    "GET_READY": "GET READY",
    "SECONDS": "SECONDS",
    "ELAPSED": "ELAPSED",
    "CONFIGURE_SESSION": "// CONFIGURE_SESSION",
    "TOTAL_ESTIMATE": "TOTAL_ESTIMATE",
    "RATIO": "RATIO",
    "START_HIIT": "START HIIT ⚡",
    "PAUSE": "⏸ PAUSE",
    "RESUME": "▶ RESUME",
    "SKIP_HIIT": "SKIP ⏭",
    "DURATION": "DURATION",
    "SAVE_VIEW_LAB": "SAVE & VIEW LAB →",
    "DONE_CHECK": "✓ DONE",
    "VOICE_GO": "Go!",
    "VOICE_REST": "Rest!",
    "VOICE_DONE": "Done!",

    // ─── Archive Screen ─────────────────────────────────────────
    "ARCHIVE": "ARCHIVE",
    "ARCHIVE_SUBTITLE": "// HISTORY_LOG",
    "CONSISTENCY": "CONSISTENCY(30D)",
    "SESSIONS_COMPLETE": "SESSIONS_COMPLETE",
    "START_NOW": "START_NOW",
    "CLEAR": "CLEAR",
    "CLEAR_ALL_CONFIRM": "CLEAR ALL HISTORY?",
    "YES_CLEAR": "YES, CLEAR",
    "CANCEL": "CANCEL",
    "CARDIO_SESSION": "CARDIO_SESSION",
    "WORKOUT": "WORKOUT",
    "REDO": "REDO",
    "SAVE": "SAVE",
    "DELETE": "DELETE",
    "SAVE_ROUTINE_TITLE": "SAVE_AS_ROUTINE",
    "PICK_DAY": "PICK A DAY",
    "NO_SESSIONS": "NO SESSIONS YET",
    "START_FIRST": "START YOUR FIRST WORKOUT",
    "CONFIRM": "CONFIRM?",
    "SESSIONS_TO_DELETE": "SESSIONS_TO_DELETE:",
    "CLEAR_WARNING_LINE1": "This will permanently delete",
    "CLEAR_WARNING_LINE2": "workout(s) from your archive.",
    "CLEAR_STREAK_WARNING": "Your streak and progress history will be reset.",

    // ─── Archive Status Labels ──────────────────────────────────
    "ON_TRACK": "ON_TRACK",
    "BUILDING": "BUILDING",
    "START_STRONG": "START_STRONG",

    // ─── Lab Screen ─────────────────────────────────────────────
    "LAB": "LAB",
    "LAB_SUBTITLE": "// ANALYTICS_HQ",
    "WEEKLY_VOLUME": "WEEKLY_VOLUME",
    "TOTAL_SETS_7D": "TOTAL_SETS(7D)",
    "SESSIONS_7D": "SESSIONS(7D)",
    "AVG_DURATION": "AVG_DURATION",
    "MUSCLE_MAP": "MUSCLE_MAP",
    "BODY_ACTIVATION": "BODY_ACTIVATION(7D)",
    "CARDIO_LOG": "CARDIO_LOG",
    "CARDIO_DURATION": "TOTAL_DURATION",
    "HIIT_SESSIONS": "HIIT_SESSIONS",
    "CARDIO_COUNT": "CARDIO_COUNT",
    "NO_CARDIO": "NO CARDIO DATA",
    "THIS_WEEK": "(THIS WEEK)",
    "SETS_UNIT": "SETS",
    "MINS_UNIT": "MINS",
    "SYSTEM_HEATMAP": "SYSTEM_HEATMAP",
    "ENERGY_LEVEL": "ENERGY_LEVEL",
    "AUTO_RECOVERY": "AUTO_RECOVERY",
    "RETURN_TO_BASE": "RETURN_TO_BASE",
    "THE_LAB": "THE_LAB",
    "DIAGNOSTICS": "// DIAGNOSTICS",
    "CHARGED": "CHARGED",
    "STABLE": "STABLE",
    "ENERGY_LOW": "LOW",
    "LAST_LABEL": "LAST",
    "SESSIONS_LABEL": "SESSIONS",
    "HIIT_LABEL": "HIIT",

    // ─── Navigation ──────────────────────────────────────────────
    "HOME": "HOME",
    "NAV_BUILDER": "BUILDER",
    "NAV_LAB": "LAB",

    // ─── Days of Week ────────────────────────────────────────────
    "MON": "M",
    "TUE": "T",
    "WED": "W",
    "THU": "T",
    "FRI": "F",
    "SAT": "S",
    "SUN": "S",

    // ─── HIIT Motivational Phrases ──────────────────────────────
    "MOTIV_WORK_1": "PUSH IT",
    "MOTIV_WORK_2": "NO LIMITS",
    "MOTIV_WORK_3": "STAY HARD",
    "MOTIV_WORK_4": "FULL SEND",
    "MOTIV_WORK_5": "BURN IT",
    "MOTIV_WORK_6": "GO HARDER",
    "MOTIV_WORK_7": "ALL OUT",
    "MOTIV_WORK_8": "BEAST MODE",
    "MOTIV_WORK_9": "MAX EFFORT",
    "MOTIV_WORK_10": "DON'T QUIT",
    "MOTIV_REST_1": "BREATHE",
    "MOTIV_REST_2": "RECOVER",
    "MOTIV_REST_3": "RELOAD",
    "MOTIV_REST_4": "RESET",
    "MOTIV_REST_5": "COOL DOWN",
    "MOTIV_REST_6": "STAY READY",
    "MOTIV_REST_7": "RECHARGE",
    "MOTIV_REST_8": "FOCUS UP",
    "MOTIV_REST_9": "STAY CALM",
    "MOTIV_REST_10": "PREPARE",
};

// ═══════════════════════════════════════════════════════════════
// SPANISH TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const es: Record<string, string> = {
    // ─── Home Screen ────────────────────────────────────────────
    "APP_TITLE": "WORK IT UP",
    "TAGLINE": "// ENTRENA_DURO, SÉ_DURO",
    "READY_QUERY": "¿LISTO?",
    "ENTER": "ENTRAR ▶",
    "SYSTEM_READY": "SISTEMA_LISTO",
    "VERSION": "V.2.0",
    "SYSTEM": "SISTEMA://",
    "STATUS_ONLINE": "ESTADO: EN LÍNEA",
    "MODULES_LOADED": "MÓDULOS: CARGADOS",

    // ─── Builder Screen ───────────────────────────────────────
    "BUILDER": "ARMADOR",
    "BUILD_SUBTITLE": "// CONSTRUCTOR_RUTINA",
    "MY_ROUTINES": "MIS_RUTINAS",
    "ADD_EXERCISES": "AGREGAR",
    "SELECTED": "ELEGIDOS",
    "YOUR_ROSTER": "// TU_LISTA",
    "SAVE_TO_DAY": "GUARDAR ▶ DÍA",
    "START_SESSION": "INICIAR_SESIÓN",
    "SEARCH_EXERCISES": "BUSCAR_EJERCICIOS",
    "PRELOADED": "PRECARGADO",
    "FROM": "DE",
    "NO_EXERCISES": "SIN EJERCICIOS",
    "TAP_ADD": "TOCA + PARA AGREGAR",
    "SETS": "SERIES",
    "SET": "SERIE",

    // ─── Exercise Search ────────────────────────────────────────
    "EXERCISE_DB": "BASE_EJERCICIOS",
    "SEARCH_PLACEHOLDER": "BUSCAR...",
    "ALL": "TODO",
    "FAVORITES": "FAVORITOS",
    "RESULTS": "RESULTADOS",
    "NO_RESULTS": "SIN RESULTADOS",
    "NO_FAVORITES": "SIN FAVORITOS AÚN",
    "TAP_STAR": "TOCA ★ EN UN EJERCICIO",
    "EQUIPMENT": "EQUIPO",
    "MUSCLE_GROUP": "GRUPO_MUSCULAR",

    // ─── Muscle Groups ──────────────────────────────────────────
    "CHEST": "PECHO",
    "BACK": "ESPALDA",
    "LEGS": "PIERNAS",
    "SHOULDERS": "HOMBROS",
    "ARMS": "BRAZOS",
    "CORE": "ABDOMEN",
    "CARDIO": "CARDIO",

    // ─── Active Screen ──────────────────────────────────────────
    "ACTIVE": "ACTIVO",
    "SESSION_SUBTITLE": "// SESIÓN_EN_VIVO",
    "CURRENT_MOVE": "MOVIMIENTO_ACTUAL",
    "LOG_SET": "REG.SERIE ▶",
    "LOG_CARDIO": "REG.CARDIO ⚡",
    "UP_NEXT": "SIGUIENTE",
    "LAST": "ÚLTIMO",
    "FINISH_WORKOUT": "FINALIZAR ▶",
    "REST_TIMER": "DESCANSO",
    "SKIP_REST": "SALTAR ▶",
    "KG": "KG",
    "REPS": "REPS",
    "MIN": "MIN",
    "KM": "KM",
    "JUMPS": "SALTOS",
    "LAPS": "VUELTAS",
    "STEPS": "PASOS",
    "ADD_SET": "+SERIE",
    "REMOVE_SET": "-SERIE",
    "QUEUE": "COLA",
    "SUPERSET": "SUPERSERIE",
    "CLEAR_ALL": "BORRAR_TODO",
    "LOADED_ARCHIVE": "CARGADO_DEL_ARCHIVO",
    "LOADED_ROUTINE": "RUTINA_CARGADA",
    "SESSION_TIME": "TIEMPO_SESIÓN",
    "REST_PERIOD": "DESCANSO",
    "CRUSHED": "¡LO LOGRASTE!",
    "WORKOUT_COMPLETE": "ENTRENO COMPLETO",
    "LAST_TIME": "ÚLTIMA_VEZ",
    "FIRST_SESSION": "1RA_SESIÓN",
    "PREVIOUS_REF": "// REF_ANTERIOR",
    "NO_HISTORY": "// SIN_HISTORIAL",
    "PROGRESS": "PROGRESO",
    "LIGHTER": "MÁS LEVE",
    "SAME_WEIGHT": "MISMO_PESO",
    "SURF": "SURF ⇪",
    "FINISH_SESSION": "/// TERMINAR",
    "LOADING": "CARGANDO...",
    "DONE_EMOJI": "¡LISTO! 🎉",
    "SESSION_COMPLETE": "SESIÓN_COMPLETA",
    "GREAT_WORK": "¡GRAN TRABAJO!",
    "TOTAL_TIME": "TIEMPO_TOTAL",
    "EXERCISES_DONE": "EJERCICIOS",
    "SETS_DONE": "SERIES",
    "VIEW_STATS": "VER STATS ▶",

    // ─── Active HIIT Screen ─────────────────────────────────────
    "HIIT_TITLE": "HIIT",
    "HIIT_SUBTITLE": "// ENTRENAMIENTO_INTERVALOS",
    "ROUNDS": "RONDAS",
    "WORK_TIME": "TRABAJO",
    "REST_TIME": "DESCANSO",
    "ESTIMATED_TIME": "TIEMPO_EST",
    "LAUNCH": "LANZAR ▶",
    "ROUND": "RONDA",
    "WORK": "TRABAJO",
    "REST": "DESCANSO",
    "SKIP_PHASE": "SALTAR ▶▶",
    "SESSION_TIMELINE": "LÍNEA_SESIÓN",
    "TOTAL_WORK": "TOTAL_TRABAJO",
    "TOTAL_REST": "TOTAL_DESCANSO",
    "NEXT_LABEL": "SIG.",
    "HIIT_COMPLETE": "HIIT_COMPLETO",
    "ROUNDS_DONE": "RONDAS",
    "SAVE_EXIT": "GUARDAR + SALIR ▶",
    "GET_READY": "PREPÁRATE",
    "SECONDS": "SEGUNDOS",
    "ELAPSED": "TRANSCUR.",
    "CONFIGURE_SESSION": "// CONFIGURAR_SESIÓN",
    "TOTAL_ESTIMATE": "ESTIMADO_TOTAL",
    "RATIO": "RATIO",
    "START_HIIT": "INICIAR HIIT ⚡",
    "PAUSE": "⏸ PAUSA",
    "RESUME": "▶ SEGUIR",
    "SKIP_HIIT": "SALTAR ⏭",
    "DURATION": "DURACIÓN",
    "SAVE_VIEW_LAB": "GUARDAR & VER LAB →",
    "DONE_CHECK": "✓ LISTO",
    "VOICE_GO": "¡Ya!",
    "VOICE_REST": "¡Descansa!",
    "VOICE_DONE": "¡Listo!",

    // ─── Archive Screen ─────────────────────────────────────────
    "ARCHIVE": "ARCHIVO",
    "ARCHIVE_SUBTITLE": "// REG_HISTORIAL",
    "CONSISTENCY": "CONSTANCIA(30D)",
    "SESSIONS_COMPLETE": "SESIONES_OK",
    "START_NOW": "EMPEZAR",
    "CLEAR": "LIMPIAR",
    "CLEAR_ALL_CONFIRM": "¿BORRAR HISTORIAL?",
    "YES_CLEAR": "SÍ, BORRAR",
    "CANCEL": "CANCELAR",
    "CARDIO_SESSION": "SESIÓN_CARDIO",
    "WORKOUT": "ENTRENO",
    "REDO": "REPETIR",
    "SAVE": "GUARDAR",
    "DELETE": "BORRAR",
    "SAVE_ROUTINE_TITLE": "GUARDAR_RUTINA",
    "PICK_DAY": "ELIGE UN DÍA",
    "NO_SESSIONS": "SIN SESIONES",
    "START_FIRST": "INICIA TU PRIMER ENTRENO",
    "CONFIRM": "¿CONFIRMAR?",
    "SESSIONS_TO_DELETE": "SESIONES_A_BORRAR:",
    "CLEAR_WARNING_LINE1": "Esto eliminará permanentemente",
    "CLEAR_WARNING_LINE2": "entreno(s) de tu archivo.",
    "CLEAR_STREAK_WARNING": "Tu racha y progreso serán reiniciados.",

    // ─── Archive Status Labels ──────────────────────────────────
    "ON_TRACK": "EN_RACHA",
    "BUILDING": "CRECIENDO",
    "START_STRONG": "A_DARLE",

    // ─── Lab Screen ─────────────────────────────────────────────
    "LAB": "LAB",
    "LAB_SUBTITLE": "// CENTRO_ANÁLISIS",
    "WEEKLY_VOLUME": "VOL_SEMANAL",
    "TOTAL_SETS_7D": "SERIES_TOTAL(7D)",
    "SESSIONS_7D": "SESIONES(7D)",
    "AVG_DURATION": "DURACIÓN_PROM",
    "MUSCLE_MAP": "MAPA_MUSCULAR",
    "BODY_ACTIVATION": "ACTIVACIÓN(7D)",
    "CARDIO_LOG": "REG_CARDIO",
    "CARDIO_DURATION": "DURACIÓN_TOTAL",
    "HIIT_SESSIONS": "SESIONES_HIIT",
    "CARDIO_COUNT": "CARDIO_TOTAL",
    "NO_CARDIO": "SIN DATOS CARDIO",
    "THIS_WEEK": "(ESTA SEMANA)",
    "SETS_UNIT": "SERIES",
    "MINS_UNIT": "MINS",
    "SYSTEM_HEATMAP": "MAPA_SISTEMA",
    "ENERGY_LEVEL": "NIVEL_ENERGÍA",
    "AUTO_RECOVERY": "AUTO_RECUP.",
    "RETURN_TO_BASE": "VOLVER_A_BASE",
    "THE_LAB": "EL_LAB",
    "DIAGNOSTICS": "// DIAGNÓSTICOS",
    "CHARGED": "CARGADO",
    "STABLE": "ESTABLE",
    "ENERGY_LOW": "BAJO",
    "LAST_LABEL": "ÚLTIMO",
    "SESSIONS_LABEL": "SESIONES",
    "HIIT_LABEL": "HIIT",

    // ─── Navigation ──────────────────────────────────────────────
    "HOME": "INICIO",
    "NAV_BUILDER": "ARMADOR",
    "NAV_LAB": "LAB",

    // ─── Days of Week ────────────────────────────────────────────
    "MON": "L",
    "TUE": "M",
    "WED": "X",
    "THU": "J",
    "FRI": "V",
    "SAT": "S",
    "SUN": "D",

    // ─── HIIT Motivational Phrases ──────────────────────────────
    "MOTIV_WORK_1": "¡DALE!",
    "MOTIV_WORK_2": "SIN LÍMITES",
    "MOTIV_WORK_3": "AGUANTA",
    "MOTIV_WORK_4": "A TOPE",
    "MOTIV_WORK_5": "QUÉMALO",
    "MOTIV_WORK_6": "MÁS DURO",
    "MOTIV_WORK_7": "TODO O NADA",
    "MOTIV_WORK_8": "MODO BESTIA",
    "MOTIV_WORK_9": "AL MÁXIMO",
    "MOTIV_WORK_10": "NO PARES",
    "MOTIV_REST_1": "RESPIRA",
    "MOTIV_REST_2": "RECUPERA",
    "MOTIV_REST_3": "RECARGA",
    "MOTIV_REST_4": "REINICIA",
    "MOTIV_REST_5": "ENFRÍA",
    "MOTIV_REST_6": "PREPÁRATE",
    "MOTIV_REST_7": "RECARGA",
    "MOTIV_REST_8": "ENFOCA",
    "MOTIV_REST_9": "CALMA",
    "MOTIV_REST_10": "ALÍSTATE",
};

// ═══════════════════════════════════════════════════════════════
// EXERCISE NAME TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
export const exerciseNamesEs: Record<string, string> = {
    // ─── CHEST ──────────────────────────────────────────────────
    "BENCH PRESS": "PRESS DE BANCA",
    "INCLINE BENCH PRESS": "PRESS INCLINADO",
    "DECLINE BENCH PRESS": "PRESS DECLINADO",
    "DUMBBELL BENCH PRESS": "PRESS MANCUERNAS",
    "INCLINE DUMBBELL PRESS": "PRESS INCL.MANC.",
    "DECLINE DUMBBELL PRESS": "PRESS DECL.MANC.",
    "CABLE FLY": "CRUCE DE CABLES",
    "LOW CABLE FLY": "CRUCE CABLE BAJO",
    "PUSH UP": "FLEXIONES",
    "DIAMOND PUSH UP": "FLEX. DIAMANTE",
    "DUMBBELL FLY": "APERT. MANCUERNAS",
    "INCLINE DUMBBELL FLY": "APERT. INCLINADO",
    "CHEST DIP": "FONDOS PECHO",
    "PEC DECK": "PEC DECK",
    "MACHINE CHEST PRESS": "PRESS MÁQUINA",

    // ─── BACK ───────────────────────────────────────────────────
    "DEADLIFT": "PESO MUERTO",
    "SUMO DEADLIFT": "PESO MUERTO SUMO",
    "PULL UP": "DOMINADAS",
    "CHIN UP": "DOMINADAS SUPINO",
    "BARBELL ROW": "REMO CON BARRA",
    "PENDLAY ROW": "REMO PENDLAY",
    "LAT PULLDOWN": "JALÓN DORSAL",
    "CLOSE GRIP PULLDOWN": "JALÓN AGARRE CER.",
    "DUMBBELL ROW": "REMO MANCUERNA",
    "SEATED CABLE ROW": "REMO SENTADO",
    "T-BAR ROW": "REMO EN T",
    "STRAIGHT ARM PULLDOWN": "JALÓN BRAZOS REC.",
    "HYPEREXTENSION": "HIPEREXTENSIÓN",
    "CABLE PULLOVER": "PULLOVER CABLES",
    "MACHINE ROW": "REMO MÁQUINA",

    // ─── LEGS ───────────────────────────────────────────────────
    "SQUAT": "SENTADILLA",
    "FRONT SQUAT": "SENTADILLA FRONT.",
    "LEG PRESS": "PRENSA PIERNAS",
    "HACK SQUAT": "HACK SQUAT",
    "ROMANIAN DEADLIFT": "P.MUERTO RUMANO",
    "STIFF LEG DEADLIFT": "P.MUERTO RÍGIDO",
    "LUNGES": "ZANCADAS",
    "WALKING LUNGES": "ZANCADAS CAMIN.",
    "BULGARIAN SPLIT SQUAT": "SENTAD. BÚLGARA",
    "GOBLET SQUAT": "SENTAD. GOBLET",
    "LEG CURL": "CURL FEMORAL",
    "SEATED LEG CURL": "CURL FEM. SENTADO",
    "LEG EXTENSION": "EXTENSIÓN PIERNA",
    "CALF RAISE": "ELEVACIÓN TALÓN",
    "SEATED CALF RAISE": "ELEV.TALÓN SENTADO",
    "HIP THRUST": "HIP THRUST",
    "GLUTE BRIDGE": "PUENTE GLÚTEO",
    "STEP UPS": "SUBIDAS AL BANCO",
    "SUMO SQUAT": "SENTADILLA SUMO",
    "SISSY SQUAT": "SENTAD. SISSY",

    // ─── SHOULDERS ──────────────────────────────────────────────
    "OVERHEAD PRESS": "PRESS MILITAR",
    "SEATED DUMBBELL PRESS": "PRESS SENT.MANC.",
    "LATERAL RAISE": "ELEV. LATERAL",
    "CABLE LATERAL RAISE": "ELEV.LAT. CABLE",
    "FRONT RAISE": "ELEV. FRONTAL",
    "FACE PULL": "FACE PULL",
    "ARNOLD PRESS": "PRESS ARNOLD",
    "REAR DELT FLY": "APERT. POSTERIOR",
    "CABLE REAR DELT FLY": "APERT.POST. CABLE",
    "SHRUGS": "ENCOGIMIENTOS",
    "BARBELL SHRUGS": "ENCOGIM. BARRA",
    "UPRIGHT ROW": "REMO AL MENTÓN",
    "MACHINE SHOULDER PRESS": "PRESS HOMBRO MÁQ.",
    "REVERSE PEC DECK": "PEC DECK INVERSO",

    // ─── ARMS ───────────────────────────────────────────────────
    "BICEP CURL": "CURL BÍCEPS",
    "BARBELL CURL": "CURL CON BARRA",
    "HAMMER CURL": "CURL MARTILLO",
    "CONCENTRATION CURL": "CURL CONCENTRADO",
    "CABLE CURL": "CURL EN CABLE",
    "PREACHER CURL": "CURL PREDICADOR",
    "INCLINE CURL": "CURL INCLINADO",
    "EZ BAR CURL": "CURL BARRA EZ",
    "TRICEP PUSHDOWN": "JALÓN TRÍCEPS",
    "ROPE PUSHDOWN": "JALÓN CUERDA",
    "SKULL CRUSHER": "ROMPECRÁNEOS",
    "TRICEP DIP": "FONDOS TRÍCEPS",
    "OVERHEAD TRICEP EXTENSION": "EXT.TRÍCEP ARRIBA",
    "CABLE OVERHEAD EXTENSION": "EXT.CABLE ARRIBA",
    "TRICEP KICKBACK": "PATADA TRÍCEPS",
    "CLOSE GRIP BENCH PRESS": "PRESS AGARRE CER.",
    "WRIST CURL": "CURL MUÑECA",
    "REVERSE CURL": "CURL INVERSO",

    // ─── CORE ───────────────────────────────────────────────────
    "PLANK": "PLANCHA",
    "SIDE PLANK": "PLANCHA LATERAL",
    "CRUNCHES": "ABDOMINALES",
    "BICYCLE CRUNCH": "ABDOM. BICICLETA",
    "LEG RAISE": "ELEV. DE PIERNAS",
    "HANGING LEG RAISE": "ELEV.PIERNAS COLG.",
    "CABLE CRUNCH": "ABDOMINAL CABLE",
    "RUSSIAN TWIST": "GIRO RUSO",
    "MOUNTAIN CLIMBER": "ESCALADORES",
    "AB WHEEL ROLLOUT": "RUEDA ABDOMINAL",
    "DEAD BUG": "BICHO MUERTO",
    "HOLLOW BODY HOLD": "HOLD CUERPO HUECO",
    "V-UPS": "V-UPS",
    "TOE TOUCHES": "TOCAR PUNTAS",
    "WOOD CHOPS": "LEÑADOR",

    // ─── CARDIO ─────────────────────────────────────────────────
    "TREADMILL": "CAMINADORA",
    "STATIONARY BIKE": "BICI ESTÁTICA",
    "ELLIPTICAL": "ELÍPTICA",
    "ROWING MACHINE": "MÁQUINA DE REMO",
    "JUMP ROPE": "SALTAR LA CUERDA",
    "STAIR CLIMBER": "ESCALADORA",
    "SWIMMING": "NATACIÓN",
    "HIIT SESSION": "SESIÓN HIIT",
};

// ─── Day-of-week arrays (locale-specific) ───────────────────────
type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export const DAYS_EN: { key: DayOfWeek; label: string }[] = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' },
];
export const DAYS_ES: { key: DayOfWeek; label: string }[] = [
    { key: 'sun', label: 'D' },
    { key: 'mon', label: 'L' },
    { key: 'tue', label: 'M' },
    { key: 'wed', label: 'X' },
    { key: 'thu', label: 'J' },
    { key: 'fri', label: 'V' },
    { key: 'sat', label: 'S' },
];

// ─── Muscle group translation helper ────────────────────────────
export function translateMuscle(muscle: string): string {
    const locale = getLocale();
    if (locale === 'en') return muscle;
    return t(muscle.toUpperCase()) || muscle;
}

// ─── Exercise name translation helper ───────────────────────────
export function translateExercise(name: string): string {
    const locale = getLocale();
    if (locale === 'en') return name;
    return exerciseNamesEs[name.toUpperCase()] || name;
}

// ─── Equipment translation helper ──────────────────────────────
const equipmentEs: Record<string, string> = {
    "BARBELL": "BARRA",
    "DUMBBELL": "MANCUERNA",
    "CABLE": "CABLE",
    "BODYWEIGHT": "PESO CORPORAL",
    "MACHINE": "MÁQUINA",
};

export function translateEquipment(equipment: string): string {
    const locale = getLocale();
    if (locale === 'en') return equipment;
    return equipmentEs[equipment.toUpperCase()] || equipment;
}
