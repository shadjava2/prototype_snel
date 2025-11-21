// Types pour la plateforme de facturation CRM SNEL

export type RoleSNEL = "CLIENT" | "AGENT" | "FACTURATION" | "ADMIN";

export type StatutFacture = "EN_ATTENTE" | "PAYEE" | "EN_RETARD" | "ANNULEE";

export type ModePaiement = "CASH" | "MOBILE_MONEY" | "CARTE" | "VIREMENT";

export type StatutPlainte = "NOUVELLE" | "EN_COURS" | "RESOLUE" | "FERMEE";

export type TypePlainte = "PANNE" | "FACTURATION" | "SERVICE" | "AUTRE";

export type StatutReleve = "SAISI" | "VALIDE" | "REJETE";

export interface UserSNEL {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: RoleSNEL;
  zoneId?: string; // Pour AGENT et FACTURATION
}

export interface Client {
  id: string;
  numeroCompteur: string;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  adresse: string;
  zone: string;
  dateAbonnement: string; // ISO string
  typeAbonnement: "DOMESTIQUE" | "COMMERCIAL" | "INDUSTRIEL";
  actif: boolean;
}

export interface Compteur {
  id: string;
  numeroCompteur: string;
  clientId: string;
  type: "MONOPHASE" | "TRIPHASE";
  puissance: number; // en kW
  dateInstallation: string; // ISO string
  actif: boolean;
}

export interface ReleveCompteur {
  id: string;
  compteurId: string;
  numeroCompteur: string;
  agentId: string;
  agentNom: string;
  indexAncien: number;
  indexNouveau: number;
  consommation: number; // kWh
  dateReleve: string; // ISO string
  dateSaisie: string; // ISO string
  statut: StatutReleve;
  observations?: string;
  photo?: string; // URL de la photo du compteur
}

export interface Facture {
  id: string;
  numeroFacture: string;
  clientId: string;
  numeroCompteur: string;
  periode: string; // Ex: "Janvier 2024"
  dateEmission: string; // ISO string
  dateEcheance: string; // ISO string
  indexAncien: number;
  indexNouveau: number;
  consommation: number; // kWh
  prixUnitaire: number; // FC par kWh
  montantHT: number;
  tva?: number;
  montantTTC: number;
  montantPaye: number;
  solde: number;
  statut: StatutFacture;
  modePaiement?: ModePaiement;
  datePaiement?: string; // ISO string
  releveId: string; // Référence au relevé utilisé
}

export interface Paiement {
  id: string;
  factureId: string;
  numeroFacture: string;
  clientId: string;
  montant: number;
  modePaiement: ModePaiement;
  datePaiement: string; // ISO string
  canalPaiement: "SELF_SERVICE" | "GUICHET" | "AGENT";
  agentId?: string; // Si paiement via agent
  referenceTransaction?: string;
  statut: "VALIDE" | "EN_ATTENTE" | "ECHEC";
}

export interface Plainte {
  id: string;
  numeroPlainte: string;
  clientId: string;
  numeroCompteur: string;
  type: TypePlainte;
  sujet: string;
  description: string;
  dateCreation: string; // ISO string
  statut: StatutPlainte;
  dateResolution?: string; // ISO string
  reponse?: string;
  traitePar?: string;
  factureId?: string; // Si liée à une facture
}

export interface Avis {
  id: string;
  clientId: string;
  numeroCompteur: string;
  note: number; // 1 à 5
  commentaire: string;
  dateCreation: string; // ISO string
  categorie: "SERVICE" | "FACTURATION" | "AGENT" | "GENERAL";
  visible: boolean;
}

export interface Zone {
  id: string;
  nom: string;
  code: string;
  description?: string;
}

