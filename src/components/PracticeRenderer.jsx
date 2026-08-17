import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampPracticeInput,
  getPracticeCharState,
} from "../utils/practiceTyping";

/**
 * 연습 모드: 흐린 전체 구절 위에 입력 글자를 겹쳐 표시.
 * 실제 입력값만 가진 투명 textarea와 세로형 가상 커서를 사용합니다.
 * 한글 조합 중에는 draft를 즉시 표시하고 조합 완료 후 상위 상태에 반영합니다.
 */
export default function PracticeRenderer({
  targetText,
  userInput = "",
  inputRef,
  isCompleted = false,
  onPracticeInput,
  onKeyDown,
  onFocus,
  onBlur,
}) {
  const ghostRef = useRef(null);
  const localInputRef = useRef(null);
  const composingRef = useRef(false);
  const [draft, setDraft] = useState(userInput);
  const chars = useMemo(() => [...targetText], [targetText]);
  const typedLength = draft.length;

  const setInputRef = (node) => {
    localInputRef.current = node;
    if (typeof inputRef === "function") {
      inputRef(node);
    } else if (inputRef) {
      inputRef.current = node;
    }
  };

  const syncInputSize = () => {
    const ghost = ghostRef.current;
    const input = localInputRef.current;
    if (!ghost || !input) return;
    input.style.width = `${ghost.offsetWidth}px`;
    input.style.height = `${ghost.offsetHeight}px`;
  };

  const moveInputCaretToEnd = () => {
    const input = localInputRef.current;
    if (!input) return;
    const pos = input.value.length;
    input.setSelectionRange(pos, pos);
  };

  useEffect(() => {
    if (!composingRef.current) setDraft(userInput);
  }, [userInput, targetText]);

  useEffect(() => {
    syncInputSize();
    const timer = window.setTimeout(syncInputSize, 0);
    return () => window.clearTimeout(timer);
  }, [targetText]);

  useEffect(() => {
    window.addEventListener("resize", syncInputSize);
    return () => window.removeEventListener("resize", syncInputSize);
  }, []);

  useEffect(() => {
    const input = localInputRef.current;
    if (!input) return;
    input.focus();
    moveInputCaretToEnd();
  }, [targetText]);

  useEffect(() => {
    moveInputCaretToEnd();
    const caret = ghostRef.current?.querySelector(".practice-char-caret");
    caret?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [draft, targetText]);

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing || composingRef.current) return;
    onKeyDown?.(e);
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = (e) => {
    composingRef.current = false;
    const next = clampPracticeInput(e.currentTarget.value, targetText);
    setDraft(next);
    onPracticeInput(next);
  };

  const handleChange = (e) => {
    const next = clampPracticeInput(e.target.value, targetText);
    setDraft(next);
    if (!composingRef.current && !e.nativeEvent.isComposing) {
      onPracticeInput(next);
    }
  };

  const focusInput = () => {
    const input = localInputRef.current;
    if (!input) return;
    input.focus();
    moveInputCaretToEnd();
  };

  if (!targetText) return null;

  return (
    <div className="practice-stack-wrap">
      <div
        className="practice-stack"
        aria-label="연습 구절"
        onClick={focusInput}
      >
        <div
          ref={ghostRef}
          className="practice-layer practice-ghost"
          aria-hidden="true"
        >
          {targetText}
        </div>

        <div className="practice-layer practice-overlay" aria-live="polite">
          {chars.map((expectedChar, index) => {
            const state = getPracticeCharState(
              expectedChar,
              draft[index],
              index,
              typedLength,
            );
            const isCaret = index === typedLength;

            if (state === "pending") {
              return (
                <span
                  key={index}
                  className={[
                    "practice-char",
                    "practice-char-pending",
                    isCaret ? "practice-char-caret" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  {expectedChar}
                </span>
              );
            }

            return (
              <span
                key={index}
                className={[
                  "practice-char",
                  state === "correct" || state === "current"
                    ? "practice-char-correct"
                    : "practice-char-wrong",
                  isCaret ? "practice-char-caret" : "",
                ].join(" ")}
              >
                {draft[index]}
              </span>
            );
          })}
          {typedLength >= chars.length && (
            <span className="practice-end-caret" aria-hidden="true" />
          )}
        </div>

        <textarea
          ref={setInputRef}
          className="practice-input"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={moveInputCaretToEnd}
          onKeyUp={moveInputCaretToEnd}
          rows={1}
          wrap="soft"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint={isCompleted ? "next" : "done"}
          aria-label={
            isCompleted
              ? "구절 입력 완료. Enter로 다음 구절"
              : "흐린 구절을 그대로 입력"
          }
        />
      </div>

      {isCompleted && (
        <p className="practice-complete-hint">Enter → 다음 구절</p>
      )}
    </div>
  );
}
