import type { Metadata } from 'next';
import './globals.css';
import './grizzley.css';
import { UserProvider } from '../context/UserContext';
import GlobalChat from '../components/GlobalChat';
import GlobalFAQ from '../components/GlobalFAQ';
import AnalyticsProvider from '../components/AnalyticsProvider';

export const metadata: Metadata = {
  title: 'SSB Statistics',
  description: 'Watch the community play live on Kick',
  icons: {
    icon: '/ssb_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="referrer" content="no-referrer" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Ubuntu:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <UserProvider>
          <AnalyticsProvider>
            <div id="__next">{children}</div>
            <GlobalChat />
            <GlobalFAQ />
          </AnalyticsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
