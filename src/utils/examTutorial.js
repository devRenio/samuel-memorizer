export const EXAM_TUTORIAL_STORAGE_KEY = "samuel_exam_tutorial_completed";
export const EXAM_TUTORIAL_PROMPT_KEY = "samuel_exam_tutorial_prompt_seen";

export function isExamTutorialCompleted() {
  return localStorage.getItem(EXAM_TUTORIAL_STORAGE_KEY) === "true";
}

export function markExamTutorialCompleted() {
  localStorage.setItem(EXAM_TUTORIAL_STORAGE_KEY, "true");
}

export function isExamTutorialPromptSeen() {
  return localStorage.getItem(EXAM_TUTORIAL_PROMPT_KEY) === "true";
}

export function markExamTutorialPromptSeen() {
  localStorage.setItem(EXAM_TUTORIAL_PROMPT_KEY, "true");
}

export function shouldShowExamTutorialPrompt() {
  return !isExamTutorialPromptSeen();
}
