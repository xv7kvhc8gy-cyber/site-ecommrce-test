import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, Package, MapPin, LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";

export default function Compte() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <h1 className="mb-4 text-3xl font-bold">Mon compte</h1>
            <p className="mb-8 text-muted-foreground">
              Veuillez vous connecter pour accéder à votre compte.
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
          <h1 className="mb-8 text-3xl font-bold md:text-4xl">Mon compte</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="card-premium p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Profil</h2>
                  <p className="text-sm text-muted-foreground">
                    Informations personnelles
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{user?.name || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || "Non renseigné"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membre depuis</p>
                  <p className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                      : "Non disponible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <Link href="/compte/commandes">
              <div className="card-premium group cursor-pointer p-6 transition-all hover:scale-105">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Mes commandes</h2>
                    <p className="text-sm text-muted-foreground">
                      Historique et suivi
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground">
                  Consultez l'historique de vos commandes et suivez vos livraisons
                </p>

                <Button className="mt-4 w-full" variant="outline">
                  Voir mes commandes
                </Button>
              </div>
            </Link>

            {/* Addresses Card */}
            <Link href="/compte/adresses">
              <div className="card-premium group cursor-pointer p-6 transition-all hover:scale-105">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Mes adresses</h2>
                    <p className="text-sm text-muted-foreground">
                      Adresses de livraison
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground">
                  Gérez vos adresses de livraison enregistrées
                </p>

                <Button className="mt-4 w-full" variant="outline">
                  Gérer mes adresses
                </Button>
              </div>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
