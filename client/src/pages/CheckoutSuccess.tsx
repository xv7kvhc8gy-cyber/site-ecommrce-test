import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckoutSuccess() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Vider le panier localement (déjà fait côté serveur via webhook)
    // Ici on pourrait invalider le cache tRPC si nécessaire
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-16">
        <div className="container max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Paiement réussi !
          </h1>

          <p className="mb-8 text-lg text-muted-foreground">
            Votre commande a été confirmée et sera traitée dans les plus brefs délais.
            Vous recevrez un email de confirmation avec les détails de votre commande.
          </p>

          {sessionId && (
            <div className="mb-8 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Référence de transaction
              </p>
              <p className="font-mono text-sm">{sessionId}</p>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/compte/commandes">
              <Button size="lg" className="btn-glow">
                <Package className="mr-2 h-5 w-5" />
                Voir mes commandes
              </Button>
            </Link>
            <Link href="/boutique">
              <Button size="lg" variant="outline">
                Continuer mes achats
              </Button>
            </Link>
          </div>

          <div className="mt-12 rounded-lg border border-border bg-card p-6 text-left">
            <h2 className="mb-4 text-xl font-bold">Prochaines étapes</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>
                  Vous recevrez un email de confirmation avec les détails de votre commande
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>
                  Votre commande sera préparée et expédiée dans les 2-3 jours ouvrés
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>
                  Vous pourrez suivre votre colis via votre espace client
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
