import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🍎 Adding Apple products...");

  // Ajouter la catégorie Apple
  console.log("Creating Apple category...");
  await db.insert(categories).values({
    name: "Apple",
    slug: "apple",
    description: "Produits Apple officiels - iPhone, iPad, AirPods et plus"
  }).onDuplicateKeyUpdate({ set: { name: "Apple" } });

  // Récupérer l'ID de la catégorie Apple (supposons ID 4)
  const appleProducts = [
    // iPhone 17 Series
    {
      name: "iPhone 17 Pro Max",
      slug: "iphone-17-pro-max",
      description: "Le summum de l'innovation Apple. Écran Super Retina XDR de 6,9 pouces, puce A19 Pro, système de caméra révolutionnaire avec téléobjectif 5x, et autonomie exceptionnelle. Disponible en Titane naturel, Titane bleu, Titane blanc et Titane noir.",
      price: 149900, // 1499.00 EUR
      compareAtPrice: null,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800",
        "https://images.unsplash.com/photo-1678652197838-b5d52d0d4b5c?w=800"
      ]),
      stock: 25,
      featured: true,
      isNew: true,
    },
    {
      name: "iPhone 17 Pro",
      slug: "iphone-17-pro",
      description: "Performance professionnelle dans un format compact. Écran de 6,3 pouces, puce A19 Pro, triple caméra avec téléobjectif 3x, et construction en titane. Le choix parfait pour les créateurs.",
      price: 129900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1696446702403-74d6f05eefa8?w=800",
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"
      ]),
      stock: 30,
      featured: true,
      isNew: true,
    },
    {
      name: "iPhone 17",
      slug: "iphone-17",
      description: "L'iPhone pour tous. Écran Super Retina XDR de 6,1 pouces, puce A19, double caméra 48 Mpx, et design en aluminium coloré. Disponible en Rose, Jaune, Vert, Bleu et Noir.",
      price: 99900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1592286927505-2fd0c2f8d3d3?w=800"
      ]),
      stock: 50,
      featured: false,
      isNew: true,
    },
    
    // iPhone 16 Series
    {
      name: "iPhone 16 Pro Max",
      slug: "iphone-16-pro-max",
      description: "Puissance et élégance. Écran de 6,7 pouces, puce A18 Pro, système de caméra Pro avec téléobjectif 5x, et enregistrement vidéo 4K ProRes. Construction en titane premium.",
      price: 139900,
      compareAtPrice: 149900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678911820864-e5c67c5d3d29?w=800"
      ]),
      stock: 35,
      featured: true,
      isNew: false,
    },
    {
      name: "iPhone 16 Pro",
      slug: "iphone-16-pro",
      description: "Pro dans tous les sens. Écran de 6,1 pouces, puce A18 Pro, triple caméra professionnelle, et Action Button personnalisable. Parfait pour la création de contenu.",
      price: 119900,
      compareAtPrice: 129900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678652197329-f9dc8e3b3b7d?w=800"
      ]),
      stock: 40,
      featured: false,
      isNew: false,
    },
    {
      name: "iPhone 16",
      slug: "iphone-16",
      description: "L'essentiel de l'iPhone. Écran de 6,1 pouces, puce A18, double caméra 48 Mpx avec mode Portrait nouvelle génération, et design en aluminium.",
      price: 89900,
      compareAtPrice: 99900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678652197838-b5d52d0d4b5c?w=800"
      ]),
      stock: 60,
      featured: false,
      isNew: false,
    },

    // iPhone 15 Series
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Excellence éprouvée. Écran de 6,7 pouces, puce A17 Pro, téléobjectif 5x, et construction en titane. Un excellent rapport qualité-prix pour un Pro.",
      price: 119900,
      compareAtPrice: 139900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800"
      ]),
      stock: 30,
      featured: false,
      isNew: false,
    },
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      description: "Performances Pro accessibles. Écran de 6,1 pouces, puce A17 Pro, triple caméra, et Action Button. Idéal pour passer au Pro.",
      price: 99900,
      compareAtPrice: 119900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1696446702403-74d6f05eefa8?w=800"
      ]),
      stock: 45,
      featured: false,
      isNew: false,
    },
    {
      name: "iPhone 15",
      slug: "iphone-15",
      description: "Fiabilité et performance. Écran de 6,1 pouces, puce A16 Bionic, double caméra 48 Mpx, et Dynamic Island. Un choix intelligent.",
      price: 79900,
      compareAtPrice: 89900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1678911820864-e5c67c5d3d29?w=800"
      ]),
      stock: 70,
      featured: false,
      isNew: false,
    },

    // AirPods
    {
      name: "AirPods Pro (2ᵉ génération)",
      slug: "airpods-pro-2",
      description: "Son immersif avec réduction active du bruit adaptative, mode Transparence adaptatif, et audio spatial personnalisé. Étui de charge MagSafe avec haut-parleur intégré et lanière. Jusqu'à 6h d'autonomie.",
      price: 27900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"
      ]),
      stock: 80,
      featured: true,
      isNew: false,
    },
    {
      name: "AirPods (3ᵉ génération)",
      slug: "airpods-3",
      description: "Audio spatial avec suivi dynamique de la tête, égaliseur adaptatif, et résistance à l'eau et à la transpiration. Étui de charge MagSafe. Jusqu'à 6h d'autonomie.",
      price: 19900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800"
      ]),
      stock: 100,
      featured: false,
      isNew: false,
    },
    {
      name: "AirPods Max",
      slug: "airpods-max",
      description: "Casque circum-auriculaire avec réduction active du bruit, mode Transparence, audio spatial, et son haute fidélité. Arceau en maille et coussinets à mémoire de forme. Disponible en 5 couleurs.",
      price: 59900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1625740515823-f06d5a0d6c1f?w=800"
      ]),
      stock: 25,
      featured: true,
      isNew: false,
    },

    // iPad
    {
      name: "iPad Pro 13 pouces (M4)",
      slug: "ipad-pro-13-m4",
      description: "L'iPad le plus puissant. Écran Ultra Retina XDR de 13 pouces, puce M4, caméra TrueDepth avant, et compatibilité Apple Pencil Pro. Parfait pour les professionnels créatifs.",
      price: 149900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"
      ]),
      stock: 20,
      featured: true,
      isNew: true,
    },
    {
      name: "iPad Pro 11 pouces (M4)",
      slug: "ipad-pro-11-m4",
      description: "Puissance Pro dans un format portable. Écran Ultra Retina XDR de 11 pouces, puce M4, et compatibilité Apple Pencil Pro. Idéal pour travailler en déplacement.",
      price: 119900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"
      ]),
      stock: 30,
      featured: true,
      isNew: true,
    },
    {
      name: "iPad Air 13 pouces (M2)",
      slug: "ipad-air-13-m2",
      description: "Grand écran, grandes possibilités. Écran Liquid Retina de 13 pouces, puce M2, et compatibilité Apple Pencil Pro. Le choix parfait pour la créativité.",
      price: 89900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1585790050230-5dd28404f905?w=800"
      ]),
      stock: 40,
      featured: false,
      isNew: false,
    },
    {
      name: "iPad Air 11 pouces (M2)",
      slug: "ipad-air-11-m2",
      description: "Léger et puissant. Écran Liquid Retina de 11 pouces, puce M2, et design fin. Parfait pour le divertissement et la productivité.",
      price: 69900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"
      ]),
      stock: 50,
      featured: false,
      isNew: false,
    },
    {
      name: "iPad (10ᵉ génération)",
      slug: "ipad-10",
      description: "L'iPad pour tous. Écran Liquid Retina de 10,9 pouces, puce A14 Bionic, et design tout écran. Disponible en Argent, Bleu, Rose et Jaune.",
      price: 44900,
      categoryId: 4,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"
      ]),
      stock: 80,
      featured: false,
      isNew: false,
    },
  ];

  console.log("Adding Apple products...");
  for (const product of appleProducts) {
    await db.insert(products).values(product).onDuplicateKeyUpdate({ set: { name: product.name } });
  }

  console.log("✅ Apple products added successfully!");
  console.log(`📱 Added ${appleProducts.length} Apple products`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
