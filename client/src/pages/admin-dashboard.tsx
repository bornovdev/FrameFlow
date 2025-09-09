import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardStats from "@/components/admin/dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertProductSchema, type InsertProduct, type Category, type Product, type User, type Order } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toLocaleDateStringWithTimezone, toDateStringWithTimezone } from '@/lib/date-utils';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  TrendingUp,
  Download,
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  Trash,
  Home
} from "lucide-react";

interface DashboardStatsType {
  totalRevenue: string;
  totalOrders: number;
  activeProducts: number;
  totalCustomers: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: string;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    product: string;
    amount: string;
    status: string;
    date: string;
  }>;
}

// CustomerEditForm Component
function CustomerEditForm({ customer, onSuccess, onCancel }: { 
  customer: User; 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email,
      role: customer.role,
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("PUT", `/api/users/${customer.id}`, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateCustomerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-first-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-last-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" data-testid="input-email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={updateCustomerMutation.isPending}
            data-testid="button-save-customer"
          >
            {updateCustomerMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-edit"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { getCurrencySymbol, settings } = useSettings();
  const { toast } = useToast();
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chartPeriod, setChartPeriod] = useState('7d');
  
  // Order management state
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerRoleFilter, setCustomerRoleFilter] = useState('all');
  const [customerDateFilter, setCustomerDateFilter] = useState('all');
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [analyticsChartPeriod, setAnalyticsChartPeriod] = useState('7d');

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'VisionCraft',
    storeEmail: 'admin@visioncraft.com',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    emailNotifications: true,
    lowStockAlerts: true,
  });
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<string>('');

  const { data: stats, isLoading } = useQuery<DashboardStatsType>({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: user?.role === 'admin',
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: user?.role === 'admin' && activeSection === 'products',
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: user?.role === 'admin' && activeSection === 'orders',
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: user?.role === 'admin' && activeSection === 'customers',
  });

  const { data: salesChartData, isLoading: isChartLoading } = useQuery<Array<{
    date: string;
    sales: number;
    revenue: number;
  }>>({
    queryKey: ["/api/admin/sales-chart", chartPeriod],
    enabled: user?.role === 'admin' && activeSection === 'dashboard',
  });

  const { data: analyticsChartData, isLoading: isAnalyticsChartLoading } = useQuery<Array<{
    date: string;
    sales: number;
    revenue: number;
  }>>({
    queryKey: ["/api/admin/sales-chart", analyticsChartPeriod],
    enabled: user?.role === 'admin' && activeSection === 'analytics',
  });

  // Settings query - only fetch when in settings section
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery<Record<string, string>>({
    queryKey: ["settings"],
    enabled: user?.role === 'admin' && activeSection === 'settings',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update settings form when data is loaded
  useEffect(() => {
    if (settingsData) {
      setSettingsForm({
        storeName: settingsData.storeName || 'VisionCraft',
        storeEmail: settingsData.storeEmail || 'admin@visioncraft.com',
        currency: settingsData.currency || 'USD',
        timezone: settingsData.timezone || 'UTC',
        language: settingsData.language || 'en',
        emailNotifications: settingsData.emailNotifications === 'true',
        lowStockAlerts: settingsData.lowStockAlerts === 'true',
      });
    }
  }, [settingsData]);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      brand: "",
      stock: 0,
      images: [],
      images360: [],
      features: [],
      specifications: {},
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      toast({
        title: "Product Created",
        description: "Product has been created successfully.",
      });
      setIsProductModalOpen(false);
      form.reset();
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => apiRequest("DELETE", `/api/products/${productId}`),
    onSuccess: () => {
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Partial<InsertProduct> }) => 
      apiRequest("PUT", `/api/products/${productId}`, data),
    onSuccess: () => {
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  // Order management queries and mutations
  const { data: selectedOrderDetails } = useQuery<Order & { orderItems: any[] }>({
    queryKey: ["/api/orders", selectedOrderForDetails],
    enabled: !!selectedOrderForDetails,
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      apiRequest("PUT", `/api/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateOrdersMutation = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: string[]; status: string }) => {
      return Promise.all(
        orderIds.map(orderId => 
          apiRequest("PUT", `/api/orders/${orderId}/status`, { status })
        )
      );
    },
    onSuccess: () => {
      toast({
        title: "Orders Updated",
        description: `${selectedOrders.length} orders have been updated successfully.`,
      });
      setSelectedOrders([]);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update orders.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    
    // Convert price strings to proper format
    data.price = data.price.toString();
    if (data.originalPrice) {
      data.originalPrice = data.originalPrice.toString();
    }
    
    if (editingProduct) {
      // Update existing product
      updateProductMutation.mutate({ productId: editingProduct.id, data });
    } else {
      // Create new product
      createProductMutation.mutate(data);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Order filtering and utility functions
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = !orderSearchTerm || 
      order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.total.toString().includes(orderSearchTerm);
    
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    
    const matchesDate = orderDateFilter === 'all' || (() => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      
      switch (orderDateFilter) {
        case 'today':
          return toDateStringWithTimezone(orderDate, settings.timezone) === toDateStringWithTimezone(now, settings.timezone);
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === filteredOrders.length 
        ? [] 
        : filteredOrders.map(order => order.id)
    );
  };

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderForDetails(orderId);
    setIsOrderDetailsModalOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleBulkUpdateStatus = (status: string) => {
    if (selectedOrders.length > 0) {
      bulkUpdateOrdersMutation.mutate({ orderIds: selectedOrders, status });
    }
  };

  // Customer Management Functions
  const deleteCustomerMutation = useMutation({
    mutationFn: (customerId: string) => 
      apiRequest("DELETE", `/api/user/${customerId}`),
    onSuccess: () => {
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCustomerDetailsModalOpen(false);
      setSelectedCustomer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer.",
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = !customerSearchTerm || 
      customer.firstName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.username.toLowerCase().includes(customerSearchTerm.toLowerCase());
    
    const matchesRole = customerRoleFilter === 'all' || customer.role === customerRoleFilter;
    
    const matchesDate = customerDateFilter === 'all' || (() => {
      if (!customer.createdAt) return false;
      const customerDate = new Date(customer.createdAt);
      const now = new Date();
      
      switch (customerDateFilter) {
        case 'today':
          return toDateStringWithTimezone(customerDate, settings.timezone) === toDateStringWithTimezone(now, settings.timezone);
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return customerDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return customerDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesRole && matchesDate;
  }) || [];

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    setSelectedCustomers(
      selectedCustomers.length === filteredCustomers.length 
        ? [] 
        : filteredCustomers.map(customer => customer.id)
    );
  };

  const handleViewCustomerDetails = (customer: User) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer);
    setIsEditCustomerModalOpen(true);
  };

  const handleViewCustomerOrders = (customerId: string) => {
    // Switch to orders section and filter by customer
    setActiveSection('orders');
    setOrderSearchTerm(customerId);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  const handleBulkExportCustomers = () => {
    if (!selectedCustomers?.length) {
      toast({
        title: "Error",
        description: "No customers selected for export.",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomerData = customers?.filter(customer => 
      selectedCustomers.includes(customer.id)
    );

    if (!selectedCustomerData?.length) return;

    const exportData = selectedCustomerData.map(customer => ({
      customer_id: customer.id,
      username: customer.username,
      email: customer.email,
      first_name: customer.firstName || '',
      last_name: customer.lastName || '',
      role: customer.role,
      created_at: customer.createdAt || '',
    }));

    const csv = convertToCSV(exportData, [
      'customer_id', 'username', 'email', 'first_name', 'last_name', 'role', 'created_at'
    ]);
    downloadCSV(csv, `selected-customers-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export Complete",
      description: `${selectedCustomers.length} customers have been exported successfully.`,
    });
    setSelectedCustomers([]);
  };

  // Settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (settingsData: Record<string, string>) => 
      apiRequest("PUT", "/api/settings", settingsData),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const handleSettingsChange = (field: string, value: string | boolean) => {
    setSettingsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    const settingsToSave = {
      storeName: settingsForm.storeName,
      storeEmail: settingsForm.storeEmail,
      currency: settingsForm.currency,
      timezone: settingsForm.timezone,
      language: settingsForm.language,
      emailNotifications: settingsForm.emailNotifications.toString(),
      lowStockAlerts: settingsForm.lowStockAlerts.toString(),
    };
    
    saveSettingsMutation.mutate(settingsToSave);
  };

  // CSV Export utility functions
  const convertToCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Export handlers
  const handleExportData = () => {
    if (!stats) {
      toast({
        title: "Error",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = [
      { metric: 'Total Revenue', value: `$${stats.totalRevenue}` },
      { metric: 'Total Orders', value: stats.totalOrders },
      { metric: 'Active Products', value: stats.activeProducts },
      { metric: 'Total Customers', value: stats.totalCustomers },
    ];

    const csv = convertToCSV(exportData, ['metric', 'value']);
    downloadCSV(csv, `dashboard-stats-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export Complete",
      description: "Dashboard data has been exported successfully.",
    });
  };

  const handleExportOrders = () => {
    if (!filteredOrders.length) {
      toast({
        title: "Error",
        description: "No orders available to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = filteredOrders.map(order => ({
      order_id: order.id,
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      total: order.total,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      payment_intent_id: order.stripePaymentIntentId || 'N/A',
    }));

    const csv = convertToCSV(exportData, [
      'order_id', 'date', 'total', 'status', 'subtotal', 'tax', 'shipping', 'payment_intent_id'
    ]);
    downloadCSV(csv, `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export Complete",
      description: `${filteredOrders.length} orders have been exported successfully.`,
    });
  };

  const handleExportCustomers = () => {
    if (!customers?.length) {
      toast({
        title: "Error",
        description: "No customers available to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = customers.map(customer => ({
      customer_id: customer.id,
      username: customer.username,
      email: customer.email,
      first_name: customer.firstName || '',
      last_name: customer.lastName || '',
      role: customer.role,
      created_at: customer.createdAt ? toLocaleDateStringWithTimezone(customer.createdAt, settings.timezone) : 'N/A',
    }));

    const csv = convertToCSV(exportData, [
      'customer_id', 'username', 'email', 'first_name', 'last_name', 'role', 'created_at'
    ]);
    downloadCSV(csv, `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export Complete",
      description: `${customers.length} customers have been exported successfully.`,
    });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Pre-populate form with existing product data
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || "",
      categoryId: product.categoryId,
      brand: product.brand || "",
      stock: product.stock,
      images: Array.isArray(product.images) ? product.images : [],
      images360: Array.isArray(product.images360) ? product.images360 : [],
      features: Array.isArray(product.features) ? product.features : [],
      specifications: product.specifications || {},
      isActive: product.isActive,
    });
    setIsProductModalOpen(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      brand: "",
      stock: 0,
      images: [],
      images360: [],
      features: [],
      specifications: {},
      isActive: true,
    });
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-card shadow-lg min-h-screen">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-card-foreground">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">VisionCraft Management</p>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/">
              <button 
                className="flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 text-card-foreground hover:bg-muted border border-border mb-4"
                data-testid="nav-back-to-store"
              >
                <Home className="h-4 w-4 mr-3" />
                Back to Store
              </button>
            </Link>
            <button 
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'dashboard' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-dashboard"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveSection('products')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'products' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-products"
            >
              <Package className="h-4 w-4 mr-3" />
              Products
            </button>
            <button 
              onClick={() => setActiveSection('orders')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'orders' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-orders"
            >
              <ShoppingCart className="h-4 w-4 mr-3" />
              Orders
            </button>
            <button 
              onClick={() => setActiveSection('customers')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'customers' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-customers"
            >
              <Users className="h-4 w-4 mr-3" />
              Customers
            </button>
            <button 
              onClick={() => setActiveSection('analytics')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'analytics' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-analytics"
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              Analytics
            </button>
            <button 
              onClick={() => setActiveSection('settings')}
              className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left rounded-lg transition-colors duration-200 ${
                activeSection === 'settings' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-card-foreground hover:bg-muted'
              }`}
              data-testid="nav-settings"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                  {activeSection === 'dashboard' && 'Dashboard Overview'}
                  {activeSection === 'products' && 'Products Management'}
                  {activeSection === 'orders' && 'Orders Management'}
                  {activeSection === 'customers' && 'Customers Management'}
                  {activeSection === 'analytics' && 'Analytics & Reports'}
                  {activeSection === 'settings' && 'Settings & Configuration'}
                </h1>
                <p className="text-muted-foreground">
                  {activeSection === 'dashboard' && "Welcome back, Admin. Here's what's happening with your store today."}
                  {activeSection === 'products' && 'Manage your product catalog, inventory, and pricing.'}
                  {activeSection === 'orders' && 'View and manage customer orders and order status.'}
                  {activeSection === 'customers' && 'Manage customer accounts and view customer information.'}
                  {activeSection === 'analytics' && 'View detailed analytics and reports for your business.'}
                  {activeSection === 'settings' && 'Configure system settings and preferences.'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {activeSection === 'dashboard' && (
                  <Button variant="outline" onClick={handleExportData} data-testid="button-export-data">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                )}
                {activeSection === 'products' && (
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateProduct} data-testid="button-add-product">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Name *</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-product-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="slug"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Slug *</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="auto-generated if empty" data-testid="input-product-slug" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} value={field.value || ""} rows={3} data-testid="input-product-description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="brand"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Brand</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} data-testid="input-product-brand" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-product-category">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Pricing and Inventory */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
                            
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price ($) *</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" data-testid="input-product-price" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Original Price ($)</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ""} type="number" step="0.01" data-testid="input-product-original-price" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock Quantity *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                      data-testid="input-product-stock"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                      Product is visible to customers
                                    </div>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value ?? true}
                                      onCheckedChange={field.onChange}
                                      data-testid="switch-product-active"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Images - Simple text inputs for now */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Images (Enter URLs)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="images"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Product Images</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field}
                                      value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(url => url.trim()))}
                                      placeholder="Enter image URLs, one per line"
                                      rows={3}
                                      data-testid="input-product-images"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="images360"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>360° Images</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field}
                                      value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                      onChange={(e) => field.onChange(e.target.value.split('\n').filter(url => url.trim()))}
                                      placeholder="Enter 360° image URLs, one per line"
                                      rows={3}
                                      data-testid="input-product-images-360"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Features</h3>
                          <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Features</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field}
                                    value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(feature => feature.trim()))}
                                    placeholder="Enter features, one per line"
                                    rows={4}
                                    data-testid="input-product-features"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsProductModalOpen(false);
                              setEditingProduct(null);
                              form.reset();
                            }}
                            data-testid="button-cancel-product"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            data-testid="button-save-product"
                          >
                            {editingProduct 
                              ? (updateProductMutation.isPending ? "Updating..." : "Update Product")
                              : (createProductMutation.isPending ? "Creating..." : "Create Product")
                            }
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                  </Dialog>
                )}
                {activeSection === 'orders' && (
                  <Button variant="outline" onClick={handleExportOrders} data-testid="button-export-orders">
                    <Download className="h-4 w-4 mr-2" />
                    Export Orders
                  </Button>
                )}
                {activeSection === 'customers' && (
                  <Button variant="outline" onClick={handleExportCustomers} data-testid="button-export-customers">
                    <Download className="h-4 w-4 mr-2" />
                    Export Customers
                  </Button>
                )}
              </div>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <>
                {isLoading ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <DashboardStats stats={stats} />

                {/* Charts and Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Sales Chart Placeholder */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Sales Overview</CardTitle>
                      <select 
                        className="text-sm border border-border rounded-lg px-3 py-2 bg-background"
                        value={chartPeriod}
                        onChange={(e) => setChartPeriod(e.target.value)}
                        data-testid="select-chart-period"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="3m">Last 3 months</option>
                      </select>
                    </CardHeader>
                    <CardContent>
                      {isChartLoading ? (
                        <div className="h-64 w-full bg-muted/20 rounded-lg animate-pulse" />
                      ) : salesChartData && salesChartData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesChartData}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis 
                                dataKey="date" 
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return chartPeriod === '7d' 
                                    ? date.toLocaleDateString(undefined, { weekday: 'short' })
                                    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                }}
                              />
                              <YAxis 
                                fontSize={12}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${getCurrencySymbol()}${value}`}
                              />
                              <Tooltip 
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-md">
                                        <p className="text-sm font-medium">
                                          {new Date(label).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                          Revenue: ${payload[0]?.value || 0}
                                        </p>
                                        <p className="text-sm text-green-600">
                                          Orders: {payload[1]?.value || 0}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="hsl(var(--muted-foreground))" 
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                            <p>No sales data available</p>
                            <p className="text-sm">Start selling to see your chart</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {stats?.topProducts?.map((product, index) => (
                          <div key={product.id} className="flex items-center space-x-4" data-testid={`top-product-${index}`}>
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-primary font-semibold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-card-foreground" data-testid="text-product-name">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid="text-product-sales">
                                {product.sales} sold
                              </p>
                            </div>
                            <span className="text-green-600 font-semibold" data-testid="text-product-revenue">
                              {getCurrencySymbol()}{product.revenue}
                            </span>
                          </div>
                        )) || (
                          <p className="text-muted-foreground">No product data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders Table */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="button-view-all-orders">
                      View All Orders
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Order ID</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Customer</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Product</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {stats?.recentOrders?.map((order, index) => (
                            <tr key={order.id} data-testid={`order-row-${index}`}>
                              <td className="px-6 py-4 text-sm font-medium text-card-foreground" data-testid="text-order-id">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 text-sm text-card-foreground" data-testid="text-customer">
                                {order.customer}
                              </td>
                              <td className="px-6 py-4 text-sm text-card-foreground" data-testid="text-product">
                                {order.product}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-card-foreground" data-testid="text-amount">
                                ${order.amount}
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  className={getStatusColor(order.status)}
                                  data-testid="badge-status"
                                >
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground" data-testid="text-date">
                                {order.date}
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                No recent orders found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                  </>
                )}
              </>
            )}
            
            {/* Products Section */}
            {activeSection === 'products' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {products ? (
                      <div className="space-y-4">
                        {products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <img 
                                src={product.images?.[0] || '/placeholder.jpg'} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">${product.price}</p>
                                <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditProduct(product)}
                                data-testid="button-edit-product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={deleteProductMutation.isPending}
                                data-testid="button-delete-product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Loading products...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search orders by ID or amount..."
                            value={orderSearchTerm}
                            onChange={(e) => setOrderSearchTerm(e.target.value)}
                            className="pl-10"
                            data-testid="input-order-search"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                          <SelectTrigger className="w-40" data-testid="select-status-filter">
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={orderDateFilter} onValueChange={setOrderDateFilter}>
                          <SelectTrigger className="w-40" data-testid="select-date-filter">
                            <SelectValue placeholder="All Time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })} data-testid="button-refresh-orders">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedOrders.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                          <Select onValueChange={handleBulkUpdateStatus}>
                            <SelectTrigger className="w-40" data-testid="select-bulk-status">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Mark as Pending</SelectItem>
                              <SelectItem value="processing">Mark as Processing</SelectItem>
                              <SelectItem value="shipped">Mark as Shipped</SelectItem>
                              <SelectItem value="delivered">Mark as Delivered</SelectItem>
                              <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedOrders([])}
                            data-testid="button-clear-selection"
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Orders Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Orders Management</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {filteredOrders.length} of {orders?.length || 0} orders
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                <Checkbox
                                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                  onCheckedChange={handleSelectAllOrders}
                                  data-testid="checkbox-select-all"
                                />
                              </th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order ID</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Total</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredOrders.length > 0 ? (
                              filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/50" data-testid={`order-row-${order.id}`}>
                                  <td className="px-4 py-3">
                                    <Checkbox
                                      checked={selectedOrders.includes(order.id)}
                                      onCheckedChange={() => handleSelectOrder(order.id)}
                                      data-testid={`checkbox-order-${order.id}`}
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-sm font-medium text-card-foreground" data-testid="text-order-id">
                                    #{order.id.slice(-8)}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground" data-testid="text-order-date">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm font-semibold text-card-foreground" data-testid="text-order-total">
                                    ${order.total}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Select
                                      value={order.status}
                                      onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                      disabled={updateOrderStatusMutation.isPending}
                                    >
                                      <SelectTrigger className="w-32 h-8" data-testid={`select-order-status-${order.id}`}>
                                        <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                                          {order.status}
                                        </Badge>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewOrderDetails(order.id)}
                                        data-testid={`button-view-order-${order.id}`}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                  {orderSearchTerm || orderStatusFilter !== 'all' || orderDateFilter !== 'all' 
                                    ? 'No orders match your filters'
                                    : 'No orders found'
                                  }
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Details Modal */}
                <Dialog open={isOrderDetailsModalOpen} onOpenChange={setIsOrderDetailsModalOpen}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrderDetails ? (
                      <div className="space-y-6">
                        {/* Order Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Order Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <span className="text-sm text-muted-foreground">Order ID:</span>
                                <p className="font-medium">#{selectedOrderDetails.id.slice(-8)}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Date:</span>
                                <p className="font-medium">
                                  {selectedOrderDetails.createdAt ? new Date(selectedOrderDetails.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <div className="mt-1">
                                  <Badge className={getStatusColor(selectedOrderDetails.status)}>
                                    {selectedOrderDetails.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Payment ID:</span>
                                <p className="font-medium text-xs break-all">
                                  {selectedOrderDetails.stripePaymentIntentId || 'N/A'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                              {selectedOrderDetails.shippingAddress ? (
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {selectedOrderDetails.shippingAddress.firstName} {selectedOrderDetails.shippingAddress.lastName}
                                  </p>
                                  <p>{selectedOrderDetails.shippingAddress.address}</p>
                                  <p>
                                    {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} {selectedOrderDetails.shippingAddress.zipCode}
                                  </p>
                                  <p>{selectedOrderDetails.shippingAddress.country}</p>
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No shipping address available</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Order Items */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Order Items</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {selectedOrderDetails.orderItems?.map((item) => (
                                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                                  <img 
                                    src={item.product.images?.[0] || '/placeholder.jpg'} 
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium">{item.product.name}</h4>
                                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                    <p className="text-sm text-muted-foreground">Price: ${item.price}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                  </div>
                                </div>
                              )) || (
                                <p className="text-muted-foreground">No items found</p>
                              )}
                            </div>
                            
                            {/* Order Total */}
                            <div className="mt-6 pt-4 border-t space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>${selectedOrderDetails.subtotal}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Tax:</span>
                                <span>${selectedOrderDetails.tax}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Shipping:</span>
                                <span>${selectedOrderDetails.shipping}</span>
                              </div>
                              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                <span>Total:</span>
                                <span>${selectedOrderDetails.total}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Customers Section */}
            {activeSection === 'customers' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search customers by name, email, or username..."
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            className="pl-10"
                            data-testid="input-customer-search"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Select value={customerRoleFilter} onValueChange={setCustomerRoleFilter}>
                          <SelectTrigger className="w-40" data-testid="select-role-filter">
                            <SelectValue placeholder="All Roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={customerDateFilter} onValueChange={setCustomerDateFilter}>
                          <SelectTrigger className="w-40" data-testid="select-date-filter">
                            <SelectValue placeholder="All Time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">Last Month</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                          toast({
                            title: "Refreshed",
                            description: "Customer data has been refreshed.",
                          });
                        }} data-testid="button-refresh-customers">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedCustomers.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setSelectedCustomers([])}
                            data-testid="button-clear-selection"
                          >
                            Clear Selection
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleBulkExportCustomers()}
                            data-testid="button-bulk-export"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Selected
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customers Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Customers Management</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {filteredCustomers.length} of {customers?.length || 0} customers
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customers ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                                <Checkbox
                                  checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                                  onCheckedChange={handleSelectAllCustomers}
                                  data-testid="checkbox-select-all-customers"
                                />
                              </th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/50" data-testid={`customer-row-${customer.id}`}>
                                  <td className="px-4 py-3">
                                    <Checkbox
                                      checked={selectedCustomers.includes(customer.id)}
                                      onCheckedChange={() => handleSelectCustomer(customer.id)}
                                      data-testid={`checkbox-customer-${customer.id}`}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>
                                      <p className="font-medium text-card-foreground" data-testid="text-customer-name">
                                        {customer.firstName} {customer.lastName}
                                      </p>
                                      <p className="text-sm text-muted-foreground" data-testid="text-customer-username">
                                        @{customer.username}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground" data-testid="text-customer-email">
                                    {customer.email}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge className={customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} data-testid="badge-customer-role">
                                      {customer.role}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-muted-foreground" data-testid="text-customer-date">
                                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewCustomerDetails(customer)}
                                        data-testid={`button-view-customer-${customer.id}`}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditCustomer(customer)}
                                        data-testid={`button-edit-customer-${customer.id}`}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewCustomerOrders(customer.id)}
                                        data-testid={`button-view-orders-${customer.id}`}
                                      >
                                        <ShoppingCart className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                  {customerSearchTerm || customerRoleFilter !== 'all' || customerDateFilter !== 'all' 
                                    ? 'No customers match your filters'
                                    : 'No customers found'
                                  }
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Details Modal */}
                <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Customer Details</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <span className="text-sm text-muted-foreground">Full Name:</span>
                                <p className="font-medium">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Username:</span>
                                <p className="font-medium">@{selectedCustomer.username}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <p className="font-medium">{selectedCustomer.email}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Role:</span>
                                <div className="mt-1">
                                  <Badge className={selectedCustomer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                                    {selectedCustomer.role}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Member Since:</span>
                                <p className="font-medium">
                                  {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Account Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleEditCustomer(selectedCustomer)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Customer
                              </Button>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => handleViewCustomerOrders(selectedCustomer.id)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                View Orders
                              </Button>
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={() => window.open(`mailto:${selectedCustomer.email}`, '_blank')}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </Button>
                              {selectedCustomer.role !== 'admin' && (
                                <Button 
                                  className="w-full" 
                                  variant="destructive"
                                  onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete Customer
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Edit Customer Modal */}
                <Dialog open={isEditCustomerModalOpen} onOpenChange={setIsEditCustomerModalOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Customer</DialogTitle>
                    </DialogHeader>
                    {selectedCustomer && (
                      <CustomerEditForm
                        customer={selectedCustomer}
                        onSuccess={() => {
                          setIsEditCustomerModalOpen(false);
                          queryClient.invalidateQueries({ queryKey: ["/api/users"] });
                          toast({
                            title: "Success",
                            description: "Customer updated successfully.",
                          });
                        }}
                        onCancel={() => setIsEditCustomerModalOpen(false)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Analytics Section */}
            {activeSection === 'analytics' && (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-total-revenue">
                            ${stats?.totalRevenue || '0'}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Revenue</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+12.5% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-total-orders">
                            {stats?.totalOrders || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Orders</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-blue-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+8.2% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-active-products">
                            {stats?.activeProducts || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Active Products</p>
                        </div>
                        <Package className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-purple-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+5.4% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold" data-testid="text-total-customers">
                            {stats?.totalCustomers || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Total Customers</p>
                        </div>
                        <Users className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-orange-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+15.3% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales Revenue Chart */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Revenue Analytics</CardTitle>
                        <Select value={analyticsChartPeriod} onValueChange={setAnalyticsChartPeriod}>
                          <SelectTrigger className="w-32" data-testid="select-chart-period">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                            <SelectItem value="3m">3 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isAnalyticsChartLoading ? (
                        <div className="h-80">
                          <Skeleton className="h-full w-full" />
                        </div>
                      ) : (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                fontSize={12}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                              />
                              <YAxis fontSize={12} />
                              <Tooltip 
                                formatter={(value, name) => [
                                  name === 'revenue' ? `$${value}` : value,
                                  name === 'revenue' ? 'Revenue' : 'Sales'
                                ]}
                                labelFormatter={(value) => {
                                  const date = new Date(value);
                                  return date.toLocaleDateString();
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sales Volume Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sales Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isAnalyticsChartLoading ? (
                        <div className="h-80">
                          <Skeleton className="h-full w-full" />
                        </div>
                      ) : (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                fontSize={12}
                                tickFormatter={(value) => {
                                  const date = new Date(value);
                                  return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                              />
                              <YAxis fontSize={12} />
                              <Tooltip 
                                formatter={(value, name) => [value, 'Orders']}
                                labelFormatter={(value) => {
                                  const date = new Date(value);
                                  return date.toLocaleDateString();
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                dot={{ fill: '#10b981', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Products and Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.topProducts && stats.topProducts.length > 0 ? (
                        <div className="space-y-4">
                          {stats.topProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`top-product-${index}`}>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-card-foreground" data-testid="text-product-name">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground" data-testid="text-product-sales">
                                    {product.sales} sales
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-card-foreground" data-testid="text-product-revenue">
                                  ${product.revenue}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No sales data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                        <div className="space-y-4">
                          {stats.recentOrders.map((order, index) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`recent-order-${index}`}>
                              <div>
                                <p className="font-medium text-card-foreground" data-testid="text-order-customer">
                                  {order.customer}
                                </p>
                                <p className="text-sm text-muted-foreground" data-testid="text-order-product">
                                  {order.product}
                                </p>
                                <p className="text-xs text-muted-foreground" data-testid="text-order-date">
                                  {order.date}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-card-foreground" data-testid="text-order-amount">
                                  ${order.amount}
                                </p>
                                <Badge className={getStatusColor(order.status)} data-testid="badge-order-status">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No recent orders</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Conversion Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">2.8%</div>
                        <p className="text-sm text-muted-foreground mb-4">Average conversion rate</p>
                        <div className="flex items-center justify-center text-sm text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+0.3% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Average Order Value */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          ${stats?.totalOrders && stats?.totalRevenue ? 
                            (parseFloat(stats.totalRevenue) / stats.totalOrders).toFixed(2) : 
                            '0.00'
                          }
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">Per order</p>
                        <div className="flex items-center justify-center text-sm text-blue-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+$5.20 from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Retention */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Retention</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600 mb-2">78%</div>
                        <p className="text-sm text-muted-foreground mb-4">Returning customers</p>
                        <div className="flex items-center justify-center text-sm text-purple-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+2.1% from last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isSettingsLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">General Settings</h3>
                        <div className="text-sm text-muted-foreground mb-4">
                          Current: {settings.currency} | {settings.timezone} | {settings.language}
                        </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Store Name</label>
                          <Input 
                            value={settingsForm.storeName}
                            onChange={(e) => handleSettingsChange('storeName', e.target.value)}
                            data-testid="input-store-name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Store Email</label>
                          <Input 
                            value={settingsForm.storeEmail}
                            onChange={(e) => handleSettingsChange('storeEmail', e.target.value)}
                            type="email"
                            data-testid="input-store-email"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Currency</label>
                          <Select 
                            value={settingsForm.currency} 
                            onValueChange={(value) => handleSettingsChange('currency', value)}
                          >
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="AED">AED (د.إ)</SelectItem>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Timezone</label>
                          <Select 
                            value={settingsForm.timezone} 
                            onValueChange={(value) => handleSettingsChange('timezone', value)}
                          >
                            <SelectTrigger data-testid="select-timezone">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                              <SelectItem value="Asia/Dubai">UAE Time (GST)</SelectItem>
                              <SelectItem value="Asia/Kolkata">India Time (IST)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Language</label>
                          <Select 
                            value={settingsForm.language} 
                            onValueChange={(value) => handleSettingsChange('language', value)}
                          >
                            <SelectTrigger data-testid="select-language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="ar">العربية (Arabic)</SelectItem>
                              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Notification Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-muted-foreground">Receive email notifications for new orders</p>
                          </div>
                          <Switch 
                            checked={settingsForm.emailNotifications}
                            onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
                            data-testid="switch-email-notifications"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Low Stock Alerts</h4>
                            <p className="text-sm text-muted-foreground">Get notified when products are low in stock</p>
                          </div>
                          <Switch 
                            checked={settingsForm.lowStockAlerts}
                            onCheckedChange={(checked) => handleSettingsChange('lowStockAlerts', checked)}
                            data-testid="switch-low-stock-alerts"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6">
                      <Button 
                        onClick={handleSaveSettings}
                        disabled={saveSettingsMutation.isPending}
                        data-testid="button-save-settings"
                      >
                        {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                      </Button>
                      {saveSettingsMutation.isSuccess && (
                        <p className="text-sm text-green-600 mt-2">Settings saved successfully!</p>
                      )}
                    </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
