/** 연습 모드 표시·입력용: 괄호 제거 */
export function stripPracticeParens(text) {
  return String(text ?? "").replace(/[()]/g, "");
}

/** textarea 표시용: 입력값 + 미입력 구간은 ghost 글자 */
export function interleavePracticeInput(targetText, userInput) {
  return [...String(targetText ?? "")].map((ch, index) => userInput[index] ?? ch).join("");
}

/** 연습 모드: 입력이 목표 문자열 범위 안인지 */
export function clampPracticeInput(value, targetText) {
  if (!targetText) return value;
  if (value.length <= targetText.length) return value;
  return value.slice(0, targetText.length);
}

/** 연습 모드: 전체 일치 여부 */
export function isPracticeComplete(targetText, userInput) {
  return Boolean(targetText) && userInput === targetText;
}

/** 연습 모드: 위치별 정오답 */
export function getPracticeCharState(expectedChar, typedChar) {
  if (typedChar === undefined) return "pending";
  return typedChar === expectedChar ? "correct" : "wrong";
}

/** 연습 모드: 순차 입력에 문자 추가 */
export function appendPracticeInput(current, chunk, targetText) {
  if (!chunk || !targetText) return current;
  return clampPracticeInput(current + chunk, targetText);
}

/** 연습 모드: 마지막 문자 삭제 */
export function backspacePracticeInput(current) {
  return current.slice(0, -1);
}
