const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export function isHangulSyllable(char) {
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

export function hangulSyllableToInitial(char) {
  if (!isHangulSyllable(char)) return "";
  const index = Math.floor((char.charCodeAt(0) - 0xac00) / 588);
  return CHOSEONG[index] ?? "";
}

function flushDigitRun(out, digitRun) {
  if (!digitRun) return out;
  return out + `${digitRun.length}자리`;
}

/**
 * 토큰 힌트: 한글→초성, 연속 숫자→N자리, 영문·기호는 그대로.
 * 모드별로 숫자 처리를 나누지 않고 동일 규칙을 씁니다.
 */
export function tokenToHint(text) {
  const value = String(text ?? "");
  if (!value) return "";

  let out = "";
  let digitRun = "";

  for (const char of value) {
    if (/[0-9]/.test(char)) {
      digitRun += char;
      continue;
    }

    out = flushDigitRun(out, digitRun);
    digitRun = "";

    if (isHangulSyllable(char)) {
      out += hangulSyllableToInitial(char);
    } else if (/[0-9A-Za-z]/.test(char) || /[^\s]/.test(char)) {
      out += char;
    }
  }

  return flushDigitRun(out, digitRun);
}

/** @deprecated tokenToHint 사용 */
export function wordToInitials(text) {
  return tokenToHint(text);
}

/** @deprecated tokenToHint 사용 */
export function referenceTokenToHint(text) {
  return tokenToHint(text);
}
