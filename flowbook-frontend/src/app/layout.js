import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

export const metadata = {
  title: "FlowBook",
  description: "Premium booking SaaS for barbers and salons."
};

export default function RootLayout({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {clientId ? (
          <GoogleOAuthProvider clientId={clientId}>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        )}
      </body>
    </html>
  );
}