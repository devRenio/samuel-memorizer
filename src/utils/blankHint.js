import { tokenToHint as buildTokenHint } from "./hangulInitials";
import { isPhraseAnswer } from "./problemText";

/**
 * 활성 빈칸 hover/터치 힌트 문자열.
 * - phrase(병합): 첫 어절만 초성 + " ..."
 * - 한글→초성, 숫자→N자리, 영문·기호 그대로
 */
export function buildBlankHint(answer) {
  if (answer == null) return "";

  const tokens = isPhraseAnswer(answer) ? answer.tokens : [answer];
  if (!tokens.length) return "";

  const firstHint = buildTokenHint(String(tokens[0] ?? "").trim());
  if (isPhraseAnswer(answer) && tokens.length > 1) {
    return firstHint ? `${firstHint} ...` : "...";
  }

  return firstHint;
}
