import "./globals.css";
import { AuthProvider } from "./AuthContext";

export const metadata = {
  title: "Validator",
  description: "Valida tu idea en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
