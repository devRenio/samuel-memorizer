import { useEffect, useState } from "react";
import { buildBlankHint } from "../utils/blankHint";
import { PHRASE_BLANK } from "../utils/problemText";

/**
 * 문제 텍스트 렌더링.
 * - `{{S:..}}` 정답(초록), `{{F:..}}` 오답(빨강)
 * - 활성 빈칸(빈칸 병합 ON이면 첫 `…`, OFF면 첫 `_+`) 하나만 깜빡임
 * - hover(데스크톱) / tap(모바일): 활성 빈칸 위 미니 힌트 팝업
 */
const ProblemRenderer = ({
  text,
  isError,
  activeBlankDisplay,
  currentAnswer,
  isMobile = false,
}) => {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintHover, setHintHover] = useState(false);

  useEffect(() => {
    setHintOpen(false);
    setHintHover(false);
  }, [text, currentAnswer]);

  if (!text) return null;

  const hintText = buildBlankHint(currentAnswer);
  const showHint = Boolean(hintText) && (isMobile ? hintOpen : hintHover);
  const usePhrase = activeBlankDisplay === PHRASE_BLANK;

  const parts = text.split(/(\{\{[SF]:.*?\}\})/g);
  let highlighted = false;

  const activeClass = isError
    ? usePhrase
      ? "text-error-flash phrase-blank"
      : "text-error-flash"
    : usePhrase
      ? "active-blank phrase-blank"
      : "active-blank";

  const handleHintOpen = () => {
    if (!hintText || isMobile) return;
    setHintHover(true);
  };

  const handleHintClose = () => {
    if (isMobile) return;
    setHintHover(false);
  };

  const handleHintToggle = (event) => {
    if (!isMobile || !hintText) return;
    event.preventDefault();
    event.stopPropagation();
    setHintOpen((open) => !open);
  };

  const renderActiveBlank = (blankText, key) => {
    const blankEl = (
      <span className={activeClass}>{blankText}</span>
    );

    if (!hintText) {
      return <span key={key}>{blankEl}</span>;
    }

    return (
      <span
        key={key}
        className="blank-hint-anchor blank-hint-target"
        onMouseEnter={handleHintOpen}
        onMouseLeave={handleHintClose}
        onClick={handleHintToggle}
        role={isMobile ? "button" : undefined}
        tabIndex={isMobile ? 0 : undefined}
        aria-expanded={showHint}
        aria-label={showHint ? "초성 힌트 숨기기" : "초성 힌트 보기"}
        onKeyDown={(event) => {
          if (!isMobile) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setHintOpen((open) => !open);
          }
        }}
      >
        {blankEl}
        <span
          className={["blank-hint-popup", showHint ? "is-visible" : ""]
            .filter(Boolean)
            .join(" ")}
          role="tooltip"
        >
          {hintText}
        </span>
      </span>
    );
  };

  const renderPlainPart = (part, key) => {
    if (highlighted) return part;

    let idx = -1;
    let len = 0;

    if (usePhrase) {
      idx = part.indexOf(PHRASE_BLANK);
      len = PHRASE_BLANK.length;
    } else {
      const m = part.match(/_+/);
      if (m) {
        idx = m.index;
        len = m[0].length;
      }
    }

    if (idx === -1) return part;

    highlighted = true;
    const blankText = part.slice(idx, idx + len);

    return (
      <span key={key}>
        {part.slice(0, idx)}
        {renderActiveBlank(blankText, `${key}-blank`)}
        {part.slice(idx + len)}
      </span>
    );
  };

  return (
    <>
      {parts.map((part, index) => {
        const key = `${index}-${part}`;

        if (part.startsWith("{{S:")) {
          return (
            <span key={key} className="text-success">
              {part.replace(/\{\{S:(.*)\}\}/, "$1")}
            </span>
          );
        }
        if (part.startsWith("{{F:")) {
          return (
            <span key={key} className="text-fail">
              {part.replace(/\{\{F:(.*)\}\}/, "$1")}
            </span>
          );
        }

        return renderPlainPart(part, key);
      })}
    </>
  );
};

export default ProblemRenderer;
