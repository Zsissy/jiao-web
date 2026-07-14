import Link from "next/link";
import { getSiteData } from "./lib/data";

export const dynamic = "force-dynamic";

const modules = [
  {
    key: "workspaceBackground",
    href: "/workspace",
    label: "workspace",
    eyebrow: "学习 / 工作 / 成果",
    copy: "学习笔记、工作计划、月度展望和成果备份，像一本持续生长的个人档案。",
  },
  {
    key: "loveBackground",
    href: "/love-story",
    label: "love story",
    eyebrow: "照片 / 纪念日 / 心愿",
    copy: "照片墙、纪念日、重要时刻和想一起完成的小愿望。",
  },
  {
    key: "futureBackground",
    href: "/future-planning",
    label: "future planning",
    eyebrow: "季度目标 / 旅行计划",
    copy: "把想抵达的地方和想成为的人，拆成清晰、可回看的计划。",
  },
] as const;

function backgroundStyle(url: string) {
  return url ? { backgroundImage: `linear-gradient(180deg, rgba(20, 18, 18, .12), rgba(20, 18, 18, .72)), url(${url})` } : undefined;
}

export default async function Home() {
  const { settings, workspaceItems, loveEvents, quarterGoals } = await getSiteData();
  const counts = {
    workspaceBackground: workspaceItems.length,
    loveBackground: loveEvents.length,
    futureBackground: quarterGoals.length,
  };

  return (
    <main className="site-shell home-shell">
      <section className="home-hero" style={backgroundStyle(settings.homeBackground)}>
        <nav className="topbar">
          <span>Jiao Archive</span>
          <Link href="/admin">管理入口</Link>
        </nav>
        <div className="hero-copy">
          <p className="kicker">PERSONAL WEBSITE</p>
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroSubtitle}</p>
        </div>
      </section>

      <section className="module-grid" aria-label="网站模块">
        {modules.map((module) => (
          <Link
            className="module-panel"
            href={module.href}
            key={module.href}
            style={backgroundStyle(settings[module.key])}
          >
            <span className="module-eyebrow">{module.eyebrow}</span>
            <strong>{module.label}</strong>
            <p>{module.copy}</p>
            <span className="module-count">{counts[module.key]} items</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
