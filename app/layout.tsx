import "./globals.css";
import { AuthProvider } from "./AuthContext";
import { GenerationProvider } from "./GenerationContext";

export const metadata = {
  title: "Validator",
  description: "Valida tu idea en minutos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <GenerationProvider>{children}</GenerationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
