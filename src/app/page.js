import { createClient } from "@/prismicio";
import TwoDPageClient from "@/components/TwoDPageClient";

/**
 * Prismic の mov から動画＋サムネイルを取得。
 * - Link to Media フィールド（API ID は何でも可）から動画URL
 * - thumb: Image から読み込み中用サムネイル
 */
function getVideoUrlFromDoc(data) {
  if (!data || typeof data !== "object") return null;
  // post 配列（Repeatable Link to Media）の先頭から動画URLを取得
  const post = data.post;
  if (Array.isArray(post) && post.length > 0) {
    const first = post[0];
    if (first && typeof first === "object" && first.link_type === "Media" && first.url) {
      return first.url;
    }
  }
  // 単一フィールド: video / movie / media など
  for (const key of ["video", "movie", "media", "link_to_media"]) {
    const field = data[key];
    if (field && typeof field === "object" && "url" in field && field.url) {
      return field.url;
    }
  }
  for (const value of Object.values(data)) {
    if (
      value &&
      typeof value === "object" &&
      "link_type" in value &&
      value.link_type === "Media" &&
      value.url
    ) {
      return value.url;
    }
  }
  return null;
}

/**
 * ソート用の値を取得（数が大きい＝新しい＝先頭に表示）
 * Prismic の Number フィールド（API ID: order または number）があればそれを使用、なければ公開日
 */
function getSortKey(doc) {
  const data = doc.data || {};
  const num = data.order ?? data.number;
  if (typeof num === "number") return num;
  if (typeof num === "string" && num !== "") return Number(num) || 0;
  return doc.first_publication_date || doc.last_publication_date || doc.uid || "";
}

async function getVideos() {
  try {
    const client = createClient();
    const response = await client.getAllByType("mov");
    const videos = response
      .map((doc) => {
        const videoUrl = getVideoUrlFromDoc(doc.data);
        const thumbUrl = doc.data?.thumb?.url ?? null;
        if (!videoUrl) return null;
        return { src: videoUrl, thumb: thumbUrl, _sortKey: getSortKey(doc) };
      })
      .filter(Boolean);
    // 数が大きいものから（降順）→ 先頭が「中心」のメイン
    videos.sort((a, b) => {
      const ka = a._sortKey;
      const kb = b._sortKey;
      if (typeof ka === "number" && typeof kb === "number") return kb - ka;
      return String(kb).localeCompare(String(ka), undefined, { numeric: true });
    });
    return videos.map(({ _sortKey, ...v }) => v);
  } catch (err) {
    console.error("[Prismic] getVideos failed:", err);
    return [];
  }
}

export default async function Page() {
  let videos = [];
  try {
    videos = await getVideos();
  } catch (err) {
    console.error("[Prismic] Page getVideos:", err);
  }
  return <TwoDPageClient videos={videos} />;
}
