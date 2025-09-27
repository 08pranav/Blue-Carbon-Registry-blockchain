import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function UserDebug() {
  const { user, isAuthenticated, isAdmin, isVerifier, userRole, loading } = useAuth();

  return (
    <Card className="m-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800">Debug: User Authentication State</CardTitle>
        <CardDescription>Current user authentication and role information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Loading:</span> <Badge variant={loading ? "destructive" : "default"}>{loading ? "True" : "False"}</Badge>
          </div>
          <div>
            <span className="font-semibold">Authenticated:</span> <Badge variant={isAuthenticated ? "default" : "destructive"}>{isAuthenticated ? "True" : "False"}</Badge>
          </div>
          <div>
            <span className="font-semibold">Is Admin:</span> <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "True" : "False"}</Badge>
          </div>
          <div>
            <span className="font-semibold">Is Verifier:</span> <Badge variant={isVerifier ? "default" : "secondary"}>{isVerifier ? "True" : "False"}</Badge>
          </div>
        </div>
        
        {user ? (
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-semibold mb-2">User Object:</h4>
            <div className="text-xs space-y-1">
              <div><span className="font-mono">ID:</span> {user.id}</div>
              <div><span className="font-mono">Name:</span> {user.name}</div>
              <div><span className="font-mono">Email:</span> {user.email}</div>
              <div><span className="font-mono">Role:</span> <Badge>{user.role}</Badge></div>
              <div><span className="font-mono">Organization:</span> {user.organization}</div>
              <div><span className="font-mono">Verified:</span> {user.isEmailVerified ? "✅" : "❌"}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">No user object found</div>
        )}

        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold mb-2">Local Storage:</h4>
          <div className="text-xs space-y-1">
            <div><span className="font-mono">Token:</span> {localStorage.getItem('auth-token') ? "Present" : "Missing"}</div>
            <div><span className="font-mono">User:</span> {localStorage.getItem('user') ? "Present" : "Missing"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}