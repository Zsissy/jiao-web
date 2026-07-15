const start = new Date("2022-12-24T00:00:00");
const daysTarget = document.querySelector("#daysTogether");
const apartStart = new Date("2026-06-21T00:00:00");
const apartDaysTarget = document.querySelector("#daysApart");

if (daysTarget) {
  const diff = Date.now() - start.getTime();
  daysTarget.textContent = String(Math.max(0, Math.floor(diff / 86400000)));
}

if (apartDaysTarget) {
  const diff = Date.now() - apartStart.getTime();
  apartDaysTarget.textContent = String(Math.max(0, Math.floor(diff / 86400000)));
}
