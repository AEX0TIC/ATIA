import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATIA - Advanced Threat Intelligence Aggregator',
  description: 'Real-time threat intelligence aggregation and analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
