import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Package, Truck, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  pending: { label: "En attente", icon: Package, color: "text-yellow-500" },
  processing: { label: "En cours", icon: Package, color: "text-blue-500" },
  shipped: { label: "Expédiée", icon: Truck, color: "text-purple-500" },
  delivered: { label: "Livrée", icon: CheckCircle, color: "text-green-500" },
  cancelled: { label: "Annulée", icon: Package, color: "text-red-500" },
};

export default function Commandes() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toFixed(2) + " €";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <h1 className="mb-4 text-3xl font-bold">Mes commandes</h1>
            <p className="mb-8 text-muted-foreground">
              Veuillez vous connecter pour voir vos commandes.
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <Link href="/compte">
            <Button variant="ghost" size="sm" className="mb-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour au compte
            </Button>
          </Link>

          <h1 className="mb-8 text-3xl font-bold md:text-4xl">Mes commandes</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">Aucune commande</h2>
              <p className="mb-8 text-muted-foreground">
                Vous n'avez pas encore passé de commande
              </p>
              <Link href="/boutique">
                <Button size="lg" className="btn-glow">
                  Découvrir nos produits
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="card-premium overflow-hidden">
                    <div className="border-b border-border bg-card p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Commande n°
                          </p>
                          <p className="font-mono font-semibold">
                            {order.orderNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          <span className={`font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Numéro de suivi
                            </p>
                            <p className="font-mono text-sm font-medium">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Link href={`/compte/commandes/${order.id}`}>
                          <Button variant="outline">Voir les détails</Button>
                        </Link>
                        {order.status === "shipped" && order.trackingNumber && (
                          <Button variant="outline">Suivre le colis</Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
