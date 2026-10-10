import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Gyeonggi-do Travel Assistant | AI Guide",
  description: "Interactive RAG assistant for exploring Gyeonggi Province, South Korea.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}