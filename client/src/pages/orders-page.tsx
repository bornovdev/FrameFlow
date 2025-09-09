import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, DollarSign, Truck } from "lucide-react";
import Header from "@/components/header";
import { useSettings } from "@/hooks/use-settings";
import { formatDateWithTimezone } from "@/lib/date-utils";

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  options: Record<string, any>;
  product: {
    id: string;
    name: string;
    price: string;
    images: string[];
    category: string;
    slug: string;
  };
};

type Order = {
  id: string;
  userId: string;
  status: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  stripePaymentIntentId: string;
  createdAt: string;
  orderItems: OrderItem[];
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
    case 'completed':
      return <Package className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const { getCurrencySymbol, settings } = useSettings();
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                <p className="text-gray-500">
                  There was an error loading your orders. Please try again later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="heading-orders">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track and manage your eyewear orders
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-6">
                  When you place orders, they'll appear here for you to track.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  data-testid="link-shop-now"
                >
                  Start Shopping
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`order-${order.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateWithTimezone(order.createdAt, 'PPP', settings.timezone)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {getCurrencySymbol()}{order.total}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={`${getStatusColor(order.status)} flex items-center gap-1`}
                      data-testid={`status-${order.status}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-md"
                              data-testid={`item-image-${item.productId}`}
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900" data-testid={`item-name-${item.productId}`}>
                                {item.product.name}
                              </h5>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity} × {getCurrencySymbol()}{item.price}
                              </p>
                              {Object.keys(item.options).length > 0 && (
                                <div className="text-sm text-gray-500">
                                  Options: {Object.entries(item.options).map(([key, value]) => 
                                    `${key}: ${value}`
                                  ).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                {getCurrencySymbol()}{(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                          <div className="text-sm text-gray-600" data-testid="shipping-address">
                            <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>${order.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span>${order.tax}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span>${order.shipping}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total:</span>
                              <span data-testid={`order-total-${order.id}`}>${order.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}