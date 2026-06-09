import Link from "next/link";
import type { Course, Post, Profile } from "@/types/db";
import type { NicheModule } from "@/lib/niches/types";
import { Avatar, RankBadge, VerifiedTick, Icon, type IconName } from "@/components/ui";
import { PostCard } from "@/components/feed/post-card";
import { CourseCard } from "@/components/marketplace/course-card";

interface NicheHubProps {
  niche: NicheModule;
  field: number;
  top: Profile[];
  posts: Post[];
  authors: Record<string, Profile>;
  nicheRpByPost: Record<string, number>;
  courses: Course[];
  instructors: Record<string, Profile>;
}

const QUICK_LINKS: { href: (slug: string) => string; label: string; icon: IconName }[] = [
  { href: (s) => `/rankings/${s}`, label: "Ranking", icon: "trophy" },
  { href: (s) => `/competitions/${s}`, label: "Retos", icon: "swords" },
  { href: (s) => `/learning/${s}`, label: "Academia", icon: "book" },
  { href: () => `/marketplace`, label: "Cursos", icon: "play" },
];

export function NicheHub({ niche, field, top, posts, authors, nicheRpByPost, courses, instructors }: NicheHubProps) {
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
      <Link href="/nichos" className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)", textDecoration: "none" }}>
        ← Nichos
      </Link>

      {/* header */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          background: `linear-gradient(120deg, color-mix(in srgb, ${niche.color} 18%, var(--bg-2)), var(--bg-2) 70%)`,
          borderColor: `color-mix(in srgb, ${niche.color} 34%, transparent)`,
        }}
      >
        <span aria-hidden style={{ fontSize: 40 }}>{niche.glyph}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24 }}>{niche.name}</h1>
          <p style={{ fontSize: 13.5, color: "var(--tx-2)", marginTop: 3 }}>{niche.tagline}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontWeight: 700, fontSize: 20 }}>{field.toLocaleString()}</div>
          <div className="sec-label" style={{ fontSize: 10 }}>{niche.copy.member}s</div>
        </div>
      </div>

      {/* quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href(niche.slug)}
            className="card"
            style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit" }}
          >
            <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${niche.color} 16%, transparent)`, color: niche.color }}>
              <Icon name={link.icon} size={17} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{link.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 20, alignItems: "start" }} className="th-course-grid">
        {/* feed del nicho */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <h2 style={{ fontSize: 16 }}>Feed de {niche.name}</h2>
          {posts.length === 0 && (
            <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
              {niche.copy.feedEmpty}
            </div>
          )}
          {posts.map((post) => {
            const author = authors[post.author];
            if (!author) return null;
            return <PostCard key={post.id} post={post} author={author} nicheRp={nicheRpByPost[post.id]} />;
          })}
        </div>

        {/* aside */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card pad">
            <div className="sec-label" style={{ marginBottom: 12 }}>Top {niche.copy.member}s</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {top.map((profile, i) => (
                <Link key={profile.id} href={`/u/${profile.handle}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 14, width: 16, color: "var(--tx-3)" }}>{i + 1}</span>
                  <Avatar user={profile} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {profile.name.replace(/^You · /, "")}
                      </span>
                      {profile.verified && <VerifiedTick size={12} />}
                    </div>
                    <RankBadge rp={profile.rp} size="sm" niche={niche.slug} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {courses.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="sec-label">Cursos de {niche.name}</div>
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} instructor={instructors[course.instructorId]} />
              ))}
            </div>
          )}

          <Link href="/communities" className="btn ghost" style={{ justifyContent: "center" }}>
            <Icon name="compass" size={16} /> Servidores de la comunidad
          </Link>
        </aside>
      </div>
    </div>
  );
}
