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

/** 연습 모드: 위치별 정오답 (현재 입력 중인 마지막 글자는 오답이어도 빨간색 표시 안 함) */
export function getPracticeCharState(expectedChar, typedChar, index, typedLength) {
  if (typedChar === undefined || index >= typedLength) return "pending";

  if (index < typedLength - 1) {
    return typedChar === expectedChar ? "correct" : "wrong";
  }

  return typedChar === expectedChar ? "correct" : "current";
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
