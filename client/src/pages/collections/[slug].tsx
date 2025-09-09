import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import { useState } from "react";

// Dummy data for collections
const collectionsData = {
  'prescription-frames': {
    name: 'Prescription Frames',
    description: 'Stylish and comfortable frames for your prescription lenses',
    products: [
      {
        id: 'pf1',
        name: 'Classic Black Frames',
        price: '129.99',
        image: '/placeholder-prescription-1.jpg',
        description: 'Timeless black frames for a professional look',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf2',
        name: 'Tortoise Shell',
        price: '149.99',
        image: '/placeholder-prescription-2.jpg',
        description: 'Classic tortoise shell pattern for a sophisticated style',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf3',
        name: 'Round Gold Frames',
        price: '169.99',
        image: '/placeholder-prescription-3.jpg',
        description: 'Elegant gold frames with a vintage touch',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf4',
        name: 'Aviator Style',
        price: '159.99',
        image: '/placeholder-prescription-4.jpg',
        description: 'Classic aviator design for a bold statement',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf5',
        name: 'Rimless Frames',
        price: '179.99',
        image: '/placeholder-prescription-1.jpg',
        description: 'Lightweight and minimal rimless design',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf6',
        name: 'Half-Rim Frames',
        price: '149.99',
        image: '/placeholder-prescription-2.jpg',
        description: 'Sleek half-rim design for a modern look',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf7',
        name: 'Browline Glasses',
        price: '159.99',
        image: '/placeholder-prescription-3.jpg',
        description: 'Vintage-inspired browline frames',
        categoryId: 'prescription-frames'
      },
      {
        id: 'pf8',
        name: 'Cat Eye Frames',
        price: '169.99',
        image: '/placeholder-prescription-4.jpg',
        description: 'Feminine and stylish cat eye design',
        categoryId: 'prescription-frames'
      }
    ]
  },
  'sunglasses': {
    name: 'Sunglasses',
    description: 'Protect your eyes with our stylish sunglasses collection',
    products: [
      {
        id: 'sg1',
        name: 'Classic Aviator',
        price: '129.99',
        image: '/placeholder-sunglasses-1.jpg',
        description: 'Timeless aviator style with UV protection',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg2',
        name: 'Wayfarer Black',
        price: '119.99',
        image: '/placeholder-sunglasses-2.jpg',
        description: 'Iconic wayfarer design in classic black',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg3',
        name: 'Cat Eye',
        price: '139.99',
        image: '/placeholder-sunglasses-3.jpg',
        description: 'Feminine cat eye sunglasses',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg4',
        name: 'Sport Wraparound',
        price: '149.99',
        image: '/placeholder-sunglasses-4.jpg',
        description: 'Durable wraparound sunglasses for sports',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg5',
        name: 'Round Metal Frames',
        price: '134.99',
        image: '/placeholder-sunglasses-1.jpg',
        description: 'Vintage round metal frame sunglasses',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg6',
        name: 'Oversized Square',
        price: '159.99',
        image: '/placeholder-sunglasses-2.jpg',
        description: 'Chic oversized square sunglasses',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg7',
        name: 'Polarized Aviators',
        price: '169.99',
        image: '/placeholder-sunglasses-3.jpg',
        description: 'Polarized lenses for reduced glare',
        categoryId: 'sunglasses'
      },
      {
        id: 'sg8',
        name: 'Mirrored Lenses',
        price: '144.99',
        image: '/placeholder-sunglasses-4.jpg',
        description: 'Stylish mirrored lenses with UV protection',
        categoryId: 'sunglasses'
      }
    ]
  },
  'reading-glasses': {
    name: 'Reading Glasses',
    description: 'Comfortable and stylish reading glasses for every need',
    products: [
      {
        id: 'rg1',
        name: 'Slim Metal Frame',
        price: '59.99',
        image: '/placeholder-reading-1.jpg',
        description: 'Lightweight metal frames for all-day comfort',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg2',
        name: 'Classic Black',
        price: '49.99',
        image: '/placeholder-reading-2.jpg',
        description: 'Classic black reading glasses',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg3',
        name: 'Half-Rim Design',
        price: '69.99',
        image: '/placeholder-reading-3.jpg',
        description: 'Stylish half-rim reading glasses',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg4',
        name: 'Folding Portable',
        price: '79.99',
        image: '/placeholder-reading-4.jpg',
        description: 'Compact folding reading glasses',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg5',
        name: 'Blue Light Blocking',
        price: '64.99',
        image: '/placeholder-reading-1.jpg',
        description: 'Blue light filtering reading glasses',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg6',
        name: 'Tortoise Shell',
        price: '54.99',
        image: '/placeholder-reading-2.jpg',
        description: 'Classic tortoise shell reading glasses',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg7',
        name: 'Bifocal Readers',
        price: '74.99',
        image: '/placeholder-reading-3.jpg',
        description: 'Bifocal reading glasses for multiple prescriptions',
        categoryId: 'reading-glasses'
      },
      {
        id: 'rg8',
        name: 'Magnetic Clip-On',
        price: '84.99',
        image: '/placeholder-reading-4.jpg',
        description: 'Reading glasses with magnetic clip-on sunglasses',
        categoryId: 'reading-glasses'
      }
    ]
  }
};

type CollectionType = 'prescription-frames' | 'sunglasses' | 'reading-glasses';

const CollectionPage = () => {
  const { slug } = useParams<{ slug: CollectionType }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get collection data based on slug
  const collection = collectionsData[slug as keyof typeof collectionsData];

  // Filter and sort products
  const filteredProducts = collection?.products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default: // newest
        return 0; // No specific sorting for newest in dummy data
    }
  }) || [];

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
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className="h-full">
                <ProductCard 
                  product={{
                    ...product,
                    images: [product.image],
                    description: product.description
                  }} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No products found matching your search.
            </p>
            <Button 
              onClick={() => setSearchQuery('')}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CollectionPage;
