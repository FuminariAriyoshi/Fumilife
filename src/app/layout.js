
import "./globals.css";
import Cursor from '../components/Cursor';
import GoogleAnalytics from "../components/GoogleAnalytics";
import PageTransition from "../components/PageTransition";

export const metadata = {
  title: "Abe Portfolio",
  description: "Advanced Portfolio with Three.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <Cursor />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
