const start = new Date("2024-01-01T00:00:00");
const daysTarget = document.querySelector("#daysTogether");

if (daysTarget) {
  const diff = Date.now() - start.getTime();
  daysTarget.textContent = String(Math.max(0, Math.floor(diff / 86400000)));
}
