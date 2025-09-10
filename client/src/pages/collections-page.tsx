import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid, List, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { api } from "@/services/api";

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  // Fetch all categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  // Fetch products with filters
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', { category: selectedCategory, search: debouncedSearchQuery, sort: sortBy }],
    queryFn: () => api.getProducts({
      categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: debouncedSearchQuery || undefined,
      sortBy: sortBy,
    }),
  });

  // Fetch featured products by category
  const { data: featuredProductsByCategory = [] } = useQuery<Array<{ category: Category; products: Product[] }>>({
    queryKey: ['featured-products-by-category'],
    queryFn: async () => {
      const featuredCategories = categories.slice(0, 3); // Get first 3 categories for featured sections
      const results = await Promise.all(
        featuredCategories.map(async (category) => {
          const products = await api.getProductsByCategory(category.id, 4);
          return { category, products };
        })
      );
      return results.filter(item => item.products.length > 0);
    },
    enabled: categories.length > 0,
  });

  // Get unique categories from products
  const allCategories = categories;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="collections-title">
            Our Collections
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover our curated selection of premium eyewear designed for every style and occasion
          </p>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="featured">Featured Collections</TabsTrigger>
            <TabsTrigger value="all">All Products</TabsTrigger>
          </TabsList>
          
          {/* Featured Collections Tab */}
          <TabsContent value="featured">
            <div className="space-y-12">
              {featuredProductsByCategory.map(({ category, products: categoryProducts }) => (
                <div key={category.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {category.name}
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                    <Link href={`/collections/${category.slug}`}>
                      <Button variant="outline" data-testid={`view-all-${category.slug}`}>
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  
                  {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {categoryProducts.map((product) => (
                        <div key={product.id} className="h-full">
                          <ProductCard 
                            product={{
                              ...product,
                              description: product.description || `${product.name} - Premium quality eyewear`
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No products available in this collection yet.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* All Products Tab */}
          <TabsContent value="all">
            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-all"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category-all">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {isLoadingCategories ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort-all">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="brand">Brand A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64 mb-4"></div>
                    <div className="bg-muted rounded h-4 mb-2"></div>
                    <div className="bg-muted rounded h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {products.map((product) => (
                  <div key={product.id} className="h-full">
                    <ProductCard 
                      product={{
                        ...product,
                        images: product.images || [''],
                        description: product.description || `${product.name} - Premium quality eyewear`
                      }} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16" data-testid="no-products-all">
                <p className="text-muted-foreground text-lg mb-4">
                  {isLoadingCategories ? 'Loading products...' : 'No products found matching your criteria.'}
                </p>
                {!isLoadingCategories && (
                  <Button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }} 
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}