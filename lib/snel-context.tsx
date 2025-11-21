"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  Client,
  Compteur,
  ReleveCompteur,
  Facture,
  Paiement,
  Plainte,
  Avis,
  Zone,
  StatutReleve,
  StatutFacture,
  ModePaiement,
  StatutPlainte,
} from "@/data/types-snel";
import {
  clients as clientsInit,
  compteurs as compteursInit,
  releves as relevesInit,
  factures as facturesInit,
  paiements as paiementsInit,
  plaintes as plaintesInit,
  avis as avisInit,
  zones as zonesInit,
} from "@/data/snel-data";
import { generateAllDemoData, demoAgents, generateTestClients } from "@/data/snel-demo-data";

// Fonction pour garantir que les clients de test sont toujours présents
function ensureTestClients<T extends { id: string; numeroCompteur?: string }>(
  items: T[],
  testItems: T[]
): T[] {
  const testIds = new Set(testItems.map(item => item.id));
  const testNumeroCompteurs = new Set(
    testItems
      .filter(item => 'numeroCompteur' in item)
      .map(item => (item as any).numeroCompteur)
  );

  // Filtrer les items existants pour retirer les anciens clients de test
  const filtered = items.filter(
    item => !testIds.has(item.id) &&
    (!('numeroCompteur' in item) || !testNumeroCompteurs.has((item as any).numeroCompteur))
  );

  // Ajouter les clients de test en premier
  return [...testItems, ...filtered];
}

interface SNELContextType {
  // Données
  clients: Client[];
  compteurs: Compteur[];
  releves: ReleveCompteur[];
  factures: Facture[];
  paiements: Paiement[];
  plaintes: Plainte[];
  avis: Avis[];
  zones: Zone[];

  // Fonctions pour les relevés
  creerReleve: (
    compteurId: string,
    numeroCompteur: string,
    agentId: string,
    agentNom: string,
    indexAncien: number,
    indexNouveau: number,
    dateReleve: string,
    observations?: string
  ) => ReleveCompteur;

  validerReleve: (releveId: string) => boolean;
  rejeterReleve: (releveId: string) => boolean;

  // Fonctions pour les factures
  genererFacture: (releveId: string, periode: string) => Facture | null;
  getFacturesByClient: (clientId: string) => Facture[];
  getFactureByNumero: (numeroFacture: string) => Facture | undefined;

  // Fonctions pour les paiements
  effectuerPaiement: (
    factureId: string,
    montant: number,
    modePaiement: ModePaiement,
    canalPaiement: "SELF_SERVICE" | "GUICHET" | "AGENT",
    agentId?: string,
    referenceTransaction?: string
  ) => Paiement | null;

  getPaiementsByClient: (clientId: string) => Paiement[];

  // Fonctions pour les plaintes
  creerPlainte: (
    clientId: string,
    numeroCompteur: string,
    type: "PANNE" | "FACTURATION" | "SERVICE" | "AUTRE",
    sujet: string,
    description: string,
    factureId?: string
  ) => Plainte;

  traiterPlainte: (plainteId: string, reponse: string, traitePar: string) => boolean;
  getPlaintesByClient: (clientId: string) => Plainte[];

  // Fonctions pour les avis
  creerAvis: (
    clientId: string,
    numeroCompteur: string,
    note: number,
    commentaire: string,
    categorie: "SERVICE" | "FACTURATION" | "AGENT" | "GENERAL"
  ) => Avis;

  getAvisByClient: (clientId: string) => Avis[];

  // Fonctions utilitaires
  getClientById: (id: string) => Client | undefined;
  getClientByNumeroCompteur: (numeroCompteur: string) => Client | undefined;
  getCompteurByNumero: (numeroCompteur: string) => Compteur | undefined;
  getReleveById: (id: string) => ReleveCompteur | undefined;
  getRelevesByCompteur: (compteurId: string) => ReleveCompteur[];
  getRelevesByAgent: (agentId: string) => ReleveCompteur[];
  getZoneById: (id: string) => Zone | undefined;

  // Fonction pour charger les données de démonstration
  loadDemoData: (clientCount?: number) => void;
}

const SNELContext = createContext<SNELContextType | undefined>(undefined);

export function SNELProvider({ children }: { children: ReactNode }) {
  // Obtenir les données de test
  const testData = generateTestClients();

  // Charger les données de démonstration depuis localStorage ou utiliser les données initiales
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_clients");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // S'assurer que les clients de test sont toujours présents
          return ensureTestClients(parsed, testData.clients);
        } catch (e) {
          // En cas d'erreur, garantir que les clients de test sont présents dans les données initiales
          return ensureTestClients(clientsInit, testData.clients);
        }
      }
    }
    // Garantir que les clients de test sont présents dans les données initiales
    return ensureTestClients(clientsInit, testData.clients);
  });

  const [compteurs, setCompteurs] = useState<Compteur[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_compteurs");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // S'assurer que les compteurs de test sont toujours présents
          return ensureTestClients(parsed, testData.compteurs);
        } catch (e) {
          // En cas d'erreur, garantir que les compteurs de test sont présents dans les données initiales
          return ensureTestClients(compteursInit, testData.compteurs);
        }
      }
    }
    // Garantir que les compteurs de test sont présents dans les données initiales
    return ensureTestClients(compteursInit, testData.compteurs);
  });

  const [releves, setReleves] = useState<ReleveCompteur[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_releves");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // S'assurer que les relevés de test sont toujours présents
          return ensureTestClients(parsed, testData.releves);
        } catch (e) {
          // En cas d'erreur, garantir que les relevés de test sont présents dans les données initiales
          return ensureTestClients(relevesInit, testData.releves);
        }
      }
    }
    // Garantir que les relevés de test sont présents dans les données initiales
    return ensureTestClients(relevesInit, testData.releves);
  });

  const [factures, setFactures] = useState<Facture[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_factures");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // S'assurer que les factures de test sont toujours présentes
          return ensureTestClients(parsed, testData.factures);
        } catch (e) {
          // En cas d'erreur, garantir que les factures de test sont présentes dans les données initiales
          return ensureTestClients(facturesInit, testData.factures);
        }
      }
    }
    // Garantir que les factures de test sont présentes dans les données initiales
    return ensureTestClients(facturesInit, testData.factures);
  });

  const [paiements, setPaiements] = useState<Paiement[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_paiements");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // S'assurer que les paiements de test sont toujours présents
          return ensureTestClients(parsed, testData.paiements);
        } catch (e) {
          // En cas d'erreur, garantir que les paiements de test sont présents dans les données initiales
          return ensureTestClients(paiementsInit, testData.paiements);
        }
      }
    }
    // Garantir que les paiements de test sont présents dans les données initiales
    return ensureTestClients(paiementsInit, testData.paiements);
  });

  const [plaintes, setPlaintes] = useState<Plainte[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_plaintes");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return plaintesInit;
        }
      }
    }
    return plaintesInit;
  });

  const [avis, setAvis] = useState<Avis[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("snel_demo_avis");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return avisInit;
        }
      }
    }
    return avisInit;
  });

  const [zones] = useState<Zone[]>(zonesInit);

  // Fonction pour charger les données de démonstration
  const loadDemoData = (clientCount: number = 1000) => {
    const data = generateAllDemoData(clientCount);

    // S'assurer que les clients de test sont toujours présents
    const clientsWithTest = ensureTestClients(data.clients, testData.clients);

    // S'assurer que les compteurs de test sont toujours présents
    const compteursWithTest = ensureTestClients(data.compteurs, testData.compteurs);

    // S'assurer que les relevés de test sont toujours présents
    const relevesWithTest = ensureTestClients(data.releves, testData.releves);

    // S'assurer que les factures de test sont toujours présentes
    const facturesWithTest = ensureTestClients(data.factures, testData.factures);

    // S'assurer que les paiements de test sont toujours présents
    const paiementsWithTest = ensureTestClients(data.paiements, testData.paiements);

    setClients(clientsWithTest);
    setCompteurs(compteursWithTest);
    setReleves(relevesWithTest);
    setFactures(facturesWithTest);
    setPaiements(paiementsWithTest);
    setPlaintes(data.plaintes);
    setAvis(data.avis);

    // Sauvegarder dans localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("snel_demo_clients", JSON.stringify(clientsWithTest));
      localStorage.setItem("snel_demo_compteurs", JSON.stringify(compteursWithTest));
      localStorage.setItem("snel_demo_releves", JSON.stringify(relevesWithTest));
      localStorage.setItem("snel_demo_factures", JSON.stringify(facturesWithTest));
      localStorage.setItem("snel_demo_paiements", JSON.stringify(paiementsWithTest));
      localStorage.setItem("snel_demo_plaintes", JSON.stringify(data.plaintes));
      localStorage.setItem("snel_demo_avis", JSON.stringify(data.avis));
    }
  };

  // Générer un numéro de facture
  const genererNumeroFacture = (): string => {
    const annee = new Date().getFullYear();
    const numero = String(factures.length + 1).padStart(6, "0");
    return `FAC-${annee}-${numero}`;
  };

  // Générer un numéro de plainte
  const genererNumeroPlainte = (): string => {
    const annee = new Date().getFullYear();
    const numero = String(plaintes.length + 1).padStart(4, "0");
    return `PLA-${annee}-${numero}`;
  };

  // Créer un relevé
  const creerReleve = (
    compteurId: string,
    numeroCompteur: string,
    agentId: string,
    agentNom: string,
    indexAncien: number,
    indexNouveau: number,
    dateReleve: string,
    observations?: string
  ): ReleveCompteur => {
    if (indexNouveau < indexAncien) {
      throw new Error("L'index nouveau ne peut pas être inférieur à l'index ancien");
    }

    const consommation = indexNouveau - indexAncien;

    const nouveauReleve: ReleveCompteur = {
      id: `REL-${String(Date.now()).slice(-6)}`,
      compteurId,
      numeroCompteur,
      agentId,
      agentNom,
      indexAncien,
      indexNouveau,
      consommation,
      dateReleve,
      dateSaisie: new Date().toISOString(),
      statut: "SAISI",
      observations,
    };

    setReleves((prev) => {
      const updated = [...prev, nouveauReleve];
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_releves", JSON.stringify(updated));
      }
      return updated;
    });
    return nouveauReleve;
  };

  // Valider un relevé
  const validerReleve = (releveId: string): boolean => {
    const releve = releves.find((r) => r.id === releveId);
    if (!releve || releve.statut !== "SAISI") return false;

    setReleves((prev) => {
      const updated = prev.map((r) => (r.id === releveId ? { ...r, statut: "VALIDE" } : r));
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_releves", JSON.stringify(updated));
      }
      return updated;
    });
    return true;
  };

  // Rejeter un relevé
  const rejeterReleve = (releveId: string): boolean => {
    const releve = releves.find((r) => r.id === releveId);
    if (!releve || releve.statut !== "SAISI") return false;

    setReleves((prev) => {
      const updated = prev.map((r) => (r.id === releveId ? { ...r, statut: "REJETE" } : r));
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_releves", JSON.stringify(updated));
      }
      return updated;
    });
    return true;
  };

  // Générer une facture à partir d'un relevé
  const genererFacture = (releveId: string, periode: string): Facture | null => {
    const releve = releves.find((r) => r.id === releveId && r.statut === "VALIDE");
    if (!releve) return null;

    const compteur = compteurs.find((c) => c.id === releve.compteurId);
    if (!compteur) return null;

    const client = clients.find((c) => c.id === compteur.clientId);
    if (!client) return null;

    // Vérifier si une facture existe déjà pour ce relevé
    const factureExistante = factures.find((f) => f.releveId === releveId);
    if (factureExistante) return factureExistante;

    // Calculer le prix selon le type d'abonnement
    let prixUnitaire = 150; // FC par kWh (tarif domestique par défaut)
    if (client.typeAbonnement === "COMMERCIAL") {
      prixUnitaire = 120;
    } else if (client.typeAbonnement === "INDUSTRIEL") {
      prixUnitaire = 100;
    }

    const montantHT = releve.consommation * prixUnitaire;
    const tva = montantHT * 0.18; // TVA de 18%
    const montantTTC = montantHT + tva;

    const dateEmission = new Date();
    const dateEcheance = new Date(dateEmission);
    dateEcheance.setMonth(dateEcheance.getMonth() + 1);

    const nouvelleFacture: Facture = {
      id: `FAC-${String(Date.now()).slice(-6)}`,
      numeroFacture: genererNumeroFacture(),
      clientId: client.id,
      numeroCompteur: releve.numeroCompteur,
      periode,
      dateEmission: dateEmission.toISOString(),
      dateEcheance: dateEcheance.toISOString(),
      indexAncien: releve.indexAncien,
      indexNouveau: releve.indexNouveau,
      consommation: releve.consommation,
      prixUnitaire,
      montantHT,
      tva,
      montantTTC,
      montantPaye: 0,
      solde: montantTTC,
      statut: "EN_ATTENTE",
      releveId: releve.id,
    };

    setFactures((prev) => {
      const updated = [...prev, nouvelleFacture];
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_factures", JSON.stringify(updated));
      }
      return updated;
    });
    return nouvelleFacture;
  };

  // Effectuer un paiement
  const effectuerPaiement = (
    factureId: string,
    montant: number,
    modePaiement: ModePaiement,
    canalPaiement: "SELF_SERVICE" | "GUICHET" | "AGENT",
    agentId?: string,
    referenceTransaction?: string
  ): Paiement | null => {
    const facture = factures.find((f) => f.id === factureId);
    if (!facture) return null;

    if (facture.statut === "PAYEE") {
      throw new Error("Cette facture est déjà payée");
    }

    if (montant > facture.solde) {
      throw new Error("Le montant payé ne peut pas être supérieur au solde");
    }

    const nouveauPaiement: Paiement = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      factureId,
      numeroFacture: facture.numeroFacture,
      clientId: facture.clientId,
      montant,
      modePaiement,
      datePaiement: new Date().toISOString(),
      canalPaiement,
      agentId,
      referenceTransaction,
      statut: "VALIDE",
    };

    // Mettre à jour la facture
    const nouveauMontantPaye = facture.montantPaye + montant;
    const nouveauSolde = facture.montantTTC - nouveauMontantPaye;
    const nouveauStatut: StatutFacture = nouveauSolde <= 0 ? "PAYEE" : "EN_ATTENTE";

    setFactures((prev) => {
      const updated = prev.map((f) =>
        f.id === factureId
          ? {
              ...f,
              montantPaye: nouveauMontantPaye,
              solde: nouveauSolde,
              statut: nouveauStatut,
              modePaiement: nouveauStatut === "PAYEE" ? modePaiement : f.modePaiement,
              datePaiement: nouveauStatut === "PAYEE" ? new Date().toISOString() : f.datePaiement,
            }
          : f
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_factures", JSON.stringify(updated));
      }
      return updated;
    });

    setPaiements((prev) => {
      const updated = [...prev, nouveauPaiement];
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_paiements", JSON.stringify(updated));
      }
      return updated;
    });
    return nouveauPaiement;
  };

  // Créer une plainte
  const creerPlainte = (
    clientId: string,
    numeroCompteur: string,
    type: "PANNE" | "FACTURATION" | "SERVICE" | "AUTRE",
    sujet: string,
    description: string,
    factureId?: string
  ): Plainte => {
    const nouvellePlainte: Plainte = {
      id: `PLA-${String(Date.now()).slice(-6)}`,
      numeroPlainte: genererNumeroPlainte(),
      clientId,
      numeroCompteur,
      type,
      sujet,
      description,
      dateCreation: new Date().toISOString(),
      statut: "NOUVELLE",
      factureId,
    };

    setPlaintes((prev) => {
      const updated = [...prev, nouvellePlainte];
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_plaintes", JSON.stringify(updated));
      }
      return updated;
    });
    return nouvellePlainte;
  };

  // Traiter une plainte
  const traiterPlainte = (plainteId: string, reponse: string, traitePar: string): boolean => {
    const plainte = plaintes.find((p) => p.id === plainteId);
    if (!plainte) return false;

    setPlaintes((prev) => {
      const updated = prev.map((p) =>
        p.id === plainteId
          ? {
              ...p,
              statut: "RESOLUE" as StatutPlainte,
              reponse,
              traitePar,
              dateResolution: new Date().toISOString(),
            }
          : p
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_plaintes", JSON.stringify(updated));
      }
      return updated;
    });
    return true;
  };

  // Créer un avis
  const creerAvis = (
    clientId: string,
    numeroCompteur: string,
    note: number,
    commentaire: string,
    categorie: "SERVICE" | "FACTURATION" | "AGENT" | "GENERAL"
  ): Avis => {
    if (note < 1 || note > 5) {
      throw new Error("La note doit être entre 1 et 5");
    }

    const nouvelAvis: Avis = {
      id: `AVI-${String(Date.now()).slice(-6)}`,
      clientId,
      numeroCompteur,
      note,
      commentaire,
      dateCreation: new Date().toISOString(),
      categorie,
      visible: true,
    };

    setAvis((prev) => {
      const updated = [...prev, nouvelAvis];
      if (typeof window !== "undefined") {
        localStorage.setItem("snel_demo_avis", JSON.stringify(updated));
      }
      return updated;
    });
    return nouvelAvis;
  };

  // Fonctions utilitaires
  const getClientById = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  const getClientByNumeroCompteur = (numeroCompteur: string): Client | undefined => {
    const compteur = compteurs.find((c) => c.numeroCompteur === numeroCompteur);
    if (!compteur) return undefined;
    return clients.find((c) => c.id === compteur.clientId);
  };

  const getCompteurByNumero = (numeroCompteur: string): Compteur | undefined => {
    return compteurs.find((c) => c.numeroCompteur === numeroCompteur);
  };

  const getReleveById = (id: string): ReleveCompteur | undefined => {
    return releves.find((r) => r.id === id);
  };

  const getRelevesByCompteur = (compteurId: string): ReleveCompteur[] => {
    return releves.filter((r) => r.compteurId === compteurId);
  };

  const getRelevesByAgent = (agentId: string): ReleveCompteur[] => {
    return releves.filter((r) => r.agentId === agentId);
  };

  const getFacturesByClient = (clientId: string): Facture[] => {
    return factures.filter((f) => f.clientId === clientId);
  };

  const getFactureByNumero = (numeroFacture: string): Facture | undefined => {
    return factures.find((f) => f.numeroFacture === numeroFacture);
  };

  const getPaiementsByClient = (clientId: string): Paiement[] => {
    return paiements.filter((p) => p.clientId === clientId);
  };

  const getPlaintesByClient = (clientId: string): Plainte[] => {
    return plaintes.filter((p) => p.clientId === clientId);
  };

  const getAvisByClient = (clientId: string): Avis[] => {
    return avis.filter((a) => a.clientId === clientId);
  };

  const getZoneById = (id: string): Zone | undefined => {
    return zones.find((z) => z.id === id);
  };

  const value: SNELContextType = {
    clients,
    compteurs,
    releves,
    factures,
    paiements,
    plaintes,
    avis,
    zones,
    creerReleve,
    validerReleve,
    rejeterReleve,
    genererFacture,
    getFacturesByClient,
    getFactureByNumero,
    effectuerPaiement,
    getPaiementsByClient,
    creerPlainte,
    traiterPlainte,
    getPlaintesByClient,
    creerAvis,
    getAvisByClient,
    getClientById,
    getClientByNumeroCompteur,
    getCompteurByNumero,
    getReleveById,
    getRelevesByCompteur,
    getRelevesByAgent,
    getZoneById,
    loadDemoData,
  };

  return <SNELContext.Provider value={value}>{children}</SNELContext.Provider>;
}

export function useSNEL() {
  const context = useContext(SNELContext);
  if (context === undefined) {
    throw new Error("useSNEL must be used within a SNELProvider");
  }
  return context;
}

