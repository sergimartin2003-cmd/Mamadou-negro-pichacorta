import Link from "next/link";
import { searchAll, getNicheRp, getProfilesByIds } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";
import { Avatar, RankBadge, VerifiedTick } from "@/components/ui";
import { PostCard } from "@/components/feed/post-card";
import { CourseCard } from "@/components/marketplace/course-card";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const { profiles, posts, courses } = await searchAll(query);
  const total = profiles.length + posts.length + courses.length;

  const authors = await getProfilesByIds([...new Set(posts.map((p) => p.author))]);
  const nicheRpEntries = await Promise.all(
    posts.map(
      async (post) =>
        [post.id, (await getNicheRp(post.author, post.niche)) ?? authors[post.author]?.rp ?? 0] as const,
    ),
  );
  const nicheRpByPost = Object.fromEntries(nicheRpEntries);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22 }}>Búsqueda</h1>
        <form action="/search" style={{ marginTop: 12 }}>
          <input
            className="input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Busca emprendedores, posts, cursos…"
            style={{ height: 44, fontSize: 14 }}
            autoFocus
          />
        </form>
        {query && (
          <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 8 }}>
            {total} {total === 1 ? "resultado" : "resultados"} para “{query}”
          </div>
        )}
      </div>

      {!query && (
        <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
          Escribe para buscar en toda la red: perfiles, posts del feed y cursos del marketplace.
        </div>
      )}

      {query && total === 0 && (
        <div className="card pad" style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}>
          Sin resultados para “{query}”. Prueba con otro término o un #tag.
        </div>
      )}

      {profiles.length > 0 && (
        <section>
          <div className="sec-label" style={{ marginBottom: 10 }}>Emprendedores</div>
          <div className="card" style={{ overflow: "hidden" }}>
            {profiles.map((p) => (
              <Link
                key={p.id}
                href={`/u/${p.handle}`}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line-1)", textDecoration: "none", color: "inherit" }}
              >
                <Avatar user={p} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600 }}>
                    {p.name.replace(/^You · /, "")}
                    {p.verified && <VerifiedTick size={13} />}
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>
                    @{p.handle} · {p.followers.toLocaleString()} seguidores
                  </div>
                </div>
                <RankBadge rp={p.rp} size="sm" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="sec-label">Posts</div>
          {posts.map((post) => {
            const author = authors[post.author] ?? byId[post.author];
            if (!author) return null;
            return (
              <PostCard key={post.id} post={post} author={author} nicheRp={nicheRpByPost[post.id]} layout="compact" />
            );
          })}
        </section>
      )}

      {courses.length > 0 && (
        <section>
          <div className="sec-label" style={{ marginBottom: 10 }}>Cursos</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} instructor={byId[course.instructorId]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
