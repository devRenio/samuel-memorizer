import ProblemRenderer from "./ProblemRenderer";
import PracticeRenderer from "./PracticeRenderer";
import { getBlankDisplay, isPhraseAnswer } from "../utils/problemText";

export default function StudyArea({
  problemContainerRef,
  currentMode,
  currentProblem,
  isError,
  isEmpty,
  activeFontFamily,
  displayFontSize,
  isBold,
  typingMode,
  mergeBlanks,
  isMobile,
  isCompleted,
  userInput,
  inputRef,
  inputFontSize,
  courseName,
  leftVerse,
  onSkip,
  onDismissKeyboard,
  onInputChange,
  onPracticeInput,
  onKeyDown,
  onBeforeInput,
  onFocus,
  onBlur,
  onSubmit,
}) {
  const isSpaceKey = (e) =>
    e.code === "Space" || e.key === " " || e.key === "Spacebar";

  const isEnterKey = (e) =>
    e.key === "Enter" || e.code === "Enter" || e.keyCode === 13;

  const isPracticeMode = currentMode === 0;
  const practiceText = currentProblem?.practiceText ?? null;

  const handleInputKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;

    if (isPracticeMode) {
      onKeyDown(e);
      return;
    }

    if (mergeBlanks) {
      if (isSpaceKey(e)) return;
      if (isEnterKey(e)) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    onKeyDown(e);
  };

  const handleInputBeforeInput = (e) => {
    if (e.nativeEvent.isComposing) return;

    if (isPracticeMode) {
      onBeforeInput(e);
      return;
    }

    if (mergeBlanks) {
      if (e.inputType === "insertLineBreak") {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    onBeforeInput(e);
  };

  const submitHint = mergeBlanks ? "Enter" : "Space/Enter";
  const inputPlaceholder = isCompleted
    ? `${submitHint} → 다음 구절`
    : `정답 입력 후 ${submitHint}로 제출`;

  return (
    <div className="mobile-study-shell">
      <main className="problem-container" ref={problemContainerRef}>
        <div
          className="problem-box"
          data-tour="problem-box"
          style={{
            fontFamily: activeFontFamily,
            fontSize: `${displayFontSize}px`,
            fontWeight: isBold ? "bold" : "normal",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: typingMode ? "flex-start" : "center",
          }}
        >
          {currentMode !== 2 && currentMode !== 4 && currentProblem?.topic && (
            <div className="topic-display">{currentProblem.topic}</div>
          )}

          <div className="problem-text-wrapper">
            {currentProblem ? (
              isPracticeMode && practiceText ? (
                <PracticeRenderer
                  targetText={practiceText}
                  userInput={userInput}
                  inputRef={inputRef}
                  isCompleted={isCompleted}
                  onPracticeInput={onPracticeInput}
                  onKeyDown={handleInputKeyDown}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              ) : (
                <ProblemRenderer
                  text={currentProblem.problemText}
                  isError={isError}
                  activeBlankDisplay={
                    isPhraseAnswer(currentProblem.answers?.[0])
                      ? getBlankDisplay(currentProblem.answers[0])
                      : null
                  }
                  currentAnswer={currentProblem.answers?.[0] ?? null}
                  isMobile={isMobile}
                />
              )
            ) : isEmpty ? (
              <div className="empty-queue-cta">
                <p className="empty-queue-title">암송할 구절이 없습니다</p>
                <p className="empty-queue-desc">
                  상단 메뉴에서 <strong>과정</strong>과 <strong>일차</strong>를
                  선택해 구절을 추가한 뒤, 원하는 <strong>모드</strong>를 눌러
                  시작하세요.
                </p>
              </div>
            ) : (
              "상단 메뉴에서 과정과 일차를 선택한 후 모드를 눌러 시작하세요."
            )}
          </div>
        </div>
      </main>

      <div className="input-dock">
        {typingMode && (
          <div className="keyboard-mini-bar">
            <span className="badge">{courseName}</span>
            <span className="keyboard-mini-stat">
              남은 <strong>{leftVerse}</strong>
            </span>
            <div className="keyboard-mini-actions">
              <button type="button" onClick={onSkip}>
                스킵
              </button>
              <button type="button" onClick={onDismissKeyboard}>
                키보드 닫기
              </button>
            </div>
          </div>
        )}

        <div className="input-area" data-tour="input-area">
          <input
            ref={isPracticeMode ? undefined : inputRef}
            className={`answer-input ${isError ? "input-error" : ""} ${isPracticeMode ? "answer-input--paused" : ""}`}
            type="text"
            value={isPracticeMode ? "" : userInput}
            disabled={isPracticeMode}
            readOnly={isPracticeMode}
            tabIndex={isPracticeMode ? -1 : 0}
            aria-hidden={isPracticeMode}
            onChange={isPracticeMode ? undefined : onInputChange}
            onKeyDown={isPracticeMode ? undefined : handleInputKeyDown}
            onBeforeInput={isPracticeMode ? undefined : handleInputBeforeInput}
            onFocus={isPracticeMode ? undefined : onFocus}
            onBlur={isPracticeMode ? undefined : onBlur}
            autoFocus={!isMobile && !isPracticeMode}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint={isCompleted ? "next" : "done"}
            placeholder={
              isPracticeMode
                ? "연습 모드 — 구절 위에서 입력하세요"
                : inputPlaceholder
            }
            style={{
              fontSize: `${inputFontSize}px`,
              fontFamily: activeFontFamily,
            }}
          />
        </div>
      </div>
    </div>
  );
}
