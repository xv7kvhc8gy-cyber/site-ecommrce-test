import { drizzle } from "drizzle-orm/mysql2";
import { categories, products } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const sampleCategories = [
  { name: "Électronique", slug: "electronique", description: "Produits électroniques haut de gamme" },
  { name: "Mode", slug: "mode", description: "Vêtements et accessoires premium" },
  { name: "Maison", slug: "maison", description: "Décoration et mobilier de luxe" },
];

const sampleProducts = [
  {
    name: "Casque Audio Premium",
    slug: "casque-audio-premium",
    description: "Casque sans fil avec réduction de bruit active et son haute définition",
    price: 29900, // 299.00 EUR
    compareAtPrice: 39900,
    categoryId: 1,
    images: JSON.stringify(["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]),
    stock: 50,
    featured: true,
    isNew: true,
  },
  {
    name: "Montre Connectée Elite",
    slug: "montre-connectee-elite",
    description: "Montre intelligente avec suivi santé complet et design élégant",
    price: 39900,
    compareAtPrice: 49900,
    categoryId: 1,
    images: JSON.stringify(["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]),
    stock: 30,
    featured: true,
    isNew: false,
  },
  {
    name: "Sac à Dos Cuir",
    slug: "sac-a-dos-cuir",
    description: "Sac à dos en cuir véritable avec compartiment laptop",
    price: 24900,
    categoryId: 2,
    images: JSON.stringify(["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]),
    stock: 20,
    featured: false,
    isNew: true,
  },
  {
    name: "Lunettes de Soleil Design",
    slug: "lunettes-soleil-design",
    description: "Lunettes de soleil polarisées avec monture premium",
    price: 14900,
    compareAtPrice: 19900,
    categoryId: 2,
    images: JSON.stringify(["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"]),
    stock: 40,
    featured: true,
    isNew: false,
  },
  {
    name: "Lampe Design Moderne",
    slug: "lampe-design-moderne",
    description: "Lampe de bureau LED avec contrôle tactile et luminosité réglable",
    price: 8900,
    categoryId: 3,
    images: JSON.stringify(["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"]),
    stock: 60,
    featured: false,
    isNew: true,
  },
  {
    name: "Coussin Velours Premium",
    slug: "coussin-velours-premium",
    description: "Coussin en velours avec rembourrage haute densité",
    price: 4900,
    categoryId: 3,
    images: JSON.stringify(["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800"]),
    stock: 100,
    featured: false,
    isNew: false,
  },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Insert categories
  console.log("Adding categories...");
  for (const category of sampleCategories) {
    await db.insert(categories).values(category).onDuplicateKeyUpdate({ set: { name: category.name } });
  }

  // Insert products
  console.log("Adding products...");
  for (const product of sampleProducts) {
    await db.insert(products).values(product).onDuplicateKeyUpdate({ set: { name: product.name } });
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
