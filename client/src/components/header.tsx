import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/cart-context";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CartSidebar from "./cart-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  LogOut, 
  Settings,
  Package,
  BarChart3
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="link-logo">
                  {settings.storeName}
                </h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                      Shop
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/collections/prescription-frames" className="w-full">Prescription Frames</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/collections/sunglasses" className="w-full">Sunglasses</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/collections/reading-glasses" className="w-full">Reading Glasses</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link 
                  href="/collections" 
                  className={`transition-colors duration-200 ${
                    location === "/collections" ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`} 
                  data-testid="link-collections"
                >
                  Collections
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-search">
                <Search className="h-5 w-5" />
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium">
                      {user.firstName} {user.lastName}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" data-testid="link-orders" asChild>
                      <Link href="/orders">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" data-testid="link-settings" asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem className="cursor-pointer" data-testid="link-admin" asChild>
                        <Link href="/admin">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" size="icon" data-testid="button-auth">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-0"
                    data-testid="badge-cart-count"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="px-2 py-2 text-foreground hover:text-primary transition-colors duration-200" data-testid="mobile-link-frames">
                  Frames
                </Link>
                <Link href="/sunglasses" className="px-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="mobile-link-sunglasses">
                  Sunglasses
                </Link>
                <Link href="/reading-glasses" className="px-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="mobile-link-reading">
                  Reading
                </Link>
                <Link href="/collections" className="px-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="mobile-link-collections">
                  Collections
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <CartSidebar />
    </>
  );
}
