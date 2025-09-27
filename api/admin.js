// Vercel serverless function for admin endpoints
const users = [
  {
    id: 'admin',
    name: 'Dr. Rajesh Kumar',
    email: 'admin@bluecarbon.org',
    role: 'ADMIN',
    organization: 'NCCR',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'auditor',
    name: 'Dr. Michael Chen',
    email: 'auditor@coastal.org',
    role: 'AUDITOR',
    organization: 'Global Audit Partners',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ngo',
    name: 'Anjali Patel',
    email: 'ngo@ocean.org',
    role: 'NGO',
    organization: 'Ocean Conservation NGO',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'buyer',
    name: 'Sarah Johnson',
    email: 'buyer@corp.com',
    role: 'BUYER',
    organization: 'ClimateCorp Industries',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  }
];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;
  const { path } = query;

  // GET /api/admin/stats
  if (method === 'GET' && path?.[0] === 'stats') {
    return res.json({
      totalProjects: 15,
      verifiedProjects: 8,
      pendingProjects: 5,
      rejectedProjects: 2,
      totalCarbonCredits: 12500,
      totalUsers: users.length,
      monthlyGrowth: 15.5,
      systemHealth: 'good'
    });
  }

  // GET /api/admin/users
  if (method === 'GET' && path?.[0] === 'users') {
    return res.json({
      users: users,
      total: users.length
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}