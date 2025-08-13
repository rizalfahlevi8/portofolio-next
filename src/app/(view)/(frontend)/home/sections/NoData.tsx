"use client";

import { Card, CardContent } from "@/components/ui/card";

export function HomeNoData({ onReload }: { onReload?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center flex flex-col items-center">
          {/* SVG ilustrasi inline */}
          <svg width="80" height="80" fill="none" className="mb-4" viewBox="0 0 80 80">
            <rect width="80" height="80" rx="16" fill="#F3F4F6"/>
            <path d="M30 36h20M30 44h12" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="40" cy="56" r="4" fill="#A1A1AA"/>
            <rect x="24" y="30" width="32" height="24" rx="6" stroke="#A1A1AA" strokeWidth="2" fill="#fff"/>
          </svg>
          <h2 className="text-2xl font-bold mb-2">Data Portfolio Gagal Termuat</h2>
          <p className="text-muted-foreground mb-4">
            Data portfolio belum tersedia atau gagal dimuat.<br />Coba muat ulang halaman atau kontak admin.
          </p>
          {onReload && (
            <button
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
              onClick={onReload}
            >
              Muat Ulang
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}