import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FinSight - Intelligent Financial Management Platform",
  description: "AI-powered platform for project financial management, forecasting, and analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
