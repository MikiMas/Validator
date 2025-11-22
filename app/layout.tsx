import "./globals.css";

export const metadata = {
  title: "Validator",
  description: "Valida tu idea en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
