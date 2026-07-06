import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: {
    default: "MY WORKER",
    template: "%s | MY WORKER"
  },
  description: "Premium Worker Management Platform - MY WORKER",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            containerClassName="md:bottom-6 md:right-6 bottom-20"
          />
        </Providers>
      </body>
    </html>
  );
}