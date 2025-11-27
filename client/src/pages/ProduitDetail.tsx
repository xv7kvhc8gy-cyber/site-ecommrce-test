import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ShoppingCart, Star, ChevronLeft, Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function ProduitDetail() {
  const [, params] = useRoute("/produit/:slug");
  const slug = params?.slug || "";
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({ slug });
  const { data: reviewsData } = trpc.reviews.list.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success("Produit ajouté au panier");
      utils.cart.getItems.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout au panier");
    },
  });

  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avis publié avec succès");
      setComment("");
      setRating(5);
      utils.reviews.list.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la publication de l'avis");
    },
  });

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2) + " €";
  };

  const getImages = (imagesJson: string) => {
    try {
      const images = JSON.parse(imagesJson);
      return images.length > 0 ? images : ["/placeholder-product.jpg"];
    } catch {
      return ["/placeholder-product.jpg"];
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }
    if (!product) return;
    
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour laisser un avis");
      return;
    }
    if (!product) return;
    
    createReviewMutation.mutate({
      productId: product.id,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const calculateAverageRating = () => {
    if (!reviewsData || reviewsData.length === 0) return 0;
    const sum = reviewsData.reduce((acc, r) => acc + r.review.rating, 0);
    return sum / reviewsData.length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <Skeleton className="mb-8 h-8 w-32" />
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <h1 className="mb-4 text-3xl font-bold">Produit non trouvé</h1>
            <p className="mb-8 text-muted-foreground">
              Le produit que vous recherchez n'existe pas.
            </p>
            <Link href="/boutique">
              <Button>Retour à la boutique</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = getImages(product.images);
  const averageRating = calculateAverageRating();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <Link href="/boutique">
            <Button variant="ghost" size="sm" className="mb-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour à la boutique
            </Button>
          </Link>

          {/* Product Details */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-border hover:border-muted"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">{product.name}</h1>
                {reviewsData && reviewsData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(averageRating)
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({reviewsData.length} avis)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Description</h2>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}

              {product.stock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Quantité:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.stock} en stock)
                    </span>
                  </div>

                  <Button
                    size="lg"
                    className="w-full btn-glow"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                  <p className="font-medium text-destructive">Rupture de stock</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold">Avis clients</h2>

            {/* Add Review */}
            {isAuthenticated && (
              <div className="mb-8 rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Laisser un avis</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Note</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              value <= rating
                                ? "fill-primary text-primary"
                                : "text-muted"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Commentaire (optionnel)
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Partagez votre expérience avec ce produit..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                  >
                    Publier l'avis
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-6">
                {reviewsData.map(({ review, user }) => (
                  <div key={review.id} className="rounded-lg border border-border bg-card p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user?.name || "Utilisateur"}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                Aucun avis pour le moment. Soyez le premier à laisser un avis !
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
