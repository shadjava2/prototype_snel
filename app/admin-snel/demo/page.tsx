"use client";

import { useState } from "react";
import { useSNEL } from "@/lib/snel-context";
import LayoutSNEL from "@/components/LayoutSNEL";
import { useRouter } from "next/navigation";

export default function DemoDataPage() {
  const { loadDemoData, clients, factures, paiements, releves, plaintes, avis } = useSNEL();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientCount, setClientCount] = useState<number>(1000);
  const [progress, setProgress] = useState<string>("");

  const handleGenerateData = async () => {
    if (clientCount < 100 || clientCount > 100000) {
      alert("❌ Le nombre de clients doit être entre 100 et 100 000");
      return;
    }

    setLoading(true);
    setProgress("🔄 Initialisation...");

    try {
      // Simulation du processus avec étapes visibles
      const steps = [
        { message: "🔄 Génération des clients...", delay: 500 },
        { message: "🔄 Création des compteurs...", delay: 500 },
        { message: "🔄 Génération des relevés...", delay: 1000 },
        { message: "🔄 Création des factures...", delay: 1000 },
        { message: "🔄 Génération des paiements...", delay: 500 },
        { message: "🔄 Création des plaintes...", delay: 500 },
        { message: "🔄 Génération des avis...", delay: 500 },
        { message: "💾 Sauvegarde des données...", delay: 500 },
      ];

      let currentStep = 0;

      const processStep = () => {
        if (currentStep < steps.length) {
          const step = steps[currentStep];
          setProgress(step.message);
          setTimeout(() => {
            currentStep++;
            processStep();
          }, step.delay);
        } else {
          // Générer les données
          loadDemoData(clientCount);
          setProgress(`✅ ${clientCount.toLocaleString("fr-FR")} clients générés avec succès !`);
          setLoading(false);

          setTimeout(() => {
            router.push("/admin-snel");
          }, 2000);
        }
      };

      processStep();
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
      setLoading(false);
      setProgress("");
    }
  };

  const handleClearData = () => {
    if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer toutes les données de démonstration ?")) {
      return;
    }

    localStorage.removeItem("snel_demo_clients");
    localStorage.removeItem("snel_demo_compteurs");
    localStorage.removeItem("snel_demo_releves");
    localStorage.removeItem("snel_demo_factures");
    localStorage.removeItem("snel_demo_paiements");
    localStorage.removeItem("snel_demo_plaintes");
    localStorage.removeItem("snel_demo_avis");

    alert("✅ Données supprimées. Rechargez la page pour voir les changements.");
    router.refresh();
  };

  return (
    <LayoutSNEL>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
            <h1 className="text-2xl font-bold text-[#0033A0] mb-4">Génération de données de démonstration</h1>
            <p className="text-slate-600 mb-6">
              Générez des données de test pour simuler un environnement avec jusqu'à 100 000 clients.
              Les données incluent des factures, paiements, plaintes et avis variés.
            </p>

            {/* Statistiques actuelles */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-blue-900 mb-3">Données actuelles</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-700">Clients</div>
                  <div className="text-lg font-bold text-[#0033A0]">{clients.length.toLocaleString("fr-FR")}</div>
                </div>
                <div>
                  <div className="text-blue-700">Factures</div>
                  <div className="text-lg font-bold text-[#0033A0]">{factures.length.toLocaleString("fr-FR")}</div>
                </div>
                <div>
                  <div className="text-blue-700">Paiements</div>
                  <div className="text-lg font-bold text-[#0033A0]">{paiements.length.toLocaleString("fr-FR")}</div>
                </div>
                <div>
                  <div className="text-blue-700">Relevés</div>
                  <div className="text-lg font-bold text-[#0033A0]">{releves.length.toLocaleString("fr-FR")}</div>
                </div>
              </div>
            </div>

            {/* Boutons rapides */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">⚡ Chargement rapide</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setClientCount(100);
                    setTimeout(() => handleGenerateData(), 100);
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 shadow-md"
                >
                  ⚡ 100 clients
                </button>
                <button
                  onClick={() => {
                    setClientCount(1000);
                    setTimeout(() => handleGenerateData(), 100);
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 shadow-md"
                >
                  ⚡ 1 000 clients
                </button>
                <button
                  onClick={() => {
                    setClientCount(5000);
                    setTimeout(() => handleGenerateData(), 100);
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 shadow-md"
                >
                  ⚡ 5 000 clients
                </button>
                <button
                  onClick={() => {
                    setClientCount(10000);
                    setTimeout(() => handleGenerateData(), 100);
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 shadow-md"
                >
                  ⚡ 10 000 clients
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                💡 Cliquez sur un bouton pour charger rapidement des données de test
              </p>
            </div>

            {/* Formulaire de génération */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de clients à générer (personnalisé)
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    value={clientCount}
                    onChange={(e) => setClientCount(parseInt(e.target.value) || 1000)}
                    min="100"
                    max="100000"
                    step="100"
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                  />
                  <div className="text-sm text-slate-600">
                    Min: 100 | Max: 100 000
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  💡 Pour de meilleures performances, utilisez 1000-5000 clients pour les tests rapides.
                  Pour une simulation complète, vous pouvez générer jusqu'à 100 000 clients.
                </p>
              </div>

              {progress && (
                <div className={`p-4 rounded-lg ${
                  progress.includes("✅")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : progress.includes("💾")
                    ? "bg-purple-50 border border-purple-200 text-purple-700"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}>
                  <div className="flex items-center gap-3">
                    {loading && !progress.includes("✅") && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    )}
                    <span className="font-medium">{progress}</span>
                  </div>
                  {loading && !progress.includes("✅") && (
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleGenerateData}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:from-[#002280] hover:to-[#0033A0] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
                >
                  {loading ? "⏳ Génération..." : `⚡ Générer ${clientCount.toLocaleString("fr-FR")} clients`}
                </button>
                <button
                  onClick={handleClearData}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold active:scale-95 hover:scale-105"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>

            {/* Informations sur les données générées */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">📊 Données générées</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• <strong>Clients</strong> : avec noms, adresses, téléphones, emails</li>
                <li>• <strong>Compteurs</strong> : monophase/triphase avec puissances variées</li>
                <li>• <strong>Relevés</strong> : 12 mois de relevés par compteur actif</li>
                <li>• <strong>Factures</strong> : générées à partir des relevés validés</li>
                <li>• <strong>Paiements</strong> : Mobile Money, Carte, Cash, Virement (60% payées)</li>
                <li>• <strong>Plaintes</strong> : 5% des clients avec différents types</li>
                <li>• <strong>Avis</strong> : 10% des clients avec notes 1-5</li>
              </ul>
            </div>

            {/* Scénarios de test */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">🧪 Scénarios de test disponibles</h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <div>
                  <strong>Paiement Mobile Money :</strong> Recherchez un client avec une facture payée par Mobile Money
                </div>
                <div>
                  <strong>Paiement par Carte :</strong> Recherchez un client avec une facture payée par Carte
                </div>
                <div>
                  <strong>Paiement Cash :</strong> Recherchez un client avec une facture payée en Cash
                </div>
                <div>
                  <strong>Facture en attente :</strong> 40% des factures sont en attente de paiement
                </div>
                <div>
                  <strong>Facture en retard :</strong> 15% des factures sont en retard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutSNEL>
  );
}

