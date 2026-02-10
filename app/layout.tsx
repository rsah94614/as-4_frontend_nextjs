//Placeholder for now, waiting for the figma 
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
