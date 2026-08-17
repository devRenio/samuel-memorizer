import { useMemo, useState } from "react";
import {
  buildExamQuestions,
  buildTopicPrompt,
  getExamPreview,
  gradeTopicAnswers,
} from "../utils/examLogic";

const ALL_DAYS = [1, 2, 3, 4, 5, 6];

function createEmptyAnswers(count) {
  return Array.from({ length: count }, () => "");
}

export default function ExamModeScreen({ originalScriptures, onBack }) {
  const [phase, setPhase] = useState("setup");
  const [courseNum, setCourseNum] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [topicResults, setTopicResults] = useState([]);
  const [showTopicReview, setShowTopicReview] = useState(false);
  const [lastTopicGrade, setLastTopicGrade] = useState(null);

  const preview = useMemo(() => {
    if (!courseNum || selectedDays.length === 0) {
      return { topicCount: 0, totalAnswerCount: 0, verseCount: 0 };
    }
    return getExamPreview(originalScriptures, courseNum, selectedDays);
  }, [originalScriptures, courseNum, selectedDays]);

  const currentQuestion = questions[questionIndex] ?? null;
  const canStart =
    courseNum !== null &&
    selectedDays.length > 0 &&
    preview.topicCount > 0 &&
    preview.totalAnswerCount > 0;

  const totalCorrect = topicResults.reduce(
    (sum, result) => sum + result.correctCount,
    0,
  );
  const totalQuestions = topicResults.reduce(
    (sum, result) => sum + result.totalCount,
    0,
  );

  const toggleDay = (dayNum) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum)
        ? prev.filter((day) => day !== dayNum)
        : [...prev, dayNum].sort((a, b) => a - b),
    );
  };

  const resetToSetup = () => {
    setPhase("setup");
    setQuestions([]);
    setQuestionIndex(0);
    setAnswers([]);
    setTopicResults([]);
    setShowTopicReview(false);
    setLastTopicGrade(null);
  };

  const handleStartExam = () => {
    if (!canStart) return;

    const built = buildExamQuestions(
      originalScriptures,
      courseNum,
      selectedDays,
    );
    if (built.length === 0) return;

    setQuestions(built);
    setQuestionIndex(0);
    setAnswers(createEmptyAnswers(built[0].answerCount));
    setTopicResults([]);
    setShowTopicReview(false);
    setLastTopicGrade(null);
    setPhase("exam");
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSubmitTopic = () => {
    if (!currentQuestion) return;

    const grade = gradeTopicAnswers(currentQuestion.expectedVerses, answers);
    const result = {
      topic: currentQuestion.topic,
      prompt: buildTopicPrompt(currentQuestion),
      excludedDisplay: currentQuestion.excludedDisplay,
      ...grade,
      expectedVerses: currentQuestion.expectedVerses.map(
        (verse) => verse.fullText,
      ),
    };

    setLastTopicGrade(result);
    setTopicResults((prev) => [...prev, result]);
    setShowTopicReview(true);
  };

  const handleNextTopic = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= questions.length) {
      setPhase("summary");
      setShowTopicReview(false);
      setLastTopicGrade(null);
      return;
    }

    setQuestionIndex(nextIndex);
    setAnswers(createEmptyAnswers(questions[nextIndex].answerCount));
    setShowTopicReview(false);
    setLastTopicGrade(null);
  };

  const handleRetake = () => {
    if (!courseNum || selectedDays.length === 0) {
      resetToSetup();
      return;
    }
    handleStartExam();
  };

  return (
    <div
      className={`exam-mode-screen${phase === "exam" ? "" : " exam-mode-screen--centered"}`}
    >
      <button
        type="button"
        className="app-mode-tab app-mode-tab--back"
        onClick={onBack}
        aria-label="암송 모드로 돌아가기"
      >
        ◀ 암송
      </button>

      <div className="exam-mode-content">
        {phase === "setup" && (
          <div className="exam-setup">
            <p className="exam-mode-eyebrow">Samuel Exam</p>
            <h1 className="exam-mode-title">시험 설정</h1>
            <p className="exam-mode-desc">
              과정과 일차를 선택하면 실제 시험처럼 주제별로 구절을 작성합니다.
            </p>

            <section className="exam-setup-section">
              <h2 className="exam-setup-heading">과정</h2>
              <div className="exam-course-grid">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`exam-course-btn${courseNum === num ? " is-selected" : ""}`}
                    onClick={() => setCourseNum(num)}
                  >
                    {num}과정
                  </button>
                ))}
              </div>
            </section>

            <section className="exam-setup-section">
              <h2 className="exam-setup-heading">일차</h2>
              <div className="exam-day-grid">
                {ALL_DAYS.map((dayNum) => {
                  const checked = selectedDays.includes(dayNum);
                  return (
                    <label
                      key={dayNum}
                      className={`exam-day-option${checked ? " is-checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDay(dayNum)}
                      />
                      <span>{dayNum}일차</span>
                    </label>
                  );
                })}
              </div>
            </section>

            <div className="exam-preview-card">
              <div className="exam-preview-row">
                <span>출제 주제</span>
                <strong>{preview.topicCount}개</strong>
              </div>
              <div className="exam-preview-row">
                <span>작성할 구절</span>
                <strong>{preview.totalAnswerCount}개</strong>
              </div>
              {courseNum &&
                selectedDays.length > 0 &&
                preview.topicCount === 0 && (
                  <p className="exam-preview-warning">
                    선택한 범위에 출제할 구절이 없습니다.
                  </p>
                )}
            </div>

            <button
              type="button"
              className="exam-primary-btn"
              disabled={!canStart}
              onClick={handleStartExam}
            >
              시험 시작
            </button>
          </div>
        )}

        {phase === "exam" && currentQuestion && (
          <div className="exam-session">
            <div className="exam-session-header">
              <span className="exam-session-progress">
                {questionIndex + 1} / {questions.length}
              </span>
              <h1 className="exam-mode-title exam-mode-title--compact">
                {buildTopicPrompt(currentQuestion)}
              </h1>
              <p className="exam-session-meta">
                작성할 구절 <strong>{currentQuestion.answerCount}개</strong>
              </p>
            </div>

            {!showTopicReview ? (
              <>
                <div className="exam-answer-slots">
                  {answers.map((value, index) => (
                    <label key={index} className="exam-answer-slot">
                      <span className="exam-answer-slot-label">
                        {index + 1}번
                      </span>
                      <textarea
                        className="exam-answer-input"
                        value={value}
                        rows={3}
                        placeholder="장절과 본문을 모두 작성하세요"
                        onChange={(event) =>
                          handleAnswerChange(index, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  className="exam-primary-btn"
                  onClick={handleSubmitTopic}
                >
                  제출하고 채점
                </button>
              </>
            ) : (
              lastTopicGrade && (
                <div className="exam-topic-review">
                  <div className="exam-topic-score">
                    <strong>
                      {lastTopicGrade.correctCount} /{" "}
                      {lastTopicGrade.totalCount}
                    </strong>
                    <span>구절 정답</span>
                  </div>

                  <div className="exam-slot-results">
                    {lastTopicGrade.slotResults.map((slot) => (
                      <div
                        key={slot.slotIndex}
                        className={`exam-slot-result${slot.correct ? " is-correct" : " is-wrong"}`}
                      >
                        <div className="exam-slot-result-head">
                          <span>{slot.slotIndex + 1}번</span>
                          <span>{slot.correct ? "정답" : "오답"}</span>
                        </div>
                        {slot.input ? (
                          <p className="exam-slot-result-input">{slot.input}</p>
                        ) : (
                          <p className="exam-slot-result-input is-empty">
                            (미작성)
                          </p>
                        )}
                        {!slot.correct && (
                          <>
                            <p className="exam-slot-result-error">
                              <strong>{slot.errorLabel}</strong>
                              {slot.errorDetail && (
                                <span> — {slot.errorDetail}</span>
                              )}
                            </p>
                            {slot.expectedFullText && (
                              <p className="exam-slot-result-expected">
                                정답: {slot.expectedFullText}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {lastTopicGrade.missedExpected.length > 0 && (
                    <div className="exam-missed-box">
                      <p className="exam-missed-title">맞히지 못한 구절</p>
                      <ul>
                        {lastTopicGrade.missedExpected.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="exam-model-answers">
                    <p className="exam-model-title">모범답안</p>
                    <ul>
                      {lastTopicGrade.expectedVerses.map((text) => (
                        <li key={text}>{text}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="exam-primary-btn"
                    onClick={handleNextTopic}
                  >
                    {questionIndex + 1 >= questions.length
                      ? "결과 보기"
                      : "다음 주제"}
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {phase === "summary" && (
          <div className="exam-summary">
            <p className="exam-mode-eyebrow">Exam Complete</p>
            <h1 className="exam-mode-title">시험 결과</h1>
            <div className="exam-summary-score">
              <strong>
                {totalCorrect} / {totalQuestions}
              </strong>
              <span>구절 정답</span>
            </div>

            <div className="exam-summary-list">
              {topicResults.map((result) => (
                <article key={result.topic} className="exam-summary-item">
                  <div className="exam-summary-item-head">
                    <h2>{result.topic}</h2>
                    <span>
                      {result.correctCount}/{result.totalCount}
                    </span>
                  </div>
                  <p className="exam-summary-item-prompt">{result.prompt}</p>
                </article>
              ))}
            </div>

            <div className="exam-summary-actions">
              <button
                type="button"
                className="exam-secondary-btn"
                onClick={resetToSetup}
              >
                설정으로
              </button>
              <button
                type="button"
                className="exam-primary-btn"
                onClick={handleRetake}
              >
                재시험
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
