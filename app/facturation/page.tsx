"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useSNEL } from "@/lib/snel-context";
import { ReleveCompteur, Facture } from "@/data/types-snel";
import LayoutSNEL from "@/components/LayoutSNEL";

export default function FacturationPage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    releves,
    factures,
    genererFacture,
    getFactureByNumero,
    getClientByNumeroCompteur,
    getReleveById,
    zones,
  } = useSNEL();

  const viewParam = searchParams.get("view") as "dashboard" | "generer" | "factures" | null;
  const [view, setView] = useState<"dashboard" | "generer" | "factures">(
    viewParam || "dashboard"
  );

  useEffect(() => {
    if (viewParam && ["dashboard", "generer", "factures"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "generer" | "factures") => {
    setView(newView);
    router.push(`/facturation?view=${newView}`, { scroll: false });
  };

  // États pour la génération de factures
  const [periode, setPeriode] = useState<string>(
    new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  );
  const [zoneFiltre, setZoneFiltre] = useState<string>("all");
  const [relevesSelectionnes, setRelevesSelectionnes] = useState<Set<string>>(new Set());

  // Filtrer les relevés validés qui n'ont pas encore de facture
  const relevesDisponibles = useMemo(() => {
    return releves.filter((r) => {
      // Seulement les relevés validés
      if (r.statut !== "VALIDE") return false;

      // Seulement ceux qui n'ont pas encore de facture
      const aDejaFacture = factures.some((f) => f.releveId === r.id);
      if (aDejaFacture) return false;

      // Filtrer par zone si nécessaire
      if (zoneFiltre !== "all") {
        const client = getClientByNumeroCompteur(r.numeroCompteur);
        if (!client || client.zone !== zoneFiltre) return false;
      }

      return true;
    });
  }, [releves, factures, zoneFiltre, getClientByNumeroCompteur]);

  // Statistiques
  const stats = useMemo(() => {
    const aujourdhui = new Date().toISOString().split("T")[0];
    const facturesAujourdhui = factures.filter((f) =>
      f.dateEmission.startsWith(aujourdhui)
    );
    const facturesEnAttente = factures.filter((f) => f.statut === "EN_ATTENTE");
    const facturesPayees = factures.filter((f) => f.statut === "PAYEE");
    const montantTotal = factures.reduce((sum, f) => sum + f.montantTTC, 0);
    const montantEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.solde, 0);

    return {
      totalAujourdhui: facturesAujourdhui.length,
      enAttente: facturesEnAttente.length,
      payees: facturesPayees.length,
      montantTotal,
      montantEnAttente,
      relevesDisponibles: relevesDisponibles.length,
    };
  }, [factures, relevesDisponibles]);

  // Toggle sélection d'un relevé
  const toggleReleve = (releveId: string) => {
    const nouveau = new Set(relevesSelectionnes);
    if (nouveau.has(releveId)) {
      nouveau.delete(releveId);
    } else {
      nouveau.add(releveId);
    }
    setRelevesSelectionnes(nouveau);
  };

  // Sélectionner tous les relevés
  const selectAll = () => {
    setRelevesSelectionnes(new Set(relevesDisponibles.map((r) => r.id)));
  };

  // Désélectionner tous
  const deselectAll = () => {
    setRelevesSelectionnes(new Set());
  };

  // Générer les factures pour les relevés sélectionnés
  const handleGenererFactures = () => {
    if (relevesSelectionnes.size === 0) {
      alert("❌ Veuillez sélectionner au moins un relevé");
      return;
    }

    if (!periode) {
      alert("❌ Veuillez saisir une période");
      return;
    }

    const facturesGenerees: Facture[] = [];
    const erreurs: string[] = [];

    relevesSelectionnes.forEach((releveId) => {
      try {
        const facture = genererFacture(releveId, periode);
        if (facture) {
          facturesGenerees.push(facture);
        } else {
          erreurs.push(`Relevé ${releveId}: Impossible de générer la facture`);
        }
      } catch (error: any) {
        erreurs.push(`Relevé ${releveId}: ${error.message}`);
      }
    });

    if (facturesGenerees.length > 0) {
      alert(
        `✅ ${facturesGenerees.length} facture(s) générée(s) avec succès !\n\n${erreurs.length > 0 ? `⚠️ ${erreurs.length} erreur(s):\n${erreurs.join("\n")}` : ""}`
      );
      setRelevesSelectionnes(new Set());
      updateView("factures");
    } else {
      alert(`❌ Aucune facture générée. Erreurs:\n${erreurs.join("\n")}`);
    }
  };

  return (
    <LayoutSNEL>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-fade-in">


          {/* Dashboard */}
          {view === "dashboard" && (
            <div className="space-y-6 animate-slide-in">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Factures aujourd'hui",
                    value: stats.totalAujourdhui,
                    icon: "📄",
                    color: "#0033A0",
                  },
                  {
                    label: "En attente de paiement",
                    value: stats.enAttente,
                    icon: "⏳",
                    color: "#FFD200",
                  },
                  {
                    label: "Factures payées",
                    value: stats.payees,
                    icon: "✅",
                    color: "#10b981",
                  },
                  {
                    label: "Montant en attente",
                    value: `${stats.montantEnAttente.toLocaleString("fr-FR")} FC`,
                    icon: "💰",
                    color: "#8b5cf6",
                  },
                ].map((kpi, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 hover:shadow-modern-lg hover:scale-[1.02] transition-all"
                    style={{ borderLeft: `4px solid ${kpi.color}` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{kpi.icon}</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">{kpi.label}</div>
                    <div className="text-2xl font-bold text-[#0033A0]">{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Alertes */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Alertes</h2>
                {stats.relevesDisponibles > 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">
                          {stats.relevesDisponibles} relevé(s) validé(s) en attente de facturation
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Vous pouvez générer les factures depuis l'onglet "Générer factures"
                        </p>
                      </div>
                      <button
                        onClick={() => updateView("generer")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium active:scale-95"
                      >
                        Générer maintenant
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    Aucun relevé en attente de facturation
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Générer factures */}
          {view === "generer" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
                <h2 className="text-xl font-semibold text-[#0033A0] mb-4">
                  Générer des factures à partir des relevés validés
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Période de facturation *
                    </label>
                    <input
                      type="text"
                      value={periode}
                      onChange={(e) => setPeriode(e.target.value)}
                      placeholder="Ex: Janvier 2024"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Filtrer par zone
                    </label>
                    <select
                      value={zoneFiltre}
                      onChange={(e) => setZoneFiltre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    >
                      <option value="all">Toutes les zones</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.nom}>
                          {zone.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium active:scale-95"
                    >
                      Tout sélectionner
                    </button>
                    <button
                      onClick={deselectAll}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all font-medium active:scale-95"
                    >
                      Tout désélectionner
                    </button>
                    <div className="flex-1"></div>
                    <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">
                        {relevesSelectionnes.size} sélectionné(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Liste des relevés */}
                {relevesDisponibles.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                    <p className="text-slate-500">Aucun relevé disponible pour la facturation</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {relevesDisponibles.map((releve) => {
                      const client = getClientByNumeroCompteur(releve.numeroCompteur);
                      const isSelected = relevesSelectionnes.has(releve.id);

                      return (
                        <div
                          key={releve.id}
                          onClick={() => toggleReleve(releve.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 shadow-md"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleReleve(releve.id)}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-[#0033A0]">
                                  {releve.numeroCompteur}
                                </h3>
                                {client && (
                                  <span className="text-sm text-slate-600">
                                    {client.prenom} {client.nom}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-xs text-slate-500">
                                <span>
                                  Index: {releve.indexAncien} → {releve.indexNouveau} kWh
                                </span>
                                <span>Consommation: {releve.consommation} kWh</span>
                                <span>
                                  {new Date(releve.dateReleve).toLocaleDateString("fr-FR")}
                                </span>
                                {client && <span>Zone: {client.zone}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={handleGenererFactures}
                  disabled={relevesSelectionnes.size === 0}
                  className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
                >
                  ⚡ Générer {relevesSelectionnes.size > 0 ? `${relevesSelectionnes.size} ` : ""}
                  facture(s)
                </button>
              </div>
            </div>
          )}

          {/* Liste des factures */}
          {view === "factures" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Toutes les factures</h2>
                {factures.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucune facture générée</p>
                ) : (
                  <div className="space-y-3">
                    {factures
                      .sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime())
                      .map((facture) => {
                        const client = getClientByNumeroCompteur(facture.numeroCompteur);
                        return (
                          <div
                            key={facture.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-[#0033A0]">
                                  {facture.numeroFacture}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    facture.statut === "PAYEE"
                                      ? "bg-green-100 text-green-700"
                                      : facture.statut === "EN_RETARD"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {facture.statut}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600">
                                {client ? `${client.prenom} ${client.nom}` : "Client inconnu"} •{" "}
                                {facture.numeroCompteur}
                              </p>
                              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                <span>Période: {facture.periode}</span>
                                <span>Consommation: {facture.consommation} kWh</span>
                                <span>
                                  Échéance: {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-[#0033A0]">
                                {facture.montantTTC.toLocaleString("fr-FR")} FC
                              </div>
                              {facture.statut !== "PAYEE" && (
                                <div className="text-sm text-slate-600">
                                  Solde: {facture.solde.toLocaleString("fr-FR")} FC
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutSNEL>
  );
}

