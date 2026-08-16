import { normToken } from "./memorizeLogic";

/** 입력을 공백·장절 기호(- , /)로 쪼개 정규화된 토큰 배열로 */
function tokenizeInput(userInput) {
  return userInput
    .trim()
    .split(/[\s\-,/]+/)
    .map(normToken)
    .filter(Boolean);
}

/**
 * 연속 구절 입력 부분 채점 — 앞에서부터 순서대로 단어 매칭.
 * 붙여쓰기(얻는+줄=얻는줄)는 인정하지 않음: 띄어쓰기가 다르면 오답.
 * 장절 범위는 "38 39"/"38-39" 모두 같은 토큰으로 정규화되어 정답 처리.
 * 동일 단어가 여러 번 있어도 항상 앞쪽 빈칸부터 채움(LCS 역추적 시 뒤쪽이 먼저 맞는 버그 방지).
 */
export function gradePhrase(expectedTokens, userInput) {
  const userWords = tokenizeInput(userInput);
  const exp = expectedTokens.map(normToken);
  const n = exp.length;

  if (userWords.length === 0) {
    return {
      allCorrect: false,
      anyCorrect: false,
      segments: expectedTokens.map(() => ({ type: "blank" })),
      unmatchedTokens: [...expectedTokens],
    };
  }

  const matched = new Array(n).fill(false);
  let expIdx = 0;

  for (const userWord of userWords) {
    if (expIdx >= n) break;
    if (userWord === exp[expIdx]) {
      matched[expIdx] = true;
      expIdx += 1;
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

  return {
    allCorrect: matchedCount === n,
    anyCorrect: matchedCount > 0,
    segments,
    unmatchedTokens,
  };
}
