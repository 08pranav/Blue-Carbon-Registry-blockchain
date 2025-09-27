import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Wallet,
  Key,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Save,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Coins,
  Activity,
  Calendar,
  Globe,
  Edit,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getRoleDisplayName } from '@/lib/permissions';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  walletAddress?: string;
  preferredCurrency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    showProfile: boolean;
    showProjects: boolean;
    showTransactions: boolean;
  };
  createdAt: string;
  lastLogin?: string;
  isVerified: boolean;
}

interface WalletInfo {
  address: string;
  balance: number;
  carbonCredits: number;
  pendingTransactions: number;
  isConnected: boolean;
}

export function UserProfile() {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWalletKey, setShowWalletKey] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchUserProfile();
    fetchWalletInfo();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // In a real implementation, this would fetch from the API
      const mockProfile: UserProfile = {
        id: user?.id || 'user-1',
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        role: user?.role || 'NGO',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra, India',
        organization: 'Marine Conservation Foundation',
        bio: 'Dedicated to protecting and restoring blue carbon ecosystems along the Indian coastline. Working with local communities to implement sustainable conservation practices.',
        avatar: '',
        walletAddress: '0x1234...5678',
        preferredCurrency: 'INR',
        notifications: {
          email: true,
          sms: false,
          inApp: true,
        },
        privacy: {
          showProfile: true,
          showProjects: true,
          showTransactions: false,
        },
        createdAt: '2024-01-15T08:30:00Z',
        lastLogin: new Date().toISOString(),
        isVerified: true,
      };
      
      setProfile(mockProfile);
      setFormData(mockProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchWalletInfo = async () => {
    try {
      // Mock wallet data - in real implementation, this would connect to blockchain
      const mockWallet: WalletInfo = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        balance: 2.45,
        carbonCredits: 150.75,
        pendingTransactions: 2,
        isConnected: true,
      };
      
      setWalletInfo(mockWallet);
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // In real implementation, this would call API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      // Mock wallet connection
      toast.info('Connecting to MetaMask...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWalletInfo(prev => prev ? { ...prev, isConnected: true } : null);
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent: keyof UserProfile, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {profile.isVerified && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {getRoleDisplayName(profile.role as any)}
                  </Badge>
                  <Button
                    variant={editMode ? "default" : "outline"}
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.organization && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{profile.organization}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editMode ? (formData.name || '') : profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled // Email typically can't be changed
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editMode ? (formData.phone || '') : (profile.phone || '')}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editMode ? (formData.location || '') : (profile.location || '')}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={editMode ? (formData.organization || '') : (profile.organization || '')}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={editMode ? (formData.bio || '') : (profile.bio || '')}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!editMode}
                  placeholder="Tell us about yourself and your work with blue carbon projects..."
                />
              </div>

              {editMode && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {walletInfo?.isConnected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    
                    <div>
                      <Label>Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={showWalletKey ? walletInfo.address : `${walletInfo.address.slice(0, 10)}...${walletInfo.address.slice(-8)}`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowWalletKey(!showWalletKey)}
                        >
                          {showWalletKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(walletInfo.address)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ETH Balance</span>
                        <span className="font-medium">{walletInfo.balance} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Carbon Credits</span>
                        <span className="font-medium">{walletInfo.carbonCredits} tCO₂</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending Transactions</span>
                        <span className="font-medium">{walletInfo.pendingTransactions}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Connect Your Wallet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Connect your Web3 wallet to manage carbon credits and transactions
                    </p>
                    <Button onClick={handleConnectWallet}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'credit', amount: '25.5 tCO₂', desc: 'Carbon credits purchased', time: '2 hours ago' },
                    { type: 'project', amount: '', desc: 'Project "Mangrove Restoration" verified', time: '1 day ago' },
                    { type: 'withdrawal', amount: '0.1 ETH', desc: 'Withdrawn to external wallet', time: '3 days ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded border">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'credit' ? 'bg-green-500' :
                        activity.type === 'project' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.desc}</p>
                        {activity.amount && (
                          <p className="text-xs text-gray-600">{activity.amount}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates about your projects and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={formData.notifications?.email ?? profile.notifications.email}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                  </div>
                  <Switch
                    checked={formData.notifications?.sms ?? profile.notifications.sms}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'sms', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>In-App Notifications</Label>
                    <p className="text-sm text-gray-600">Show notifications in the application</p>
                  </div>
                  <Switch
                    checked={formData.notifications?.inApp ?? profile.notifications.inApp}
                    onCheckedChange={(checked) => handleNestedInputChange('notifications', 'inApp', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control what information is visible to other users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Profile</Label>
                    <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={formData.privacy?.showProfile ?? profile.privacy.showProfile}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'showProfile', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Projects</Label>
                    <p className="text-sm text-gray-600">Display your projects publicly</p>
                  </div>
                  <Switch
                    checked={formData.privacy?.showProjects ?? profile.privacy.showProjects}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'showProjects', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Transactions</Label>
                    <p className="text-sm text-gray-600">Make your transaction history visible</p>
                  </div>
                  <Switch
                    checked={formData.privacy?.showTransactions ?? profile.privacy.showTransactions}
                    onCheckedChange={(checked) => handleNestedInputChange('privacy', 'showTransactions', checked)}
                  />
                </div>
              </div>
              
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}