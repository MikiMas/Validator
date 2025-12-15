import "./globals.css";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { GenerationProvider } from "./contexts/generation/GenerationContext";

export const metadata = {
  title: "Buff Launch",
  description: "Valida tu idea en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <AuthProvider>
          <GenerationProvider>{children}</GenerationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
