import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientBase — Requirements Portal',
  description: 'Advanced client requirements management portal. Track clients, manage requirements, and monitor progress with a sleek dashboard.',
  keywords: 'client management, requirements portal, project tracking, dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
