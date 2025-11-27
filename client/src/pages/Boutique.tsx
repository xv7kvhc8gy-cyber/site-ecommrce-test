import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Filter, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Boutique() {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery({
    categoryId: selectedCategory,
  });

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2) + " €";
  };

  const getFirstImage = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images[0] || "/placeholder-product.jpg";
    } catch {
      return "/placeholder-product.jpg";
    }
  };

  // Tri des produits
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
    const sorted = [...products];
    
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-card py-12">
          <div className="container">
            <h1 className="text-4xl font-bold md:text-5xl">Boutique</h1>
            <p className="mt-2 text-muted-foreground">
              Découvrez notre collection complète de produits premium
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8">
          <div className="container">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Catégories</h3>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === undefined ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(undefined)}
                      >
                        Toutes les catégories
                      </Button>
                      {categories?.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {/* Mobile Filter Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filtres
                    </Button>

                    <p className="text-sm text-muted-foreground">
                      {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Trier par:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Plus récent</SelectItem>
                        <SelectItem value="price-asc">Prix croissant</SelectItem>
                        <SelectItem value="price-desc">Prix décroissant</SelectItem>
                        <SelectItem value="name">Nom A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                  <div className="mb-6 rounded-lg border border-border bg-card p-4 lg:hidden">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold">Filtres</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === undefined ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedCategory(undefined);
                          setShowFilters(false);
                        }}
                      >
                        Toutes les catégories
                      </Button>
                      {categories?.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowFilters(false);
                          }}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : sortedProducts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Aucun produit trouvé dans cette catégorie.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedProducts.map((product) => (
                      <Link key={product.id} href={`/produit/${product.slug}`}>
                        <div className="card-premium group cursor-pointer overflow-hidden">
                          <div className="aspect-square overflow-hidden bg-secondary">
                            <img
                              src={getFirstImage(product.images)}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="mb-2 font-semibold text-foreground line-clamp-2">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
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
                            {product.stock === 0 && (
                              <p className="mt-2 text-sm text-destructive">Rupture de stock</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
