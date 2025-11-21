"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context";
import { useSNEL } from "@/lib/snel-context";
import { Facture, Plainte, Avis, ModePaiement } from "@/data/types-snel";
import PaymentModal from "@/components/PaymentModal";
import LayoutSNEL from "@/components/LayoutSNEL";

function ClientContent() {
  const { userBilleterie } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    getFacturesByClient,
    getPlaintesByClient,
    getAvisByClient,
    getClientByNumeroCompteur,
    effectuerPaiement,
    creerPlainte,
    creerAvis,
    getFactureByNumero,
  } = useSNEL();

  const viewParam = searchParams.get("view") as "factures" | "paiement" | "plaintes" | "avis" | null;
  const [view, setView] = useState<"factures" | "paiement" | "plaintes" | "avis">(
    viewParam && ["factures", "paiement", "plaintes", "avis"].includes(viewParam)
      ? viewParam
      : "factures"
  );

  useEffect(() => {
    if (viewParam && ["factures", "paiement", "plaintes", "avis"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  const updateView = (newView: "factures" | "paiement" | "plaintes" | "avis") => {
    setView(newView);
    router.push(`/client?view=${newView}`, { scroll: false });
  };

  // États pour le client
  const [numeroCompteur, setNumeroCompteur] = useState<string>("");
  const [factures, setFactures] = useState<Facture[]>([]);
  const [plaintes, setPlaintes] = useState<Plainte[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>("MOBILE_MONEY");

  // États pour les plaintes
  const [nouvellePlainte, setNouvellePlainte] = useState({
    type: "FACTURATION" as "PANNE" | "FACTURATION" | "SERVICE" | "AUTRE",
    sujet: "",
    description: "",
    factureId: "",
  });

  // États pour les avis
  const [nouvelAvis, setNouvelAvis] = useState({
    note: 5,
    commentaire: "",
    categorie: "SERVICE" as "SERVICE" | "FACTURATION" | "AGENT" | "GENERAL",
  });

  // Charger les données du client
  useEffect(() => {
    if (numeroCompteur) {
      const client = getClientByNumeroCompteur(numeroCompteur);
      if (client) {
        setFactures(getFacturesByClient(client.id));
        setPlaintes(getPlaintesByClient(client.id));
        setAvis(getAvisByClient(client.id));
      }
    }
  }, [numeroCompteur, getFacturesByClient, getPlaintesByClient, getAvisByClient, getClientByNumeroCompteur]);

  const handlePayerFacture = (facture: Facture) => {
    setSelectedFacture(facture);
    setModePaiement("MOBILE_MONEY");
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedFacture) return;

    try {
      const paiement = effectuerPaiement(
        selectedFacture.id,
        selectedFacture.solde,
        modePaiement,
        "SELF_SERVICE",
        undefined,
        paymentData.transactionId
      );

      if (paiement) {
        // Mettre à jour la liste des factures
        const factureMiseAJour = getFactureByNumero(selectedFacture.numeroFacture);
        if (factureMiseAJour) {
          setFactures((prev) =>
            prev.map((f) => (f.id === selectedFacture.id ? factureMiseAJour : f))
          );
        }

        alert(`✅ Paiement effectué avec succès !\n\nTransaction ID: ${paymentData.transactionId || "N/A"}\nMontant: ${selectedFacture.solde.toLocaleString("fr-FR")} FC`);
        setShowPaymentModal(false);
        setSelectedFacture(null);
      }
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
      setShowPaymentModal(false);
    }
  };

  const handleCreerPlainte = () => {
    if (!numeroCompteur) {
      alert("❌ Veuillez d'abord saisir votre numéro de compteur");
      return;
    }

    const client = getClientByNumeroCompteur(numeroCompteur);
    if (!client) {
      alert("❌ Client introuvable");
      return;
    }

    if (!nouvellePlainte.sujet || !nouvellePlainte.description) {
      alert("❌ Veuillez remplir tous les champs");
      return;
    }

    try {
      const plainte = creerPlainte(
        client.id,
        numeroCompteur,
        nouvellePlainte.type,
        nouvellePlainte.sujet,
        nouvellePlainte.description,
        nouvellePlainte.factureId || undefined
      );

      setPlaintes((prev) => [...prev, plainte]);
      setNouvellePlainte({
        type: "FACTURATION",
        sujet: "",
        description: "",
        factureId: "",
      });
      alert(`✅ Plainte créée avec succès !\n\nNuméro: ${plainte.numeroPlainte}`);
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const handleCreerAvis = () => {
    if (!numeroCompteur) {
      alert("❌ Veuillez d'abord saisir votre numéro de compteur");
      return;
    }

    const client = getClientByNumeroCompteur(numeroCompteur);
    if (!client) {
      alert("❌ Client introuvable");
      return;
    }

    if (!nouvelAvis.commentaire) {
      alert("❌ Veuillez saisir un commentaire");
      return;
    }

    try {
      const avis = creerAvis(
        client.id,
        numeroCompteur,
        nouvelAvis.note,
        nouvelAvis.commentaire,
        nouvelAvis.categorie
      );

      setAvis((prev) => [...prev, avis]);
      setNouvelAvis({
        note: 5,
        commentaire: "",
        categorie: "SERVICE",
      });
      alert("✅ Avis publié avec succès !");
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    }
  };

  const client = numeroCompteur ? getClientByNumeroCompteur(numeroCompteur) : null;

  return (
    <LayoutSNEL>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          {/* Recherche par numéro de compteur */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6 shadow-modern-lg">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Numéro de compteur
            </label>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">💡 Compteurs de test disponibles :</p>
              <div className="text-xs text-blue-700 space-y-1 mb-2">
                <div>• <strong>CTR-TEST-001</strong> - Facture payée par Mobile Money</div>
                <div>• <strong>CTR-TEST-002</strong> - Facture payée par Carte</div>
                <div>• <strong>CTR-TEST-003</strong> - Facture en attente de paiement</div>
              </div>
              <button
                onClick={() => {
                  const testCompteurs = ["CTR-TEST-001", "CTR-TEST-002", "CTR-TEST-003"];
                  const randomCompteur = testCompteurs[Math.floor(Math.random() * testCompteurs.length)];
                  setNumeroCompteur(randomCompteur);
                }}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all font-medium"
              >
                🎲 Charger un compteur de test
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={numeroCompteur}
                onChange={(e) => setNumeroCompteur(e.target.value.toUpperCase())}
                placeholder="Ex: CTR-001234"
                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20 focus:border-[#0033A0]"
              />
              {client && (
                <div className="px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <span className="text-green-700 font-semibold">
                    {client.prenom} {client.nom}
                  </span>
                </div>
              )}
            </div>
            {!client && numeroCompteur && (
              <p className="text-red-600 text-sm mt-2">❌ Compteur introuvable</p>
            )}
          </div>


          {/* Vue Factures */}
          {view === "factures" && (
            <div className="space-y-4 animate-slide-in">
              {!numeroCompteur ? (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-slate-600">Veuillez saisir votre numéro de compteur pour voir vos factures</p>
                </div>
              ) : factures.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-slate-600">Aucune facture trouvée</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {factures.map((facture) => (
                    <div
                      key={facture.id}
                      className="bg-white/90 backdrop-blur-sm border-2 border-slate-200/80 rounded-xl p-6 hover:shadow-modern-xl transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-[#0033A0]">{facture.numeroFacture}</h3>
                          <p className="text-sm text-slate-600">{facture.periode}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Consommation:</span>
                          <span className="font-semibold">{facture.consommation} kWh</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Montant TTC:</span>
                          <span className="font-semibold">{facture.montantTTC.toLocaleString("fr-FR")} FC</span>
                        </div>
                        {facture.statut !== "PAYEE" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Solde:</span>
                            <span className="font-bold text-[#0033A0]">{facture.solde.toLocaleString("fr-FR")} FC</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Échéance:</span>
                          <span className="font-semibold">
                            {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      {facture.statut !== "PAYEE" && (
                        <button
                          onClick={() => handlePayerFacture(facture)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:scale-105 active:scale-95 transition-all font-semibold"
                        >
                          💳 Payer maintenant
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vue Paiement */}
          {view === "paiement" && (
            <div className="space-y-4 animate-slide-in">
              {!numeroCompteur ? (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <p className="text-slate-600">Veuillez saisir votre numéro de compteur</p>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Paiement de facture</h2>
                  <p className="text-slate-600 mb-4">
                    Sélectionnez une facture depuis l'onglet "Mes Factures" pour effectuer un paiement.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 Vous pouvez payer vos factures en ligne (Mobile Money, Carte bancaire) ou vous rendre
                      dans un guichet SNEL pour un paiement en espèces.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vue Plaintes */}
          {view === "plaintes" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Déposer une plainte</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type de plainte</label>
                    <select
                      value={nouvellePlainte.type}
                      onChange={(e) =>
                        setNouvellePlainte({ ...nouvellePlainte, type: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    >
                      <option value="FACTURATION">Facturation</option>
                      <option value="PANNE">Panne</option>
                      <option value="SERVICE">Service</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
                    <input
                      type="text"
                      value={nouvellePlainte.sujet}
                      onChange={(e) => setNouvellePlainte({ ...nouvellePlainte, sujet: e.target.value })}
                      placeholder="Ex: Montant facture élevé"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={nouvellePlainte.description}
                      onChange={(e) => setNouvellePlainte({ ...nouvellePlainte, description: e.target.value })}
                      placeholder="Décrivez votre plainte en détail..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>
                  <button
                    onClick={handleCreerPlainte}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:scale-105 active:scale-95 transition-all font-semibold"
                  >
                    📝 Envoyer la plainte
                  </button>
                </div>
              </div>

              {/* Liste des plaintes */}
              {plaintes.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#0033A0] mb-4">Mes plaintes</h3>
                  <div className="space-y-3">
                    {plaintes.map((plainte) => (
                      <div
                        key={plainte.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-[#0033A0]">{plainte.numeroPlainte}</h4>
                            <p className="text-sm text-slate-600">{plainte.sujet}</p>
                          </div>
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
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{plainte.description}</p>
                        {plainte.reponse && (
                          <div className="bg-white border border-green-200 rounded-lg p-3 mt-2">
                            <p className="text-xs text-green-700 font-semibold mb-1">Réponse SNEL:</p>
                            <p className="text-sm text-slate-700">{plainte.reponse}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vue Avis */}
          {view === "avis" && (
            <div className="space-y-4 animate-slide-in">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-[#0033A0] mb-4">Donner votre avis</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Note (1-5)</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((note) => (
                        <button
                          key={note}
                          onClick={() => setNouvelAvis({ ...nouvelAvis, note })}
                          className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                            nouvelAvis.note >= note
                              ? "bg-yellow-400 text-yellow-900"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                    <select
                      value={nouvelAvis.categorie}
                      onChange={(e) => setNouvelAvis({ ...nouvelAvis, categorie: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    >
                      <option value="SERVICE">Service</option>
                      <option value="FACTURATION">Facturation</option>
                      <option value="AGENT">Agent</option>
                      <option value="GENERAL">Général</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Commentaire</label>
                    <textarea
                      value={nouvelAvis.commentaire}
                      onChange={(e) => setNouvelAvis({ ...nouvelAvis, commentaire: e.target.value })}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0033A0]/20"
                    />
                  </div>
                  <button
                    onClick={handleCreerAvis}
                    className="w-full px-4 py-2 bg-gradient-to-r from-[#0033A0] to-[#002280] text-white rounded-lg hover:scale-105 active:scale-95 transition-all font-semibold"
                  >
                    ⭐ Publier l'avis
                  </button>
                </div>
              </div>

              {/* Liste des avis */}
              {avis.length > 0 && (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#0033A0] mb-4">Mes avis</h3>
                  <div className="space-y-3">
                    {avis.map((a) => (
                      <div key={a.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((note) => (
                              <span
                                key={note}
                                className={note <= a.note ? "text-yellow-400" : "text-slate-300"}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(a.dateCreation).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{a.commentaire}</p>
                        <p className="text-xs text-slate-500 mt-2">Catégorie: {a.categorie}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal de paiement */}
          <PaymentModal
            isOpen={showPaymentModal && selectedFacture !== null}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
            amount={selectedFacture ? selectedFacture.solde : 0}
            modePaiement={modePaiement}
            clientNom={client ? `${client.prenom} ${client.nom}` : ""}
            clientNumero={client?.telephone || ""}
          />
        </div>
      </div>
    </LayoutSNEL>
  );
}

export default function ClientPage() {
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
      <ClientContent />
    </Suspense>
  );
}
