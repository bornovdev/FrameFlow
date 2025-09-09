import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Product360Viewer from "@/components/product-360-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Heart, Truck, RotateCcw, Shield } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { getCurrencySymbol } = useSettings();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/products/slug/${slug}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        quantity: 1,
        options: selectedOptions,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8" data-testid="breadcrumb">
            <a href="/" className="hover:text-primary transition-colors duration-200">Home</a>
            <span>/</span>
            <a href="/" className="hover:text-primary transition-colors duration-200">Products</a>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images & 360 Viewer */}
            <div className="space-y-4">
              <Product360Viewer 
                images={product.images || []} 
                images360={product.images360 || []}
                productName={product.name}
              />
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-brand">
                    {product.brand || "Premium Collection"}
                  </span>
                  <div className="flex items-center">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground" data-testid="text-reviews">
                      (124 reviews)
                    </span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-product-name">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-description">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-foreground" data-testid="text-price">
                  {getCurrencySymbol()}{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through" data-testid="text-original-price">
                      {getCurrencySymbol()}{product.originalPrice}
                    </span>
                    <Badge variant="destructive" data-testid="badge-discount">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Product Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Frame Color</label>
                  <div className="flex space-x-3">
                    <button 
                      className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-primary shadow-sm"
                      onClick={() => setSelectedOptions({ ...selectedOptions, color: "gold" })}
                      data-testid="button-color-gold"
                    />
                    <button 
                      className="w-8 h-8 rounded-full bg-gray-400 border-2 border-border shadow-sm hover:border-primary transition-colors duration-200"
                      onClick={() => setSelectedOptions({ ...selectedOptions, color: "silver" })}
                      data-testid="button-color-silver"
                    />
                    <button 
                      className="w-8 h-8 rounded-full bg-rose-400 border-2 border-border shadow-sm hover:border-primary transition-colors duration-200"
                      onClick={() => setSelectedOptions({ ...selectedOptions, color: "rose" })}
                      data-testid="button-color-rose"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Lens Type</label>
                  <Select value={selectedOptions.lensType} onValueChange={(value) => setSelectedOptions({ ...selectedOptions, lensType: value })}>
                    <SelectTrigger className="w-full" data-testid="select-lens-type">
                      <SelectValue placeholder="Select lens type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear (No Prescription)</SelectItem>
                      <SelectItem value="reading">Reading (+1.0 to +3.0)</SelectItem>
                      <SelectItem value="prescription">Prescription (Upload Later)</SelectItem>
                      <SelectItem value="blue-light">Blue Light Blocking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <p className="text-sm text-green-600 font-medium" data-testid="text-stock">
                  In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-sm text-destructive font-medium" data-testid="text-out-of-stock">
                  Out of Stock
                </p>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex space-x-4">
                  <Button
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    data-testid="button-add-to-cart"
                  >
                    Add to Cart - ${product.price}
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-favorite">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-virtual-try-on">
                  Virtual Try-On
                </Button>
              </div>

              {/* Product Details */}
              <div className="border-t border-border pt-6">
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-foreground">Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <RotateCcw className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-foreground">30-day return policy</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground mr-3" />
                    <span className="text-foreground">1-year manufacturer warranty</span>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
