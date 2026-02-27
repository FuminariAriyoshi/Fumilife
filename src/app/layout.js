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
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "FUMILIFE",
  description: "Who is Fumi? How does Fumi think? What does Fumi do?",
  openGraph: {
    title: "FUMILIFE",
    description: "Who is Fumi? How does Fumi think? What does Fumi do?",
    siteName: "FUMILIFE",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FUMILIFE",
    description: "Who is Fumi? How does Fumi think? What does Fumi do?",
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body data-theme="dark">
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

        </section>
        <GoogleAnalytics />
        <Cursor />
        <PageTransition />
        <LoadPageWrapper>
          {children}
        </LoadPageWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
