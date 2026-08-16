export const ADMIN_MEMBER_SORT_OPTIONS = [
  { id: "name", label: "이름순" },
  { id: "church", label: "교회별" },
  { id: "joined", label: "가입일순" },
  { id: "lastActive", label: "최근 이용순" },
];

function compareName(a, b) {
  return (a.name || a.userid || "").localeCompare(
    b.name || b.userid || "",
    "ko",
  );
}

export function formatLastActiveAt(value) {
  if (!value) return "이용 기록 없음";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "이용 기록 없음";

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function sortAdminMembers(members, sortBy) {
  const list = [...members];

  switch (sortBy) {
    case "church":
      return list.sort((a, b) => {
        const churchCmp = (a.church || "—").localeCompare(
          b.church || "—",
          "ko",
        );
        if (churchCmp !== 0) return churchCmp;
        return compareName(a, b);
      });
    case "joined":
      return list.sort((a, b) => {
        const aTime = Date.parse(a.joinedAt || "") || 0;
        const bTime = Date.parse(b.joinedAt || "") || 0;
        if (aTime !== bTime) return aTime - bTime;
        return compareName(a, b);
      });
    case "lastActive":
      return list.sort((a, b) => {
        const aTime = Date.parse(a.lastActiveAt || "") || 0;
        const bTime = Date.parse(b.lastActiveAt || "") || 0;
        if (aTime !== bTime) return bTime - aTime;
        return compareName(a, b);
      });
    case "name":
    default:
      return list.sort((a, b) => {
        const nameCmp = compareName(a, b);
        if (nameCmp !== 0) return nameCmp;
        return (a.userid || "").localeCompare(b.userid || "", "ko");
      });
  }
}
