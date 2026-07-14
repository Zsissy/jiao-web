import { PageHero } from "../components/SiteNav";
import { getSiteData } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function FuturePlanningPage() {
  const { settings, quarterGoals, travelPlans } = await getSiteData();

  return (
    <main className="site-shell">
      <PageHero
        eyebrow="FUTURE PLANNING"
        title="把远方拆成今天可以靠近的一步。"
        copy="季度目标和旅行计划并排生长，既看方向，也看当下的进度。"
        background={settings.futureBackground}
      />
      <section className="content-band split-columns">
        <section>
          <div className="section-heading">
            <p>季度目标</p>
            <span>{quarterGoals.length} 个目标</span>
          </div>
          <div className="goal-list">
            {quarterGoals.map((goal) => (
              <article key={goal.id}>
                <div>
                  <span>{goal.quarter}</span>
                  <em>{goal.status}</em>
                </div>
                <h2>{goal.title}</h2>
                <p>{goal.note}</p>
                <div className="progress-track">
                  <i style={{ width: `${goal.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section>
          <div className="section-heading">
            <p>旅行计划</p>
            <span>{travelPlans.length} 个目的地</span>
          </div>
          <div className="travel-grid">
            {travelPlans.map((trip) => (
              <article key={trip.id}>
                {trip.imageUrl ? <img src={trip.imageUrl} alt="" /> : <div className="image-placeholder" />}
                <div>
                  <span>{trip.status} · {trip.timeRange}</span>
                  <h2>{trip.destination}</h2>
                  <p>{trip.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
