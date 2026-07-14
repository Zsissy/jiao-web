"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  LoveEvent,
  LoveWish,
  Photo,
  QuarterGoal,
  SiteData,
  SiteSettings,
  TravelPlan,
  WorkspaceItem,
} from "../lib/types";

type CollectionName = keyof Omit<SiteData, "settings">;

const blankWorkspace: WorkspaceItem = {
  id: 0,
  category: "学习笔记",
  title: "",
  body: "",
  itemDate: "",
  imageUrl: "",
  pinned: false,
  sortOrder: 0,
};

const blankPhoto: Photo = {
  id: 0,
  scope: "love-wall",
  title: "",
  caption: "",
  url: "",
  objectKey: "",
  sortOrder: 0,
};

const blankEvent: LoveEvent = { id: 0, title: "", body: "", eventDate: "", sortOrder: 0 };
const blankWish: LoveWish = { id: 0, title: "", note: "", completed: false, sortOrder: 0 };
const blankGoal: QuarterGoal = {
  id: 0,
  quarter: "2026 Q3",
  title: "",
  note: "",
  progress: 0,
  status: "进行中",
  sortOrder: 0,
};
const blankTrip: TravelPlan = {
  id: 0,
  destination: "",
  timeRange: "",
  note: "",
  status: "计划中",
  imageUrl: "",
  sortOrder: 0,
};

function resequence<T extends { sortOrder: number; id: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, id: item.id || index + 1, sortOrder: (index + 1) * 10 }));
}

export function AdminPanel({ initialData }: { initialData: SiteData }) {
  const [data, setData] = useState(initialData);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState("请输入管理密码开始维护内容。");
  const [saving, setSaving] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setMessage("正在验证...");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.message ?? "登录失败。");
      return;
    }
    setAuthorized(true);
    setMessage("已进入管理模式。");
  }

  async function save() {
    setSaving(true);
    setMessage("正在保存...");
    const response = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(result.message ?? "保存失败。");
      return;
    }
    setData(result.data);
    setMessage("已保存，前台页面会读取最新内容。");
  }

  async function upload(file: File, applyUrl: (url: string, objectKey: string) => void) {
    const body = new FormData();
    body.append("file", file);
    setMessage("正在上传图片...");
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.message ?? "上传失败。");
      return;
    }
    applyUrl(result.url, result.objectKey);
    setMessage("图片已上传，记得保存。");
  }

  function updateSettings(key: keyof SiteSettings, value: string) {
    setData((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }

  function setCollection<T>(name: CollectionName, items: T[]) {
    setData((current) => ({ ...current, [name]: resequence(items as never[]) }));
  }

  if (!authorized) {
    return (
      <main className="admin-shell">
        <section className="login-panel">
          <Link href="/">返回首页</Link>
          <p className="kicker">PRIVATE ADMIN</p>
          <h1>管理入口</h1>
          <p>{message}</p>
          <form onSubmit={login}>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="管理密码"
              autoComplete="current-password"
            />
            <button type="submit">进入管理</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-header">
        <div>
          <p className="kicker">PRIVATE ADMIN</p>
          <h1>内容管理</h1>
          <span>{message}</span>
        </div>
        <div>
          <Link href="/">查看首页</Link>
          <button onClick={save} disabled={saving}>{saving ? "保存中" : "保存全部"}</button>
        </div>
      </div>

      <section className="admin-section">
        <h2>首页与背景</h2>
        <div className="admin-grid two">
          <label>首页标题<input value={data.settings.heroTitle} onChange={(e) => updateSettings("heroTitle", e.target.value)} /></label>
          <label>纪念日名称<input value={data.settings.anniversaryLabel} onChange={(e) => updateSettings("anniversaryLabel", e.target.value)} /></label>
          <label className="wide">首页副标题<textarea value={data.settings.heroSubtitle} onChange={(e) => updateSettings("heroSubtitle", e.target.value)} /></label>
          <label>纪念日起始日期<input type="date" value={data.settings.anniversaryStart} onChange={(e) => updateSettings("anniversaryStart", e.target.value)} /></label>
        </div>
        <div className="background-editor">
          {([
            ["homeBackground", "首页背景"],
            ["workspaceBackground", "workspace 背景"],
            ["loveBackground", "love story 背景"],
            ["futureBackground", "future planning 背景"],
          ] as const).map(([key, label]) => (
            <label key={key}>
              {label}
              <input value={data.settings[key]} onChange={(e) => updateSettings(key, e.target.value)} placeholder="图片地址或上传图片" />
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => updateSettings(key, url))} />
            </label>
          ))}
        </div>
      </section>

      <CollectionEditor
        title="workspace"
        addLabel="新增 workspace 条目"
        items={data.workspaceItems}
        blank={blankWorkspace}
        setItems={(items) => setCollection("workspaceItems", items)}
        render={(item, update, index) => (
          <>
            <select value={item.category} onChange={(e) => update({ category: e.target.value })}>
              <option>学习笔记</option>
              <option>工作计划</option>
              <option>月度展望</option>
              <option>成果备份</option>
            </select>
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="标题" />
            <input value={item.itemDate} onChange={(e) => update({ itemDate: e.target.value })} placeholder="日期或月份" />
            <label className="checkbox"><input type="checkbox" checked={item.pinned} onChange={(e) => update({ pinned: e.target.checked })} />置顶</label>
            <textarea value={item.body} onChange={(e) => update({ body: e.target.value })} placeholder="正文" />
            <input value={item.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="配图地址" />
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => {
              const next = [...data.workspaceItems];
              next[index] = { ...next[index], imageUrl: url };
              setCollection("workspaceItems", next);
            })} />
          </>
        )}
      />

      <CollectionEditor
        title="love story 照片墙"
        addLabel="新增照片"
        items={data.photos}
        blank={blankPhoto}
        setItems={(items) => setCollection("photos", items)}
        render={(item, update) => (
          <>
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="照片标题" />
            <input value={item.caption} onChange={(e) => update({ caption: e.target.value })} placeholder="说明" />
            <select value={item.scope} onChange={(e) => update({ scope: e.target.value })}>
              <option value="love-wall">love story 照片墙</option>
            </select>
            <input value={item.url} onChange={(e) => update({ url: e.target.value })} placeholder="图片地址" />
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url, objectKey) => update({ url, objectKey }))} />
          </>
        )}
      />

      <CollectionEditor
        title="恋爱时间线"
        addLabel="新增时间线"
        items={data.loveEvents}
        blank={blankEvent}
        setItems={(items) => setCollection("loveEvents", items)}
        render={(item, update) => (
          <>
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="标题" />
            <input type="date" value={item.eventDate} onChange={(e) => update({ eventDate: e.target.value })} />
            <textarea value={item.body} onChange={(e) => update({ body: e.target.value })} placeholder="记录" />
          </>
        )}
      />

      <CollectionEditor
        title="愿望清单"
        addLabel="新增愿望"
        items={data.loveWishes}
        blank={blankWish}
        setItems={(items) => setCollection("loveWishes", items)}
        render={(item, update) => (
          <>
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="愿望" />
            <label className="checkbox"><input type="checkbox" checked={item.completed} onChange={(e) => update({ completed: e.target.checked })} />已完成</label>
            <textarea value={item.note} onChange={(e) => update({ note: e.target.value })} placeholder="备注" />
          </>
        )}
      />

      <CollectionEditor
        title="季度目标"
        addLabel="新增目标"
        items={data.quarterGoals}
        blank={blankGoal}
        setItems={(items) => setCollection("quarterGoals", items)}
        render={(item, update) => (
          <>
            <input value={item.quarter} onChange={(e) => update({ quarter: e.target.value })} placeholder="季度，如 2026 Q3" />
            <input value={item.title} onChange={(e) => update({ title: e.target.value })} placeholder="目标" />
            <input value={item.status} onChange={(e) => update({ status: e.target.value })} placeholder="状态" />
            <input type="number" min="0" max="100" value={item.progress} onChange={(e) => update({ progress: Number(e.target.value) })} placeholder="进度" />
            <textarea value={item.note} onChange={(e) => update({ note: e.target.value })} placeholder="说明" />
          </>
        )}
      />

      <CollectionEditor
        title="旅行计划"
        addLabel="新增旅行"
        items={data.travelPlans}
        blank={blankTrip}
        setItems={(items) => setCollection("travelPlans", items)}
        render={(item, update) => (
          <>
            <input value={item.destination} onChange={(e) => update({ destination: e.target.value })} placeholder="目的地" />
            <input value={item.timeRange} onChange={(e) => update({ timeRange: e.target.value })} placeholder="时间" />
            <input value={item.status} onChange={(e) => update({ status: e.target.value })} placeholder="状态" />
            <textarea value={item.note} onChange={(e) => update({ note: e.target.value })} placeholder="计划说明" />
            <input value={item.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="配图地址" />
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], (url) => update({ imageUrl: url }))} />
          </>
        )}
      />
    </main>
  );
}

function CollectionEditor<T extends { id: number; sortOrder: number }>({
  title,
  addLabel,
  items,
  blank,
  setItems,
  render,
}: {
  title: string;
  addLabel: string;
  items: T[];
  blank: T;
  setItems: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  return (
    <section className="admin-section">
      <div className="admin-section-title">
        <h2>{title}</h2>
        <button onClick={() => setItems([...items, { ...blank, id: Date.now(), sortOrder: items.length * 10 }])}>{addLabel}</button>
      </div>
      <div className="editor-list">
        {items.map((item, index) => (
          <article className="editor-row" key={`${title}-${item.id}-${index}`}>
            <div className="editor-fields">
              {render(item, (patch) => {
                const next = [...items];
                next[index] = { ...item, ...patch };
                setItems(next);
              }, index)}
            </div>
            <button className="danger" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>删除</button>
          </article>
        ))}
      </div>
    </section>
  );
}
