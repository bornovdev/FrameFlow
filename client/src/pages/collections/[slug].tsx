import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";
import { Product, Category } from "@shared/schema";

// Map of slug to category name and description
const categoryData: Record<string, { name: string; description: string }> = {
  'prescription-frames': {
    name: 'Prescription Frames',
    description: 'Stylish and comfortable frames for your prescription lenses'
  },
  'sunglasses': {
    name: 'Sunglasses',
    description: 'Protect your eyes with our stylish sunglasses collection'
  },
  'reading-glasses': {
    name: 'Reading Glasses',
    description: 'Comfortable and stylish reading glasses for every need'
  }
};

type CollectionType = 'prescription-frames' | 'sunglasses' | 'reading-glasses';

const CollectionPage = () => {
  const { slug = '' } = useParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products for the current category
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => api.getProducts({ categoryId: slug }),
    enabled: !!slug,
  });

  const collection = {
    name: categoryData[slug]?.name || 'Collection not found',
    description: categoryData[slug]?.description || 'The requested collection could not be found.',
    products: products || []
  };

  // Filter and sort products
  const filteredProducts = (collection.products || []).filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default: // featured
        return 0; // No specific sorting for featured in API data
    }
  });

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404 - Collection Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8">The collection you're looking for doesn't exist or has been moved.</p>
          <Button asChild>
            <a href="/collections">Back to Collections</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{collection.name}</h1>
          <p className="text-muted-foreground text-lg">{collection.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={`Search ${collection.name.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className={
            view === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price.toString()}
                image={product.images?.[0] || '/placeholder-product.jpg'}
                description={product.description}
                categoryId={product.categoryId}
              />
            ))}
          </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CollectionPage;
