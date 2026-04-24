import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'ClientBase — Requirements Portal',
  description: 'Advanced client requirements management portal. Track clients, manage requirements, and monitor progress.',
  keywords: 'client management, requirements portal, project tracking, dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
