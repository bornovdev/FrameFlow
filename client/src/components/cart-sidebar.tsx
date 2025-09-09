import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { X, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { useLocation } from "wouter";

export default function CartSidebar() {
  const { 
    cartItems, 
    cartTotal, 
    cartSubtotal, 
    cartTax, 
    cartShipping, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setLocation('/checkout');
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-96 sm:max-w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2" data-testid="text-cart-title">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({cartItems.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full mt-6">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium text-foreground" data-testid="text-empty-cart">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add some products to get started
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setLocation('/');
                  }}
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-4" data-testid={`cart-item-${item.id}`}>
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-card-foreground text-sm" data-testid="text-item-name">
                              {item.product.name}
                            </h3>
                            {Object.keys(item.options || {}).length > 0 && (
                              <p className="text-xs text-muted-foreground" data-testid="text-item-options">
                                {Object.entries(item.options || {}).map(([key, value]) => 
                                  `${key}: ${value}`
                                ).join(', ')}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            data-testid="button-remove-item"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                              data-testid="button-decrease-quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium" data-testid="text-quantity">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                              data-testid="button-increase-quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold text-sm" data-testid="text-item-total">
                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Stock warning */}
                        {item.product.stock <= 5 && item.product.stock > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            Only {item.product.stock} left in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium" data-testid="text-subtotal">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium" data-testid="text-tax">
                      ${cartTax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium" data-testid="text-shipping">
                      {cartShipping === 0 ? 'Free' : `$${cartShipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {cartShipping === 0 && cartSubtotal >= 100 && (
                    <div className="flex items-center text-xs text-green-600 font-medium">
                      🎉 Free shipping applied!
                    </div>
                  )}
                  
                  {cartShipping > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Add ${(100 - cartSubtotal).toFixed(2)} more for free shipping
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-total">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsCartOpen(false)}
                  data-testid="button-continue-shopping-from-cart"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
