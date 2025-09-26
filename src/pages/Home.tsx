import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";
import { 
  TrendingUp, 
  Leaf, 
  Shield, 
  Clock, 
  ArrowRight,
  Database,
  Upload,
  ShoppingCart
} from "lucide-react";

const Home = () => {
  const stats = [
    { label: "Total Projects", value: "1,247", icon: Database, trend: "+12%" },
    { label: "Carbon Credits", value: "892K", icon: Leaf, trend: "+8%" },
    { label: "Verified Projects", value: "1,089", icon: Shield, trend: "+15%" },
    { label: "Pending Review", value: "158", icon: Clock, trend: "-3%" },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "verification",
      title: "Sundarbans Mangrove Project verified",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "submission",
      title: "New data submitted by Coastal Guard NGO",
      time: "4 hours ago",
      status: "pending"
    },
    {
      id: 3,
      type: "credit",
      title: "15,000 carbon credits tokenized",
      time: "1 day ago",
      status: "completed"
    },
    {
      id: 4,
      type: "project",
      title: "Mangaluru Seagrass Restoration registered",
      time: "2 days ago",
      status: "completed"
    }
  ];

  const quickActions = [
    {
      title: "Submit Project Data",
      description: "Upload field data and verification documents",
      href: "/submit",
      icon: Upload,
      color: "primary"
    },
    {
      title: "Browse Registry",
      description: "Explore verified blue carbon projects",
      href: "/registry",
      icon: Database,
      color: "secondary"
    },
    {
      title: "Carbon Marketplace",
      description: "Trade tokenized carbon credits",
      href: "/marketplace",
      icon: ShoppingCart,
      color: "accent"
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Overview Statistics */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Registry Overview</h2>
            <p className="mt-2 text-muted-foreground">
              Real-time statistics from the blockchain-powered blue carbon registry
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{stat.trend} from last month</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Quick Actions</h2>
            <p className="mt-2 text-muted-foreground">
              Get started with common tasks in the blue carbon registry
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full group-hover:translate-x-1 transition-transform">
                      <NavLink to={action.href} className="flex items-center justify-between">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </NavLink>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Recent Activity</h2>
              <p className="mt-2 text-muted-foreground">
                Latest updates from the blue carbon registry
              </p>
            </div>
            <Button variant="outline" asChild>
              <NavLink to="/registry">View All</NavLink>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;