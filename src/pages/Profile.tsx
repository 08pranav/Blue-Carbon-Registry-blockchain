import { UserProfile } from '@/components/UserProfile';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings, wallet, and preferences
            </p>
          </div>
          
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Profile;
