import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Upload,
  Shield,
  CheckCircle,
  Coins,
  Waves,
  FileText,
  Eye,
  Globe,
  Users,
  BarChart3,
  Zap,
  Leaf,
  MapPin,
  Camera,
  Database,
  TrendingUp,
  Award,
  RefreshCw,
  Clock,
  Star,
  Target
} from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Project Registration',
      description: 'Communities, NGOs, and organizations register their blue carbon restoration projects with detailed information about location, ecosystem type, and restoration plans.',
      icon: FileText,
      details: [
        'Submit project proposal with location details',
        'Specify ecosystem type (mangrove, seagrass, salt marsh)',
        'Provide restoration methodology and timeline',
        'Upload baseline environmental data'
      ],
      color: 'bg-blue-500'
    },
    {
      number: 2,
      title: 'Data Collection & Monitoring',
      description: 'Continuous monitoring using mobile apps, satellite imagery, and field measurements to track restoration progress and carbon sequestration.',
      icon: Camera,
      details: [
        'Regular photo documentation of restoration sites',
        'GPS-tagged data collection using mobile apps',
        'Satellite imagery analysis for area coverage',
        'Scientific measurements of carbon storage'
      ],
      color: 'bg-green-500'
    },
    {
      number: 3,
      title: 'Scientific Verification',
      description: 'Expert auditors review all data and evidence to verify carbon sequestration claims using internationally recognized methodologies.',
      icon: Shield,
      details: [
        'Third-party expert auditor review',
        'Compliance with international MRV standards',
        'Scientific validation of carbon measurements',
        'Quality assurance and peer review'
      ],
      color: 'bg-purple-500'
    },
    {
      number: 4,
      title: 'Blockchain Certification',
      description: 'Verified projects are recorded on the blockchain, creating immutable certificates and tokenized carbon credits that prevent double-counting.',
      icon: Zap,
      details: [
        'Immutable blockchain records',
        'Tokenized carbon credit NFTs',
        'Transparent verification history',
        'Prevention of double-counting'
      ],
      color: 'bg-orange-500'
    },
    {
      number: 5,
      title: 'Marketplace Trading',
      description: 'Verified carbon credits can be traded in our marketplace, providing economic incentives to communities and supporting further restoration.',
      icon: Coins,
      details: [
        'Transparent marketplace trading',
        'Real-time pricing and market data',
        'Direct payments to project owners',
        'Portfolio management for buyers'
      ],
      color: 'bg-teal-500'
    }
  ];

  const participants = [
    {
      name: 'NGOs & Communities',
      role: 'Project Submitters',
      description: 'Submit restoration projects, monitor progress, and earn carbon credits',
      icon: Users,
      benefits: ['Direct economic benefits', 'Capacity building', 'Community empowerment', 'Sustainable livelihoods'],
      color: 'bg-green-100 text-green-800'
    },
    {
      name: 'Scientific Auditors',
      role: 'Verification Experts',
      description: 'Review and verify project data using scientific methodologies',
      icon: Award,
      benefits: ['Research opportunities', 'Policy influence', 'Scientific recognition', 'Conservation impact'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      name: 'Corporations & Buyers',
      role: 'Carbon Credit Buyers',
      description: 'Purchase verified credits for carbon offsetting and ESG goals',
      icon: Target,
      benefits: ['Climate goals achievement', 'ESG compliance', 'Transparent reporting', 'Real environmental impact'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Technology Partners',
      role: 'Platform Enablers',
      description: 'Provide blockchain, satellite, and mobile technology infrastructure',
      icon: Zap,
      benefits: ['Innovation showcase', 'Market expansion', 'Sustainability impact', 'Technology validation'],
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const technologies = [
    {
      name: 'Blockchain Technology',
      description: 'Ethereum-based smart contracts for immutable record keeping and tokenized carbon credits',
      icon: Database,
      features: ['Smart contracts', 'NFT carbon credits', 'Transparent transactions', 'Fraud prevention']
    },
    {
      name: 'Satellite Monitoring',
      description: 'Regular satellite imagery analysis to monitor restoration progress and validate claims',
      icon: Globe,
      features: ['Area coverage analysis', 'Change detection', 'Deforestation alerts', 'Progress tracking']
    },
    {
      name: 'Mobile Data Collection',
      description: 'Field-friendly mobile apps for GPS-tagged data collection and photo documentation',
      icon: Camera,
      features: ['GPS integration', 'Offline capability', 'Photo documentation', 'Real-time sync']
    },
    {
      name: 'Scientific MRV',
      description: 'Monitoring, Reporting, and Verification following international carbon standards',
      icon: BarChart3,
      features: ['IPCC guidelines', 'VCS methodology', 'CDM compliance', 'Peer review']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700 text-white py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-8">
              <RefreshCw className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              How It Works
            </h1>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto">
              Discover how our comprehensive platform transforms coastal ecosystem restoration 
              into verifiable, tradeable carbon credits through cutting-edge technology and rigorous science.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
              <Waves className="w-4 h-4 mr-2" />
              Step-by-Step Process
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              From Restoration to Carbon Credits
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process ensures scientific rigor, transparency, and economic benefits 
              for all stakeholders in the blue carbon ecosystem.
            </p>
          </div>
          
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                  {/* Content */}
                  <div className="flex-1">
                    <Card className="border-0 shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${step.color} text-white`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">Step {step.number}</Badge>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className={`w-24 h-24 rounded-full ${step.color} text-white flex items-center justify-center text-3xl font-bold shadow-lg`}>
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-1 h-12 bg-gray-200 mx-auto mt-4"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Who Participates</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together diverse stakeholders in a collaborative ecosystem 
              that benefits everyone while protecting our planet.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {participants.map((participant, index) => {
              const Icon = participant.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{participant.name}</CardTitle>
                    <Badge className={participant.color}>{participant.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{participant.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Key Benefits:</p>
                      {participant.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Technology Behind the Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technologies work together to ensure transparency, accuracy, and trust 
              in every carbon credit transaction.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {technologies.map((tech, index) => {
              const Icon = tech.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-4">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{tech.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tech.description}</p>
                    <div className="space-y-2">
                      {tech.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6">Typical Project Timeline</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From project submission to carbon credit issuance, here's what to expect 
              in terms of timeline and milestones.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-5">
            {[
              { phase: 'Registration', duration: '1-2 weeks', description: 'Submit project and initial review' },
              { phase: 'Monitoring', duration: '6-24 months', description: 'Continuous data collection and progress tracking' },
              { phase: 'Verification', duration: '2-4 weeks', description: 'Expert auditor review and validation' },
              { phase: 'Certification', duration: '1 week', description: 'Blockchain recording and credit minting' },
              { phase: 'Trading', duration: 'Ongoing', description: 'Marketplace listing and active trading' }
            ].map((phase, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-bold mb-3">
                    {index + 1}
                  </div>
                  <h4 className="font-bold mb-2">{phase.phase}</h4>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{phase.duration}</span>
                  </div>
                  <p className="text-xs text-gray-600">{phase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Whether you're a community looking to restore coastal ecosystems or a company 
            seeking verified carbon credits, we're here to help you succeed.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/register">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/marketplace">
                Browse Credits
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;