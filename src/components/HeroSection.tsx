import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowRight, 
  Waves, 
  Shield, 
  Leaf, 
  BarChart3 
} from 'lucide-react';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src='assets/hero-mangroves.jpg'
          alt="Mangrove forest coastal ecosystem"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-cyan-800/70 to-teal-900/80" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
          <Shield className="w-4 h-4 mr-2" />
          Blockchain-Verified Carbon Registry
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Blue Carbon
          <br />
          <span className="bg-gradient-to-r from-blue-200 to-green-200 bg-clip-text text-transparent">
            Registry & MRV
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 leading-relaxed">
          Transparent, verifiable monitoring of coastal ecosystem restoration through blockchain technology. 
          Empowering communities, NGOs, and panchayats with immutable carbon credit generation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isAuthenticated ? (
            <>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg" asChild>
                <Link to="/submit">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Submit Project
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm" asChild>
                <Link to="/projects">
                  <Waves className="w-5 h-5 mr-2" />
                  My Projects
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg" asChild>
                <Link to="/register">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10 backdrop-blur-sm" asChild>
                <Link to="/registry">
                  <Waves className="w-5 h-5 mr-2" />
                  Explore Registry
                </Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center mb-3">
              <Waves className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-3xl font-bold mb-2">2,847</div>
            <div className="text-blue-200">Hectares Restored</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center mb-3">
              <Leaf className="w-8 h-8 text-green-200" />
            </div>
            <div className="text-3xl font-bold mb-2">156,420</div>
            <div className="text-green-200">Carbon Credits Generated</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">47</div>
            <div className="text-blue-200">Verified Projects</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
