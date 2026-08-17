export const EXAM_TUTORIAL_STEPS = [
  {
    id: "welcome",
    type: "center",
    title: "시험 모드 안내",
    description:
      "실제 시험처럼 **주제별로 구절**을 작성하는 모드입니다.\n화면 아무 곳이나 클릭하면 다음으로 넘어갑니다.",
  },
  {
    id: "course",
    target: "exam-tour-course",
    title: "과정 선택",
    description: "시험에 포함할 **과정**을 선택합니다.",
    placement: "bottom",
  },
  {
    id: "days",
    target: "exam-tour-days",
    title: "일차 선택",
    description:
      "시험볼 **일차**를 체크박스로 선택합니다.\n**여러 일차**를 함께 선택할 수 있습니다.",
    placement: "bottom",
  },
  {
    id: "preview",
    target: "exam-tour-preview",
    title: "출제 미리보기",
    description:
      "선택한 범위의 **주제 수**와 **작성할 구절 수**를 확인한 뒤 **시험 시작**을 누릅니다.",
    placement: "top",
  },
  {
    id: "demo-question",
    type: "demo",
    demoId: "question",
    title: "주제별 문제",
    description:
      "한 주제씩 출제됩니다. **제외 장절**과 **작성할 구절 개수**만 표시되며, 힌트 없이 빈칸에 **장절과 본문**을 모두 작성합니다.",
  },
  {
    id: "demo-grading",
    type: "demo",
    demoId: "grading",
    title: "제출 후 채점",
    description:
      "주제별로 제출하면 **즉시 채점**됩니다.\n틀린 구절에는 **오류 유형**과 **정답**이 표시됩니다.",
  },
  {
    id: "demo-summary",
    type: "demo",
    demoId: "summary",
    title: "시험 결과",
    description:
      "모든 주제를 마치면 **전체 점수**와 주제별 결과를 확인하고, **재시험** 또는 **설정으로** 돌아갈 수 있습니다.",
  },
  {
    id: "finish",
    type: "center",
    title: "준비 완료!",
    description:
      "이제 과정과 일차를 고른 뒤 시험을 시작해 보세요.\n설정 화면 **우측 상단 ?** 버튼으로 이 안내를 다시 볼 수 있습니다.",
  },
];
