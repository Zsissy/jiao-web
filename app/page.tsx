import Link from "next/link";
import type { CSSProperties } from "react";
import { getSiteData } from "./lib/data";

export const dynamic = "force-dynamic";

function daysSince(value: string) {
  const start = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(start.getTime())) return 0;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86400000));
}

function photoAt<T>(items: T[], index: number): T | undefined {
  return items[index % Math.max(items.length, 1)];
}

export default async function Home() {
  const data = await getSiteData();
  const { settings, contentBlocks: c } = data;
  const lovePhotos = data.photos.filter((photo) => photo.scope === "love-wall");

  const modules = [
    ["workspace-cover", "#workspace", "module.workspace.eyebrow", "module.workspace.title", "module.workspace.copy"],
    ["love-cover", "#love-story", "module.love.eyebrow", "module.love.title", "module.love.copy"],
    ["future-cover", "#future-planning", "module.future.eyebrow", "module.future.title", "module.future.copy"],
  ] as const;

  return (
    <>
      <header className="hero" id="home">
        <nav className="nav">
          <a className="script-text" href="#home">{c["nav.brand"]}</a>
          <div>
            <a className="script-text" href="#workspace">{c["nav.workspace"]}</a>
            <a className="script-text" href="#love-story">{c["nav.love"]}</a>
            <a className="script-text" href="#future-planning">{c["nav.future"]}</a>
            <Link className="script-text" href="/admin">{c["nav.admin"]}</Link>
          </div>
        </nav>
        <div className="hero-content">
          <div className="hero-copy">
            <p className="kicker script-text">{c["hero.kicker"]}</p>
            <h1 className="script-text">{c["hero.title"]}</h1>
            <div className="hero-stickers" aria-label="personal archive stickers">
              <img className="hero-sticker sticker-a" src={settings.stickerWorkStretch} alt="" />
              <img className="hero-sticker sticker-b" src={settings.stickerReadingDog} alt="" />
              <img className="hero-sticker sticker-c" src={settings.stickerNapDog} alt="" />
              <img className="hero-sticker sticker-d" src={settings.stickerWorkBox} alt="" />
            </div>
          </div>
          <figure className="profile-feature" aria-label="personal portrait and identity notes">
            <img src={settings.profileImage} alt="Jiao portrait" />
            <svg className="identity-map" viewBox="0 0 520 560" aria-hidden="true">
              <defs>
                <marker id="arrowTip" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M1,1 L7,4 L1,7" />
                </marker>
              </defs>
              <path className="arrow-line student-line" d="M176 120 C118 82 76 62 30 48" />
              <path className="arrow-line law-line" d="M388 128 C438 120 476 98 510 72" />
              <path className="arrow-line admin-line" d="M410 438 C452 476 482 512 506 548" />
              <path className="arrow-line soulmate-line" d="M142 440 C96 482 62 514 28 548" />
            </svg>
            <span className="identity-tag student-tag script-text">{c["identity.student"]}</span>
            <span className="identity-tag law-tag script-text">{c["identity.law"]}</span>
            <span className="identity-tag admin-tag script-text">{c["identity.admin"]}</span>
            <span className="identity-tag soulmate-tag script-text">{c["identity.soulmate"]}</span>
          </figure>
        </div>
      </header>

      <main>
        <section className="module-grid" aria-label="网站模块">
          {modules.map(([className, href, eyebrow, title, copy]) => (
            <a className={`module-card ${className}`} href={href} key={href}>
              <span>{c[eyebrow]}</span>
              <strong className="script-text">{c[title]}</strong>
              <p>{c[copy]}</p>
            </a>
          ))}
        </section>

        <section className="page-section scenic-section workspace-scene" id="workspace" style={{ "--scene-bg": `url(${settings.workspaceBackground})` } as CSSProperties}>
          <div className="section-heading">
            <p className="script-text">{c["workspace.heading.title"]}</p>
            <span>{c["workspace.heading.subtitle"]}</span>
          </div>
          <div className="journal-grid">
            {data.workspaceItems.map((item) => (
              <article key={item.id}>
                <span>{item.category} · {item.itemDate}</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section love-section" id="love-story">
          <div className="section-heading">
            <p className="script-text">{c["love.heading.title"]}</p>
            <span>{c["love.heading.subtitle"]}</span>
          </div>
          <div className="anniversary">
            <div>
              <p>{settings.anniversaryLabel}</p>
              <span>{c["love.anniversary.from"]} {settings.anniversaryStart}</span>
            </div>
            <strong>{daysSince(settings.anniversaryStart)}</strong>
            <em className="script-text">{c["love.anniversary.unit"]}</em>
          </div>
          <div className="scrapbook" aria-label="love story scrapbook">
            <div className="book-page left-page">
              {[0, 1, 2, 3].map((index) => {
                const photo = photoAt(lovePhotos, index);
                return photo ? (
                  <figure className={`polaroid p${index + 1}`} key={photo.id}>
                    <img src={photo.url} alt={photo.title || photo.caption} />
                    <figcaption>{photo.caption}</figcaption>
                  </figure>
                ) : null;
              })}
            </div>
            <div className="book-spine" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="book-page right-page">
              {[4, 5, 6, 7].map((index) => {
                const photo = photoAt(lovePhotos, index);
                return photo ? (
                  <figure className={`polaroid p${index + 1}`} key={photo.id}>
                    <img src={photo.url} alt={photo.title || photo.caption} />
                    <figcaption>{photo.caption}</figcaption>
                  </figure>
                ) : null;
              })}
            </div>
          </div>
          <div className="split love-notes" style={{ "--scene-bg": `url(${settings.loveBackground})` } as CSSProperties}>
            <section>
              <h2>{c["love.timeline.title"]}</h2>
              <article>
                <span>{c["love.apart.from"]} {settings.apartStart}</span>
                <h3>{c["love.apart.prefix"]} <b>{daysSince(settings.apartStart)}</b> {c["love.apart.suffix"]}</h3>
                <img className="apart-sticker" src={settings.apartSticker} alt="" />
                <p>{c["love.apart.body"]}</p>
              </article>
              {data.loveEvents.map((event) => (
                <article key={event.id}>
                  <span>{event.eventDate}</span>
                  <h3>{event.title}</h3>
                  <p>{event.body}</p>
                </article>
              ))}
            </section>
            <section>
              <h2>{c["love.wishes.title"]}</h2>
              {data.loveWishes.map((wish) => (
                <article key={wish.id}>
                  <span>{wish.completed ? "已完成" : c["love.wishes.status"]}</span>
                  <h3 className="wish-heading">{wish.title} {wish.imageUrl ? <img src={wish.imageUrl} alt="" /> : null}</h3>
                  <p>{wish.note}</p>
                </article>
              ))}
            </section>
          </div>
        </section>

        <section className="page-section scenic-section future-scene" id="future-planning" style={{ "--scene-bg": `url(${settings.futureBackground})` } as CSSProperties}>
          <div className="section-heading">
            <p className="script-text">{c["future.heading.title"]}</p>
            <span>{c["future.heading.subtitle"]}</span>
          </div>
          <div className="split">
            <section className="goal-list">
              <h2>{c["future.goals.title"]}</h2>
              {data.quarterGoals.map((goal) => (
                <article key={goal.id}>
                  <span>{goal.quarter} · {goal.status}</span>
                  <h3>{goal.title}</h3>
                  <p>{goal.note}</p>
                  <div className="progress"><i style={{ width: `${goal.progress}%` }} /></div>
                </article>
              ))}
            </section>
            <section className="travel-list">
              <h2>{c["future.travel.title"]}</h2>
              {data.travelPlans.map((trip) => (
                <article key={trip.id}>
                  <span>{trip.status} · {trip.timeRange}</span>
                  <h3>{trip.destination}</h3>
                  <p>{trip.note}</p>
                </article>
              ))}
            </section>
          </div>
        </section>

        <section className="page-section admin-note" id="admin">
          <div className="section-heading">
            <p className="script-text">{c["admin.heading.title"]}</p>
            <span>{c["admin.heading.subtitle"]}</span>
          </div>
          <p>{c["admin.body"]}</p>
          <Link href="/admin">进入管理入口</Link>
        </section>
      </main>
    </>
  );
}
