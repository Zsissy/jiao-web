import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="topbar inner-nav">
      <Link href="/">Jiao Archive</Link>
      <div>
        <Link href="/workspace">workspace</Link>
        <Link href="/love-story">love story</Link>
        <Link href="/future-planning">future</Link>
      </div>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
  background,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  background?: string;
}) {
  const style = background
    ? { backgroundImage: `linear-gradient(180deg, rgba(21, 19, 19, .1), rgba(21, 19, 19, .76)), url(${background})` }
    : undefined;
  return (
    <header className="page-hero" style={style}>
      <SiteNav />
      <div className="page-hero-copy">
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </header>
  );
}
