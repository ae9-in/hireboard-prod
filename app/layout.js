import { Inter, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: "HireBoard — Premium Job Board in India",
    template: "%s | HireBoard"
  },
  description: "Search verified job openings at top Indian companies with full salary visibility. Apply directly and fast. No spam jobs, fully moderated listings.",
  metadataBase: new URL("https://hireboard.in"),
  keywords: ["jobs in India", "software engineer jobs", "product manager jobs", "remote jobs", "Bangalore jobs", "hiring", "HireBoard"],
  openGraph: {
    title: "HireBoard — Premium Job Board in India",
    description: "Search verified job openings at top Indian companies with full salary visibility. Apply directly and fast.",
    url: "https://hireboard.in",
    siteName: "HireBoard",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireBoard — Premium Job Board",
    description: "Search verified job openings at top Indian companies with full salary visibility.",
  },
  alternates: {
    canonical: "https://hireboard.in"
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
