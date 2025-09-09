import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Package, Users, DollarSign } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface DashboardStatsProps {
  stats?: {
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
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const { getCurrencySymbol } = useSettings();
  
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `${getCurrencySymbol()}${parseFloat(stats.totalRevenue).toLocaleString()}`,
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: DollarSign,
      iconBg: "bg-gradient-to-br from-primary to-primary/80",
      testId: "stat-revenue"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+8% from last month",
      changeType: "positive" as const,
      icon: ShoppingCart,
      iconBg: "bg-green-500",
      testId: "stat-orders"
    },
    {
      title: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      change: "+3 new this week",
      changeType: "positive" as const,
      icon: Package,
      iconBg: "bg-blue-500",
      testId: "stat-products"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+15% from last month",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-purple-500",
      testId: "stat-customers"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        const isRevenue = index === 0;
        
        return (
          <Card key={index} className={isRevenue ? "text-white" : ""} data-testid={stat.testId}>
            <CardContent className={`p-6 ${isRevenue ? stat.iconBg : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isRevenue ? "text-white/80" : "text-muted-foreground"}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${isRevenue ? "text-white" : "text-card-foreground"}`} data-testid={`${stat.testId}-value`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm ${isRevenue ? "text-white/60" : getChangeColor(stat.changeType)}`} data-testid={`${stat.testId}-change`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isRevenue ? "bg-white/20" : getIconBgColor(stat.iconBg)
                }`}>
                  <Icon className={`h-6 w-6 ${isRevenue ? "text-white" : getIconColor(stat.iconBg)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function getChangeColor(type: "positive" | "negative" | "neutral") {
  switch (type) {
    case "positive":
      return "text-green-600";
    case "negative":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

function getIconBgColor(iconBg: string) {
  if (iconBg.includes("green")) return "bg-green-100";
  if (iconBg.includes("blue")) return "bg-blue-100";
  if (iconBg.includes("purple")) return "bg-purple-100";
  return "bg-primary/10";
}

function getIconColor(iconBg: string) {
  if (iconBg.includes("green")) return "text-green-600";
  if (iconBg.includes("blue")) return "text-blue-600";
  if (iconBg.includes("purple")) return "text-purple-600";
  return "text-primary";
}
