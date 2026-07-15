const REPOSITORY = "Zsissy/jiao-web";
const CONTENT_PATH = "docs/content.json";
const API_ROOT = `https://api.github.com/repos/${REPOSITORY}`;
const pendingFiles = new Map();
let model = null;

const contentFields = [
  ["导航 · 品牌名", "nav.brand"],
  ["导航 · Workspace", "nav.workspace"],
  ["导航 · Love Story", "nav.love"],
  ["导航 · Future", "nav.future"],
  ["导航 · Admin", "nav.admin"],
  ["首页小标题", "hero.kicker"],
  ["首页主标题", "hero.title"],
  ["身份 · Student", "identity.student"],
  ["身份 · Law", "identity.law"],
  ["身份 · Administration", "identity.admin"],
  ["身份 · Soulmate", "identity.soulmate"],
  ["Workspace 标签", "module.workspace.eyebrow"],
  ["Workspace 标题", "module.workspace.title"],
  ["Workspace 说明", "module.workspace.copy", "textarea"],
  ["Love Story 标签", "module.love.eyebrow"],
  ["Love Story 标题", "module.love.title"],
  ["Love Story 说明", "module.love.copy", "textarea"],
  ["Future 标签", "module.future.eyebrow"],
  ["Future 标题", "module.future.title"],
  ["Future 说明", "module.future.copy", "textarea"],
  ["Workspace 页面标题", "workspace.heading.title"],
  ["Workspace 页面副标题", "workspace.heading.subtitle"],
  ["Love Story 页面标题", "love.heading.title"],
  ["Love Story 页面副标题", "love.heading.subtitle"],
  ["纪念日标题", "love.anniversary.label"],
  ["纪念日起始词", "love.anniversary.from"],
  ["纪念日英文单位", "love.anniversary.unit"],
  ["时间线标题", "love.timeline.title"],
  ["分别日期起始词", "love.apart.from"],
  ["愿望清单标题", "love.wishes.title"],
  ["Future 页面标题", "future.heading.title"],
  ["Future 页面副标题", "future.heading.subtitle"],
  ["季度目标标题", "future.goals.title"],
  ["旅行计划标题", "future.travel.title"],
  ["页面底部标题", "admin.heading.title"],
  ["页面底部副标题", "admin.heading.subtitle"],
  ["页面底部说明", "admin.body", "textarea"],
];

const imageFields = [
  ["首页个人照片", "profile"],
  ["首页贴纸 · 工作", "stickerWorkStretch"],
  ["首页贴纸 · 阅读", "stickerReadingDog"],
  ["首页贴纸 · 休息", "stickerNapDog"],
  ["首页贴纸 · 成果箱", "stickerWorkBox"],
  ["Workspace 背景", "workspaceBackground"],
  ["Love Story 背景", "loveBackground"],
  ["Future Planning 背景", "futureBackground"],
  ["分别天数贴纸", "apartSticker"],
];

const repeaterSections = [
  {
    title: "Workspace 条目",
    path: ["workspaceItems"],
    empty: { category: "", date: "", title: "", body: "" },
    fields: [["分类", "category"], ["日期", "date"], ["标题", "title"], ["正文", "body", "textarea"]],
  },
  {
    title: "Love Story 照片",
    path: ["love", "photos"],
    empty: { src: "", caption: "" },
    fields: [["照片", "src", "image"], ["照片说明", "caption"]],
  },
  {
    title: "愿望清单",
    path: ["love", "wishes"],
    empty: { status: "想完成", title: "", body: "", image: "" },
    fields: [["状态", "status"], ["愿望", "title"], ["说明", "body", "textarea"], ["表情图片", "image", "image"]],
  },
  {
    title: "季度目标",
    path: ["quarterGoals"],
    empty: { quarter: "", status: "进行中", title: "", body: "", progress: 0 },
    fields: [["季度", "quarter"], ["状态", "status"], ["标题", "title"], ["说明", "body", "textarea"], ["进度（0-100）", "progress", "number"]],
  },
  {
    title: "旅行计划",
    path: ["travelPlans"],
    empty: { status: "计划中", time: "", destination: "", body: "" },
    fields: [["状态", "status"], ["时间", "time"], ["目的地", "destination"], ["说明", "body", "textarea"]],
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getValue(path) {
  return path.reduce((value, key) => value?.[key], model);
}

function setValue(path, value) {
  const parent = path.slice(0, -1).reduce((current, key) => current[key], model);
  parent[path.at(-1)] = value;
}

function pathKey(path) {
  return encodeURIComponent(JSON.stringify(path));
}

function parsePath(value) {
  return JSON.parse(decodeURIComponent(value));
}

function fieldMarkup(label, path, type = "text") {
  const value = getValue(path) ?? "";
  const wide = type === "textarea" || type === "image" ? " field-wide" : "";
  if (type === "textarea") {
    return `<label class="${wide}">${escapeHtml(label)}<textarea data-path="${pathKey(path)}">${escapeHtml(value)}</textarea></label>`;
  }
  if (type === "image") {
    return `<div class="image-field">
      <label>${escapeHtml(label)}<input data-path="${pathKey(path)}" value="${escapeHtml(value)}" /></label>
      <label>选择新图片<input type="file" accept="image/*" data-upload-path="${pathKey(path)}" /></label>
    </div>`;
  }
  return `<label class="${wide}">${escapeHtml(label)}<input type="${type === "number" ? "number" : "text"}" ${type === "number" ? 'min="0" max="100"' : ""} data-path="${pathKey(path)}" value="${escapeHtml(value)}" /></label>`;
}

function makeSection(title, markup) {
  const template = document.querySelector("#sectionTemplate");
  const section = template.content.firstElementChild.cloneNode(true);
  section.querySelector("h2").textContent = title;
  section.querySelector(".fields").innerHTML = markup;
  return section;
}

function bindInputs(root) {
  root.querySelectorAll("[data-path]").forEach((input) => {
    input.addEventListener("input", () => {
      const path = parsePath(input.dataset.path);
      setValue(path, input.type === "number" ? Number(input.value) : input.value);
    });
  });
  root.querySelectorAll("[data-upload-path]").forEach((input) => {
    input.addEventListener("change", () => {
      const path = parsePath(input.dataset.uploadPath);
      if (input.files?.[0]) pendingFiles.set(JSON.stringify(path), input.files[0]);
    });
  });
}

function renderEditor() {
  const editor = document.querySelector("#editor");
  editor.innerHTML = "";

  const textMarkup = contentFields.map(([label, key, type]) => fieldMarkup(label, ["content", key], type)).join("");
  editor.append(makeSection("全站文字", textMarkup));

  const imageMarkup = imageFields.map(([label, key]) => fieldMarkup(label, ["images", key], "image")).join("");
  editor.append(makeSection("照片、贴纸与背景", `${imageMarkup}<p class="hint">可粘贴图片地址，也可以直接选择本机图片。上传后的图片会保存在你的 GitHub 仓库中。</p>`));

  const loveMarkup = [
    fieldMarkup("纪念日起始日期", ["love", "anniversaryStart"]),
    fieldMarkup("分别起始日期", ["love", "apartStart"]),
    fieldMarkup("分别天数前文字", ["love", "apartPrefix"]),
    fieldMarkup("分别天数后文字", ["love", "apartSuffix"]),
    fieldMarkup("分别模块说明", ["love", "apartBody"], "textarea"),
  ].join("");
  editor.append(makeSection("纪念日与时间线", loveMarkup));

  repeaterSections.forEach((definition) => {
    const list = getValue(definition.path) || [];
    const cards = list.map((_, index) => {
      const fields = definition.fields.map(([label, key, type]) => fieldMarkup(label, [...definition.path, index, key], type)).join("");
      return `<div class="repeater-item" data-item="${index}"><h3>${escapeHtml(definition.title)} ${index + 1}</h3><button class="remove" type="button" data-remove="${index}">删除</button>${fields}</div>`;
    }).join("");
    const section = makeSection(definition.title, `<div class="repeater" data-repeater="${pathKey(definition.path)}">${cards}<button class="add-button" type="button">＋ 新增一项</button></div>`);
    const repeater = section.querySelector(".repeater");
    repeater.querySelector(".add-button").addEventListener("click", () => {
      getValue(definition.path).push(structuredClone(definition.empty));
      pendingFiles.clear();
      renderEditor();
    });
    repeater.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        getValue(definition.path).splice(Number(button.dataset.remove), 1);
        pendingFiles.clear();
        renderEditor();
      });
    });
    editor.append(section);
  });

  bindInputs(editor);
  editor.hidden = false;
}

function setStatus(message, type = "") {
  const status = document.querySelector("#status");
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

function githubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function githubRequest(path, options = {}) {
  const token = document.querySelector("#tokenInput").value.trim();
  if (!token) throw new Error("请先填写 GitHub 管理密钥。");
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: { ...githubHeaders(token), ...(options.headers || {}) },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("管理密钥无效，请重新创建或检查是否完整粘贴。");
    if (response.status === 403) throw new Error("管理密钥没有写入权限，请将 jiao-web 仓库的 Contents 权限设为 Read and write。");
    throw new Error(`GitHub 保存失败（${response.status}）。`);
  }
  return response.json();
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function uploadImage(path, file) {
  const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const repositoryPath = `docs/uploads/${filename}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await githubRequest(`/contents/${repositoryPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Upload website image ${filename}`,
      content: bytesToBase64(bytes),
      branch: "main",
    }),
  });
  setValue(path, `./uploads/${filename}`);
}

async function saveAll() {
  const button = document.querySelector("#saveButton");
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "正在保存…";
  setStatus("正在检查管理密钥…");
  try {
    const token = document.querySelector("#tokenInput").value.trim();
    if (!token) throw new Error("请先填写 GitHub 管理密钥。");
    sessionStorage.setItem("jiaoGithubToken", token);
    setStatus("正在验证权限并上传图片…");
    await githubRequest("");

    for (const [key, file] of pendingFiles) {
      await uploadImage(JSON.parse(key), file);
    }

    setStatus("正在保存文字和列表内容…");
    const current = await githubRequest(`/contents/${CONTENT_PATH}?ref=main`);
    const bytes = new TextEncoder().encode(`${JSON.stringify(model, null, 2)}\n`);
    await githubRequest(`/contents/${CONTENT_PATH}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update website content from online admin",
        content: bytesToBase64(bytes),
        sha: current.sha,
        branch: "main",
      }),
    });

    pendingFiles.clear();
    setStatus("保存成功。GitHub Pages 通常会在 1–2 分钟内更新，网址保持不变。", "success");
    button.textContent = "保存成功";
    renderEditor();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "保存失败，请稍后重试。", "error");
    button.textContent = "保存失败";
  } finally {
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = originalLabel;
    }, 1200);
  }
}

async function start() {
  const savedToken = sessionStorage.getItem("jiaoGithubToken");
  if (savedToken) document.querySelector("#tokenInput").value = savedToken;
  document.querySelector("#saveButton").addEventListener("click", saveAll);
  try {
    const response = await fetch(`./content.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("无法读取网站内容。");
    model = await response.json();
    renderEditor();
    setStatus("内容已读取。修改后点击右上角“保存全部修改”。");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "无法读取网站内容。", "error");
  }
}

start();
