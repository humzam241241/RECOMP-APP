import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "RECOMP - 90 Day Body Recomposition",
  description: "Transform your body in 90 days with science-backed training, nutrition, and habit tracking.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
