import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/cart-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from 'wouter';
import { useSettings } from "@/hooks/use-settings";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : Promise.resolve(null);

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  // Check if this is a development mode payment
  const isDevelopmentMode = clientSecret.startsWith('pi_dev_');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required shipping information
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.address || 
        !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping information fields.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isDevelopmentMode) {
        // Handle development mode payment (no Stripe processing)
        console.log('Processing development mode payment');
        
        // Extract payment intent ID from client secret for development mode
        const paymentIntentId = clientSecret.split('_secret_')[0];
        
        // Confirm the order on the backend
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: paymentIntentId,
          shippingAddress: shippingInfo,
        });

        toast({
          title: "Order Successful!",
          description: "Thank you for your purchase. Your order is being processed.",
        });
        
        setLocation('/');
        return;
      }

      // Regular Stripe processing
      if (!stripe || !elements) {
        toast({
          title: "Payment Failed",
          description: "Payment system not available. Please try again later.",
          variant: "destructive",
        });
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === 'succeeded') {
        // Confirm the order on the backend
        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: paymentIntent.id,
          shippingAddress: shippingInfo,
        });

        toast({
          title: "Order Successful!",
          description: "Thank you for your purchase. Your order is being processed.",
        });
        
        setLocation('/');
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={shippingInfo.firstName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                required
                data-testid="input-first-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={shippingInfo.lastName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                required
                data-testid="input-last-name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
              required
              data-testid="input-address"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                required
                data-testid="input-city"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={shippingInfo.state}
                onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                required
                data-testid="input-state"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={shippingInfo.zipCode}
                onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                required
                data-testid="input-zip"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isDevelopmentMode ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Development Mode:</strong> Payment processing is in test mode. 
                No real payment will be processed. Simply complete the order to test the checkout flow.
              </p>
            </div>
          ) : (
            <PaymentElement />
          )}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={(!stripe || !elements) && !isDevelopmentMode || isProcessing}
        data-testid="button-complete-order"
      >
        {isProcessing ? "Processing..." : isDevelopmentMode ? "Complete Test Order" : "Complete Order"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartTotal } = useCart();
  const { getCurrencySymbol } = useSettings();
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    if (!cartItems.length) {
      setLocation('/');
      return;
    }

    // Calculate totals
    const subtotal = cartTotal;
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal >= 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: total,
      cartItems: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        options: item.options,
      })),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Error creating payment intent:', error);
      });
  }, [user, cartItems, cartTotal, setLocation]);

  if (!user) return null;

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-4">Add some products to proceed with checkout.</p>
            <Button onClick={() => setLocation('/')} data-testid="button-continue-shopping">
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cartTotal;
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal + tax + shipping;

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-checkout-title">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3" data-testid={`cart-item-${item.id}`}>
                      <img
                        src={item.product.images?.[0] || '/placeholder-image.jpg'}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm" data-testid="text-item-name">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-sm" data-testid="text-item-price">
                        {getCurrencySymbol()}{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal">{getCurrencySymbol()}{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span data-testid="text-tax">{getCurrencySymbol()}{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span data-testid="text-shipping">
                      {shipping === 0 ? 'Free' : `${getCurrencySymbol()}${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span data-testid="text-total">{getCurrencySymbol()}{total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
