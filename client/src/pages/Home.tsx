import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const { data: newProducts } = trpc.products.list.useQuery({ isNew: true });
  const { data: featuredProducts } = trpc.products.list.useQuery({ featured: true });

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2) + " €";
  };

  const getFirstImage = (product: any) => {
    try {
      const images = JSON.parse(product.images);
      
      // Logique de remplacement d'image pour contourner le problème de DB
      if (product.name.includes("AirPods Pro")) {
        return "/airpods-pro-user.jpg";
      }
      if (product.name.includes("iPhone 17 Pro")) {
        return "/iphone-17-pro-user.jpg";
      }
      return images[0] || "/placeholder-product.jpg";
    } catch {
      return "/placeholder-product.jpg";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-card to-background py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
          
          <div className="container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card px-4 py-2">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Nouvelle Collection 2024</span>
              </div>
              
              <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Découvrez l'Excellence
              </h1>
              
              <p className="mb-8 text-xl text-muted-foreground md:text-2xl">
                Des produits de qualité, un design unique, une expérience d'achat fluide.
              </p>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/boutique">
                  <Button size="lg" className="btn-glow text-lg">
                    Acheter maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </section>

        {/* Nouveautés Section */}
        {newProducts && newProducts.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">Nouveautés</h2>
                  <p className="mt-2 text-muted-foreground">
                    Découvrez nos derniers produits
                  </p>
                </div>
                <Link href="/boutique">
                  <Button variant="outline">
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {newProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/produit/${product.slug}`}>
                    <div className="card-premium group cursor-pointer overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-secondary">
                        <img
                          src={getFirstImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 font-semibold text-foreground line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Produits Populaires Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="bg-card py-16 md:py-24">
            <div className="container">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">Produits Populaires</h2>
                  <p className="mt-2 text-muted-foreground">
                    Les favoris de nos clients
                  </p>
                </div>
                <Link href="/boutique">
                  <Button variant="outline">
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/produit/${product.slug}`}>
                    <div className="card-premium group cursor-pointer overflow-hidden">
                      <div className="aspect-square overflow-hidden bg-secondary">
                        <img
                          src={getFirstImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-2 font-semibold text-foreground line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="card-premium overflow-hidden">
              <div className="relative bg-gradient-to-r from-card via-secondary to-card p-12 text-center md:p-16">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative z-10">
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Prêt à découvrir notre collection ?
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground">
                    Explorez tous nos produits et trouvez celui qui vous correspond
                  </p>
                  <Link href="/boutique">
                    <Button size="lg" className="btn-glow">
                      Voir la boutique
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
