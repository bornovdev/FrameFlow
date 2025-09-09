import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Product, Category } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [location, setLocation] = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleNavigation = (path: string, buttonId?: string) => {
    if (buttonId) {
      setIsButtonLoading(buttonId);
    } else {
      setIsNavigating(true);
    }
    
    setTimeout(() => {
      setLocation(path);
    }, 600);
  };
  
  const handleCategoryClick = (path: string) => {
    handleNavigation(path);
  };

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", categoryFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("categoryId", categoryFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    setSearchQuery(formData.get("search") as string);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-muted py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Discover Your Perfect
                <span className="text-primary block">Vision</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Premium eyewear crafted with precision. Experience our revolutionary 360° view technology and find frames that truly fit your style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 relative"
                  onClick={() => handleNavigation("/collections", "explore")}
                  data-testid="button-explore-collection"
                  disabled={!!isButtonLoading}
                >
                  {isButtonLoading === "explore" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Explore Collection'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleNavigation("/virtual-try-on", "tryon")}
                  data-testid="button-virtual-try-on"
                  disabled={!!isButtonLoading}
                >
                  {isButtonLoading === "tryon" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Virtual Try-On'
                  )}
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Premium designer eyeglasses" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">Find the perfect frames for every occasion</p>
          </div>
          
          <AnimatePresence>
            {isNavigating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-card p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-4"
                >
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  <p className="text-lg font-medium">Loading collection...</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="group cursor-pointer" 
                onClick={() => handleCategoryClick('/collections/prescription-frames')}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=600&h=400" 
                    alt="Prescription glasses" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Prescription Frames</h3>
                    <p className="text-muted-foreground mb-4">Classic and modern designs for everyday wear</p>
                    <span className="text-primary font-medium">From $99</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="group cursor-pointer" 
                onClick={() => handleCategoryClick('/collections/sunglasses')}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&h=400" 
                    alt="Designer sunglasses" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Sunglasses</h3>
                    <p className="text-muted-foreground mb-4">UV protection with uncompromising style</p>
                    <span className="text-primary font-medium">From $149</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="group cursor-pointer" 
                onClick={() => handleCategoryClick('/collections/reading-glasses')}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1556306535-38febf6782e7?auto=format&fit=crop&w=600&h=400" 
                    alt="Reading glasses" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">Reading Glasses</h3>
                    <p className="text-muted-foreground mb-4">Comfortable magnification for close work</p>
                    <span className="text-primary font-medium">From $79</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Discover our most popular frames</p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  name="search"
                  placeholder="Search products..."
                  className="w-48"
                  data-testid="input-search"
                />
                <Button type="submit" size="sm" data-testid="button-search">
                  Search
                </Button>
              </form>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.filter(category => category.id && category.id.trim() !== '').map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" data-testid="button-view-all">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
