import HeroSection from "@/components/HeroSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";
import { 
  TrendingUp, 
  Leaf, 
  Shield, 
  ArrowRight,
  Database,
  Upload,
  Smartphone,
  Globe,
  CheckCircle,
  Users,
  BarChart3,
  FileText,
  Waves,
  TreePine,
  Star,
  Zap,
  Heart,
  Award
} from "lucide-react";

const Home = () => {
  const stats = [
    { 
      label: "Projects Verified", 
      value: "1,247", 
      icon: Shield, 
      trend: "+12%"
    },
    { 
      label: "Carbon Credits Issued", 
      value: "892K", 
      icon: Leaf, 
      trend: "+8%"
    },
    { 
      label: "Coastal Communities", 
      value: "445", 
      icon: Users, 
      trend: "+22%"
    },
    { 
      label: "Hectares Restored", 
      value: "2.8K", 
      icon: TreePine, 
      trend: "+15%"
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "Immutable verification of blue carbon projects with complete transparency and trust."
    },
    {
      icon: Smartphone,
      title: "Mobile MRV",
      description: "Advanced mobile monitoring with GPS tracking and real-time data synchronization."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards for carbon sequestration and ecosystem health monitoring."
    },
    {
      icon: Globe,
      title: "Global Registry",
      description: "Public, searchable registry of verified blue carbon projects worldwide."
    },
    {
      icon: Waves,
      title: "Multi-Ecosystem",
      description: "Support for mangroves, seagrass meadows, and salt marsh ecosystems."
    },
    {
      icon: Users,
      title: "Community Powered",
      description: "Direct participation for local communities, NGOs, and panchayats."
    }
  ];

  const ecosystems = [
    {
      name: "Mangroves",
      icon: TreePine,
      projects: 847,
      credits: "642K",
      description: "Coastal mangrove restoration and conservation",
      image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9"
    },
    {
      name: "Seagrass Meadows",
      icon: Waves,
      projects: 285,
      credits: "189K",
      description: "Underwater seagrass ecosystem restoration",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19"
    },
    {
      name: "Salt Marshes",
      icon: Leaf,
      projects: 115,
      credits: "61K",
      description: "Tidal salt marsh habitat restoration",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Register Project",
      description: "Submit your blue carbon project with location and baseline data",
      icon: FileText
    },
    {
      step: 2,
      title: "Monitor & Report",
      description: "Use mobile apps for ongoing monitoring and data collection",
      icon: Smartphone
    },
    {
      step: 3,
      title: "Get Verified",
      description: "Expert review and blockchain-based verification",
      icon: Shield
    },
    {
      step: 4,
      title: "Earn Credits",
      description: "Receive tradeable tokenized carbon credits",
      icon: Award
    }
  ];

  const quickActions = [
    {
      title: "Start Your Project",
      description: "Register your blue carbon restoration project today",
      href: "/submit",
      icon: Upload
    },
    {
      title: "Explore Registry",
      description: "Browse verified projects and their impact",
      href: "/registry",
      icon: Database
    },
    {
      title: "View Analytics",
      description: "Access detailed performance metrics",
      href: "/analytics",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Impact Statistics */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900/95 via-cyan-900/95 to-teal-900/95">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-cyan-100/10 text-cyan-100 border-cyan-100/20">
              <Star className="w-4 h-4 mr-2" />
              Platform Impact
            </Badge>
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">
              Making Waves in Blue Carbon
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
              Join thousands of organizations creating measurable impact in coastal ecosystem restoration
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-0 bg-white/10 backdrop-blur-lg hover:bg-white/20 transition-all duration-300 hover:scale-105 text-white shadow-xl hover:shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-cyan-100/20 backdrop-blur-sm">
                        <Icon className="h-8 w-8 text-cyan-100" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold mb-1">{stat.value}</div>
                        <div className="flex items-center text-sm text-cyan-200">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {stat.trend}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-cyan-100">{stat.label}</h3>
                  </CardContent>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-800/95 via-blue-800/95 to-cyan-800/95">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100/10 text-teal-100 border-teal-100/20">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Technology
            </Badge>
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Revolutionary tools powered by blockchain technology for transparent blue carbon management
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 bg-white/10 backdrop-blur-lg hover:bg-white/20 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-2xl bg-teal-100/20 backdrop-blur-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-8 w-8 text-teal-100" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                      <p className="text-blue-100 leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Ecosystems */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-900/95 via-cyan-900/95 to-blue-900/95">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100/10 text-emerald-100 border-emerald-100/20">
              <Heart className="w-4 h-4 mr-2" />
              Ecosystem Protection
            </Badge>
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">
              Protecting Blue Carbon Ecosystems
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
              Specialized monitoring and verification for the world's most critical coastal ecosystems
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {ecosystems.map((ecosystem, index) => {
              const Icon = ecosystem.icon;
              return (
                <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white/10 backdrop-blur-lg hover:bg-white/15 hover:scale-105">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={ecosystem.image} 
                      alt={ecosystem.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-cyan-800/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold">{ecosystem.name}</h3>
                      </div>
                      <p className="text-sm text-white/90">{ecosystem.description}</p>
                    </div>
                  </div>
                  <CardContent className="p-8 bg-slate-800/50">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-2">{ecosystem.projects}</div>
                        <div className="text-sm text-cyan-200 font-medium">Active Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-300 mb-2">{ecosystem.credits}</div>
                        <div className="text-sm text-cyan-200 font-medium">Credits Issued</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-indigo-900/95 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100/10 text-blue-100 border-blue-100/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-5xl font-bold tracking-tight mb-6">
              How It Works
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Four simple steps from project registration to earning tradeable carbon credits
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center">
                  <div className="group">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-teal-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
                      Step {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                    <p className="text-blue-100 leading-relaxed">{step.description}</p>
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-6 transform">
                      <ArrowRight className="h-8 w-8 text-cyan-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-600 via-blue-700 to-teal-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-10">
              Join the blue carbon revolution and start making a difference for our planet's coastal ecosystems
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 bg-white/15 backdrop-blur-lg shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{action.title}</h3>
                    <p className="text-cyan-100 mb-8 leading-relaxed">{action.description}</p>
                    <Button asChild className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 hover:shadow-xl transition-all duration-300 text-white border-0 py-3 text-lg font-semibold">
                      <NavLink to={action.href} className="flex items-center justify-center">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </NavLink>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;