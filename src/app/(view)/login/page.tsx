"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/about";
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error === "unauthorized") {
      setShowError(true);
      // Hapus error dari URL setelah 5 detik
      setTimeout(() => {
        router.replace("/login");
        setShowError(false);
      }, 5000);
    }
  }, [error, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setShowError(false);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i className="fa-solid fa-lock text-blue-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Silakan login untuk mengakses dashboard
          </p>
        </div>

        {showError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Akses Ditolak
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Email Anda tidak memiliki akses ke dashboard ini. Silakan hubungi administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isLoading ? "Memproses..." : "Masuk dengan Google"}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Akses Terbatas
              </span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Hanya email yang terotorisasi yang dapat mengakses dashboard ini.
          </p>
        </div>
      </div>
    </div>
  );
}