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
import { getRuntimeEnv } from "./runtime-env";

type Row = Record<string, unknown>;
export type CollectionName = keyof Omit<SiteData, "settings" | "contentBlocks">;

const asset = (path: string) => `/assets/${path}`;

export const defaultSettings: SiteSettings = {
  homeBackground: "",
  profileImage: asset("profile.jpg"),
  workspaceBackground: asset("section-bg/workspace-bg-sketch.jpg"),
  loveBackground: asset("section-bg/love-notes-bg-sketch.jpg"),
  futureBackground: asset("section-bg/future-bg-sketch.jpg"),
  anniversaryStart: "2022-12-24",
  anniversaryLabel: "我们的纪念日",
  apartStart: "2026-06-21",
  apartSticker: asset("wishes/love-apart.png"),
  stickerWorkStretch: asset("stickers/sticker-work-stretch.png"),
  stickerReadingDog: asset("stickers/sticker-reading-dog.png"),
  stickerNapDog: asset("stickers/sticker-nap-dog.png"),
  stickerWorkBox: asset("stickers/sticker-work-box.png"),
};

export const defaultContentBlocks: Record<string, string> = {
  "nav.brand": "Jiao Archive",
  "nav.workspace": "workspace",
  "nav.love": "love story",
  "nav.future": "future",
  "nav.admin": "admin",
  "hero.kicker": "PERSONAL WEBSITE",
  "hero.title": "Jiao's Living Archive",
  "identity.student": "student",
  "identity.law": "law exploring",
  "identity.admin": "administration management",
  "identity.soulmate": "soulmate with june",
  "module.workspace.eyebrow": "学习 / 工作 / 成果",
  "module.workspace.title": "workspace",
  "module.workspace.copy": "学习笔记、工作计划、月度展望和成果备份，像一本持续生长的个人档案。",
  "module.love.eyebrow": "照片 / 纪念日 / 心愿",
  "module.love.title": "love story",
  "module.love.copy": "照片墙、纪念日、重要时刻和想一起完成的小愿望。",
  "module.future.eyebrow": "季度目标 / 旅行计划",
  "module.future.title": "future planning",
  "module.future.copy": "把想抵达的地方和想成为的人，拆成清晰、可回看的计划。",
  "workspace.heading.title": "workspace",
  "workspace.heading.subtitle": "学习笔记 · 工作计划 · 月度展望 · 成果备份",
  "love.heading.title": "love story",
  "love.heading.subtitle": "照片墙 · 纪念日 · 时间线 · 愿望清单",
  "love.anniversary.from": "from",
  "love.anniversary.unit": "days together",
  "love.timeline.title": "时间线",
  "love.apart.from": "from",
  "love.apart.prefix": "和宝宝分别已经",
  "love.apart.suffix": "天",
  "love.apart.body": "把想念认真存起来，等见面的时候一点点还给彼此。",
  "love.wishes.title": "愿望清单",
  "love.wishes.status": "想完成",
  "future.heading.title": "future planning",
  "future.heading.subtitle": "季度目标 · 旅行计划",
  "future.goals.title": "季度目标",
  "future.travel.title": "旅行计划",
  "admin.heading.title": "editable admin",
  "admin.heading.subtitle": "动态版说明",
  "admin.body":
    "这是可编辑动态版。进入 /admin 输入管理密码后，可以维护页面文字、照片、背景图和列表内容；朋友访问公开网址无需登录。",
};

export const fallbackData: SiteData = {
  settings: defaultSettings,
  contentBlocks: defaultContentBlocks,
  workspaceItems: [
    {
      id: 1,
      category: "学习笔记",
      title: "阅读与课程索引",
      body: "把最近的阅读、课程、论文和灵感按月份整理，沉淀成可以反复回看的知识地图。",
      itemDate: "2026-07",
      imageUrl: "",
      pinned: true,
      sortOrder: 10,
    },
    {
      id: 2,
      category: "工作计划",
      title: "本周重点",
      body: "优先完成最重要的三件事：整理项目节奏、复盘输出、准备下一阶段材料。",
      itemDate: "2026-W29",
      imageUrl: "",
      pinned: false,
      sortOrder: 20,
    },
    {
      id: 3,
      category: "月度展望",
      title: "七月展望",
      body: "保持稳定输入，也给生活留出漂亮的空白。这个月的关键词是节奏、表达、远方。",
      itemDate: "2026-07",
      imageUrl: "",
      pinned: false,
      sortOrder: 30,
    },
    {
      id: 4,
      category: "成果备份",
      title: "阶段成果库",
      body: "把交付物、作品截图、重要记录和复盘结论归档，形成可追踪的成长证据。",
      itemDate: "2026",
      imageUrl: "",
      pinned: false,
      sortOrder: 40,
    },
  ],
  photos: [
    { id: 1, scope: "love-wall", title: "", caption: "fountain day", url: asset("love/love-01.jpg"), objectKey: "", sortOrder: 10 },
    { id: 2, scope: "love-wall", title: "", caption: "study with you", url: asset("love/love-03.jpg"), objectKey: "", sortOrder: 20 },
    { id: 3, scope: "love-wall", title: "", caption: "sunlit shadow", url: asset("love/love-08.jpg"), objectKey: "", sortOrder: 30 },
    { id: 4, scope: "love-wall", title: "", caption: "on the way", url: asset("love/love-07.jpg"), objectKey: "", sortOrder: 40 },
    { id: 5, scope: "love-wall", title: "", caption: "soft dance", url: asset("love/love-02.jpg"), objectKey: "", sortOrder: 50 },
    { id: 6, scope: "love-wall", title: "", caption: "spring kiss", url: asset("love/love-06.jpg"), objectKey: "", sortOrder: 60 },
    { id: 7, scope: "love-wall", title: "", caption: "little mirror", url: asset("love/love-04.jpg"), objectKey: "", sortOrder: 70 },
    { id: 8, scope: "love-wall", title: "", caption: "bright noon", url: asset("love/love-05.jpg"), objectKey: "", sortOrder: 80 },
  ],
  loveEvents: [],
  loveWishes: [
    {
      id: 1,
      title: "一起出国旅行",
      note: "带相机、护照和一本小本子，把路上的风景都贴进去。",
      imageUrl: asset("wishes/wish-travel.png"),
      completed: false,
      sortOrder: 10,
    },
    {
      id: 2,
      title: "一起过小肥生活",
      note: "认真吃饭，认真散步，也认真把普通日子过得软乎乎。",
      imageUrl: asset("wishes/wish-chubby-life.png"),
      completed: false,
      sortOrder: 20,
    },
    {
      id: 3,
      title: "顺利毕业",
      note: "一起稳稳走过这一段，把努力和好消息都带到下一站。",
      imageUrl: asset("wishes/wish-graduation-study.png"),
      completed: false,
      sortOrder: 30,
    },
  ],
  quarterGoals: [
    {
      id: 1,
      quarter: "2026 Q3",
      title: "建立稳定输出节奏",
      note: "每周整理一次学习笔记，每月做一次成果复盘。",
      progress: 35,
      status: "进行中",
      sortOrder: 10,
    },
    {
      id: 2,
      quarter: "2026 Q3",
      title: "升级个人作品集",
      note: "把重要作品归档到网站，让朋友也能看到阶段成果。",
      progress: 20,
      status: "进行中",
      sortOrder: 20,
    },
  ],
  travelPlans: [
    { id: 1, destination: "京都", timeRange: "秋天", note: "枫叶、老街、胶片感照片和慢慢走的下午。", status: "想去", imageUrl: "", sortOrder: 10 },
    { id: 2, destination: "海边城市", timeRange: "一个长周末", note: "看日落，写一页旅行笔记，给照片墙添一组蓝色。", status: "计划中", imageUrl: "", sortOrder: 20 },
  ],
};

const tableByCollection: Record<CollectionName, string> = {
  workspaceItems: "workspace_items",
  photos: "photos",
  loveEvents: "love_events",
  loveWishes: "love_wishes",
  quarterGoals: "quarter_goals",
  travelPlans: "travel_plans",
};

function text(row: Row, key: string) {
  return String(row[key] ?? "");
}

function num(row: Row, key: string) {
  return Number(row[key] ?? 0);
}

function bool(row: Row, key: string) {
  return Boolean(row[key]);
}

function db() {
  return getRuntimeEnv()?.DB ?? null;
}

async function runAll(database: D1Database, sql: string, ...binds: unknown[]) {
  return database.prepare(sql).bind(...binds).all<Row>();
}

async function exec(database: D1Database, sql: string, ...binds: unknown[]) {
  return database.prepare(sql).bind(...binds).run();
}

async function ensureSchema(database: D1Database) {
  await database.batch([
    database.prepare(
      "CREATE TABLE IF NOT EXISTS site_settings (key text PRIMARY KEY, value text NOT NULL DEFAULT '', updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS content_blocks (key text PRIMARY KEY, value text NOT NULL DEFAULT '', updated_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS workspace_items (id integer PRIMARY KEY AUTOINCREMENT, category text NOT NULL, title text NOT NULL, body text NOT NULL DEFAULT '', item_date text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '', pinned integer NOT NULL DEFAULT 0, sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS photos (id integer PRIMARY KEY AUTOINCREMENT, scope text NOT NULL, title text NOT NULL DEFAULT '', caption text NOT NULL DEFAULT '', url text NOT NULL, object_key text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS love_events (id integer PRIMARY KEY AUTOINCREMENT, title text NOT NULL, body text NOT NULL DEFAULT '', event_date text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS love_wishes (id integer PRIMARY KEY AUTOINCREMENT, title text NOT NULL, note text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '', completed integer NOT NULL DEFAULT 0, sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS quarter_goals (id integer PRIMARY KEY AUTOINCREMENT, quarter text NOT NULL, title text NOT NULL, note text NOT NULL DEFAULT '', progress integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT '进行中', sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
    database.prepare(
      "CREATE TABLE IF NOT EXISTS travel_plans (id integer PRIMARY KEY AUTOINCREMENT, destination text NOT NULL, time_range text NOT NULL DEFAULT '', note text NOT NULL DEFAULT '', status text NOT NULL DEFAULT '计划中', image_url text NOT NULL DEFAULT '', sort_order integer NOT NULL DEFAULT 0, created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP)"
    ),
  ]);

  const info = await runAll(database, "PRAGMA table_info(love_wishes)");
  if (!info.results.some((row) => text(row, "name") === "image_url")) {
    await exec(database, "ALTER TABLE love_wishes ADD COLUMN image_url text NOT NULL DEFAULT ''");
  }
}

export async function seedIfEmpty() {
  const database = db();
  if (!database) return;
  await ensureSchema(database);
  const existing = await runAll(database, "SELECT key FROM content_blocks LIMIT 1");
  if (existing.results.length) return;

  await saveSettings(fallbackData.settings);
  await saveContentBlocks(fallbackData.contentBlocks);
  for (const collection of Object.keys(tableByCollection) as CollectionName[]) {
    await saveCollection(collection, fallbackData[collection]);
  }
}

export async function getSiteData(): Promise<SiteData> {
  const database = db();
  if (!database) return fallbackData;
  await seedIfEmpty();

  const [settingsRows, contentRows, workspaceRows, photoRows, eventRows, wishRows, goalRows, tripRows] =
    await Promise.all([
      runAll(database, "SELECT key, value FROM site_settings"),
      runAll(database, "SELECT key, value FROM content_blocks"),
      runAll(database, "SELECT * FROM workspace_items ORDER BY pinned DESC, sort_order ASC, id DESC"),
      runAll(database, "SELECT * FROM photos ORDER BY sort_order ASC, id ASC"),
      runAll(database, "SELECT * FROM love_events ORDER BY sort_order ASC, event_date ASC, id ASC"),
      runAll(database, "SELECT * FROM love_wishes ORDER BY completed ASC, sort_order ASC, id ASC"),
      runAll(database, "SELECT * FROM quarter_goals ORDER BY quarter ASC, sort_order ASC, id ASC"),
      runAll(database, "SELECT * FROM travel_plans ORDER BY sort_order ASC, id ASC"),
    ]);

  const settings = { ...defaultSettings };
  for (const row of settingsRows.results) {
    const key = text(row, "key") as keyof SiteSettings;
    if (key in settings) settings[key] = text(row, "value");
  }

  const contentBlocks = { ...defaultContentBlocks };
  for (const row of contentRows.results) contentBlocks[text(row, "key")] = text(row, "value");

  return {
    settings,
    contentBlocks,
    workspaceItems: workspaceRows.results.map((row): WorkspaceItem => ({
      id: num(row, "id"),
      category: text(row, "category"),
      title: text(row, "title"),
      body: text(row, "body"),
      itemDate: text(row, "item_date"),
      imageUrl: text(row, "image_url"),
      pinned: bool(row, "pinned"),
      sortOrder: num(row, "sort_order"),
    })),
    photos: photoRows.results.map((row): Photo => ({
      id: num(row, "id"),
      scope: text(row, "scope"),
      title: text(row, "title"),
      caption: text(row, "caption"),
      url: text(row, "url"),
      objectKey: text(row, "object_key"),
      sortOrder: num(row, "sort_order"),
    })),
    loveEvents: eventRows.results.map((row): LoveEvent => ({
      id: num(row, "id"),
      title: text(row, "title"),
      body: text(row, "body"),
      eventDate: text(row, "event_date"),
      sortOrder: num(row, "sort_order"),
    })),
    loveWishes: wishRows.results.map((row): LoveWish => ({
      id: num(row, "id"),
      title: text(row, "title"),
      note: text(row, "note"),
      imageUrl: text(row, "image_url"),
      completed: bool(row, "completed"),
      sortOrder: num(row, "sort_order"),
    })),
    quarterGoals: goalRows.results.map((row): QuarterGoal => ({
      id: num(row, "id"),
      quarter: text(row, "quarter"),
      title: text(row, "title"),
      note: text(row, "note"),
      progress: Math.min(100, Math.max(0, num(row, "progress"))),
      status: text(row, "status"),
      sortOrder: num(row, "sort_order"),
    })),
    travelPlans: tripRows.results.map((row): TravelPlan => ({
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
  const database = db();
  if (!database) return;
  await ensureSchema(database);
  const statements = Object.entries(settings).map(([key, value]) =>
    database
      .prepare("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP")
      .bind(key, value ?? "")
  );
  if (statements.length) await database.batch(statements);
}

export async function saveContentBlocks(blocks: Record<string, string>) {
  const database = db();
  if (!database) return;
  await ensureSchema(database);
  const statements = Object.entries(blocks).map(([key, value]) =>
    database
      .prepare("INSERT INTO content_blocks (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP")
      .bind(key, value ?? "")
  );
  if (statements.length) await database.batch(statements);
}

function rowsForCollection(collection: CollectionName, items: unknown[]) {
  if (collection === "workspaceItems") {
    return (items as WorkspaceItem[]).map((item, index) => [
      item.category,
      item.title,
      item.body,
      item.itemDate,
      item.imageUrl,
      item.pinned ? 1 : 0,
      item.sortOrder || (index + 1) * 10,
    ]);
  }
  if (collection === "photos") {
    return (items as Photo[]).map((item, index) => [
      item.scope,
      item.title,
      item.caption,
      item.url,
      item.objectKey,
      item.sortOrder || (index + 1) * 10,
    ]);
  }
  if (collection === "loveEvents") {
    return (items as LoveEvent[]).map((item, index) => [
      item.title,
      item.body,
      item.eventDate,
      item.sortOrder || (index + 1) * 10,
    ]);
  }
  if (collection === "loveWishes") {
    return (items as LoveWish[]).map((item, index) => [
      item.title,
      item.note,
      item.imageUrl,
      item.completed ? 1 : 0,
      item.sortOrder || (index + 1) * 10,
    ]);
  }
  if (collection === "quarterGoals") {
    return (items as QuarterGoal[]).map((item, index) => [
      item.quarter,
      item.title,
      item.note,
      item.progress,
      item.status,
      item.sortOrder || (index + 1) * 10,
    ]);
  }
  return (items as TravelPlan[]).map((item, index) => [
    item.destination,
    item.timeRange,
    item.note,
    item.status,
    item.imageUrl,
    item.sortOrder || (index + 1) * 10,
  ]);
}

const insertSql: Record<CollectionName, string> = {
  workspaceItems:
    "INSERT INTO workspace_items (category, title, body, item_date, image_url, pinned, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
  photos: "INSERT INTO photos (scope, title, caption, url, object_key, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
  loveEvents: "INSERT INTO love_events (title, body, event_date, sort_order) VALUES (?, ?, ?, ?)",
  loveWishes: "INSERT INTO love_wishes (title, note, image_url, completed, sort_order) VALUES (?, ?, ?, ?, ?)",
  quarterGoals: "INSERT INTO quarter_goals (quarter, title, note, progress, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
  travelPlans: "INSERT INTO travel_plans (destination, time_range, note, status, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
};

export async function saveCollection(collection: CollectionName, items: unknown[]) {
  const database = db();
  if (!database) return;
  await ensureSchema(database);
  const table = tableByCollection[collection];
  await exec(database, `DELETE FROM ${table}`);
  const rows = rowsForCollection(collection, items);
  if (!rows.length) return;
  await database.batch(rows.map((row) => database.prepare(insertSql[collection]).bind(...row)));
}
