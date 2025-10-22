type HapticStyle = "light" | "medium" | "heavy";

const hapticPatterns: Record<HapticStyle, number[]> = {
  light: [10],
  medium: [25],
  heavy: [50],
};

export function triggerHapticFeedback(style: HapticStyle = "light"): void {
  if (typeof window === "undefined") return;

  const pattern = hapticPatterns[style];

  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
    }
  }
} 