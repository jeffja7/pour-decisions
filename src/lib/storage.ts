import { TasteProfile, ScanHistoryEntry, FeedbackEntry } from "./types";

const PROFILE_KEY = "pourdecision_profile";
const HISTORY_KEY = "pourdecision_history";
const ONBOARDED_KEY = "pourdecision_onboarded";

export function getProfile(): TasteProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: TasteProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDED_KEY) === "true";
}

export function setOnboarded(): void {
  localStorage.setItem(ONBOARDED_KEY, "true");
}

export function getHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addScanToHistory(entry: ScanHistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  // Keep last 50 scans
  if (history.length > 50) history.length = 50;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addFeedbackToScan(
  scanId: string,
  feedback: FeedbackEntry
): void {
  const history = getHistory();
  const scan = history.find((s) => s.id === scanId);
  if (scan) {
    scan.feedback.push(feedback);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

export function getRecentFeedback(limit = 20): FeedbackEntry[] {
  const history = getHistory();
  return history.flatMap((s) => s.feedback).slice(0, limit);
}

export function clearAllData(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(ONBOARDED_KEY);
}
