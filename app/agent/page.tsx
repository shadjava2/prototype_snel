"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useSNEL } from "@/lib/snel-context";
import { ReleveCompteur, StatutReleve } from "@/data/types-snel";
import LayoutSNEL from "@/components/LayoutSNEL";

function AgentContent() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    creerReleve,
    validerReleve,
    rejeterReleve,
    getRelevesByAgent,
    getCompteurByNumero,
    getClientByNumeroCompteur,
    zones,
  } = useSNEL();

  const viewParam = searchParams.get("view") as "dashboard" | "releve" | "historique" | null;
  const [view, setView] = useState<"dashboard" | "releve" | "historique">(
    viewParam || "dashboard"
  );

  useEffect(() => {
    if (viewParam && ["dashboard", "releve", "historique"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "dashboard" | "releve" | "historique") => {
    setView(newView);
    router.push(`/agent?view=${newView}`, { scroll: false });
  };

  // États pour le relevé
  const [numeroCompteur, setNumeroCompteur] = useState<string>("");
  const [indexAncien, setIndexAncien] = useState<string>("");
  const [indexNouveau, setIndexNouveau] = useState<string>("");
  const [dateReleve, setDateReleve] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [observations, setObservations] = useState<string>("");
  const [releves, setReleves] = useState<ReleveCompteur[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<"all" | StatutReleve>("all");

  const agentId = userBilleterie?.id || "AGT-001";
  const agentNom = userBilleterie?.nom || "Agent";

  // Charger les relevés de l'agent
  useEffect(() => {
    const relevesAgent = getRelevesByAgent(agentId);
    setReleves(relevesAgent);
  }, [agentId, getRelevesByAgent]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const aujourdhui = new Date().toISOString().split("T")[0];
    const relevesAujourdhui = releves.filter((r) =>
      r.dateSaisie.startsWith(aujourdhui)
    );
    const relevesValides = releves.filter((r) => r.statut === "VALIDE");
    const relevesEnAttente = releves.filter((r) => r.statut === "SAISI");

    return {
      totalAujourdhui: relevesAujourdhui.length,
      totalValides: relevesValides.length,
      enAttente: relevesEnAttente.length,
      consommationTotale: relevesValides.reduce((sum, r) => sum + r.consommation, 0),
    };
  }, [releves]);

  // Vérifier le compteur et charger l'index ancien
  const handleVerifierCompteur = () => {
    if (!numeroCompteur) {
      alert("❌ Veuillez saisir un numéro de compteur");
      return;
    }

    const compteur = getCompteurByNumero(numeroCompteur);
    if (!compteur) {
      alert("❌ Compteur introuvable");
      return;
    }

    // Trouver le dernier relevé validé pour ce compteur
    const derniersReleves = releves
      .filter((r) => r.numeroCompteur === numeroCompteur && r.statut === "VALIDE")
      .sort((a, b) => new Date(b.dateReleve).getTime() - new Date(a.dateReleve).getTime());

    if (derniersReleves.length > 0) {
      setIndexAncien(derniersReleves[0].indexNouveau.toString());
    } else {
      // Si pas de relevé précédent, demander à l'agent de saisir
      setIndexAncien("");
    }

    const client = getClientByNumeroCompteur(numeroCompteur);
    if (client) {
      alert(`✅ Compteur trouvé\n\nClient: ${client.prenom} ${client.nom}\nAdresse: ${client.adresse}`);
    }
  };

  // Enregistrer un relevé
  const handleEnregistrerReleve = () => {
    if (!numeroCompteur || !indexAncien || !indexNouveau) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    const indexAncienNum = parseInt(indexAncien);
    const indexNouveauNum = parseInt(indexNouveau);

    if (isNaN(indexAncienNum) || isNaN(indexNouveauNum)) {
      alert("❌ Les index doivent être des nombres valides");
      return;
    }

    if (indexNouveauNum < indexAncienNum) {
      alert("❌ L'index nouveau ne peut pas être inférieur à l'index ancien");
      return;
    }

    const compteur = getCompteurByNumero(numeroCompteur);
    if (!compteur) {
      alert("❌ Compteur introuvable");
      return;
    }

    try {
      const dateReleveISO = new Date(dateReleve).toISOString();
      const nouveauReleve = creerReleve(
        compteur.id,
        numeroCompteur,
        agentId,
        agentNom,
        indexAncienNum,
        indexNouveauNum,
        dateReleveISO,
        observations || undefined
      );

      setReleves((prev) => [...prev, nouveauReleve]);

      // Réinitialiser le formulaire
      setIndexAncien("");
      setIndexNouveau("");
      setObservations("");
      setDateReleve(new Date().toISOString().split("T")[0]);

      alert(
        `✅ Relevé enregistré avec succès !\n\nConsommation: ${nouveauReleve.consommation} kWh\nStatut: ${nouveauReleve.statut}`
      );
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  // Filtrer les relevés
  const relevesFiltres = useMemo(() => {
    if (filtreStatut === "all") return releves;
    return releves.filter((r) => r.statut === filtreStatut);
  }, [releves, filtreStatut]);

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
                    label: "Relevés aujourd'hui",
                    value: stats.totalAujourdhui,
                    icon: "📝",
                    color: "#0033A0",
                  },
                  {
                    label: "Relevés validés",
                    value: stats.totalValides,
                    icon: "✅",
                    color: "#10b981",
                  },
                  {
                    label: "En attente",
                    value: stats.enAttente,
                    icon: "⏳",
                    color: "#FFD200",
                  },
                  {
                    label: "Consommation totale",
                    value: `${stats.consommationTotale} kWh`,
                    icon: "⚡",
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

              {/* Derniers relevés */}
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Derniers relevés</h2>
                {releves.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Aucun relevé enregistré</p>
                ) : (
                  <div className="space-y-3">
                    {releves.slice(0, 5).map((releve) => {
                      const client = getClientByNumeroCompteur(releve.numeroCompteur);
                      return (
                        <div
                          key={releve.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#0033A0]">
                              {releve.numeroCompteur}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {client ? `${client.prenom} ${client.nom}` : "Client inconnu"}
                            </p>
                            <p className="text-xs text-slate-500">
                              {releve.consommation} kWh •{" "}
                              {new Date(releve.dateReleve).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              releve.statut === "VALIDE"
                                ? "bg-green-100 text-green-700"
                                : releve.statut === "REJETE"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {releve.statut}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nouveau relevé */}
          {view === "releve" && (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg max-w-2xl mx-auto animate-slide-in">
              <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Nouveau relevé de compteur</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Numéro de compteur *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={numeroCompteur}
                      onChange={(e) => setNumeroCompteur(e.target.value.toUpperCase())}
                      placeholder="Ex: CTR-001234"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                    <button
                      onClick={handleVerifierCompteur}
                      className="px-4 py-2 bg-[#0033A0] text-white rounded-lg hover:bg-[#002280] transition-all font-medium active:scale-95"
                    >
                      Vérifier
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date du relevé *</label>
                  <input
                    type="date"
                    value={dateReleve}
                    onChange={(e) => setDateReleve(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Index ancien (kWh) *
                    </label>
                    <input
                      type="number"
                      value={indexAncien}
                      onChange={(e) => setIndexAncien(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Index nouveau (kWh) *
                    </label>
                    <input
                      type="number"
                      value={indexNouveau}
                      onChange={(e) => setIndexNouveau(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>
                </div>

                {indexAncien && indexNouveau && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-900">Consommation calculée:</span>
                      <span className="text-lg font-bold text-[#0033A0]">
                        {parseInt(indexNouveau || "0") - parseInt(indexAncien || "0")} kWh
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Observations (optionnel)
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Notes, remarques..."
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                  />
                </div>

                <button
                  onClick={handleEnregistrerReleve}
                  disabled={!numeroCompteur || !indexAncien || !indexNouveau}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
                >
                  📝 Enregistrer le relevé
                </button>
              </div>
            </div>
          )}

          {/* Historique */}
          {view === "historique" && (
            <div className="space-y-4 animate-slide-in">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Filtrer par statut</label>
                <select
                  value={filtreStatut}
                  onChange={(e) => setFiltreStatut(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                >
                  <option value="all">Tous</option>
                  <option value="SAISI">Saisi</option>
                  <option value="VALIDE">Validé</option>
                  <option value="REJETE">Rejeté</option>
                </select>
              </div>

              {relevesFiltres.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                  <p className="text-slate-500">Aucun relevé trouvé</p>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5 shadow-modern-lg">
                  <h2 className="text-lg font-semibold text-[#0033A0] mb-4">Historique des relevés</h2>
                  <div className="space-y-3">
                    {relevesFiltres.map((releve) => {
                      const client = getClientByNumeroCompteur(releve.numeroCompteur);
                      return (
                        <div
                          key={releve.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-[#0033A0]">{releve.numeroCompteur}</h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  releve.statut === "VALIDE"
                                    ? "bg-green-100 text-green-700"
                                    : releve.statut === "REJETE"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {releve.statut}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">
                              {client ? `${client.prenom} ${client.nom}` : "Client inconnu"}
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-slate-500">
                              <span>
                                Index: {releve.indexAncien} → {releve.indexNouveau} kWh
                              </span>
                              <span>Consommation: {releve.consommation} kWh</span>
                              <span>
                                {new Date(releve.dateReleve).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                            {releve.observations && (
                              <p className="text-xs text-slate-500 mt-1 italic">
                                {releve.observations}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutSNEL>
  );
}

export default function AgentPage() {
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
      <AgentContent />
    </Suspense>
  );
}
