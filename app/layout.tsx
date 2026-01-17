import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { AIChatbot } from "@/components/ai-chatbot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "শব্দভাণ্ডার - English to Bangla Vocabulary",
  description: "বৈজ্ঞানিক পদ্ধতিতে ইংরেজি থেকে বাংলা শব্দ শিখুন। Spaced Repetition ও Active Recall ব্যবহার করে কার্যকর শব্দ শেখা।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <body className={`${inter.variable} font-bangla antialiased`}>
        <AuthProvider>
          {children}
          <AIChatbot />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

