import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Database, 
  FolderOpen, 
  Upload, 
  ShoppingCart,
  Map,
  ArrowLeft,
  Search,
  Waves
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getQuickLinks = () => {
    const links = [
      { name: "Home", href: "/", icon: Home, description: "Return to the homepage" },
      { name: "Registry", href: "/registry", icon: Database, description: "Browse verified projects" },
      { name: "Map", href: "/map", icon: Map, description: "View project locations" },
    ];

    if (isAuthenticated) {
      links.push(
        { name: "Dashboard", href: "/dashboard", icon: Home, description: "Your personal dashboard" },
        { name: "Projects", href: "/projects", icon: FolderOpen, description: "Manage your projects" }
      );

      if (userRole === 'NGO' || userRole === 'ADMIN') {
        links.push({ name: "Submit Project", href: "/submit", icon: Upload, description: "Submit a new project" });
      }

      if (userRole === 'BUYER' || userRole === 'ADMIN') {
        links.push({ name: "Marketplace", href: "/marketplace", icon: ShoppingCart, description: "Browse carbon credits" });
      }
    }

    return links;
  };

  const quickLinks = getQuickLinks();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 px-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 mb-4">
            <Waves className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blue Carbon Registry</h1>
        </div>

        <Card className="text-center mb-8">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <CardTitle className="text-6xl font-bold text-gray-300 mb-4">404</CardTitle>
            <CardTitle className="text-2xl text-gray-700">Page Not Found</CardTitle>
            <CardDescription className="text-lg">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
            {location.pathname && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Attempted path:</p>
                <code className="text-sm font-mono text-gray-800">{location.pathname}</code>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/" onClick={() => window.history.back()}>
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to={isAuthenticated ? "/dashboard" : "/"}>
                  <Home className="h-4 w-4" />
                  {isAuthenticated ? 'Dashboard' : 'Home'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Quick Navigation</CardTitle>
            <CardDescription className="text-center">
              Here are some helpful links to get you back on track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="group flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {link.name}
                      </p>
                      <p className="text-xs text-gray-600 group-hover:text-blue-600">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
