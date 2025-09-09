import { useState } from "react";
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

// Dummy data for featured collections
const featuredCollections = [
  {
    id: "prescription-frames",
    name: "Prescription Frames",
    description: "Stylish and comfortable frames for your prescription lenses",
    slug: "prescription-frames",
    products: [
      {
        id: "pf1",
        name: "Classic Black Frames",
        price: "129.99",
        image: "/placeholder-prescription-1.jpg",
        categoryId: "prescription-frames"
      },
      {
        id: "pf2",
        name: "Tortoise Shell",
        price: "149.99",
        image: "/placeholder-prescription-2.jpg",
        categoryId: "prescription-frames"
      },
      {
        id: "pf3",
        name: "Round Gold Frames",
        price: "169.99",
        image: "/placeholder-prescription-3.jpg",
        categoryId: "prescription-frames"
      },
      {
        id: "pf4",
        name: "Aviator Style",
        price: "159.99",
        image: "/placeholder-prescription-4.jpg",
        categoryId: "prescription-frames"
      }
    ]
  },
  {
    id: "sunglasses",
    name: "Sunglasses",
    description: "Protect your eyes with our stylish sunglasses collection",
    slug: "sunglasses",
    products: [
      {
        id: "sg1",
        name: "Classic Aviator",
        price: "129.99",
        image: "/placeholder-sunglasses-1.jpg",
        categoryId: "sunglasses"
      },
      {
        id: "sg2",
        name: "Wayfarer Black",
        price: "119.99",
        image: "/placeholder-sunglasses-2.jpg",
        categoryId: "sunglasses"
      },
      {
        id: "sg3",
        name: "Cat Eye",
        price: "139.99",
        image: "/placeholder-sunglasses-3.jpg",
        categoryId: "sunglasses"
      },
      {
        id: "sg4",
        name: "Sport Wraparound",
        price: "149.99",
        image: "/placeholder-sunglasses-4.jpg",
        categoryId: "sunglasses"
      }
    ]
  },
  {
    id: "reading-glasses",
    name: "Reading Glasses",
    description: "Comfortable and stylish reading glasses for every need",
    slug: "reading-glasses",
    products: [
      {
        id: "rg1",
        name: "Slim Metal Frame",
        price: "59.99",
        image: "/placeholder-reading-1.jpg",
        categoryId: "reading-glasses"
      },
      {
        id: "rg2",
        name: "Classic Black",
        price: "49.99",
        image: "/placeholder-reading-2.jpg",
        categoryId: "reading-glasses"
      },
      {
        id: "rg3",
        name: "Half-Rim Design",
        price: "69.99",
        image: "/placeholder-reading-3.jpg",
        categoryId: "reading-glasses"
      },
      {
        id: "rg4",
        name: "Folding Portable",
        price: "79.99",
        image: "/placeholder-reading-4.jpg",
        categoryId: "reading-glasses"
      }
    ]
  }
];

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get all products from featured collections
  const allProducts = featuredCollections.flatMap(collection => 
    collection.products.map(product => ({
      ...product,
      images: [product.image],
      description: product.description || `${product.name} - Premium quality eyewear`,
      brand: "FrameFlow",
      categoryId: collection.id,
      category: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        slug: collection.slug
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  );

  // Get unique categories from products
  const categories = Array.from(new Set(allProducts.map(p => p.categoryId))).map(id => {
    const product = allProducts.find(p => p.categoryId === id);
    return product?.category || {
      id,
      name: id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: '',
      slug: id
    };
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => allProducts,
    select: (data) => {
      // Filter by category and search query
      let filtered = [...data]; // Create a copy to avoid mutating the original array
      
      if (selectedCategory !== "all") {
        filtered = filtered.filter(product => product.categoryId === selectedCategory);
      }
      
      if (searchQuery) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort products
      switch (sortBy) {
        case "price-low":
          return filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case "price-high":
          return filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        case "name":
          return filtered.sort((a, b) => a.name.localeCompare(b.name));
        case "brand":
          return filtered.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
        default: // newest
          return filtered.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
      }
    },
  });

  // Use categories from products
  const { data: remoteCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    initialData: categories, // Use local categories as fallback
  });
  
  const allCategories = remoteCategories || categories;

  // Group products by category for featured collections
  const productsByCategory = categories.map(category => ({
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
      slug: category.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    products: allProducts.filter(p => p.categoryId === category.id).slice(0, 4) // Show first 4 products per category
  }));

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
              {productsByCategory.map(({ category, products: categoryProducts }) => (
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
                              images: [product.image],
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
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64 mb-4"></div>
                    <div className="bg-muted rounded h-4 mb-2"></div>
                    <div className="bg-muted rounded h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
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
                  No products found matching your criteria.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }} 
                  variant="outline"
                >
                  Clear Filters
                </Button>
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