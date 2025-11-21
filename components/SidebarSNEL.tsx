"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useRouter } from "next/navigation";

type RoleSNEL = "CLIENT" | "AGENT" | "FACTURATION" | "GUICHET" | "ADMIN";

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: RoleSNEL[];
  viewParam?: string;
}

const menuItems: MenuItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: "📊",
    roles: ["CLIENT", "AGENT", "FACTURATION", "GUICHET", "ADMIN"],
  },
  {
    label: "Mes factures",
    href: "/client",
    icon: "📄",
    roles: ["CLIENT"],
    viewParam: "factures",
  },
  {
    label: "Paiement",
    href: "/client",
    icon: "💳",
    roles: ["CLIENT"],
    viewParam: "paiement",
  },
  {
    label: "Mes plaintes",
    href: "/client",
    icon: "📝",
    roles: ["CLIENT"],
    viewParam: "plaintes",
  },
  {
    label: "Mes avis",
    href: "/client",
    icon: "⭐",
    roles: ["CLIENT"],
    viewParam: "avis",
  },
  {
    label: "Dashboard",
    href: "/agent",
    icon: "📊",
    roles: ["AGENT"],
    viewParam: "dashboard",
  },
  {
    label: "Nouveau relevé",
    href: "/agent",
    icon: "📝",
    roles: ["AGENT"],
    viewParam: "releve",
  },
  {
    label: "Historique",
    href: "/agent",
    icon: "📋",
    roles: ["AGENT"],
    viewParam: "historique",
  },
  {
    label: "Dashboard",
    href: "/facturation",
    icon: "📊",
    roles: ["FACTURATION"],
    viewParam: "dashboard",
  },
  {
    label: "Générer factures",
    href: "/facturation",
    icon: "⚡",
    roles: ["FACTURATION"],
    viewParam: "generer",
  },
  {
    label: "Liste factures",
    href: "/facturation",
    icon: "📋",
    roles: ["FACTURATION"],
    viewParam: "factures",
  },
  {
    label: "Nouveau paiement",
    href: "/guichet",
    icon: "💵",
    roles: ["GUICHET"],
    viewParam: "paiement",
  },
  {
    label: "Historique",
    href: "/guichet",
    icon: "📋",
    roles: ["GUICHET"],
    viewParam: "historique",
  },
  {
    label: "Dashboard",
    href: "/admin-snel",
    icon: "📊",
    roles: ["ADMIN"],
    viewParam: "dashboard",
  },
  {
    label: "Clients",
    href: "/admin-snel",
    icon: "👥",
    roles: ["ADMIN"],
    viewParam: "clients",
  },
  {
    label: "Plaintes",
    href: "/admin-snel",
    icon: "📝",
    roles: ["ADMIN"],
    viewParam: "plaintes",
  },
  {
    label: "Statistiques",
    href: "/admin-snel",
    icon: "📈",
    roles: ["ADMIN"],
    viewParam: "statistiques",
  },
  {
    label: "Données démo",
    href: "/admin-snel/demo",
    icon: "🎲",
    roles: ["ADMIN"],
  },
];

interface SidebarSNELProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarSNEL({ isOpen = false, onClose }: SidebarSNELProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userBilleterie } = useAuth();

  if (!userBilleterie) return null;

  // Déterminer le rôle SNEL basé sur l'email
  const getSNELRole = (): RoleSNEL => {
    const email = userBilleterie.email || "";
    if (email.includes("facturation")) return "FACTURATION";
    if (email.includes("guichet")) return "GUICHET";
    if (email.includes("admin")) return "ADMIN";
    if (email.includes("agent")) return "AGENT";
    return "CLIENT";
  };

  const snelRole = getSNELRole();
  const filteredMenu = menuItems.filter((item) => item.roles.includes(snelRole));

  const isActive = (item: MenuItem) => {
    const isOnSamePage = pathname === item.href;
    const currentView = searchParams.get("view");

    if (isOnSamePage && item.viewParam) {
      if (!currentView && item.viewParam === getDefaultViewForPath(pathname)) {
        return true;
      }
      return currentView === item.viewParam;
    }

    return isOnSamePage;
  };

  const getDefaultViewForPath = (path: string): string => {
    if (path === "/client") return "factures";
    if (path === "/agent") return "dashboard";
    if (path === "/facturation") return "dashboard";
    if (path === "/guichet") return "paiement";
    if (path === "/admin-snel") return "dashboard";
    return "";
  };

  const handleMenuItemClick = (item: MenuItem, e: React.MouseEvent) => {
    e.preventDefault();
    if (onClose) onClose();

    const url = item.viewParam
      ? `${item.href}?view=${item.viewParam}`
      : item.href;

    router.push(url);
  };

  const getRoleLabel = () => {
    switch (snelRole) {
      case "CLIENT":
        return "Espace Client";
      case "AGENT":
        return "Agent de Relevé";
      case "FACTURATION":
        return "Service Facturation";
      case "GUICHET":
        return "Guichet";
      case "ADMIN":
        return "Administration";
      default:
        return "SNEL";
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          w-64 bg-gradient-to-b from-white via-slate-50/50 to-white border-r border-slate-200/60
          min-h-screen fixed left-0 top-0 z-50 shadow-modern-xl backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Titre en haut */}
        <div className="h-16 border-b border-slate-200/80 flex items-center justify-between px-4 bg-gradient-to-r from-[#0033A0]/5 via-[#FFD200]/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0033A0] to-[#002280] flex items-center justify-center shadow-lg shadow-[#0033A0]/30 animate-pulse-glow">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0033A0] leading-tight">SNEL</div>
              <div className="text-xs text-slate-600 leading-tight">{getRoleLabel()}</div>
            </div>
          </div>
          {/* Bouton fermer mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-all text-slate-600"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {filteredMenu.map((item) => {
            const active = isActive(item);

            return (
              <button
                key={`${item.href}-${item.viewParam || ''}`}
                onClick={(e) => handleMenuItemClick(item, e)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-left ${
                  active
                    ? "bg-gradient-to-r from-[#0033A0] to-[#002280] text-white font-medium shadow-lg shadow-[#0033A0]/30 transform scale-[1.02]"
                    : "text-slate-700 hover:bg-gradient-to-r hover:from-[#0033A0]/10 hover:to-[#FFD200]/10 hover:text-[#0033A0] hover:shadow-sm hover:border border-[#0033A0]/20"
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer avec info utilisateur */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/80 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="text-xs text-slate-600 text-center">
            <div className="font-semibold text-[#0033A0] mb-1">SNEL RDC</div>
            <div>Plateforme CRM</div>
          </div>
        </div>
      </aside>
    </>
  );
}

