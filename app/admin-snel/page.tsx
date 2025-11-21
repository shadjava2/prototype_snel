"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useSNEL } from "@/lib/snel-context";
import { Facture, Paiement, Plainte, ReleveCompteur } from "@/data/types-snel";
import LayoutSNEL from "@/components/LayoutSNEL";

function AdminSNELContent() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    clients,
    factures,
    paiements,
    plaintes,
    releves,
    avis,
    zones,
    getClientById,
    getFactureByNumero,
    traiterPlainte,
    loadDemoData,
  } = useSNEL();

  const viewParam = searchParams.get("view") as "dashboard" | "clients" | "plaintes" | "statistiques" | null;
  const [view, setView] = useState<"dashboard" | "clients" | "plaintes" | "statistiques">(
    viewParam || "dashboard"
  );

  useEffect(() => {
    if (viewParam && ["dashboard", "clients", "plaintes", "statistiques"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "clients" | "plaintes" | "statistiques") => {
    setView(newView);
    router.push(`/admin-snel?view=${newView}`, { scroll: false });
  };

  // États pour le traitement des plaintes
  const [plainteSelectionnee, setPlainteSelectionnee] = useState<string | null>(null);
  const [reponsePlainte, setReponsePlainte] = useState<string>("");

  // Statistiques globales
  const stats = useMemo(() => {
    const aujourdhui = new Date().toISOString().split("T")[0];

    // Factures
    const facturesAujourdhui = factures.filter((f) => f.dateEmission.startsWith(aujourdhui));
    const facturesEnAttente = factures.filter((f) => f.statut === "EN_ATTENTE");
    const facturesPayees = factures.filter((f) => f.statut === "PAYEE");
    const montantTotalFactures = factures.reduce((sum, f) => sum + f.montantTTC, 0);
    const montantEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.solde, 0);
    const montantPaye = facturesPayees.reduce((sum, f) => sum + f.montantPaye, 0);

    // Paiements
    const paiementsAujourdhui = paiements.filter((p) => p.datePaiement.startsWith(aujourdhui));
    const montantPaiementsAujourdhui = paiementsAujourdhui.reduce((sum, p) => sum + p.montant, 0);

    // Relevés
    const relevesValides = releves.filter((r) => r.statut === "VALIDE");
    const relevesEnAttente = releves.filter((r) => r.statut === "SAISI");

    // Plaintes
    const plaintesNouvelles = plaintes.filter((p) => p.statut === "NOUVELLE");
    const plaintesEnCours = plaintes.filter((p) => p.statut === "EN_COURS");
    const plaintesResolues = plaintes.filter((p) => p.statut === "RESOLUE");

    // Clients
    const clientsActifs = clients.filter((c) => c.actif).length;

    // Avis
    const moyenneAvis = avis.length > 0
      ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
      : 0;

    return {
      factures: {
        totalAujourdhui: facturesAujourdhui.length,
        enAttente: facturesEnAttente.length,
        payees: facturesPayees.length,
        montantTotal: montantTotalFactures,
        montantEnAttente,
        montantPaye,
      },
      paiements: {
        aujourdhui: paiementsAujourdhui.length,
        montantAujourdhui: montantPaiementsAujourdhui,
      },
      releves: {
        valides: relevesValides.length,
        enAttente: relevesEnAttente.length,
      },
      plaintes: {
        nouvelles: plaintesNouvelles.length,
        enCours: plaintesEnCours.length,
        resolues: plaintesResolues.length,
      },
      clients: {
        actifs: clientsActifs,
        total: clients.length,
      },
      avis: {
        moyenne: Math.round(moyenneAvis * 10) / 10,
        total: avis.length,
      },
    };
  }, [factures, paiements, releves, plaintes, clients, avis]);

  // Traiter une plainte
  const handleTraiterPlainte = () => {
    if (!plainteSelectionnee || !reponsePlainte) {
      alert("❌ Veuillez sélectionner une plainte et saisir une réponse");
      return;
    }

    const traitePar = userBilleterie?.nom || "Admin SNEL";
    const success = traiterPlainte(plainteSelectionnee, reponsePlainte, traitePar);

    if (success) {
      alert("✅ Plainte traitée avec succès !");
      setPlainteSelectionnee(null);
      setReponsePlainte("");
    } else {
      alert("❌ Erreur lors du traitement de la plainte");
    }
  };

  return (
    <LayoutSNEL>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-fade-in">


          {/* Dashboard */}
          {view === "dashboard" && (
            <div className="space-y-6 animate-slide-in">
              {/* Alerte si peu de données */}
              {clients.length < 100 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-modern-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">🎲</div>
                      <div>
                        <h3 className="font-bold text-purple-900 mb-1">Charger des données de démonstration</h3>
                        <p className="text-sm text-purple-700">
                          Générez rapidement des données de test pour tester tous les scénarios (paiements Mobile Money, Carte, Cash, factures, plaintes)
                        </p>
                      </div>
                    </div>
                    <a
                      href="/admin-snel/demo"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold active:scale-95 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                      <span>⚡</span>
                      <span>Charger données démo</span>
                    </a>
                  </div>
                </div>
              )}

              {/* KPIs Principaux */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Factures en attente",
                    value: stats.factures.enAttente,
                    icon: "⏳",
                    color: "#FFD200",
                    sousLabel: `${stats.factures.montantEnAttente.toLocaleString("fr-FR")} FC`,
                  },
                  {
                    label: "Factures payées",
                    value: stats.factures.payees,
                    icon: "✅",
                    color: "#10b981",
                    sousLabel: `${stats.factures.montantPaye.toLocaleString("fr-FR")} FC`,
                  },
                  {
                    label: "Plaintes nouvelles",
                    value: stats.plaintes.nouvelles,
                    icon: "📝",
                    color: "#ef4444",
                    sousLabel: `${stats.plaintes.enCours} en cours`,
                  },
                  {
                    label: "Clients actifs",
                    value: stats.clients.actifs,
                    icon: "👥",
                    color: "#0033A0",
                    sousLabel: `${stats.clients.total} total`,
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
                    {kpi.sousLabel && (
                      <div className="text-xs text-slate-500 mt-1">{kpi.sousLabel}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Graphiques et détails */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paiements aujourd'hui */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Paiements aujourd'hui</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Nombre de paiements</span>
                        <span className="text-lg font-bold text-[#0033A0]">{stats.paiements.aujourdhui}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Montant total</span>
                        <span className="text-lg font-bold text-green-600">
                          {stats.paiements.montantAujourdhui.toLocaleString("fr-FR")} FC
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avis clients */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Avis clients</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Note moyenne</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-[#0033A0]">{stats.avis.moyenne}</span>
                          <span className="text-yellow-400 text-xl">⭐</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Total avis</span>
                        <span className="text-lg font-bold text-[#0033A0]">{stats.avis.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vue Clients */}
          {view === "clients" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Liste des clients</h2>
                {clients.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucun client enregistré</p>
                ) : (
                  <div className="space-y-3">
                    {clients.map((client) => {
                      const facturesClient = factures.filter((f) => f.clientId === client.id);
                      const facturesEnAttente = facturesClient.filter((f) => f.statut === "EN_ATTENTE");
                      const montantDu = facturesEnAttente.reduce((sum, f) => sum + f.solde, 0);

                      return (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-[#0033A0]">
                                {client.prenom} {client.nom}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  client.actif
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {client.actif ? "Actif" : "Inactif"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {client.numeroCompteur} • {client.zone}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              <span>Tél: {client.telephone}</span>
                              <span>Type: {client.typeAbonnement}</span>
                              <span>Factures: {facturesClient.length}</span>
                              {montantDu > 0 && (
                                <span className="text-red-600 font-semibold">
                                  Dû: {montantDu.toLocaleString("fr-FR")} FC
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vue Plaintes */}
          {view === "plaintes" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Gestion des plaintes</h2>
                {plaintes.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucune plainte enregistrée</p>
                ) : (
                  <div className="space-y-3">
                    {plaintes
                      .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
                      .map((plainte) => {
                        const client = getClientById(plainte.clientId);
                        const facture = plainte.factureId
                          ? factures.find((f) => f.id === plainte.factureId)
                          : null;

                        return (
                          <div
                            key={plainte.id}
                            className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-[#0033A0]">{plainte.numeroPlainte}</h3>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      plainte.statut === "RESOLUE"
                                        ? "bg-green-100 text-green-700"
                                        : plainte.statut === "EN_COURS"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {plainte.statut}
                                  </span>
                                  <span className="text-xs text-slate-500">{plainte.type}</span>
                                </div>
                                <p className="font-medium text-slate-900 mb-1">{plainte.sujet}</p>
                                <p className="text-sm text-slate-700 mb-2">{plainte.description}</p>
                                <div className="flex gap-4 text-xs text-slate-500">
                                  <span>
                                    Client: {client ? `${client.prenom} ${client.nom}` : "Inconnu"}
                                  </span>
                                  <span>Compteur: {plainte.numeroCompteur}</span>
                                  {facture && <span>Facture: {facture.numeroFacture}</span>}
                                  <span>
                                    {new Date(plainte.dateCreation).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {plainte.reponse && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                <p className="text-xs text-green-700 font-semibold mb-1">Réponse SNEL:</p>
                                <p className="text-sm text-slate-700">{plainte.reponse}</p>
                                {plainte.traitePar && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Traité par: {plainte.traitePar} le{" "}
                                    {plainte.dateResolution
                                      ? new Date(plainte.dateResolution).toLocaleDateString("fr-FR")
                                      : ""}
                                  </p>
                                )}
                              </div>
                            )}

                            {plainte.statut !== "RESOLUE" && (
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <textarea
                                  value={plainteSelectionnee === plainte.id ? reponsePlainte : ""}
                                  onChange={(e) => {
                                    setPlainteSelectionnee(plainte.id);
                                    setReponsePlainte(e.target.value);
                                  }}
                                  placeholder="Saisir la réponse à la plainte..."
                                  rows={3}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 mb-2"
                                />
                                <button
                                  onClick={() => {
                                    setPlainteSelectionnee(plainte.id);
                                    handleTraiterPlainte();
                                  }}
                                  disabled={plainteSelectionnee !== plainte.id || !reponsePlainte}
                                  className="px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
                                >
                                  ✅ Traiter la plainte
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vue Statistiques */}
          {view === "statistiques" && (
            <div className="space-y-6 animate-slide-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statistiques factures */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Statistiques factures</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total factures</span>
                      <span className="font-bold text-[#0033A0]">{factures.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Montant total</span>
                      <span className="font-bold text-[#0033A0]">
                        {stats.factures.montantTotal.toLocaleString("fr-FR")} FC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Montant payé</span>
                      <span className="font-bold text-green-600">
                        {stats.factures.montantPaye.toLocaleString("fr-FR")} FC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Montant en attente</span>
                      <span className="font-bold text-yellow-600">
                        {stats.factures.montantEnAttente.toLocaleString("fr-FR")} FC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistiques paiements */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Statistiques paiements</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total paiements</span>
                      <span className="font-bold text-[#0033A0]">{paiements.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Paiements aujourd'hui</span>
                      <span className="font-bold text-[#0033A0]">{stats.paiements.aujourdhui}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Montant aujourd'hui</span>
                      <span className="font-bold text-green-600">
                        {stats.paiements.montantAujourdhui.toLocaleString("fr-FR")} FC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Par canal</span>
                      <div className="text-right">
                        <div className="text-sm">
                          Self-service: {paiements.filter((p) => p.canalPaiement === "SELF_SERVICE").length}
                        </div>
                        <div className="text-sm">
                          Guichet: {paiements.filter((p) => p.canalPaiement === "GUICHET").length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutSNEL>
  );
}

export default function AdminSNELPage() {
  return (
    <Suspense fallback={
      <LayoutSNEL>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0033A0] mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      </LayoutSNEL>
    }>
      <AdminSNELContent />
    </Suspense>
  );
}

