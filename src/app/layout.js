
import "./globals.css";
import TransitionLink from "../components/TransitionLink";
import BtnContainer from "../components/BtnContainer";
import "./2D.css";
import Cursor from "../components/Cursor";
import GoogleAnalytics from "../components/GoogleAnalytics";
import PageTransition from "../components/PageTransition";
import GrdLstContainer from "../components/GrdLstContainer";

export const metadata = {
  title: "FUMILIFE",
  description: "Who is Fumi? How does Fumi think? What does Fumi do?",
};

export default function RootLayout({ children }) {
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
        {children}
      </body>
    </html>
  );
}
