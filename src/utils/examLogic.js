const PUNCT_RE = /[,\-/:().]/g;

/** 시험 채점용: 공백·기본 문장부호 제거 */
export function normalizeExamAnswer(text) {
  return String(text ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(PUNCT_RE, "");
}

/** "(시 50:21)" → "시 50:21" */
export function formatReferenceDisplay(reference) {
  return String(reference ?? "")
    .trim()
    .replace(/^\(|\)$/g, "");
}

export function getExpectedFullText(verse) {
  return `${verse.reference} ${verse.verse}`;
}

function shuffleInPlace(array, random = Math.random) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** N과정 누적 + 선택 일차 구절 필터 */
export function filterVersesByCourseAndDays(
  originalScriptures,
  courseNum,
  selectedDays,
) {
  const daySet = new Set(selectedDays);
  const verses = [];

  originalScriptures.forEach((dayList, dayIndex) => {
    const dayNum = dayIndex + 1;
    if (!daySet.has(dayNum)) return;

    dayList.forEach((verse) => {
      if (verse.course <= courseNum) {
        verses.push(verse);
      }
    });
  });

  return verses;
}

/** topic 기준 병합 (reference 중복 제거) */
export function groupVersesByTopic(verses) {
  const map = new Map();

  verses.forEach((verse) => {
    const key = verse.topic || "주제 미지정";
    if (!map.has(key)) map.set(key, []);

    const list = map.get(key);
    if (!list.some((item) => item.reference === verse.reference)) {
      list.push(verse);
    }
  });

  return map;
}

export function getExamPreview(originalScriptures, courseNum, selectedDays) {
  const verses = filterVersesByCourseAndDays(
    originalScriptures,
    courseNum,
    selectedDays,
  );
  const topicMap = groupVersesByTopic(verses);

  let totalAnswerCount = 0;
  topicMap.forEach((topicVerses) => {
    totalAnswerCount +=
      topicVerses.length >= 2 ? topicVerses.length - 1 : topicVerses.length;
  });

  return {
    topicCount: topicMap.size,
    totalAnswerCount,
    verseCount: verses.length,
  };
}

/** 시험 문제 생성 — 주제 섞기·제외 구절은 시험 시작 시 1회 고정 */
export function buildExamQuestions(
  originalScriptures,
  courseNum,
  selectedDays,
  random = Math.random,
) {
  const verses = filterVersesByCourseAndDays(
    originalScriptures,
    courseNum,
    selectedDays,
  );
  const topicMap = groupVersesByTopic(verses);
  const questions = [];

  topicMap.forEach((topicVerses, topic) => {
    let excluded = null;
    let answerVerses = [...topicVerses];

    if (topicVerses.length >= 2) {
      const excludeIndex = Math.floor(random() * topicVerses.length);
      excluded = topicVerses[excludeIndex];
      answerVerses = topicVerses.filter((_, index) => index !== excludeIndex);
    }

    questions.push({
      topic,
      excludedReference: excluded?.reference ?? null,
      excludedDisplay: excluded
        ? formatReferenceDisplay(excluded.reference)
        : null,
      answerCount: answerVerses.length,
      expectedVerses: answerVerses.map((verse) => {
        const fullText = getExpectedFullText(verse);
        return {
          reference: verse.reference,
          verse: verse.verse,
          fullText,
          normalized: normalizeExamAnswer(fullText),
        };
      }),
    });
  });

  return shuffleInPlace(questions, random);
}

export function buildTopicPrompt(question) {
  const suffix = question.excludedDisplay
    ? `(${question.excludedDisplay} 제외)`
    : "";
  return `"${question.topic}" 소제목에 해당하는 말씀을 모두 적어주세요.${suffix}`;
}

function findExpectedVerse(expectedVerses, fullText) {
  return expectedVerses.find((verse) => verse.fullText === fullText) ?? null;
}

/** 오답 슬롯에 표시할 오류 유형과 설명 */
export function getWrongAnswerFeedback(
  input,
  expectedVerse,
  { alreadyMatchedNormalized = [] } = {},
) {
  if (!String(input ?? "").trim()) {
    return {
      errorLabel: "미작성",
      errorDetail: "이 구절을 작성하지 않았습니다.",
    };
  }

  const normInput = normalizeExamAnswer(input);

  if (alreadyMatchedNormalized.includes(normInput)) {
    return {
      errorLabel: "중복",
      errorDetail: "다른 칸에 이미 맞힌 구절입니다.",
    };
  }

  if (!expectedVerse) {
    return {
      errorLabel: "불일치",
      errorDetail: "정답 구절과 일치하지 않습니다.",
    };
  }

  const normRef = normalizeExamAnswer(expectedVerse.reference);
  const normVerse = normalizeExamAnswer(expectedVerse.verse);

  const hasRef = normRef.length > 0 && normInput.includes(normRef);
  const hasVerse = normVerse.length > 0 && normInput.includes(normVerse);

  if (hasRef && !hasVerse) {
    return {
      errorLabel: "본문 오류",
      errorDetail: "장절은 맞지만 본문이 틀리거나 빠졌습니다.",
    };
  }

  if (!hasRef && hasVerse) {
    return {
      errorLabel: "장절 오류",
      errorDetail: "본문은 포함했지만 장절이 틀리거나 빠졌습니다.",
    };
  }

  if (hasRef && hasVerse) {
    return {
      errorLabel: "형식 오류",
      errorDetail:
        "장절과 본문은 포함했지만 전체 내용이 정답과 다릅니다.",
    };
  }

  return {
    errorLabel: "불일치",
    errorDetail: "정답 구절과 일치하지 않습니다.",
  };
}

/** 입력칸 순서와 무관한 일대일 매칭 채점 */
export function gradeTopicAnswers(expectedVerses, userAnswers) {
  const pool = expectedVerses.map((verse) => ({ ...verse, matched: false }));

  const slotResults = userAnswers.map((input, slotIndex) => {
    const normalized = normalizeExamAnswer(input);

    if (!normalized) {
      return {
        slotIndex,
        correct: false,
        input,
        matchedReference: null,
        expectedFullText: null,
        errorLabel: null,
        errorDetail: null,
      };
    }

    const match = pool.find(
      (candidate) => !candidate.matched && candidate.normalized === normalized,
    );

    if (match) {
      match.matched = true;
      return {
        slotIndex,
        correct: true,
        input,
        matchedReference: match.reference,
        expectedFullText: match.fullText,
        errorLabel: null,
        errorDetail: null,
      };
    }

    return {
      slotIndex,
      correct: false,
      input,
      matchedReference: null,
      expectedFullText: null,
      errorLabel: null,
      errorDetail: null,
    };
  });

  const missedCandidates = pool.filter((candidate) => !candidate.matched);
  const wrongSlots = slotResults.filter((result) => !result.correct);
  const alreadyMatchedNormalized = slotResults
    .filter((result) => result.correct)
    .map((result) => normalizeExamAnswer(result.input));

  wrongSlots.forEach((slot, index) => {
    const missed = missedCandidates[index];
    const expectedFullText = missed?.fullText ?? null;
    slot.expectedFullText = expectedFullText;

    const feedback = getWrongAnswerFeedback(
      slot.input,
      missed ? findExpectedVerse(expectedVerses, expectedFullText) : null,
      { alreadyMatchedNormalized },
    );
    slot.errorLabel = feedback.errorLabel;
    slot.errorDetail = feedback.errorDetail;
  });

  const correctCount = slotResults.filter((result) => result.correct).length;
  const totalCount = expectedVerses.length;
  const missedExpected = missedCandidates.map((candidate) => candidate.fullText);

  return {
    slotResults,
    correctCount,
    totalCount,
    missedExpected,
    allCorrect: correctCount === totalCount,
  };
}
