import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: cartData } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cartItemsCount = cartData?.reduce((sum: number, item: any) => sum + item.cartItem.quantity, 0) || 0;

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Boutique", href: "/boutique" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center space-x-2 text-xl font-bold tracking-tight hover:opacity-80">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BOUTIQUE PREMIUM
            </span>
          </a>
        </Link>

        {/* Navigation Desktop */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>

        {/* Actions Desktop */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {/* Panier */}
          <Link href="/panier">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.name || user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/compte">
                    <a className="w-full cursor-pointer">Mon compte</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compte/commandes">
                    <a className="w-full cursor-pointer">Mes commandes</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/api/oauth/logout";
                  }}
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/api/oauth/login">
              <Button variant="outline" size="sm" className="btn-glow">
                <User className="mr-2 h-4 w-4" />
                Connexion
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container space-y-1 py-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-secondary ${
                    location === item.href
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              </Link>
            ))}
            
            <div className="pt-4 space-y-2">
              <Link href="/panier">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Panier {cartItemsCount > 0 && `(${cartItemsCount})`}
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/compte">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mon compte
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      window.location.href = "/api/oauth/logout";
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/api/oauth/login">
                  <Button
                    variant="default"
                    className="w-full btn-glow"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
