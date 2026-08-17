import { normToken } from "./memorizeLogic";

const PUNCT_RE = /[,\-/]/g;

/** 병합 입력: 공백·장절 기호 제거 후 연속 비교 */
function normalizePhraseInput(userInput) {
  return String(userInput ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(PUNCT_RE, "");
}

/**
 * 연속 구절 입력 부분 채점 — 앞에서부터 순서대로 단어 매칭.
 * 띄어쓰기는 무시하며, 붙여쓰기(얻는+줄=얻는줄)도 인정합니다.
 * 장절 범위는 "38 39"/"38-39" 모두 같은 토큰으로 정규화되어 정답 처리.
 */
export function gradePhrase(expectedTokens, userInput) {
  const exp = expectedTokens.map(normToken);
  const n = exp.length;
  const userNorm = normalizePhraseInput(userInput);

  if (!userNorm) {
    return {
      allCorrect: false,
      anyCorrect: false,
      segments: expectedTokens.map(() => ({ type: "blank" })),
      unmatchedTokens: [...expectedTokens],
    };
  }

  let pos = 0;
  const matched = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (userNorm.startsWith(exp[i], pos)) {
      matched[i] = true;
      pos += exp[i].length;
    }
  }

  const segments = [];
  const unmatchedTokens = [];
  let matchedCount = 0;

  for (let k = 0; k < n; k++) {
    if (matched[k]) {
      segments.push({ type: "correct", text: expectedTokens[k] });
      matchedCount += 1;
    } else {
      segments.push({ type: "blank" });
      unmatchedTokens.push(expectedTokens[k]);
    }
  }

  const allCorrect = matchedCount === n && pos === userNorm.length;

  return {
    allCorrect,
    anyCorrect: matchedCount > 0,
    segments,
    unmatchedTokens,
  };
}
