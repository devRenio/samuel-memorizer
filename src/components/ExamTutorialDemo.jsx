export default function ExamTutorialDemo({ demoId }) {
  if (demoId === "question") {
    return (
      <div className="exam-tutorial-demo">
        <div className="exam-tutorial-demo-screen">
          <span className="exam-tutorial-demo-badge">1 / 3</span>
          <p className="exam-tutorial-demo-prompt">
            &quot;죽음 후 심판&quot; 소제목에 해당하는 말씀을 모두 적어주세요.(시 50:21
            제외)
          </p>
          <p className="exam-tutorial-demo-meta">
            작성할 구절 <strong>2개</strong>
          </p>
          <div className="exam-tutorial-demo-slots">
            <div className="exam-tutorial-demo-slot">
              <span>1번</span>
              <div className="exam-tutorial-demo-input" />
            </div>
            <div className="exam-tutorial-demo-slot">
              <span>2번</span>
              <div className="exam-tutorial-demo-input" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (demoId === "grading") {
    return (
      <div className="exam-tutorial-demo">
        <div className="exam-tutorial-demo-screen">
          <div className="exam-tutorial-demo-score">
            <strong>1 / 2</strong>
            <span>구절 정답</span>
          </div>
          <div className="exam-tutorial-demo-result is-correct">
            <div className="exam-tutorial-demo-result-head">
              <span>1번</span>
              <span>정답</span>
            </div>
            <p>(히 9:27) 한 번 죽는 것은 사람에게 정하신 것이요…</p>
          </div>
          <div className="exam-tutorial-demo-result is-wrong">
            <div className="exam-tutorial-demo-result-head">
              <span>2번</span>
              <span>오답</span>
            </div>
            <p className="is-empty">(미작성)</p>
            <p className="exam-tutorial-demo-error">
              <strong>미작성</strong> — 이 구절을 작성하지 않았습니다.
            </p>
            <p className="exam-tutorial-demo-answer">
              정답: (계 20:12) … 각 사람이 행한 일대로 심판을 받으리라
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (demoId === "summary") {
    return (
      <div className="exam-tutorial-demo">
        <div className="exam-tutorial-demo-screen">
          <div className="exam-tutorial-demo-score">
            <strong>4 / 6</strong>
            <span>구절 정답</span>
          </div>
          <div className="exam-tutorial-demo-summary-item">
            <div className="exam-tutorial-demo-summary-head">
              <span>죽음 후 심판</span>
              <span>1/2</span>
            </div>
          </div>
          <div className="exam-tutorial-demo-summary-item">
            <div className="exam-tutorial-demo-summary-head">
              <span>부활</span>
              <span>3/4</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
