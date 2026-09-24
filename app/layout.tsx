import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollProgress from "@/components/ScrollProgress";
import AmbientGlow from "@/components/AmbientGlow";

export const metadata: Metadata = {
  title: "PlanetPulse — Carbon Footprint Tracker",
  description:
    "Track the carbon impact of your everyday choices and see where small changes can make a difference. Log activities, calculate CO₂, set weekly targets, and understand your footprint.",
  keywords: [
    "carbon footprint",
    "CO2 tracker",
    "climate tech",
    "sustainability",
    "emissions calculator",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('planetpulse_theme');
                  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <ScrollProgress />
          <AmbientGlow />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
