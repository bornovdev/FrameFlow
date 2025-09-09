import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./context/cart-context";
import { SettingsProvider } from "./hooks/use-settings";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductDetail from "@/pages/product-detail";
import CategoryPage from "@/pages/category-page";
import CollectionsPage from "@/pages/collections-page";
import OrdersPage from "@/pages/orders-page";
import SettingsPage from "@/pages/settings-page";
import Checkout from "@/pages/checkout";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/sunglasses" component={() => <CategoryPage categorySlug="sunglasses" />} />
      <ProtectedRoute path="/prescription-glasses" component={() => <CategoryPage categorySlug="prescription-glasses" />} />
      <ProtectedRoute path="/reading-glasses" component={() => <CategoryPage categorySlug="reading-glasses" />} />
      <ProtectedRoute path="/collections" component={CollectionsPage} />
      <ProtectedRoute path="/orders" component={OrdersPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/product/:slug" component={ProductDetail} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
