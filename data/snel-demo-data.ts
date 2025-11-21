// Données de démonstration pour 100 000 clients SNEL
// Génération dynamique de données réalistes pour les tests

import {
  Client,
  Compteur,
  ReleveCompteur,
  Facture,
  Paiement,
  Plainte,
  Avis,
  StatutFacture,
  ModePaiement,
  StatutPlainte,
} from "./types-snel";

// Zones de distribution
const zones = [
  "Kinshasa Centre",
  "Kinshasa Est",
  "Kinshasa Ouest",
  "Lubumbashi",
  "Mbuji-Mayi",
  "Kisangani",
  "Kananga",
  "Bukavu",
  "Goma",
  "Matadi",
];

// Types d'abonnement
const typesAbonnement = ["DOMESTIQUE", "COMMERCIAL", "INDUSTRIEL"] as const;

// Noms et prénoms congolais courants
const prenoms = [
  "Jean", "Marie", "Pierre", "Paul", "Joseph", "François", "Antoine", "André",
  "Philippe", "Michel", "Luc", "Marc", "David", "Daniel", "Thomas", "Nicolas",
  "Sophie", "Catherine", "Isabelle", "Anne", "Julie", "Claire", "Laure", "Sylvie",
  "Patrice", "Didier", "Olivier", "Stéphane", "Laurent", "Sébastien",
];

const noms = [
  "Mukendi", "Kabila", "Tshisekedi", "Lumumba", "Kasa-Vubu", "Mobutu",
  "Kabila", "Kasaï", "Katanga", "Kivu", "Kongo", "Lubumbashi", "Kinshasa",
  "Mwamba", "Kabongo", "Mulumba", "Kasenga", "Tshilombo", "Kabengele",
  "Mputu", "Ngalula", "Kazadi", "Mwanza", "Kalombo", "Mukamba", "Kazumba",
  "Tshibangu", "Mukasa", "Kalombo", "Mwamba", "Kazadi", "Ngalula",
];

// Générer un numéro de téléphone aléatoire
function generatePhoneNumber(): string {
  const prefixes = ["900", "901", "902", "903", "904", "905", "910", "915", "920", "925"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = String(Math.floor(Math.random() * 10000000)).padStart(7, "0");
  return `+243${prefix}${number}`;
}

// Générer un email
function generateEmail(prenom: string, nom: string): string {
  const domains = ["gmail.com", "yahoo.fr", "hotmail.com", "outlook.com", "snel.rdc"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${prenom.toLowerCase()}.${nom.toLowerCase()}@${domain}`;
}

// Générer une adresse
function generateAddress(zone: string): string {
  const types = ["Avenue", "Boulevard", "Rue", "Quartier"];
  const noms = ["Lumumba", "Kasa-Vubu", "Trikot", "Victoire", "Commerce", "Indépendance", "30 Juin"];
  const type = types[Math.floor(Math.random() * types.length)];
  const nom = noms[Math.floor(Math.random() * noms.length)];
  const numero = Math.floor(Math.random() * 500) + 1;
  return `${type} ${nom}, ${numero}, ${zone}`;
}

// Générer des clients de démonstration
export function generateDemoClients(count: number = 100000): Client[] {
  const clients: Client[] = [];

  for (let i = 1; i <= count; i++) {
    const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
    const nom = noms[Math.floor(Math.random() * noms.length)];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const typeAbonnement = typesAbonnement[Math.floor(Math.random() * typesAbonnement.length)];
    const numeroCompteur = `CTR-${String(i).padStart(6, "0")}`;

    const dateAbonnement = new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    clients.push({
      id: `CLI-${String(i).padStart(6, "0")}`,
      numeroCompteur,
      nom,
      prenom,
      telephone: generatePhoneNumber(),
      email: Math.random() > 0.3 ? generateEmail(prenom, nom) : undefined,
      adresse: generateAddress(zone),
      zone,
      dateAbonnement: dateAbonnement.toISOString(),
      typeAbonnement,
      actif: Math.random() > 0.05, // 95% actifs
    });
  }

  return clients;
}

// Générer des compteurs
export function generateDemoCompteurs(clients: Client[]): Compteur[] {
  return clients.map((client, index) => ({
    id: `CPT-${String(index + 1).padStart(6, "0")}`,
    numeroCompteur: client.numeroCompteur,
    clientId: client.id,
    type: Math.random() > 0.7 ? "TRIPHASE" : "MONOPHASE",
    puissance: Math.random() > 0.7 ? (Math.random() > 0.5 ? 20 : 10) : 5,
    dateInstallation: client.dateAbonnement,
    actif: client.actif,
  }));
}

// Générer des relevés de compteur
export function generateDemoReleves(
  compteurs: Compteur[],
  agents: { id: string; nom: string }[],
  countPerCompteur: number = 12
): ReleveCompteur[] {
  const releves: ReleveCompteur[] = [];

  compteurs.forEach((compteur) => {
    if (!compteur.actif) return;

    let indexAncien = Math.floor(Math.random() * 5000);
    const startDate = new Date(2023, 0, 1);

    for (let i = 0; i < countPerCompteur; i++) {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const indexNouveau = indexAncien + Math.floor(Math.random() * 200) + 50;
      const consommation = indexNouveau - indexAncien;

      const dateReleve = new Date(startDate);
      dateReleve.setMonth(startDate.getMonth() + i);

      releves.push({
        id: `REL-${compteur.id}-${String(i + 1).padStart(3, "0")}`,
        compteurId: compteur.id,
        numeroCompteur: compteur.numeroCompteur,
        agentId: agent.id,
        agentNom: agent.nom,
        indexAncien,
        indexNouveau,
        consommation,
        dateReleve: dateReleve.toISOString(),
        dateSaisie: new Date(dateReleve.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        statut: Math.random() > 0.1 ? "VALIDE" : "SAISI",
        observations: Math.random() > 0.8 ? "Compteur en bon état" : undefined,
      });

      indexAncien = indexNouveau;
    }
  });

  return releves;
}

// Générer des factures
export function generateDemoFactures(
  releves: ReleveCompteur[],
  clients: Client[],
  compteurs: Compteur[]
): Facture[] {
  const factures: Facture[] = [];
  const factureCount = { current: 1 };

  releves.forEach((releve) => {
    if (releve.statut !== "VALIDE") return;

    const compteur = compteurs.find((c) => c.id === releve.compteurId);
    if (!compteur) return;

    const client = clients.find((c) => c.id === compteur.clientId);
    if (!client) return;

    // Vérifier si une facture existe déjà pour ce relevé
    const factureExistante = factures.find((f) => f.releveId === releve.id);
    if (factureExistante) return;

    // Calculer le prix selon le type d'abonnement
    let prixUnitaire = 150; // FC par kWh (tarif domestique)
    if (client.typeAbonnement === "COMMERCIAL") {
      prixUnitaire = 120;
    } else if (client.typeAbonnement === "INDUSTRIEL") {
      prixUnitaire = 100;
    }

    const montantHT = releve.consommation * prixUnitaire;
    const tva = montantHT * 0.18; // TVA de 18%
    const montantTTC = montantHT + tva;

    const dateReleve = new Date(releve.dateReleve);
    const mois = dateReleve.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const dateEmission = new Date(dateReleve);
    dateEmission.setDate(dateEmission.getDate() + 5);

    const dateEcheance = new Date(dateEmission);
    dateEcheance.setMonth(dateEcheance.getMonth() + 1);

    // Déterminer le statut de la facture (scénarios variés)
    let statut: StatutFacture = "EN_ATTENTE";
    let montantPaye = 0;
    let modePaiement: ModePaiement | undefined;
    let datePaiement: string | undefined;

    const rand = Math.random();
    if (rand > 0.4) {
      // 60% des factures sont payées
      statut = "PAYEE";
      montantPaye = montantTTC;
      // Différents modes de paiement
      const paiementRand = Math.random();
      if (paiementRand > 0.6) {
        modePaiement = "MOBILE_MONEY";
      } else if (paiementRand > 0.3) {
        modePaiement = "CARTE";
      } else if (paiementRand > 0.1) {
        modePaiement = "CASH";
      } else {
        modePaiement = "VIREMENT";
      }
      datePaiement = new Date(dateEmission.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString();
    } else if (rand > 0.25) {
      // 15% en retard
      statut = "EN_RETARD";
    }

    const annee = dateEmission.getFullYear();
    const numero = String(factureCount.current++).padStart(6, "0");

    factures.push({
      id: `FAC-${releve.id}`,
      numeroFacture: `FAC-${annee}-${numero}`,
      clientId: client.id,
      numeroCompteur: releve.numeroCompteur,
      periode: mois,
      dateEmission: dateEmission.toISOString(),
      dateEcheance: dateEcheance.toISOString(),
      indexAncien: releve.indexAncien,
      indexNouveau: releve.indexNouveau,
      consommation: releve.consommation,
      prixUnitaire,
      montantHT,
      tva,
      montantTTC,
      montantPaye,
      solde: montantTTC - montantPaye,
      statut,
      modePaiement,
      datePaiement,
      releveId: releve.id,
    });
  });

  return factures;
}

// Générer des paiements
export function generateDemoPaiements(factures: Facture[]): Paiement[] {
  const paiements: Paiement[] = [];

  factures.forEach((facture) => {
    if (facture.statut === "PAYEE" && facture.modePaiement && facture.datePaiement) {
      const canalPaiement = facture.modePaiement === "CASH" ? "GUICHET" : "SELF_SERVICE";

      paiements.push({
        id: `PAY-${facture.id}`,
        factureId: facture.id,
        numeroFacture: facture.numeroFacture,
        clientId: facture.clientId,
        montant: facture.montantTTC,
        modePaiement: facture.modePaiement,
        datePaiement: facture.datePaiement,
        canalPaiement,
        agentId: canalPaiement === "GUICHET" ? "GUICHET-001" : undefined,
        referenceTransaction: facture.modePaiement === "MOBILE_MONEY"
          ? `MM-${new Date(facture.datePaiement).toISOString().split("T")[0].replace(/-/g, "")}-${Math.floor(Math.random() * 1000)}`
          : facture.modePaiement === "CARTE"
          ? `CARD-${Math.floor(Math.random() * 10000)}`
          : undefined,
        statut: "VALIDE",
      });
    }
  });

  return paiements;
}

// Générer des plaintes
export function generateDemoPlaintes(clients: Client[], factures: Facture[]): Plainte[] {
  const plaintes: Plainte[] = [];
  const types = ["FACTURATION", "PANNE", "SERVICE", "AUTRE"] as const;

  // Générer des plaintes pour environ 5% des clients
  const clientsAvecPlaintes = clients.filter(() => Math.random() < 0.05);

  clientsAvecPlaintes.forEach((client, index) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const facture = factures.find((f) => f.clientId === client.id && f.statut === "EN_ATTENTE");

    const sujets = {
      FACTURATION: ["Montant facture élevé", "Facture incorrecte", "Double facturation"],
      PANNE: ["Coupure de courant", "Compteur défectueux", "Problème de connexion"],
      SERVICE: ["Service client insatisfaisant", "Délai de réponse trop long", "Agent impoli"],
      AUTRE: ["Autre problème", "Question générale", "Réclamation"],
    };

    const descriptions = {
      FACTURATION: [
        "Je trouve que le montant de ma facture est anormalement élevé par rapport à ma consommation habituelle.",
        "La facture ne correspond pas à ma consommation réelle.",
        "J'ai reçu deux factures pour la même période.",
      ],
      PANNE: [
        "Nous avons des coupures de courant fréquentes dans notre quartier.",
        "Le compteur ne fonctionne plus correctement.",
        "Problème de connexion électrique depuis plusieurs jours.",
      ],
      SERVICE: [
        "Le service client n'a pas répondu à mes demandes.",
        "Les délais de traitement sont trop longs.",
        "L'agent était impoli lors de sa visite.",
      ],
      AUTRE: [
        "J'aimerais obtenir plus d'informations.",
        "Question concernant mon abonnement.",
        "Réclamation générale.",
      ],
    };

    const sujet = sujets[type][Math.floor(Math.random() * sujets[type].length)];
    const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];

    const dateCreation = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    let statut: StatutPlainte = "NOUVELLE";
    let reponse: string | undefined;
    let dateResolution: string | undefined;
    let traitePar: string | undefined;

    if (Math.random() > 0.4) {
      // 60% des plaintes sont résolues
      statut = "RESOLUE";
      reponse = "Votre plainte a été traitée. Nous avons vérifié votre dossier et pris les mesures nécessaires.";
      dateResolution = new Date(dateCreation.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      traitePar = "Service Client SNEL";
    } else if (Math.random() > 0.5) {
      statut = "EN_COURS";
    }

    const annee = dateCreation.getFullYear();
    const numero = String(index + 1).padStart(4, "0");

    plaintes.push({
      id: `PLA-${client.id}-${index}`,
      numeroPlainte: `PLA-${annee}-${numero}`,
      clientId: client.id,
      numeroCompteur: client.numeroCompteur,
      type,
      sujet,
      description,
      dateCreation: dateCreation.toISOString(),
      statut,
      reponse,
      dateResolution,
      traitePar,
      factureId: facture?.id,
    });
  });

  return plaintes;
}

// Générer des avis
export function generateDemoAvis(clients: Client[]): Avis[] {
  const avis: Avis[] = [];
  const categories = ["SERVICE", "FACTURATION", "AGENT", "GENERAL"] as const;

  // Générer des avis pour environ 10% des clients
  const clientsAvecAvis = clients.filter(() => Math.random() < 0.1);

  clientsAvecAvis.forEach((client) => {
    const categorie = categories[Math.floor(Math.random() * categories.length)];
    const note = Math.floor(Math.random() * 5) + 1; // 1 à 5

    const commentaires = {
      SERVICE: [
        "Service rapide et efficace.",
        "Très satisfait du service client.",
        "Service à améliorer.",
        "Excellent service, je recommande.",
        "Service moyen, peut mieux faire.",
      ],
      FACTURATION: [
        "Les factures sont claires et précises.",
        "Système de facturation très pratique.",
        "Quelques erreurs dans les factures.",
        "Facturation transparente.",
        "Problèmes avec le système de facturation.",
      ],
      AGENT: [
        "Agent très professionnel et courtois.",
        "Agent ponctuel et efficace.",
        "Agent en retard et peu professionnel.",
        "Excellent agent, très serviable.",
        "Agent moyen.",
      ],
      GENERAL: [
        "Très satisfait de la SNEL.",
        "Service globalement bon.",
        "À améliorer sur plusieurs points.",
        "Excellent service public.",
        "Service correct mais perfectible.",
      ],
    };

    const commentaire = commentaires[categorie][Math.floor(Math.random() * commentaires[categorie].length)];

    const dateCreation = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

    avis.push({
      id: `AVI-${client.id}-${Date.now()}`,
      clientId: client.id,
      numeroCompteur: client.numeroCompteur,
      note,
      commentaire,
      dateCreation: dateCreation.toISOString(),
      categorie,
      visible: true,
    });
  });

  return avis;
}

// Agents de démonstration
export const demoAgents = [
  { id: "AGT-001", nom: "Jean KABONGO" },
  { id: "AGT-002", nom: "Marie MULUMBA" },
  { id: "AGT-003", nom: "Pierre KASENGA" },
  { id: "AGT-004", nom: "Paul TSHISEKEDI" },
  { id: "AGT-005", nom: "Sophie TSHILOMBO" },
  { id: "AGT-006", nom: "Lucie KABENGELE" },
  { id: "AGT-007", nom: "Didier MWAMBA" },
  { id: "AGT-008", nom: "Olivier KAZADI" },
  { id: "AGT-009", nom: "Stéphane NGALULA" },
  { id: "AGT-010", nom: "Laurent MUKASA" },
];

// Clients de test avec scénarios spécifiques pour les démos
export function generateTestClients(): { clients: Client[]; compteurs: Compteur[]; releves: ReleveCompteur[]; factures: Facture[]; paiements: Paiement[] } {
  const testClients: Client[] = [
    {
      id: "CLI-TEST-001",
      numeroCompteur: "CTR-TEST-001",
      nom: "Mukendi",
      prenom: "Jean",
      telephone: "+243900123456",
      email: "jean.mukendi@test.snel",
      adresse: "Avenue Kasa-Vubu 123, Kinshasa Centre",
      zone: "Kinshasa Centre",
      dateAbonnement: "2020-01-15T00:00:00Z",
      typeAbonnement: "DOMESTIQUE",
      actif: true,
    },
    {
      id: "CLI-TEST-002",
      numeroCompteur: "CTR-TEST-002",
      nom: "Kabila",
      prenom: "Marie",
      telephone: "+243900234567",
      email: "marie.kabila@test.snel",
      adresse: "Boulevard Triomphal 456, Kinshasa Est",
      zone: "Kinshasa Est",
      dateAbonnement: "2019-06-20T00:00:00Z",
      typeAbonnement: "COMMERCIAL",
      actif: true,
    },
    {
      id: "CLI-TEST-003",
      numeroCompteur: "CTR-TEST-003",
      nom: "Tshisekedi",
      prenom: "Pierre",
      telephone: "+243900345678",
      email: "pierre.tshisekedi@test.snel",
      adresse: "Avenue Lumumba 789, Lubumbashi",
      zone: "Lubumbashi",
      dateAbonnement: "2021-03-10T00:00:00Z",
      typeAbonnement: "DOMESTIQUE",
      actif: true,
    },
  ];

  const testCompteurs: Compteur[] = testClients.map((client, idx) => ({
    id: `CPT-TEST-${String(idx + 1).padStart(3, "0")}`,
    numeroCompteur: client.numeroCompteur,
    clientId: client.id,
    type: idx === 1 ? "TRIPHASE" : "MONOPHASE",
    puissance: idx === 1 ? 20 : 5,
    dateInstallation: client.dateAbonnement,
    actif: true,
  }));

  // Relevés de test
  const testReleves: ReleveCompteur[] = [
    {
      id: "REL-TEST-001",
      compteurId: "CPT-TEST-001",
      numeroCompteur: "CTR-TEST-001",
      agentId: "AGT-001",
      agentNom: "Jean KABONGO",
      indexAncien: 1250,
      indexNouveau: 1350,
      consommation: 100,
      dateReleve: "2024-01-15T08:00:00Z",
      dateSaisie: "2024-01-15T10:00:00Z",
      statut: "VALIDE",
    },
    {
      id: "REL-TEST-002",
      compteurId: "CPT-TEST-002",
      numeroCompteur: "CTR-TEST-002",
      agentId: "AGT-001",
      agentNom: "Jean KABONGO",
      indexAncien: 3500,
      indexNouveau: 3800,
      consommation: 300,
      dateReleve: "2024-01-15T09:00:00Z",
      dateSaisie: "2024-01-15T10:30:00Z",
      statut: "VALIDE",
    },
    {
      id: "REL-TEST-003",
      compteurId: "CPT-TEST-003",
      numeroCompteur: "CTR-TEST-003",
      agentId: "AGT-001",
      agentNom: "Jean KABONGO",
      indexAncien: 2000,
      indexNouveau: 2150,
      consommation: 150,
      dateReleve: "2024-01-15T10:00:00Z",
      dateSaisie: "2024-01-15T11:00:00Z",
      statut: "VALIDE",
    },
  ];

  const testFactures: Facture[] = [
    {
      id: "FAC-TEST-001",
      numeroFacture: "FAC-2024-TEST-001",
      clientId: "CLI-TEST-001",
      numeroCompteur: "CTR-TEST-001",
      periode: "Janvier 2024",
      dateEmission: "2024-01-20T00:00:00Z",
      dateEcheance: "2024-02-20T00:00:00Z",
      indexAncien: 1250,
      indexNouveau: 1350,
      consommation: 100,
      prixUnitaire: 150,
      montantHT: 15000,
      tva: 2700,
      montantTTC: 17700,
      montantPaye: 17700,
      solde: 0,
      statut: "PAYEE",
      modePaiement: "MOBILE_MONEY",
      datePaiement: "2024-01-25T14:30:00Z",
      releveId: "REL-TEST-001",
    },
    {
      id: "FAC-TEST-002",
      numeroFacture: "FAC-2024-TEST-002",
      clientId: "CLI-TEST-002",
      numeroCompteur: "CTR-TEST-002",
      periode: "Janvier 2024",
      dateEmission: "2024-01-20T00:00:00Z",
      dateEcheance: "2024-02-20T00:00:00Z",
      indexAncien: 3500,
      indexNouveau: 3800,
      consommation: 300,
      prixUnitaire: 120,
      montantHT: 36000,
      tva: 6480,
      montantTTC: 42480,
      montantPaye: 42480,
      solde: 0,
      statut: "PAYEE",
      modePaiement: "CARTE",
      datePaiement: "2024-01-22T10:15:00Z",
      releveId: "REL-TEST-002",
    },
    {
      id: "FAC-TEST-003",
      numeroFacture: "FAC-2024-TEST-003",
      clientId: "CLI-TEST-003",
      numeroCompteur: "CTR-TEST-003",
      periode: "Janvier 2024",
      dateEmission: "2024-01-20T00:00:00Z",
      dateEcheance: "2024-02-20T00:00:00Z",
      indexAncien: 2000,
      indexNouveau: 2150,
      consommation: 150,
      prixUnitaire: 150,
      montantHT: 22500,
      tva: 4050,
      montantTTC: 26550,
      montantPaye: 0,
      solde: 26550,
      statut: "EN_ATTENTE",
      releveId: "REL-TEST-003",
    },
  ];

  const testPaiements: Paiement[] = [
    {
      id: "PAY-TEST-001",
      factureId: "FAC-TEST-001",
      numeroFacture: "FAC-2024-TEST-001",
      clientId: "CLI-TEST-001",
      montant: 17700,
      modePaiement: "MOBILE_MONEY",
      datePaiement: "2024-01-25T14:30:00Z",
      canalPaiement: "SELF_SERVICE",
      referenceTransaction: "MM-20240125-123456",
      statut: "VALIDE",
    },
    {
      id: "PAY-TEST-002",
      factureId: "FAC-TEST-002",
      numeroFacture: "FAC-2024-TEST-002",
      clientId: "CLI-TEST-002",
      montant: 42480,
      modePaiement: "CARTE",
      datePaiement: "2024-01-22T10:15:00Z",
      canalPaiement: "SELF_SERVICE",
      referenceTransaction: "CARD-9876543210",
      statut: "VALIDE",
    },
  ];

  return {
    clients: testClients,
    compteurs: testCompteurs,
    releves: testReleves,
    factures: testFactures,
    paiements: testPaiements,
  };
}

// Fonction principale pour générer toutes les données de démonstration
export function generateAllDemoData(clientCount: number = 1000) {
  console.log(`🔄 Génération de ${clientCount} clients de démonstration...`);

  // Ajouter les clients de test en premier
  const testData = generateTestClients();

  const clients = [...testData.clients, ...generateDemoClients(clientCount)];
  console.log(`✅ ${clients.length} clients générés (incluant ${testData.clients.length} clients de test)`);

  const compteurs = [...testData.compteurs, ...generateDemoCompteurs(clients.slice(testData.clients.length))];
  console.log(`✅ ${compteurs.length} compteurs générés (incluant ${testData.compteurs.length} compteurs de test)`);

  // Générer les relevés pour tous les compteurs, mais préserver les relevés de test
  const relevesDemo = generateDemoReleves(compteurs, demoAgents, 12);
  // Filtrer les relevés de test pour éviter les doublons
  const relevesDemoFiltered = relevesDemo.filter(r => !r.id.startsWith("REL-TEST-"));
  const releves = [...testData.releves, ...relevesDemoFiltered];
  console.log(`✅ ${releves.length} relevés générés (incluant ${testData.releves.length} relevés de test)`);

  const factures = [...testData.factures, ...generateDemoFactures(releves, clients, compteurs)];
  console.log(`✅ ${factures.length} factures générées (incluant ${testData.factures.length} factures de test)`);

  const paiements = [...testData.paiements, ...generateDemoPaiements(factures)];
  console.log(`✅ ${paiements.length} paiements générés (incluant ${testData.paiements.length} paiements de test)`);

  const plaintes = generateDemoPlaintes(clients, factures);
  console.log(`✅ ${plaintes.length} plaintes générées`);

  const avis = generateDemoAvis(clients);
  console.log(`✅ ${avis.length} avis générés`);

  return {
    clients,
    compteurs,
    releves,
    factures,
    paiements,
    plaintes,
    avis,
  };
}

