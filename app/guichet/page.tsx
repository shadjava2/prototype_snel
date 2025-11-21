"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useSNEL } from "@/lib/snel-context";
import { Facture, Paiement } from "@/data/types-snel";
import LayoutSNEL from "@/components/LayoutSNEL";

export default function GuichetPage() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    factures,
    paiements,
    effectuerPaiement,
    getFactureByNumero,
    getClientByNumeroCompteur,
    getPaiementsByClient,
  } = useSNEL();

  const viewParam = searchParams.get("view") as "paiement" | "historique" | null;
  const [view, setView] = useState<"paiement" | "historique">(viewParam || "paiement");

  useEffect(() => {
    if (viewParam && ["paiement", "historique"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "paiement" | "historique") => {
    setView(newView);
    router.push(`/guichet?view=${newView}`, { scroll: false });
  };

  // États pour le paiement
  const [numeroFacture, setNumeroFacture] = useState<string>("");
  const [factureTrouvee, setFactureTrouvee] = useState<Facture | null>(null);
  const [montantPaiement, setMontantPaiement] = useState<string>("");
  const [clientInfo, setClientInfo] = useState<any>(null);

  const agentId = userBilleterie?.id || "GUICHET-001";
  const agentNom = userBilleterie?.nom || "Agent Guichet";

  // Rechercher une facture
  const handleRechercherFacture = () => {
    if (!numeroFacture) {
      alert("❌ Veuillez saisir un numéro de facture");
      return;
    }

    const facture = getFactureByNumero(numeroFacture.toUpperCase());
    if (!facture) {
      alert("❌ Facture introuvable");
      setFactureTrouvee(null);
      setClientInfo(null);
      return;
    }

    const client = getClientByNumeroCompteur(facture.numeroCompteur);
    setFactureTrouvee(facture);
    setClientInfo(client);
    setMontantPaiement(facture.solde.toString());
  };

  // Effectuer un paiement en cash
  const handleEffectuerPaiement = () => {
    if (!factureTrouvee) {
      alert("❌ Aucune facture sélectionnée");
      return;
    }

    const montant = parseFloat(montantPaiement);
    if (isNaN(montant) || montant <= 0) {
      alert("❌ Montant invalide");
      return;
    }

    if (montant > factureTrouvee.solde) {
      alert(`❌ Le montant ne peut pas dépasser le solde (${factureTrouvee.solde.toLocaleString("fr-FR")} FC)`);
      return;
    }

    try {
      const paiement = effectuerPaiement(
        factureTrouvee.id,
        montant,
        "CASH",
        "GUICHET",
        agentId,
        `CASH-${Date.now()}`
      );

      if (paiement) {
        // Mettre à jour la facture trouvée
        const factureMiseAJour = getFactureByNumero(factureTrouvee.numeroFacture);
        if (factureMiseAJour) {
          setFactureTrouvee(factureMiseAJour);
        }

        alert(
          `✅ Paiement enregistré avec succès !\n\nFacture: ${factureTrouvee.numeroFacture}\nMontant: ${montant.toLocaleString("fr-FR")} FC\nMode: Cash\nAgent: ${agentNom}`
        );

        // Réinitialiser
        setNumeroFacture("");
        setMontantPaiement("");
        setFactureTrouvee(null);
        setClientInfo(null);
      }
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  // Statistiques du jour
  const stats = useMemo(() => {
    const aujourdhui = new Date().toISOString().split("T")[0];
    const paiementsAujourdhui = paiements.filter(
      (p) => p.datePaiement.startsWith(aujourdhui) && p.canalPaiement === "GUICHET"
    );
    const montantTotal = paiementsAujourdhui.reduce((sum, p) => sum + p.montant, 0);
    const nombrePaiements = paiementsAujourdhui.length;

    return {
      nombrePaiements,
      montantTotal,
    };
  }, [paiements]);

  // Paiements récents du guichet
  const paiementsRecents = useMemo(() => {
    return paiements
      .filter((p) => p.canalPaiement === "GUICHET")
      .sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime())
      .slice(0, 10);
  }, [paiements]);

  return (
    <LayoutSNEL>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          {/* Statistiques du jour */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700 mb-1">Paiements aujourd'hui</div>
                <div className="text-2xl font-bold text-[#0033A0]">{stats.nombrePaiements}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 mb-1">Montant total</div>
                <div className="text-2xl font-bold text-green-700">
                  {stats.montantTotal.toLocaleString("fr-FR")} FC
                </div>
              </div>
            </div>
          </div>


          {/* Vue Paiement */}
          {view === "paiement" && (
            <div className="space-y-6 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg max-w-2xl mx-auto">
                <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Enregistrer un paiement en cash</h2>

                <div className="space-y-4">
                  {/* Recherche de facture */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numéro de facture *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={numeroFacture}
                        onChange={(e) => setNumeroFacture(e.target.value.toUpperCase())}
                        placeholder="Ex: FAC-2024-001234"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                      <button
                        onClick={handleRechercherFacture}
                        className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all font-medium active:scale-95"
                      >
                        Rechercher
                      </button>
                    </div>
                  </div>

                  {/* Informations de la facture */}
                  {factureTrouvee && clientInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-blue-900 mb-2">Informations de la facture</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-blue-700">Client:</span>
                          <p className="font-semibold text-blue-900">
                            {clientInfo.prenom} {clientInfo.nom}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700">Compteur:</span>
                          <p className="font-semibold text-blue-900">{factureTrouvee.numeroCompteur}</p>
                        </div>
                        <div>
                          <span className="text-blue-700">Période:</span>
                          <p className="font-semibold text-blue-900">{factureTrouvee.periode}</p>
                        </div>
                        <div>
                          <span className="text-blue-700">Consommation:</span>
                          <p className="font-semibold text-blue-900">
                            {factureTrouvee.consommation} kWh
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700">Montant TTC:</span>
                          <p className="font-semibold text-blue-900">
                            {factureTrouvee.montantTTC.toLocaleString("fr-FR")} FC
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700">Solde restant:</span>
                          <p className="font-semibold text-[#0033A0]">
                            {factureTrouvee.solde.toLocaleString("fr-FR")} FC
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-300">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            factureTrouvee.statut === "PAYEE"
                              ? "bg-green-100 text-green-700"
                              : factureTrouvee.statut === "EN_RETARD"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          Statut: {factureTrouvee.statut}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Montant du paiement */}
                  {factureTrouvee && factureTrouvee.statut !== "PAYEE" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Montant à payer (FC) *
                      </label>
                      <input
                        type="number"
                        value={montantPaiement}
                        onChange={(e) => setMontantPaiement(e.target.value)}
                        placeholder="0"
                        min="0"
                        max={factureTrouvee.solde}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Solde maximum: {factureTrouvee.solde.toLocaleString("fr-FR")} FC
                      </p>
                    </div>
                  )}

                  {factureTrouvee && factureTrouvee.statut === "PAYEE" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-700 font-semibold">
                        ✅ Cette facture est déjà payée en totalité
                      </p>
                    </div>
                  )}

                  {/* Bouton de paiement */}
                  {factureTrouvee && factureTrouvee.statut !== "PAYEE" && (
                    <button
                      onClick={handleEffectuerPaiement}
                      disabled={!montantPaiement || parseFloat(montantPaiement) <= 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
                    >
                      💵 Enregistrer le paiement en cash
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vue Historique */}
          {view === "historique" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">
                  Historique des paiements en guichet
                </h2>
                {paiementsRecents.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucun paiement enregistré</p>
                ) : (
                  <div className="space-y-3">
                    {paiementsRecents.map((paiement) => {
                      const facture = factures.find((f) => f.id === paiement.factureId);
                      const client = facture
                        ? getClientByNumeroCompteur(facture.numeroCompteur)
                        : null;

                      return (
                        <div
                          key={paiement.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-[#0033A0]">
                                {paiement.numeroFacture}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  paiement.statut === "VALIDE"
                                    ? "bg-green-100 text-green-700"
                                    : paiement.statut === "EN_ATTENTE"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {paiement.statut}
                              </span>
                            </div>
                            {client && (
                              <p className="text-sm text-slate-600">
                                {client.prenom} {client.nom}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              <span>Mode: {paiement.modePaiement}</span>
                              <span>
                                {new Date(paiement.datePaiement).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {paiement.referenceTransaction && (
                                <span>Ref: {paiement.referenceTransaction}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-600">
                              {paiement.montant.toLocaleString("fr-FR")} FC
                            </div>
                            <div className="text-xs text-slate-500">Cash</div>
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

