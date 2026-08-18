const MAX_WRONG_REFS = 100;
const MAX_REF_LENGTH = 32;
const MIN_COURSE_NUM = 1;
const MAX_COURSE_NUM = 4;
const REF_PATTERN = /^\([^)]+\)$/;

function sanitizeRef(ref) {
  if (typeof ref !== "string") return null;
  const trimmed = ref.trim().slice(0, MAX_REF_LENGTH);
  if (!trimmed || !REF_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function sanitizeRefList(list, maxLen) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const ref = sanitizeRef(item);
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(ref);
    if (out.length >= maxLen) break;
  }
  return out;
}

function sanitizeCourseNum(value) {
  const n = Math.floor(Number(value));
  if (n < MIN_COURSE_NUM || n > MAX_COURSE_NUM) return null;
  return n;
}

export function parseCourseNum(courseName) {
  const match = /^(\d+)과정$/.exec(courseName ?? "");
  if (!match) return null;
  return sanitizeCourseNum(Number(match[1]));
}

/** originalScriptures에서 reference 목록으로 구절 객체 복원 */
export function findVersesByRefs(originalScriptures, refs) {
  const safeRefs = sanitizeRefList(refs, MAX_WRONG_REFS);
  if (!safeRefs.length || !originalScriptures?.length) return [];

  const refSet = new Set(safeRefs);
  const found = [];

  originalScriptures.forEach((dayList) => {
    dayList.forEach((verse) => {
      if (refSet.has(verse.reference)) {
        found.push({ ...verse });
      }
    });
  });

  return safeRefs
    .map((ref) => found.find((v) => v.reference === ref))
    .filter(Boolean);
}
