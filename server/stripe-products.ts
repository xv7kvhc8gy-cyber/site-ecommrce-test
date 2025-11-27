// Ce fichier définit les produits et prix Stripe de manière centralisée
// Note: Les produits sont gérés dans la base de données locale
// Stripe est utilisé uniquement pour le traitement des paiements

export const STRIPE_CONFIG = {
  currency: "eur",
  shippingCost: 0, // Livraison gratuite
};
