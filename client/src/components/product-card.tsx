import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/context/cart-context";
import { useSettings } from "@/hooks/use-settings";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { getCurrencySymbol, settings } = useSettings();
  
  // Force re-render when currency changes
  const currencySymbol = getCurrencySymbol();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      quantity: 1,
      options: {},
    });
  };

  const discountPercentage = product.originalPrice 
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer" data-testid={`card-product-${product.id}`}>
        <div className="relative">
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/90 shadow-lg hover:bg-background"
              data-testid="button-360-view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge className="bg-primary text-primary-foreground text-xs">
              360° View
            </Badge>
          </div>
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide" data-testid="text-brand">
              {product.brand || 'Premium'}
            </span>
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-xs text-muted-foreground ml-1">4.8</span>
            </div>
          </div>
          <h3 className="font-semibold text-card-foreground mb-2" data-testid="text-product-name">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="text-description">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground" data-testid="text-price">
                {currencySymbol}{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through" data-testid="text-original-price">
                  {currencySymbol}{product.originalPrice}
                </span>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              data-testid="button-add-to-cart"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 mt-2 font-medium">
              Only {product.stock} left in stock!
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
