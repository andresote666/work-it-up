/**
 * Static Exercise Image Mapping
 * Maps app exercise IDs to wger.de image URLs
 * Manually curated for best matches
 */

// Direct mapping: app exercise ID -> wger image URL
export const exerciseImageMap: Record<string, string> = {
    // CHEST
    bench_press: "https://wger.de/media/exercise-images/192/Bench-press-1.png",
    incline_bench_press: "https://wger.de/media/exercise-images/41/Incline-bench-press-1.png",
    decline_bench_press: "https://wger.de/media/exercise-images/100/Decline-bench-press-1.png",
    dumbbell_bench_press: "https://wger.de/media/exercise-images/97/Dumbbell-bench-press-1.png",
    incline_dumbbell_press: "https://wger.de/media/exercise-images/16/Incline-press-1.png",
    dumbbell_fly: "https://wger.de/media/exercise-images/238/2fc242d3-5bdd-4f97-99bd-678adb8c96fc.png",
    push_up: "https://wger.de/media/exercise-images/143/Push-ups-1.png",
    chest_dip: "https://wger.de/media/exercise-images/83/Bench-dips-1.png",

    // BACK
    deadlift: "https://wger.de/media/exercise-images/105/Deadlift-1.png",
    pull_up: "https://wger.de/media/exercise-images/153/Pull-ups-1.png",
    chin_up: "https://wger.de/media/exercise-images/181/Chin-ups-1.png",
    barbell_row: "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png",
    lat_pulldown: "https://wger.de/media/exercise-images/122/Lat-pulldown-1.png",
    dumbbell_row: "https://wger.de/media/exercise-images/86/Dumbbell-row-1.png",
    seated_cable_row: "https://wger.de/media/exercise-images/108/Seated-cable-rows-1.png",
    hyperextension: "https://wger.de/media/exercise-images/128/Hyperextensions-1.png",
    straight_arm_pulldown: "https://wger.de/media/exercise-images/1726/2e7e541b-5f55-405a-ae78-3e71b3f42db4.png",

    // LEGS
    squat: "https://wger.de/media/exercise-images/111/Full-squat-1.png",
    front_squat: "https://wger.de/media/exercise-images/191/Front-squats-1.png",
    leg_press: "https://wger.de/media/exercise-images/130/Leg-press-1.png",
    romanian_deadlift: "https://wger.de/media/exercise-images/94/Stiff-legged-deadlift-1.png",
    lunges: "https://wger.de/media/exercise-images/113/Lunges-1.png",
    leg_curl: "https://wger.de/media/exercise-images/117/Lying-leg-curls-1.png",
    leg_extension: "https://wger.de/media/exercise-images/118/Leg-extensions-1.png",
    calf_raise: "https://wger.de/media/exercise-images/104/Calf-raises-1.png",
    hip_thrust: "https://wger.de/media/exercise-images/1614/d5ebadd8-f676-427f-b755-6a0679c19265.jpg",

    // SHOULDERS
    overhead_press: "https://wger.de/media/exercise-images/190/Military-press-1.png",
    seated_dumbbell_press: "https://wger.de/media/exercise-images/152/Seated-dumbbell-press-1.png",
    lateral_raise: "https://wger.de/media/exercise-images/148/Dumbbell-lateral-raise-1.png",
    cable_lateral_raise: "https://wger.de/media/exercise-images/1378/7c1fcf34-fb7e-45e7-a0c1-51f296235315.jpg",
    front_raise: "https://wger.de/media/exercise-images/154/Front-raises-1.png",
    shrugs: "https://wger.de/media/exercise-images/150/Shrugs-1.png",
    barbell_shrugs: "https://wger.de/media/exercise-images/150/Shrugs-1.png",
    upright_row: "https://wger.de/media/exercise-images/127/Upright-rows-1.png",

    // ARMS
    bicep_curl: "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png",
    barbell_curl: "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png",
    hammer_curl: "https://wger.de/media/exercise-images/742/77e4d448-a37e-4c08-90df-ac8c8b7a8219.png",
    concentration_curl: "https://wger.de/media/exercise-images/1109/00b0a0bf-c14a-4f13-bb14-62c09030a1aa.png",
    cable_curl: "https://wger.de/media/exercise-images/129/Standing-biceps-curl-1.png",
    preacher_curl: "https://wger.de/media/exercise-images/82/Preacher-curls-1.png",
    tricep_pushdown: "https://wger.de/media/exercise-images/659/a60452f1-e2ea-43fe-baa6-c1a2208d060c.png",
    skull_crusher: "https://wger.de/media/exercise-images/344/ae8ea3fe-61c1-4d03-b03f-e69f3fda1a6b.png",
    tricep_dip: "https://wger.de/media/exercise-images/83/Bench-dips-1.png",
    close_grip_bench_press: "https://wger.de/media/exercise-images/88/Narrow-grip-bench-press-1.png",

    // CORE
    crunches: "https://wger.de/media/exercise-images/91/Crunches-1.png",
    leg_raise: "https://wger.de/media/exercise-images/125/Leg-raises-1.png",
    russian_twist: "https://wger.de/media/exercise-images/340/1b5f6e34-77b1-4068-84d4-87f917bd0288.png",
};

/**
 * Get image URL for an exercise by its ID
 */
export function getExerciseImageUrl(exerciseId: string): string | null {
    return exerciseImageMap[exerciseId] || null;
}

/**
 * Get image URL by exercise name (fallback for dynamic lookup)
 */
export function getExerciseImageByName(exerciseName: string): string | null {
    // Convert name to ID format: "BENCH PRESS" -> "bench_press"
    const id = exerciseName.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
    return exerciseImageMap[id] || null;
}
