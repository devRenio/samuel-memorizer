export default function Navbar({
  navRef,
  activeMenu,
  toggleMenu,
  dayProgressLabels,
  onSelectCourse,
  onSelectDay,
  onRequestReset,
  onOpenFont,
  onOpenStats,
  onOpenAccount,
  onOpenInfo,
  onToggleTheme,
  onToggleFullscreen,
  theme,
}) {
  const courseOpen = activeMenu === "course";
  const dayOpen = activeMenu === "day";

  return (
    <nav className="navbar" ref={navRef}>
      <div className="menu-groups" data-tour="course-day">
        <div className={`menu-group${courseOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="menu-trigger"
            aria-haspopup="listbox"
            aria-expanded={courseOpen}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu("course");
            }}
          >
            과정 ▾
          </button>
          <div className="dropdown-content" role="listbox">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                role="option"
                onClick={() => {
                  onSelectCourse(n);
                  toggleMenu(null);
                }}
              >
                {n}과정
              </button>
            ))}
          </div>
        </div>

        <div className={`menu-group${dayOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="menu-trigger"
            aria-haspopup="listbox"
            aria-expanded={dayOpen}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu("day");
            }}
          >
            일차 ▾
          </button>
          <div className="dropdown-content" role="listbox">
            {dayProgressLabels.map((label, i) => (
              <button
                key={i}
                type="button"
                role="option"
                onClick={() => {
                  onSelectDay(i + 1);
                  toggleMenu(null);
                }}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              role="option"
              onClick={() => {
                onSelectDay(7);
                toggleMenu(null);
              }}
            >
              전체
            </button>
            <hr />
            <button
              type="button"
              onClick={() => {
                onRequestReset();
                toggleMenu(null);
              }}
              style={{ color: "#ff6b6b" }}
            >
              초기화
            </button>
          </div>
        </div>

        <div className="menu-group">
          <button
            className="menu-trigger"
            data-tour="font-btn"
            onClick={onOpenFont}
          >
            글꼴
          </button>
        </div>
      </div>

      <div className="nav-actions">
        <button
          onClick={onToggleFullscreen}
          className="theme-toggle hide-mobile"
          data-tour="fullscreen-btn"
        >
          ⛶ 전체화면
        </button>
        <button
          onClick={onToggleTheme}
          className="theme-toggle"
          data-tour="theme-btn"
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <button
          className="theme-toggle"
          data-tour="stats-btn"
          onClick={onOpenStats}
        >
          통계
        </button>
        <button
          className="theme-toggle"
          data-tour="account-btn"
          onClick={onOpenAccount}
        >
          계정
        </button>
        <button
          className="theme-toggle"
          data-tour="info-btn"
          onClick={onOpenInfo}
        >
          정보
        </button>
      </div>
    </nav>
  );
}
