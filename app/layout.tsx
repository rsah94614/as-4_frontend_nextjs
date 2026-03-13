import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

import DevLoggerProvider from "@/providers/DevLoggerProvider";

export const metadata = {
  title: "Employee Reward & Recognition",
  description: "R&R System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DevLoggerProvider>{children}</DevLoggerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
