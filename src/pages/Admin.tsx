import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Users, 
  FileCheck, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { useState } from "react";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const adminStats = [
    { label: "Pending Verifications", value: "23", icon: Clock, trend: "+5 this week" },
    { label: "Active Users", value: "1,247", icon: Users, trend: "+67 this month" },
    { label: "Verified Projects", value: "1,089", icon: CheckCircle, trend: "15 this week" },
    { label: "System Alerts", value: "3", icon: AlertTriangle, trend: "2 resolved today" }
  ];

  const pendingVerifications = [
    {
      id: "VER-001",
      projectName: "Mangaluru Seagrass Restoration",
      submittedBy: "Marine Conservation Trust",
      submissionDate: "2024-09-22",
      dataType: "New Project Registration",
      priority: "high",
      estimatedCredits: 25000,
      status: "pending-review"
    },
    {
      id: "VER-002",
      projectName: "Gujarat Salt Marsh Recovery",
      submittedBy: "Gujarat Coastal Panchayat",
      submissionDate: "2024-09-20",
      dataType: "Progress Update",
      priority: "medium",
      estimatedCredits: 15000,
      status: "field-verification"
    },
    {
      id: "VER-003",
      projectName: "Andhra Pradesh Mangrove",
      submittedBy: "Forest Department AP",
      submissionDate: "2024-09-18",
      dataType: "Milestone Report",
      priority: "low",
      estimatedCredits: 30000,
      status: "document-review"
    }
  ];

  const users = [
    {
      id: "USER-001",
      name: "Sundarbans Foundation",
      type: "NGO",
      email: "contact@sundarbansfoundation.org",
      projects: 5,
      lastActive: "2024-09-22",
      status: "active",
      verified: true
    },
    {
      id: "USER-002", 
      name: "Kerala Coastal Panchayat",
      type: "Government",
      email: "coastal@kerala.gov.in",
      projects: 3,
      lastActive: "2024-09-21",
      status: "active",
      verified: true
    },
    {
      id: "USER-003",
      name: "Marine Conservation Trust",
      type: "NGO",
      email: "info@marineconservation.in",
      projects: 1,
      lastActive: "2024-09-20",
      status: "pending-verification",
      verified: false
    }
  ];

  const blockchainTransactions = [
    {
      id: "TX-001",
      type: "Credit Generation",
      projectName: "Sundarbans Mangrove",
      credits: 25000,
      txHash: "0x1a2b3c...",
      timestamp: "2024-09-22 14:30",
      status: "confirmed"
    },
    {
      id: "TX-002",
      type: "Project Registration", 
      projectName: "Kerala Backwater",
      credits: 0,
      txHash: "0x4d5e6f...",
      timestamp: "2024-09-21 16:45",
      status: "confirmed"
    },
    {
      id: "TX-003",
      type: "Credit Transfer",
      projectName: "Gujarat Salt Marsh",
      credits: 15000,
      txHash: "0x7g8h9i...",
      timestamp: "2024-09-20 11:20",
      status: "pending"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending-verification": return "secondary";
      case "confirmed": return "default";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-background py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Manage blue carbon project verifications, user accounts, and system monitoring. 
              Oversee the blockchain-powered registry operations.
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            {adminStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="verifications" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="verifications">Verification Queue</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Monitor</TabsTrigger>
              <TabsTrigger value="analytics">System Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="verifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Verifications</CardTitle>
                      <CardDescription>Projects awaiting review and verification</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-1" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingVerifications.map((verification) => (
                      <div key={verification.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{verification.projectName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Submitted by {verification.submittedBy} • {verification.dataType}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(verification.priority)}>
                              {verification.priority} priority
                            </Badge>
                            <Badge variant="outline">
                              {verification.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <div className="text-muted-foreground">Submission Date</div>
                            <div>{new Date(verification.submissionDate).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Est. Credits</div>
                            <div>{verification.estimatedCredits.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Data Type</div>
                            <div>{verification.dataType}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Verification ID</div>
                            <div>{verification.id}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Project
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage NGOs, communities, and coastal panchayats</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="ngo">NGO</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{user.name}</h4>
                                {user.verified && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.type} • {user.email}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.projects} projects • Last active: {new Date(user.lastActive).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(user.status)}>
                              {user.status.replace('-', ' ')}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Transaction Monitor</CardTitle>
                  <CardDescription>Monitor carbon credit tokenization and transfers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blockchainTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{transaction.type}</h4>
                              <Badge variant={getStatusColor(transaction.status)}>
                                {transaction.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Project: {transaction.projectName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transaction.timestamp} • Hash: {transaction.txHash}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {transaction.credits > 0 ? `${transaction.credits.toLocaleString()} Credits` : 'N/A'}
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View TX
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Registry Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground">
                        Detailed analytics and reporting features coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Database Connection</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Blockchain Node</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">API Response Time</span>
                        <Badge variant="default">125ms</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Storage Usage</span>
                        <Badge variant="secondary">68%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;