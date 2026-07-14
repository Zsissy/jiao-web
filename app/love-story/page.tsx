import { PageHero } from "../components/SiteNav";
import { getSiteData } from "../lib/data";

export const dynamic = "force-dynamic";

function daysTogether(start: string) {
  const startDate = new Date(`${start}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return 0;
  const diff = Date.now() - startDate.getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export default async function LoveStoryPage() {
  const { settings, photos, loveEvents, loveWishes } = await getSiteData();
  const wall = photos.filter((photo) => photo.scope === "love-wall");

  return (
    <main className="site-shell">
      <PageHero
        eyebrow="LOVE STORY"
        title="把普通日子过成会发光的章节。"
        copy="照片墙、纪念日、时间线和愿望清单，留给我们慢慢翻。"
        background={settings.loveBackground}
      />
      <section className="content-band love-layout">
        <div className="anniversary-panel">
          <p>{settings.anniversaryLabel}</p>
          <strong>{daysTogether(settings.anniversaryStart)}</strong>
          <span>days together · from {settings.anniversaryStart}</span>
        </div>
        <div className="photo-wall" aria-label="可翻页照片墙">
          {wall.length ? (
            wall.map((photo) => (
              <figure key={photo.id}>
                <img src={photo.url} alt={photo.title || "love story photo"} />
                <figcaption>
                  <strong>{photo.title}</strong>
                  <span>{photo.caption}</span>
                </figcaption>
              </figure>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, index) => <div className="photo-empty" key={index}>photo {index + 1}</div>)
          )}
        </div>
        <div className="split-columns">
          <section>
            <div className="section-heading">
              <p>时间线</p>
              <span>重要时刻</span>
            </div>
            <div className="timeline">
              {loveEvents.map((event) => (
                <article key={event.id}>
                  <time>{event.eventDate}</time>
                  <h2>{event.title}</h2>
                  <p>{event.body}</p>
                </article>
              ))}
            </div>
          </section>
          <section>
            <div className="section-heading">
              <p>愿望清单</p>
              <span>想一起完成</span>
            </div>
            <div className="wish-list">
              {loveWishes.map((wish) => (
                <article className={wish.completed ? "is-complete" : ""} key={wish.id}>
                  <span>{wish.completed ? "已完成" : "想完成"}</span>
                  <h2>{wish.title}</h2>
                  <p>{wish.note}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
