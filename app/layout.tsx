import { Providers } from './providers';
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers user={null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
