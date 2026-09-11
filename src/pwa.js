/** 배포된 새 버전이 있으면 페이지를 한 번 새로고침합니다. */

export function registerPwa() {
  if (!import.meta.env.PROD) return;
  if (!("serviceWorker" in navigator)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };

  if (hadController) {
    navigator.serviceWorker.addEventListener("controllerchange", reload);
  }

  navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: "none",
    })
    .then((reg) => {
      const check = () => {
        reg.update().catch(() => {});
      };

      check();
      window.setInterval(check, 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.addEventListener("focus", check);
    })
    .catch(() => {});
}
