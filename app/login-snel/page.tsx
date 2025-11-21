"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useEffect } from "react";

type RoleSNEL = "CLIENT" | "AGENT" | "FACTURATION" | "GUICHET" | "ADMIN";

export default function LoginSNELPage() {
  const router = useRouter();
  const { loginBilleterie, userBilleterie } = useAuth();

  const handleSelectRole = (role: RoleSNEL) => {
    // Créer un utilisateur SNEL avec le rôle approprié
    const userSNEL = {
      id: `SNEL-${role}-001`,
      nom: `Utilisateur ${role} SNEL`,
      email: `${role.toLowerCase()}@snel.rdc`,
      role: role === "ADMIN" ? "ADMIN_OPERATEUR" : role === "FACTURATION" || role === "GUICHET" ? "AGENT" : role,
    };

    loginBilleterie(userSNEL.role as any, undefined);
    localStorage.setItem("userBilleterie", JSON.stringify(userSNEL));

    // Rediriger vers la page correspondante
    switch (role) {
      case "CLIENT":
        router.push("/client");
        break;
      case "AGENT":
        router.push("/agent");
        break;
      case "FACTURATION":
        router.push("/facturation");
        break;
      case "GUICHET":
        router.push("/guichet");
        break;
      case "ADMIN":
        router.push("/admin-snel");
        break;
    }
  };

  // Si déjà connecté, rediriger
  useEffect(() => {
    if (userBilleterie) {
      const email = userBilleterie.email || "";
      if (email.includes("snel") || email.includes("electricite")) {
        switch (userBilleterie.role) {
          case "CLIENT":
            router.push("/client");
            break;
          case "AGENT":
            router.push("/agent");
            break;
          case "ADMIN_OPERATEUR":
            router.push("/admin-snel");
            break;
          default:
            router.push("/client");
        }
      }
    }
  }, [userBilleterie, router]);

  if (userBilleterie) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0033A0] via-[#002280] to-[#0033A0] relative overflow-hidden">

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-slide-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD200] to-[#FFE066] flex items-center justify-center shadow-lg">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Plateforme de Facturation CRM - SNEL</h1>
          <p className="text-white/80">Société Nationale d'Électricité - RDC</p>
          <p className="text-white/60 text-sm mt-2">Sélectionnez un profil pour continuer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CLIENT */}
          <button
            onClick={() => handleSelectRole("CLIENT")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Client</h3>
                <p className="text-sm text-slate-600">Espace client</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Consulter vos factures, effectuer des paiements, déposer des plaintes et donner votre avis
            </p>
          </button>

          {/* AGENT */}
          <button
            onClick={() => handleSelectRole("AGENT")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Agent de Relevé</h3>
                <p className="text-sm text-slate-600">Saisie des relevés</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Enregistrer les relevés de compteur pour permettre la génération des factures
            </p>
          </button>

          {/* FACTURATION */}
          <button
            onClick={() => handleSelectRole("FACTURATION")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Service de Facturation</h3>
                <p className="text-sm text-slate-600">Génération des factures</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Générer les factures à partir des relevés validés et gérer le cycle de facturation
            </p>
          </button>

          {/* GUICHET */}
          <button
            onClick={() => handleSelectRole("GUICHET")}
            className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white hover:shadow-modern-xl hover:scale-105 transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💵
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Guichet</h3>
                <p className="text-sm text-slate-600">Paiement en espèces</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Enregistrer les paiements en cash effectués par les clients au guichet
            </p>
          </button>

          {/* ADMIN */}
          <button
            onClick={() => handleSelectRole("ADMIN")}
            className="bg-gradient-to-br from-[#FFD200] to-[#FFE066] border border-[#FFD200]/30 rounded-xl p-6 hover:shadow-modern-xl hover:scale-105 transition-all text-left group md:col-span-2"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0033A0]">Administration SNEL</h3>
                <p className="text-sm text-slate-700">Gestion globale</p>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Tableau de bord administratif, gestion des clients, traitement des plaintes et statistiques globales
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

