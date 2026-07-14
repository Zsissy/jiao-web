import { env } from "cloudflare:workers";
import type {
  LoveEvent,
  LoveWish,
  Photo,
  QuarterGoal,
  SiteData,
  SiteSettings,
  TravelPlan,
  WorkspaceItem,
} from "./types";

type Row = Record<string, unknown>;

const defaultSettings: SiteSettings = {
  heroTitle: "Jiao's Living Archive",
  heroSubtitle: "学习、相爱、计划未来。把重要的日子和想成为的自己都认真保存。",
  homeBackground: "",
  workspaceBackground: "",
  loveBackground: "",
  futureBackground: "",
  anniversaryStart: "2024-01-01",
  anniversaryLabel: "我们的纪念日",
};

const defaultWorkspace = [
  ["学习笔记", "阅读与课程索引", "把最近的阅读、课程、论文和灵感按月份整理，沉淀成可以反复回看的知识地图。", "2026-07", 1, 10],
  ["工作计划", "本周重点", "优先完成最重要的三件事：整理项目节奏、复盘输出、准备下一阶段材料。", "2026-W29", 0, 20],
  ["月度展望", "七月展望", "保持稳定输入，也给生活留出漂亮的空白。这个月的关键词是节奏、表达、远方。", "2026-07", 0, 30],
  ["成果备份", "阶段成果库", "把交付物、作品截图、重要记录和复盘结论归档，形成可追踪的成长证据。", "2026", 0, 40],
];

const defaultLoveEvents = [
  ["第一次认真计划未来", "从散步聊天开始，把旅行、学习和生活一点点写进同一本计划里。", "2024-01-01", 10],
  ["值得纪念的小日子", "不用等到盛大的节日，普通的一天也可以因为被记住而发光。", "2024-05-20", 20],
  ["一起去看世界", "愿照片墙越来越满，愿每一次出发都有新的故事。", "2025-10-01", 30],
];

const defaultWishes = [
  ["一起看一场海边日落", "带相机，也带一件薄外套。", 0, 10],
  ["做一本年度相册", "把照片、票根和一句话日记排成一本小书。", 0, 20],
  ["完成一次没有赶路的旅行", "每天只安排一个目的地，其余时间留给随机。", 0, 30],
];

const defaultGoals = [
  ["2026 Q3", "建立稳定输出节奏", "每周整理一次学习笔记，每月做一次成果复盘。", 35, "进行中", 10],
  ["2026 Q3", "升级个人作品集", "把重要作品归档到网站，让朋友也能看到阶段成果。", 20, "进行中", 20],
  ["2026 Q4", "规划年末旅行", "确定目的地、预算、时间和想拍的照片主题。", 10, "计划中", 30],
];

const defaultTrips = [
  ["京都", "秋天", "枫叶、老街、胶片感照片和慢慢走的下午。", "想去", "", 10],
  ["海边城市", "一个长周末", "看日落，写一页旅行笔记，给照片墙添一组蓝色。", "计划中", "", 20],
];

function getD1() {
  if (!env.DB) {
    throw new Error("缺少数据库绑定 DB。");
  }
  return env.DB;
}

async function ensureDatabase() {
  const db = getD1();
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS workspace_items (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', item_date TEXT NOT NULL DEFAULT '', image_url TEXT NOT NULL DEFAULT '', pinned INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, title TEXT NOT NULL DEFAULT '', caption TEXT NOT NULL DEFAULT '', url TEXT NOT NULL, object_key TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS love_events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', event_date TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS love_wishes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', completed INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS quarter_goals (id INTEGER PRIMARY KEY AUTOINCREMENT, quarter TEXT NOT NULL, title TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', progress INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT '进行中', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
    db.prepare("CREATE TABLE IF NOT EXISTS travel_plans (id INTEGER PRIMARY KEY AUTOINCREMENT, destination TEXT NOT NULL, time_range TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '计划中', image_url TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)"),
  ]);

  const existing = await db.prepare("SELECT COUNT(*) AS count FROM site_settings").first<{ count: number }>();
  if ((existing?.count ?? 0) > 0) return;

  const settingsStatements = Object.entries(defaultSettings).map(([key, value]) =>
    db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)").bind(key, value)
  );
  const workspaceStatements = defaultWorkspace.map((item) =>
    db.prepare("INSERT INTO workspace_items (category, title, body, item_date, pinned, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(...item)
  );
  const loveEventStatements = defaultLoveEvents.map((item) =>
    db.prepare("INSERT INTO love_events (title, body, event_date, sort_order) VALUES (?, ?, ?, ?)").bind(...item)
  );
  const wishStatements = defaultWishes.map((item) =>
    db.prepare("INSERT INTO love_wishes (title, note, completed, sort_order) VALUES (?, ?, ?, ?)").bind(...item)
  );
  const goalStatements = defaultGoals.map((item) =>
    db.prepare("INSERT INTO quarter_goals (quarter, title, note, progress, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(...item)
  );
  const tripStatements = defaultTrips.map((item) =>
    db.prepare("INSERT INTO travel_plans (destination, time_range, note, status, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(...item)
  );

  await db.batch([
    ...settingsStatements,
    ...workspaceStatements,
    ...loveEventStatements,
    ...wishStatements,
    ...goalStatements,
    ...tripStatements,
  ]);
}

function text(row: Row, key: string) {
  return String(row[key] ?? "");
}

function num(row: Row, key: string) {
  return Number(row[key] ?? 0);
}

export async function getSiteData(): Promise<SiteData> {
  await ensureDatabase();
  const db = getD1();
  const [settingsRows, workspaceRows, photoRows, eventRows, wishRows, goalRows, tripRows] =
    await Promise.all([
      db.prepare("SELECT key, value FROM site_settings").all<Row>(),
      db.prepare("SELECT * FROM workspace_items ORDER BY pinned DESC, sort_order ASC, id DESC").all<Row>(),
      db.prepare("SELECT * FROM photos ORDER BY sort_order ASC, id DESC").all<Row>(),
      db.prepare("SELECT * FROM love_events ORDER BY sort_order ASC, event_date ASC, id ASC").all<Row>(),
      db.prepare("SELECT * FROM love_wishes ORDER BY completed ASC, sort_order ASC, id ASC").all<Row>(),
      db.prepare("SELECT * FROM quarter_goals ORDER BY quarter ASC, sort_order ASC, id ASC").all<Row>(),
      db.prepare("SELECT * FROM travel_plans ORDER BY sort_order ASC, id ASC").all<Row>(),
    ]);

  const settings = { ...defaultSettings };
  for (const row of settingsRows.results ?? []) {
    const key = text(row, "key") as keyof SiteSettings;
    if (key in settings) settings[key] = text(row, "value");
  }

  return {
    settings,
    workspaceItems: (workspaceRows.results ?? []).map((row): WorkspaceItem => ({
      id: num(row, "id"),
      category: text(row, "category"),
      title: text(row, "title"),
      body: text(row, "body"),
      itemDate: text(row, "item_date"),
      imageUrl: text(row, "image_url"),
      pinned: Boolean(num(row, "pinned")),
      sortOrder: num(row, "sort_order"),
    })),
    photos: (photoRows.results ?? []).map((row): Photo => ({
      id: num(row, "id"),
      scope: text(row, "scope"),
      title: text(row, "title"),
      caption: text(row, "caption"),
      url: text(row, "url"),
      objectKey: text(row, "object_key"),
      sortOrder: num(row, "sort_order"),
    })),
    loveEvents: (eventRows.results ?? []).map((row): LoveEvent => ({
      id: num(row, "id"),
      title: text(row, "title"),
      body: text(row, "body"),
      eventDate: text(row, "event_date"),
      sortOrder: num(row, "sort_order"),
    })),
    loveWishes: (wishRows.results ?? []).map((row): LoveWish => ({
      id: num(row, "id"),
      title: text(row, "title"),
      note: text(row, "note"),
      completed: Boolean(num(row, "completed")),
      sortOrder: num(row, "sort_order"),
    })),
    quarterGoals: (goalRows.results ?? []).map((row): QuarterGoal => ({
      id: num(row, "id"),
      quarter: text(row, "quarter"),
      title: text(row, "title"),
      note: text(row, "note"),
      progress: Math.min(100, Math.max(0, num(row, "progress"))),
      status: text(row, "status"),
      sortOrder: num(row, "sort_order"),
    })),
    travelPlans: (tripRows.results ?? []).map((row): TravelPlan => ({
      id: num(row, "id"),
      destination: text(row, "destination"),
      timeRange: text(row, "time_range"),
      note: text(row, "note"),
      status: text(row, "status"),
      imageUrl: text(row, "image_url"),
      sortOrder: num(row, "sort_order"),
    })),
  };
}

export async function saveSettings(settings: SiteSettings) {
  await ensureDatabase();
  const db = getD1();
  await db.batch(
    Object.entries(settings).map(([key, value]) =>
      db.prepare("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP").bind(key, value)
    )
  );
}

export async function saveCollection(collection: keyof Omit<SiteData, "settings">, items: unknown[]) {
  await ensureDatabase();
  const db = getD1();
  if (collection === "workspaceItems") {
    await db.prepare("DELETE FROM workspace_items").run();
    if (!items.length) return;
    await db.batch((items as WorkspaceItem[]).map((item, index) =>
      db.prepare("INSERT INTO workspace_items (category, title, body, item_date, image_url, pinned, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(item.category, item.title, item.body, item.itemDate, item.imageUrl, item.pinned ? 1 : 0, item.sortOrder || index * 10)
    ));
  }
  if (collection === "photos") {
    await db.prepare("DELETE FROM photos").run();
    if (!items.length) return;
    await db.batch((items as Photo[]).map((item, index) =>
      db.prepare("INSERT INTO photos (scope, title, caption, url, object_key, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(item.scope, item.title, item.caption, item.url, item.objectKey, item.sortOrder || index * 10)
    ));
  }
  if (collection === "loveEvents") {
    await db.prepare("DELETE FROM love_events").run();
    if (!items.length) return;
    await db.batch((items as LoveEvent[]).map((item, index) =>
      db.prepare("INSERT INTO love_events (title, body, event_date, sort_order) VALUES (?, ?, ?, ?)").bind(item.title, item.body, item.eventDate, item.sortOrder || index * 10)
    ));
  }
  if (collection === "loveWishes") {
    await db.prepare("DELETE FROM love_wishes").run();
    if (!items.length) return;
    await db.batch((items as LoveWish[]).map((item, index) =>
      db.prepare("INSERT INTO love_wishes (title, note, completed, sort_order) VALUES (?, ?, ?, ?)").bind(item.title, item.note, item.completed ? 1 : 0, item.sortOrder || index * 10)
    ));
  }
  if (collection === "quarterGoals") {
    await db.prepare("DELETE FROM quarter_goals").run();
    if (!items.length) return;
    await db.batch((items as QuarterGoal[]).map((item, index) =>
      db.prepare("INSERT INTO quarter_goals (quarter, title, note, progress, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(item.quarter, item.title, item.note, item.progress, item.status, item.sortOrder || index * 10)
    ));
  }
  if (collection === "travelPlans") {
    await db.prepare("DELETE FROM travel_plans").run();
    if (!items.length) return;
    await db.batch((items as TravelPlan[]).map((item, index) =>
      db.prepare("INSERT INTO travel_plans (destination, time_range, note, status, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)").bind(item.destination, item.timeRange, item.note, item.status, item.imageUrl, item.sortOrder || index * 10)
    ));
  }
}
