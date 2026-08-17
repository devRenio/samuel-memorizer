export const PRACTICE_INTRO_DISMISS_KEY = "samuel_practice_intro_dismissed";
export const PRACTICE_INTRO_SESSION_KEY = "samuel_practice_intro_shown";

export const PRACTICE_INTRO_MESSAGE =
  "본격적으로 외우시기 전에, 각 말씀을 잠시 묵상하며 시작해 보세요.";

export function isPracticeIntroDismissed() {
  return localStorage.getItem(PRACTICE_INTRO_DISMISS_KEY) === "true";
}

export function dismissPracticeIntroPermanently() {
  localStorage.setItem(PRACTICE_INTRO_DISMISS_KEY, "true");
}

export function markPracticeIntroShownThisSession() {
  sessionStorage.setItem(PRACTICE_INTRO_SESSION_KEY, "true");
}

export function wasPracticeIntroShownThisSession() {
  return sessionStorage.getItem(PRACTICE_INTRO_SESSION_KEY) === "true";
}

export function shouldShowPracticeIntro() {
  return !isPracticeIntroDismissed() && !wasPracticeIntroShownThisSession();
}
