// Vercel serverless function for authentication
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

  const { method, query, body } = req;
  const { path } = query;

  if (method === 'POST' && path?.[0] === 'login') {
    const { email, password } = body;
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (password !== 'demo123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = 'demo-token-' + user.id + '-' + Date.now();

    return res.json({ user, token });
  }

  if (method === 'GET' && path?.[0] === 'profile') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userId = token.split('-')[2];
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.json({ user });
  }

  return res.status(404).json({ error: 'Not found' });
}