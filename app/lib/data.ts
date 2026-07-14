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
type CollectionName = keyof Omit<SiteData, "settings">;

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

const fallbackData: SiteData = {
  settings: defaultSettings,
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
  photos: [],
  loveEvents: [
    {
      id: 1,
      title: "第一次认真计划未来",
      body: "从散步聊天开始，把旅行、学习和生活一点点写进同一本计划里。",
      eventDate: "2024-01-01",
      sortOrder: 10,
    },
    {
      id: 2,
      title: "值得纪念的小日子",
      body: "不用等到盛大的节日，普通的一天也可以因为被记住而发光。",
      eventDate: "2024-05-20",
      sortOrder: 20,
    },
    {
      id: 3,
      title: "一起去看世界",
      body: "愿照片墙越来越满，愿每一次出发都有新的故事。",
      eventDate: "2025-10-01",
      sortOrder: 30,
    },
  ],
  loveWishes: [
    { id: 1, title: "一起看一场海边日落", note: "带相机，也带一件薄外套。", completed: false, sortOrder: 10 },
    { id: 2, title: "做一本年度相册", note: "把照片、票根和一句话日记排成一本小书。", completed: false, sortOrder: 20 },
    { id: 3, title: "完成一次没有赶路的旅行", note: "每天只安排一个目的地，其余时间留给随机。", completed: false, sortOrder: 30 },
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
    {
      id: 3,
      quarter: "2026 Q4",
      title: "规划年末旅行",
      note: "确定目的地、预算、时间和想拍的照片主题。",
      progress: 10,
      status: "计划中",
      sortOrder: 30,
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

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

function headers(prefer?: string) {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  return {
    apikey: config.serviceKey,
    authorization: `Bearer ${config.serviceKey}`,
    "content-type": "application/json",
    ...(prefer ? { prefer } : {}),
  };
}

async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function text(row: Row, key: string) {
  return String(row[key] ?? "");
}

function num(row: Row, key: string) {
  return Number(row[key] ?? 0);
}

function bool(row: Row, key: string) {
  return Boolean(row[key]);
}

async function seedIfEmpty() {
  const rows = await supabaseFetch<Row[]>("/rest/v1/site_settings?select=key&limit=1");
  if (rows.length) return;
  await saveSettings(fallbackData.settings);
  await Promise.all(
    (Object.keys(tableByCollection) as CollectionName[]).map((collection) =>
      saveCollection(collection, fallbackData[collection])
    )
  );
}

export async function getSiteData(): Promise<SiteData> {
  if (!supabaseConfig()) return fallbackData;
  await seedIfEmpty();
  const [settingsRows, workspaceRows, photoRows, eventRows, wishRows, goalRows, tripRows] =
    await Promise.all([
      supabaseFetch<Row[]>("/rest/v1/site_settings?select=key,value"),
      supabaseFetch<Row[]>("/rest/v1/workspace_items?select=*&order=pinned.desc,sort_order.asc,id.desc"),
      supabaseFetch<Row[]>("/rest/v1/photos?select=*&order=sort_order.asc,id.desc"),
      supabaseFetch<Row[]>("/rest/v1/love_events?select=*&order=sort_order.asc,event_date.asc,id.asc"),
      supabaseFetch<Row[]>("/rest/v1/love_wishes?select=*&order=completed.asc,sort_order.asc,id.asc"),
      supabaseFetch<Row[]>("/rest/v1/quarter_goals?select=*&order=quarter.asc,sort_order.asc,id.asc"),
      supabaseFetch<Row[]>("/rest/v1/travel_plans?select=*&order=sort_order.asc,id.asc"),
    ]);

  const settings = { ...defaultSettings };
  for (const row of settingsRows) {
    const key = text(row, "key") as keyof SiteSettings;
    if (key in settings) settings[key] = text(row, "value");
  }

  return {
    settings,
    workspaceItems: workspaceRows.map((row): WorkspaceItem => ({
      id: num(row, "id"),
      category: text(row, "category"),
      title: text(row, "title"),
      body: text(row, "body"),
      itemDate: text(row, "item_date"),
      imageUrl: text(row, "image_url"),
      pinned: bool(row, "pinned"),
      sortOrder: num(row, "sort_order"),
    })),
    photos: photoRows.map((row): Photo => ({
      id: num(row, "id"),
      scope: text(row, "scope"),
      title: text(row, "title"),
      caption: text(row, "caption"),
      url: text(row, "url"),
      objectKey: text(row, "object_key"),
      sortOrder: num(row, "sort_order"),
    })),
    loveEvents: eventRows.map((row): LoveEvent => ({
      id: num(row, "id"),
      title: text(row, "title"),
      body: text(row, "body"),
      eventDate: text(row, "event_date"),
      sortOrder: num(row, "sort_order"),
    })),
    loveWishes: wishRows.map((row): LoveWish => ({
      id: num(row, "id"),
      title: text(row, "title"),
      note: text(row, "note"),
      completed: bool(row, "completed"),
      sortOrder: num(row, "sort_order"),
    })),
    quarterGoals: goalRows.map((row): QuarterGoal => ({
      id: num(row, "id"),
      quarter: text(row, "quarter"),
      title: text(row, "title"),
      note: text(row, "note"),
      progress: Math.min(100, Math.max(0, num(row, "progress"))),
      status: text(row, "status"),
      sortOrder: num(row, "sort_order"),
    })),
    travelPlans: tripRows.map((row): TravelPlan => ({
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
  const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
  await supabaseFetch("/rest/v1/site_settings?on_conflict=key", {
    method: "POST",
    headers: headers("resolution=merge-duplicates"),
    body: JSON.stringify(payload),
  });
}

function toRows(collection: CollectionName, items: unknown[]) {
  if (collection === "workspaceItems") {
    return (items as WorkspaceItem[]).map((item, index) => ({
      category: item.category,
      title: item.title,
      body: item.body,
      item_date: item.itemDate,
      image_url: item.imageUrl,
      pinned: item.pinned,
      sort_order: item.sortOrder || (index + 1) * 10,
    }));
  }
  if (collection === "photos") {
    return (items as Photo[]).map((item, index) => ({
      scope: item.scope,
      title: item.title,
      caption: item.caption,
      url: item.url,
      object_key: item.objectKey,
      sort_order: item.sortOrder || (index + 1) * 10,
    }));
  }
  if (collection === "loveEvents") {
    return (items as LoveEvent[]).map((item, index) => ({
      title: item.title,
      body: item.body,
      event_date: item.eventDate,
      sort_order: item.sortOrder || (index + 1) * 10,
    }));
  }
  if (collection === "loveWishes") {
    return (items as LoveWish[]).map((item, index) => ({
      title: item.title,
      note: item.note,
      completed: item.completed,
      sort_order: item.sortOrder || (index + 1) * 10,
    }));
  }
  if (collection === "quarterGoals") {
    return (items as QuarterGoal[]).map((item, index) => ({
      quarter: item.quarter,
      title: item.title,
      note: item.note,
      progress: item.progress,
      status: item.status,
      sort_order: item.sortOrder || (index + 1) * 10,
    }));
  }
  return (items as TravelPlan[]).map((item, index) => ({
    destination: item.destination,
    time_range: item.timeRange,
    note: item.note,
    status: item.status,
    image_url: item.imageUrl,
    sort_order: item.sortOrder || (index + 1) * 10,
  }));
}

export async function saveCollection(collection: CollectionName, items: unknown[]) {
  const table = tableByCollection[collection];
  await supabaseFetch(`/rest/v1/${table}?id=not.is.null`, {
    method: "DELETE",
    headers: headers("return=minimal"),
  });
  const rows = toRows(collection, items);
  if (!rows.length) return;
  await supabaseFetch(`/rest/v1/${table}`, {
    method: "POST",
    headers: headers("return=minimal"),
    body: JSON.stringify(rows),
  });
}
