"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context";
import { useRouter, usePathname } from "next/navigation";
import SidebarSNEL from "./SidebarSNEL";

export default function LayoutSNEL({ children }: { children: React.ReactNode }) {
  const { userBilleterie, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    if (!userBilleterie) {
      router.replace("/login-snel");
    }
  }, [userBilleterie, router]);

  useEffect(() => {
    // Animation d'entrée lors du changement de page
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!userBilleterie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033A0] via-[#002280] to-[#0033A0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Redirection...</p>
        </div>
      </div>
    );
  }

  const getRoleLabel = () => {
    const email = userBilleterie.email || "";
    if (email.includes("facturation")) return "Service de Facturation";
    if (email.includes("guichet")) return "Guichet";
    if (email.includes("admin")) return "Administration";
    if (email.includes("agent")) return "Agent de Relevé";
    return "Client SNEL";
  };

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Sidebar */}
      <SidebarSNEL isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 transition-all min-h-screen">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 shadow-modern-lg">
          <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
            {/* Bouton menu hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-700"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Titre de la page */}
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-[#0033A0]">{getRoleLabel()}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Profil utilisateur */}
              {userBilleterie && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-all hover:shadow-md transform hover:scale-105 border border-transparent hover:border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-[#0033A0]/30 flex-shrink-0">
                    {userBilleterie.nom?.[0] || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-slate-900 leading-tight">
                      {userBilleterie.nom || "Utilisateur"}
                    </div>
                    <div className="text-xs text-slate-500 leading-tight">
                      {getRoleLabel()}
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton déconnexion */}
              <button
                onClick={() => {
                  logout();
                  router.replace("/login-snel");
                }}
                className="p-2 sm:px-3 sm:py-1.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all hover:shadow-md hover:shadow-red-500/10 transform hover:scale-105 active:scale-95 border border-transparent hover:border-red-200"
                title="Déconnexion"
              >
                <span className="text-base">🚪</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className={`min-h-[calc(100vh-73px)] bg-transparent px-3 sm:px-4 md:px-6 py-4 sm:py-6 ${isEntering ? "dashboard-enter" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

