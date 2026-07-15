const DAY = 86400000;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function daysSince(date) {
  const start = new Date(`${date}T00:00:00`);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / DAY));
}

function renderScrapbook(photos) {
  const target = document.querySelector("#loveScrapbook");
  if (!target || !Array.isArray(photos)) return;
  const items = Array.from({ length: 8 }, (_, index) => photos[index] ?? {});
  const photo = (item, index) => `
    <figure class="polaroid p${index + 1}">
      ${item.src ? `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption || "love story photo")}" />` : ""}
      <figcaption>${escapeHtml(item.caption)}</figcaption>
    </figure>`;
  target.innerHTML = `
    <div class="book-page left-page">${items.slice(0, 4).map(photo).join("")}</div>
    <div class="book-spine" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="book-page right-page">${items.slice(4).map((item, index) => photo(item, index + 4)).join("")}</div>`;
}

function renderContent(data) {
  document.querySelectorAll("[data-content]").forEach((node) => {
    const value = data.content?.[node.dataset.content];
    if (typeof value === "string") node.textContent = value;
  });
  document.querySelectorAll("[data-image]").forEach((node) => {
    const key = node.dataset.image?.replace("images.", "");
    const value = data.images?.[key];
    if (value) node.src = value;
  });

  const workspace = document.querySelector("#workspaceItems");
  if (workspace && Array.isArray(data.workspaceItems)) {
    workspace.innerHTML = data.workspaceItems.map((item) => `
      <article>
        <span>${escapeHtml(item.category)} · ${escapeHtml(item.date)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.body)}</p>
      </article>`).join("");
  }

  const anniversary = data.love?.anniversaryStart || "2022-12-24";
  const apartStart = data.love?.apartStart || "2026-06-21";
  const anniversaryFrom = document.querySelector("#anniversaryFrom");
  if (anniversaryFrom) anniversaryFrom.textContent = `${data.content?.["love.anniversary.from"] || "from"} ${anniversary}`;
  const daysTogether = document.querySelector("#daysTogether");
  if (daysTogether) daysTogether.textContent = String(daysSince(anniversary));
  const daysApart = document.querySelector("#daysApart");
  if (daysApart) daysApart.textContent = String(daysSince(apartStart));

  renderScrapbook(data.love?.photos);

  const timeline = document.querySelector("#loveTimeline");
  if (timeline) {
    const title = escapeHtml(data.content?.["love.timeline.title"] || "时间线");
    timeline.innerHTML = `<h2>${title}</h2><article>
      <span>${escapeHtml(data.content?.["love.apart.from"] || "from")} ${escapeHtml(apartStart)}</span>
      <h3>${escapeHtml(data.love?.apartPrefix)} <b>${daysSince(apartStart)}</b> ${escapeHtml(data.love?.apartSuffix)}</h3>
      ${data.images?.apartSticker ? `<img class="apart-sticker" src="${escapeHtml(data.images.apartSticker)}" alt="love sticker" />` : ""}
      <p>${escapeHtml(data.love?.apartBody)}</p>
    </article>`;
  }

  const wishes = document.querySelector("#loveWishes");
  if (wishes && Array.isArray(data.love?.wishes)) {
    wishes.innerHTML = `<h2>${escapeHtml(data.content?.["love.wishes.title"] || "愿望清单")}</h2>${data.love.wishes.map((item) => `
      <article>
        <span>${escapeHtml(item.status)}</span>
        <h3 class="wish-heading">${escapeHtml(item.title)} ${item.image ? `<img src="${escapeHtml(item.image)}" alt="wish sticker" />` : ""}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>`).join("")}`;
  }

  const goals = document.querySelector("#quarterGoals");
  if (goals && Array.isArray(data.quarterGoals)) {
    goals.innerHTML = `<h2>${escapeHtml(data.content?.["future.goals.title"] || "季度目标")}</h2>${data.quarterGoals.map((item) => `
      <article>
        <span>${escapeHtml(item.quarter)} · ${escapeHtml(item.status)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
        <div class="progress"><i style="width:${Math.min(100, Math.max(0, Number(item.progress) || 0))}%"></i></div>
      </article>`).join("")}`;
  }

  const trips = document.querySelector("#travelPlans");
  if (trips && Array.isArray(data.travelPlans)) {
    trips.innerHTML = `<h2>${escapeHtml(data.content?.["future.travel.title"] || "旅行计划")}</h2>${data.travelPlans.map((item) => `
      <article>
        <span>${escapeHtml(item.status)} · ${escapeHtml(item.time)}</span>
        <h3>${escapeHtml(item.destination)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </article>`).join("")}`;
  }

  const backgrounds = [
    [".workspace-scene", data.images?.workspaceBackground],
    [".love-notes", data.images?.loveBackground],
    [".future-scene", data.images?.futureBackground],
  ];
  backgrounds.forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node && value) node.style.backgroundImage = `url("${String(value).replaceAll('"', "%22")}")`;
  });
}

async function loadContent() {
  try {
    const response = await fetch(`./content.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("content unavailable");
    renderContent(await response.json());
  } catch (error) {
    console.warn("Using the page's built-in content.", error);
    const daysTogether = document.querySelector("#daysTogether");
    const daysApart = document.querySelector("#daysApart");
    if (daysTogether) daysTogether.textContent = String(daysSince("2022-12-24"));
    if (daysApart) daysApart.textContent = String(daysSince("2026-06-21"));
  }
}

loadContent();
