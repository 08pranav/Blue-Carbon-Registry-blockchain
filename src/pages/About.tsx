import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Waves, 
  Leaf, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp,
  Award,
  Heart,
  Zap,
  TreePine,
  Fish,
  Anchor,
  CheckCircle,
  Target,
  ArrowRight
} from 'lucide-react';

const About = () => {
  const ecosystems = [
    {
      name: 'Mangroves',
      description: 'Coastal wetland ecosystems that store massive amounts of carbon in their roots and sediments.',
      icon: TreePine,
      stats: { coverage: '152,000 km²', carbonStore: '22.8 Gt C', locations: '118 countries' },
      image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9'
    },
    {
      name: 'Seagrass Meadows',
      description: 'Underwater flowering plants that create highly productive marine ecosystems.',
      icon: Fish,
      stats: { coverage: '177,000 km²', carbonStore: '19.9 Gt C', locations: '159 countries' },
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19'
    },
    {
      name: 'Salt Marshes',
      description: 'Tidal wetlands that provide crucial habitat while sequestering significant carbon.',
      icon: Anchor,
      stats: { coverage: '54,951 km²', carbonStore: '6.2 Gt C', locations: '43 countries' },
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
    }
  ];

  const features = [
    {
      title: 'Blockchain Verification',
      description: 'Immutable record-keeping ensures transparency and prevents double-counting of carbon credits.',
      icon: Shield
    },
    {
      title: 'Scientific Accuracy',
      description: 'All methodologies are based on peer-reviewed science and international standards.',
      icon: Award
    },
    {
      title: 'Community Empowerment',
      description: 'Local communities are at the center of conservation efforts and benefit directly from projects.',
      icon: Users
    },
    {
      title: 'Global Impact',
      description: 'Contributing to international climate goals and the UN Sustainable Development Goals.',
      icon: Globe
    }
  ];

  const team = [
    {
      name: 'Dr. Marine Scientist',
      role: 'Chief Scientific Officer',
      description: 'Leading marine biologist specializing in blue carbon ecosystems.',
      icon: Waves
    },
    {
      name: 'Tech Innovation Lead',
      role: 'CTO',
      description: 'Blockchain and sustainability technology expert.',
      icon: Zap
    },
    {
      name: 'Community Outreach',
      role: 'Director of Partnerships',
      description: 'Building bridges with coastal communities and NGOs worldwide.',
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700 text-white py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8">
              <Waves className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              About Blue Carbon Registry
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto">
              We're pioneering the future of coastal ecosystem restoration through blockchain technology, 
              scientific rigor, and community empowerment. Our mission is to protect and restore the world's 
              most powerful carbon-capturing ecosystems.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  To create a transparent, scientifically-rigorous platform that enables the protection, 
                  restoration, and monitoring of blue carbon ecosystems while providing economic incentives 
                  to coastal communities and organizations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Restore 1 million hectares by 2030</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Generate 100 million carbon credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Support 10,000 coastal communities</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 mb-4">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  A world where coastal ecosystems are valued, protected, and thriving, contributing 
                  significantly to global climate stability while providing sustainable livelihoods 
                  for coastal communities.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Global standard for blue carbon credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Empowered coastal communities worldwide</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Thriving blue carbon ecosystems</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blue Carbon Ecosystems */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              <Waves className="w-4 h-4 mr-2" />
              Blue Carbon Ecosystems
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              The World's Most Powerful Carbon Stores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Blue carbon ecosystems can sequester carbon up to 10 times faster than terrestrial forests
              and store it for millennia in their sediments.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {ecosystems.map((ecosystem, index) => {
              const Icon = ecosystem.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48">
                    <img 
                      src={ecosystem.image} 
                      alt={ecosystem.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <h3 className="text-xl font-bold">{ecosystem.name}</h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">{ecosystem.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Global Coverage</span>
                        <span className="font-medium">{ecosystem.stats.coverage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Carbon Storage</span>
                        <span className="font-medium">{ecosystem.stats.carbonStore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Present in</span>
                        <span className="font-medium">{ecosystem.stats.locations}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Why Choose Our Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology meets environmental science to create the most 
              transparent and reliable blue carbon credit system.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              World-class experts in marine science, blockchain technology, and sustainable development.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member, index) => {
              const Icon = member.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                      <Icon className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600">{member.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join us in protecting and restoring the world's blue carbon ecosystems. 
            Together, we can create a sustainable future for our planet.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/registry">
                Explore Projects
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;