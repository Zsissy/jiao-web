import { PageHero } from "../components/SiteNav";
import { getSiteData } from "../lib/data";

export const dynamic = "force-dynamic";

const categoryLabels = ["学习笔记", "工作计划", "月度展望", "成果备份"];

export default async function WorkspacePage() {
  const { settings, workspaceItems } = await getSiteData();

  return (
    <main className="site-shell">
      <PageHero
        eyebrow="WORKSPACE"
        title="把正在成长的部分，认真保存。"
        copy="学习笔记、工作计划、月度展望和成果备份在这里汇合，公开给朋友看到真实的进度。"
        background={settings.workspaceBackground}
      />
      <section className="content-band">
        {categoryLabels.map((category) => {
          const items = workspaceItems.filter((item) => item.category === category);
          return (
            <div className="section-block" key={category}>
              <div className="section-heading">
                <p>{category}</p>
                <span>{items.length} 条记录</span>
              </div>
              <div className="journal-grid">
                {items.map((item) => (
                  <article className="journal-card" key={item.id}>
                    {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <div className="image-placeholder" />}
                    <div>
                      <span>{item.itemDate || "未标注日期"}</span>
                      <h2>{item.title}</h2>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
