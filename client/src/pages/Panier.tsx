import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Panier() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: cartItems, isLoading } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.getItems.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      toast.success("Produit retiré du panier");
      utils.cart.getItems.invalidate();
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
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

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.cartItem.quantity,
      0
    );
  };

  const handleUpdateQuantity = (cartItemId: number, newQuantity: number) => {
    updateQuantityMutation.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemoveItem = (cartItemId: number) => {
    removeItemMutation.mutate({ cartItemId });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h1 className="mb-4 text-3xl font-bold">Panier</h1>
            <p className="mb-8 text-muted-foreground">
              Veuillez vous connecter pour accéder à votre panier.
            </p>
            <Link href="/api/oauth/login">
              <Button size="lg" className="btn-glow">
                Se connecter
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <Skeleton className="mb-8 h-10 w-48" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const total = calculateTotal();
  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">Panier</h1>

          {isEmpty ? (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">Votre panier est vide</h2>
              <p className="mb-8 text-muted-foreground">
                Découvrez nos produits et ajoutez-les à votre panier
              </p>
              <Link href="/boutique">
                <Button size="lg" className="btn-glow">
                  Continuer mes achats
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <div
                      key={item.cartItem.id}
                      className="flex gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      <Link href={`/produit/${product.slug}`}>
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <img
                            src={getFirstImage(product.images)}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link href={`/produit/${product.slug}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cartItem.id,
                                  Math.max(1, item.cartItem.quantity - 1)
                                )
                              }
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.cartItem.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.cartItem.id,
                                  Math.min(product.stock, item.cartItem.quantity + 1)
                                )
                              }
                              disabled={updateQuantityMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.cartItem.id)}
                            disabled={removeItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(product.price * item.cartItem.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="mb-6 text-xl font-bold">Récapitulatif</h2>

                  <div className="space-y-3 border-b border-border pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="font-medium">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="font-medium">Calculée à l'étape suivante</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button size="lg" className="mt-6 w-full btn-glow">
                      Passer la commande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="/boutique">
                    <Button variant="ghost" className="mt-4 w-full">
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
