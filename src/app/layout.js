import "./globals.css";
import TransitionLink from "../components/TransitionLink";
import BtnContainer from "../components/BtnContainer";
import "./2D.css";
import Cursor from "../components/Cursor";
import GoogleAnalytics from "../components/GoogleAnalytics";
import PageTransition from "../components/PageTransition";
import GrdLstContainer from "../components/GrdLstContainer";
import LoadPageWrapper from "../components/LoadPageWrapper";
import { createClient } from "@/prismicio";

export const metadata = {
  title: "FUMILIFE",
  description: "Who is Fumi? How does Fumi think? What does Fumi do?",
};

/**
 * LoadPage用の画像を取得（IDが大きい順）
 */
async function getLoadImages() {
  try {
    const client = createClient();
    const response = await client.getAllByType("mov");
    const images = response
      .map((doc) => {
        const thumbUrl = doc.data?.thumb?.url ?? null;
        if (!thumbUrl) return null;
        return {
          id: doc.id,
          url: thumbUrl,
        };
      })
      .filter(Boolean);
    // IDが大きい順にソート
    images.sort((a, b) => b.id.localeCompare(a.id));
    return images.map((img) => img.url);
  } catch (err) {
    console.error("[Prismic] getLoadImages failed:", err);
    return [];
  }
}

export default async function RootLayout({ children }) {
  const loadImages = await getLoadImages();
  
  return (
    <html lang="en">
      <body>
        <section>
          <div className="corner-element title">
            <TransitionLink href="/">FUMILIFE</TransitionLink>
            <TransitionLink href="/about">ABOUT</TransitionLink>
          </div>

          <div className="btn-container-wrapper">
            <BtnContainer />
          </div>
          <div className="GrdLst-container-wrapper">
            <GrdLstContainer />
          </div>

          <div className="corner-element sns">
          <ul className="sns-list">
            <li><a href="https://www.instagram.com/fumilife" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="https://www.youtube.com/@fumilife" target="_blank" rel="noopener noreferrer">Youtube</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">X</a></li>
          </ul>
        </div>  
      </section>
        <GoogleAnalytics />
        <Cursor />
        <PageTransition />
        <LoadPageWrapper images={loadImages}>
          {children}
        </LoadPageWrapper>
      </body>
    </html>
  );
}
