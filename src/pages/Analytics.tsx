import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Download, 
  Leaf, 
  MapPin, 
  Users, 
  Target,
  DollarSign,
  Activity,
  Calendar
} from "lucide-react";

const Analytics = () => {
  // Mock analytics data
  const overviewStats = {
    totalProjects: 156,
    verifiedProjects: 89,
    totalCredits: 125690,
    totalRevenue: 2840000,
    activeUsers: 1247,
    monthlyGrowth: 12.5
  };

  const ecosystemData = [
    { ecosystem: 'Mangrove', count: 67, percentage: 43, credits: 67500, color: 'bg-green-500' },
    { ecosystem: 'Seagrass', count: 45, percentage: 29, credits: 38200, color: 'bg-blue-500' },
    { ecosystem: 'Salt Marsh', count: 44, percentage: 28, credits: 19990, color: 'bg-purple-500' }
  ];

  const monthlyData = [
    { month: 'Jan', projects: 8, credits: 12500, revenue: 450000 },
    { month: 'Feb', projects: 12, credits: 18200, revenue: 680000 },
    { month: 'Mar', projects: 15, credits: 22800, revenue: 820000 },
    { month: 'Apr', projects: 18, credits: 28500, revenue: 950000 },
    { month: 'May', projects: 22, credits: 35200, revenue: 1200000 },
    { month: 'Jun', projects: 19, credits: 29800, revenue: 1050000 }
  ];

  const topPerformers = [
    {
      name: 'Coastal Conservation Trust',
      projects: 15,
      credits: 25000,
      revenue: 875000,
      location: 'West Bengal'
    },
    {
      name: 'Marine Foundation Kerala',
      projects: 12,
      credits: 18500,
      revenue: 640000,
      location: 'Kerala'
    },
    {
      name: 'Gujarat Coastal Authority',
      projects: 8,
      credits: 14200,
      revenue: 520000,
      location: 'Gujarat'
    }
  ];

  const impactMetrics = {
    carbonSequestered: 125690, // tCO2
    areaRestored: 5480, // hectares
    communitiesImpacted: 89,
    biodiversityScore: 8.7
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics & Reports</h1>
              <p className="mt-2 text-indigo-100">
                Comprehensive insights into blue carbon project performance and impact
              </p>
            </div>
            <Button variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{overviewStats.monthlyGrowth}% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.totalCredits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">tCO2 equivalent issued</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(overviewStats.totalRevenue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">From credit transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Registered organizations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ecosystems">Ecosystems</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Project Submissions</CardTitle>
                  <CardDescription>Projects submitted over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 text-sm font-medium">{data.month}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(data.projects / 25) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium w-8 text-right">{data.projects}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue from carbon credit sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 text-sm font-medium">{data.month}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(data.revenue / 1200000) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-right">₹{(data.revenue / 100000).toFixed(1)}L</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ecosystems" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Ecosystem Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Distribution by Ecosystem</CardTitle>
                  <CardDescription>Breakdown of projects by ecosystem type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ecosystemData.map((eco, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{eco.ecosystem}</span>
                        <span>{eco.percentage}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${eco.color} h-2 rounded-full`}
                            style={{ width: `${eco.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">{eco.count} projects</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Carbon Credits by Ecosystem */}
              <Card>
                <CardHeader>
                  <CardTitle>Carbon Credits by Ecosystem</CardTitle>
                  <CardDescription>Total credits issued per ecosystem type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ecosystemData.map((eco, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${eco.color}`} />
                        <div>
                          <div className="font-medium">{eco.ecosystem}</div>
                          <div className="text-sm text-gray-600">{eco.count} projects</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{eco.credits.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">tCO2</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Organizations</CardTitle>
                <CardDescription>Organizations with highest project success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((org, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className="font-semibold">{org.name}</div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {org.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{org.projects}</span> projects
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{org.credits.toLocaleString()}</span> credits
                        </div>
                        <div className="text-sm text-green-600">
                          ₹{(org.revenue / 100000).toFixed(1)}L revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            {/* Environmental Impact */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Carbon Sequestered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {impactMetrics.carbonSequestered.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">tonnes CO2 equivalent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Area Restored</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {impactMetrics.areaRestored.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">hectares of ecosystems</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {impactMetrics.communitiesImpacted}
                  </div>
                  <p className="text-sm text-gray-600">coastal communities impacted</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Biodiversity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">
                    {impactMetrics.biodiversityScore}/10
                  </div>
                  <p className="text-sm text-gray-600">average improvement</p>
                </CardContent>
              </Card>
            </div>

            {/* SDG Alignment */}
            <Card>
              <CardHeader>
                <CardTitle>UN SDG Alignment</CardTitle>
                <CardDescription>Contribution to Sustainable Development Goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="text-blue-600 font-semibold mb-2">SDG 13: Climate Action</div>
                    <div className="text-2xl font-bold mb-1">125,690</div>
                    <div className="text-sm text-gray-600">tonnes CO2 sequestered</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-green-600 font-semibold mb-2">SDG 14: Life Below Water</div>
                    <div className="text-2xl font-bold mb-1">5,480</div>
                    <div className="text-sm text-gray-600">hectares of marine ecosystems restored</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-purple-600 font-semibold mb-2">SDG 1: No Poverty</div>
                    <div className="text-2xl font-bold mb-1">89</div>
                    <div className="text-sm text-gray-600">coastal communities supported</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;