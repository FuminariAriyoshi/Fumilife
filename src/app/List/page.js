import { createClient } from "@/prismicio";
import ListPageClient from "@/components/ListPageClient";
import "./list.css";

/**
 * Prismic の mov から動画＋サムネイルを取得（ID順でソート）。
 */
function getVideoUrlFromDoc(data) {
  if (!data || typeof data !== "object") return null;
  const post = data.post;
  if (Array.isArray(post) && post.length > 0) {
    const first = post[0];
    if (first && typeof first === "object" && first.link_type === "Media" && first.url) {
      return first.url;
    }
  }
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

async function getVideos() {
  try {
    const client = createClient();
    const response = await client.getAllByType("mov");
    const videos = response
      .map((doc) => {
        const videoUrl = getVideoUrlFromDoc(doc.data);
        const thumbUrl = doc.data?.thumb?.url ?? null;
        if (!videoUrl) return null;
        return {
          id: doc.id,
          src: videoUrl,
          thumb: thumbUrl,
          date: doc.first_publication_date || doc.last_publication_date || null,
          // 必要に応じて追加フィールド（例: doc.data?.source, doc.data?.camera など）
        };
      })
      .filter(Boolean);
    // ID順でソート（文字列として比較）
    videos.sort((a, b) => a.id.localeCompare(b.id));
    return videos;
  } catch (err) {
    console.error("[Prismic] getVideos failed:", err);
    return [];
  }
}

export default async function ListPage() {
  let videos = [];
  try {
    videos = await getVideos();
  } catch (err) {
    console.error("[Prismic] ListPage getVideos:", err);
  }
  return <ListPageClient videos={videos} />;
}
