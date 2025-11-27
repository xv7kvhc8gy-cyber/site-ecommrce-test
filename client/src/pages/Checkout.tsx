import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { CreditCard, MapPin, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: cartItems, isLoading: cartLoading } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: addresses } = trpc.addresses.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "France",
    phone: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(false);

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2) + " €";
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.cartItem.quantity,
      0
    );
  };

  const createCheckoutMutation = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirection vers le paiement sécurisé...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la session de paiement");
      console.error(error);
    },
  });

  const handleSubmitOrder = async () => {
    if (!useNewAddress && !selectedAddressId) {
      toast.error("Veuillez sélectionner une adresse de livraison");
      return;
    }

    if (useNewAddress) {
      if (!newAddress.fullName || !newAddress.addressLine1 || !newAddress.city || !newAddress.postalCode) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    }

    createCheckoutMutation.mutate({
      addressId: selectedAddressId || undefined,
      newAddress: useNewAddress ? newAddress : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
            <p className="mb-8 text-muted-foreground">
              Veuillez vous connecter pour finaliser votre commande.
            </p>
            <Button size="lg" onClick={() => (window.location.href = "/api/oauth/login")}>
              Se connecter
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <Skeleton className="mb-8 h-10 w-48" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const total = calculateTotal();
  const isEmpty = !cartItems || cartItems.length === 0;

  if (isEmpty) {
    setLocation("/panier");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">Finaliser la commande</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Adresse de livraison</h2>
                </div>

                {addresses && addresses.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <RadioGroup
                      value={useNewAddress ? "new" : selectedAddressId?.toString()}
                      onValueChange={(value) => {
                        if (value === "new") {
                          setUseNewAddress(true);
                          setSelectedAddressId(null);
                        } else {
                          setUseNewAddress(false);
                          setSelectedAddressId(Number(value));
                        }
                      }}
                    >
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-start space-x-3 rounded-lg border border-border p-4"
                        >
                          <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} />
                          <Label
                            htmlFor={`address-${address.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.postalCode} {address.city}, {address.country}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                            )}
                          </Label>
                        </div>
                      ))}
                      <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                        <RadioGroupItem value="new" id="address-new" />
                        <Label htmlFor="address-new" className="cursor-pointer font-medium">
                          Utiliser une nouvelle adresse
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {(useNewAddress || !addresses || addresses.length === 0) && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="fullName">Nom complet *</Label>
                        <Input
                          id="fullName"
                          value={newAddress.fullName}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, fullName: e.target.value })
                          }
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, phone: e.target.value })
                          }
                          placeholder="+33 6 12 34 56 78"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="addressLine1">Adresse *</Label>
                      <Input
                        id="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, addressLine1: e.target.value })
                        }
                        placeholder="123 Rue de la Paix"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressLine2">Complément d'adresse</Label>
                      <Input
                        id="addressLine2"
                        value={newAddress.addressLine2}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, addressLine2: e.target.value })
                        }
                        placeholder="Appartement, étage, etc."
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="postalCode">Code postal *</Label>
                        <Input
                          id="postalCode"
                          value={newAddress.postalCode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, postalCode: e.target.value })
                          }
                          placeholder="75001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Ville *</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                          placeholder="Paris"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Pays *</Label>
                        <Input
                          id="country"
                          value={newAddress.country}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, country: e.target.value })
                          }
                          placeholder="France"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method - Placeholder */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Paiement</h2>
                </div>
                <p className="text-muted-foreground">
                  Le paiement sécurisé sera traité à l'étape suivante via Stripe.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Récapitulatif</h2>
                </div>

                <div className="space-y-3 border-b border-border pb-4">
                  {cartItems?.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    return (
                      <div key={item.cartItem.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {product.name} × {item.cartItem.quantity}
                        </span>
                        <span className="font-medium">
                          {formatPrice(product.price * item.cartItem.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">Gratuite</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>

                <Button
                  size="lg"
                  className="mt-6 w-full btn-glow"
                  onClick={handleSubmitOrder}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? "Chargement..." : "Procéder au paiement"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
