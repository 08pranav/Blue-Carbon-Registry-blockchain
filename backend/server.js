const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Create directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed!'));
    }
  }
});

// In-memory storage for demo (use database in production)
let projects = [
  {
    id: 'PRJ-DEMO1',
    title: 'Sundarbans Mangrove Restoration Phase-I',
    description: 'Large-scale mangrove restoration project in the Sundarbans delta region.',
    ecosystem: 'MANGROVE',
    location: 'West Bengal, India',
    coordinates: { latitude: 21.9497, longitude: 88.2636 },
    area: 150,
    carbonCreditsEstimated: 2500,
    carbonCreditsIssued: 2500,
    species: 'Rhizophora mucronata, Avicennia marina',
    methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
    timeline: '3 years (2021-2024)',
    status: 'VERIFIED',
    submitterId: 'ngo',
    submitterName: 'Coastal Conservation NGO',
    submitterOrganization: 'Coastal Conservation Trust',
    evidenceFiles: [],
    submissionDate: '2024-01-15T00:00:00Z',
    lastUpdated: '2024-09-15T00:00:00Z',
    verifiedAt: '2024-09-15T00:00:00Z'
  },
  {
    id: 'PRJ-DEMO2',
    title: 'Kerala Backwater Seagrass Conservation',
    description: 'Seagrass meadow restoration project in Kerala backwaters.',
    ecosystem: 'SEAGRASS',
    location: 'Kerala, India',
    coordinates: { latitude: 9.9312, longitude: 76.2673 },
    area: 75,
    carbonCreditsEstimated: 1200,
    carbonCreditsIssued: 1200,
    species: 'Zostera marina, Halophila ovalis',
    methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
    timeline: '2 years (2022-2024)',
    status: 'VERIFIED',
    submitterId: 'ngo',
    submitterName: 'Marine Foundation Kerala',
    submitterOrganization: 'Kerala Marine Conservation Society',
    evidenceFiles: [],
    submissionDate: '2024-02-10T00:00:00Z',
    lastUpdated: '2024-09-10T00:00:00Z',
    verifiedAt: '2024-09-10T00:00:00Z'
  }
];
let marketplace = [];
let transactions = [];
let users = [
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

// Helper function to generate project ID
function generateProjectId() {
  return 'PRJ-' + Date.now().toString(36).toUpperCase();
}

// Routes

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In production, verify password hash
  if (password !== 'demo123') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token (in production, use JWT)
  const token = 'demo-token-' + user.id + '-' + Date.now();

  res.json({
    user,
    token
  });
});

app.get('/api/auth/profile', (req, res) => {
  // Extract token from header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // In production, verify JWT token
  const userId = token.split('-')[2]; // Extract user ID from demo token
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ user });
});

// Project routes
app.get('/api/projects', (req, res) => {
  const { role, userId } = req.query;

  let filteredProjects = projects;

  // Filter based on role
  if (role === 'NGO') {
    // NGOs can only see their own projects
    filteredProjects = projects.filter(p => p.submitterId === userId);
  } else if (role === 'ADMIN' || role === 'AUDITOR') {
    // Admins and Auditors can see all projects
    filteredProjects = projects;
  } else if (role === 'BUYER') {
    // Buyers can see only verified projects
    filteredProjects = projects.filter(p => p.status === 'VERIFIED');
  }

  res.json({
    projects: filteredProjects,
    total: filteredProjects.length
  });
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

app.post('/api/projects', upload.array('files', 10), (req, res) => {
  try {
    const {
      title,
      description,
      ecosystem,
      location,
      latitude,
      longitude,
      area,
      carbonCreditsEstimated,
      species,
      methodology,
      timeline,
      submitterId,
      submitterName,
      submitterOrganization
    } = req.body;

    // Validate required fields
    if (!title || !description || !ecosystem || !location || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process uploaded files
    const evidenceFiles = req.files ? req.files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      name: file.originalname,
      filename: file.filename,
      path: file.path,
      url: `/uploads/${file.filename}`,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date().toISOString()
    })) : [];

    // Create new project
    const newProject = {
      id: generateProjectId(),
      title,
      description,
      ecosystem,
      location,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      area: parseFloat(area) || 0,
      carbonCreditsEstimated: parseInt(carbonCreditsEstimated) || 0,
      species: species || '',
      methodology: methodology || '',
      timeline: timeline || '',
      status: 'PENDING',
      submitterId: submitterId || 'unknown',
      submitterName: submitterName || 'Unknown User',
      submitterOrganization: submitterOrganization || 'Unknown Organization',
      evidenceFiles,
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Add to projects array
    projects.push(newProject);

    console.log(`New project submitted: ${title} by ${submitterName}`);

    res.status(201).json({
      message: 'Project submitted successfully',
      project: newProject
    });

  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

// Update project status (for admin/auditor)
app.patch('/api/projects/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const project = projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  project.status = status;
  project.verificationNotes = notes;
  project.lastUpdated = new Date().toISOString();

  if (status === 'VERIFIED') {
    project.verifiedAt = new Date().toISOString();
    project.carbonCreditsIssued = project.carbonCreditsEstimated;
  }

  console.log(`Project ${project.id} status updated to: ${status}`);

  res.json({
    message: 'Project status updated successfully',
    project
  });
});

// Get pending verifications (for auditors)
app.get('/api/verifications/pending', (req, res) => {
  const pendingProjects = projects.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  
  res.json({
    verifications: pendingProjects.map(project => ({
      id: project.id,
      name: project.title,
      submitter: {
        name: project.submitterName,
        organization: project.submitterOrganization,
        email: users.find(u => u.id === project.submitterId)?.email || 'unknown@example.com'
      },
      ecosystemType: project.ecosystem,
      location: project.location,
      areaSize: project.area,
      estimatedCarbonCapture: project.carbonCreditsEstimated,
      submissionTimestamp: project.submissionDate,
      evidenceFiles: project.evidenceFiles,
      status: project.status,
      coordinates: project.coordinates
    }))
  });
});

// Admin routes
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    overview: {
      totalProjects: projects.length,
      pendingProjects: projects.filter(p => p.status === 'PENDING').length,
      verifiedProjects: projects.filter(p => p.status === 'VERIFIED').length,
      totalCredits: projects.filter(p => p.status === 'VERIFIED').length,
      totalCarbonIssued: projects.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + (p.carbonCreditsIssued || 0), 0)
    },
    recentProjects: projects.slice(-5).reverse()
  };

  res.json(stats);
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    users: users.map(user => ({
      ...user,
      _count: {
        submittedProjects: projects.filter(p => p.submitterId === user.id).length
      }
    })),
    pagination: {
      page: 1,
      limit: 10,
      total: users.length,
      pages: 1
    }
  });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    message: 'File uploaded successfully',
    file: {
      id: Date.now().toString(),
      name: req.file.originalname,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      type: req.file.mimetype
    }
  });
});

// Marketplace routes
app.get('/api/marketplace/listings', (req, res) => {
  // Get all verified projects as available carbon credits
  const availableCredits = projects.filter(p => p.status === 'VERIFIED').map(project => ({
    id: `CC-${project.id}`,
    projectId: project.id,
    projectName: project.title,
    credits: project.carbonCreditsIssued || project.carbonCreditsEstimated,
    pricePerCredit: Math.floor(Math.random() * 200) + 700, // Random price between 700-900
    totalPrice: (project.carbonCreditsIssued || project.carbonCreditsEstimated) * (Math.floor(Math.random() * 200) + 700),
    vintage: new Date(project.submissionDate).getFullYear().toString(),
    certification: 'NCCR Verified',
    location: project.location,
    seller: project.submitterName,
    listedDate: project.submissionDate,
    status: 'available',
    ecosystem: project.ecosystem,
    area: project.area,
    coordinates: project.coordinates
  }));
  
  res.json({
    listings: availableCredits,
    marketStats: {
      totalVolume: availableCredits.reduce((sum, listing) => sum + listing.totalPrice, 0),
      averagePrice: availableCredits.length > 0 ? Math.floor(availableCredits.reduce((sum, listing) => sum + listing.pricePerCredit, 0) / availableCredits.length) : 0,
      activeListings: availableCredits.length,
      dailyChange: '+' + (Math.random() * 20).toFixed(1) + '%'
    }
  });
});

app.post('/api/marketplace/purchase', (req, res) => {
  try {
    const { listingId, quantity, buyerId, buyerName, paymentMethod } = req.body;
    
    if (!listingId || !quantity || !buyerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the project
    const project = projects.find(p => `CC-${p.id}` === listingId);
    if (!project || project.status !== 'VERIFIED') {
      return res.status(404).json({ error: 'Listing not found or not available' });
    }
    
    const availableCredits = project.carbonCreditsIssued || project.carbonCreditsEstimated;
    if (quantity > availableCredits) {
      return res.status(400).json({ error: 'Insufficient credits available' });
    }
    
    // Generate transaction
    const transaction = {
      id: 'TX-' + Date.now().toString(36).toUpperCase(),
      listingId,
      projectId: project.id,
      projectName: project.title,
      credits: quantity,
      pricePerCredit: Math.floor(Math.random() * 200) + 700,
      totalAmount: quantity * (Math.floor(Math.random() * 200) + 700),
      buyerId,
      buyerName: buyerName || 'Unknown Buyer',
      sellerId: project.submitterId,
      sellerName: project.submitterName,
      paymentMethod: paymentMethod || 'card',
      status: 'completed',
      transactionDate: new Date().toISOString(),
      blockchainTxHash: '0x' + Math.random().toString(16).substr(2, 64),
      carbonCreditsRetired: false
    };
    
    transactions.push(transaction);
    
    // Update project credits (simulate selling)
    if (project.carbonCreditsIssued) {
      project.carbonCreditsIssued -= quantity;
    }
    
    console.log(`Carbon credit purchase: ${quantity} credits from ${project.title} by ${buyerName}`);
    
    res.status(201).json({
      message: 'Purchase successful',
      transaction
    });
    
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

app.get('/api/marketplace/transactions', (req, res) => {
  const { userId, role } = req.query;
  
  let filteredTransactions = transactions;
  
  if (role === 'BUYER' && userId) {
    filteredTransactions = transactions.filter(t => t.buyerId === userId);
  } else if (role === 'NGO' && userId) {
    filteredTransactions = transactions.filter(t => t.sellerId === userId);
  }
  
  res.json({
    transactions: filteredTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
  });
});

app.patch('/api/marketplace/transactions/:id/retire', (req, res) => {
  const transaction = transactions.find(t => t.id === req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  if (transaction.carbonCreditsRetired) {
    return res.status(400).json({ error: 'Credits already retired' });
  }
  
  transaction.carbonCreditsRetired = true;
  transaction.retiredAt = new Date().toISOString();
  
  res.json({
    message: 'Carbon credits retired successfully',
    transaction
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    projects: projects.length,
    users: users.length,
    transactions: transactions.length,
    marketplaceListings: projects.filter(p => p.status === 'VERIFIED').length
  });
});

// Minimal blockchain endpoints (mocked until on-chain integration is wired)
const blockchainCredits = [];

app.get('/api/blockchain/credits', (req, res) => {
  const { projectId } = req.query;
  let credits = blockchainCredits;
  if (projectId) {
    credits = credits.filter(c => c.projectId === projectId);
  }
  res.json({ credits });
});

app.get('/api/blockchain/transactions', (req, res) => {
  res.json({
    transactions: transactions,
    pagination: { page: 1, limit: transactions.length, total: transactions.length, pages: 1 }
  });
});

app.post('/api/blockchain/mint-credits', (req, res) => {
  const { projectId, carbonAmount, vintageYear, recipientAddress, certificationStandard } = req.body;
  if (!projectId || !carbonAmount || !vintageYear || !recipientAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.status !== 'VERIFIED') return res.status(400).json({ error: 'Project must be verified to mint credits' });

  const tokenId = 'CC-' + Date.now().toString(36).toUpperCase();
  const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');

  const credit = {
    id: tokenId,
    projectId: project.id,
    amount: Number(carbonAmount),
    tokenId,
    status: 'MINTED',
    currentOwner: recipientAddress,
    blockchainTxHash: txHash,
    createdAt: new Date().toISOString()
  };
  blockchainCredits.push(credit);

  // Record synthetic transaction
  transactions.push({
    id: 'TX-' + Date.now().toString(36).toUpperCase(),
    listingId: `CC-${project.id}`,
    projectId: project.id,
    projectName: project.title || project.name || 'Project',
    credits: Number(carbonAmount),
    pricePerCredit: 0,
    totalAmount: 0,
    buyerId: 'onchain',
    buyerName: 'On-chain Mint',
    sellerId: project.submitterId || 'admin',
    sellerName: project.submitterName || 'Admin',
    paymentMethod: 'onchain',
    status: 'completed',
    transactionDate: new Date().toISOString(),
    blockchainTxHash: txHash,
    carbonCreditsRetired: false
  });

  return res.json({ credit, transactionHash: txHash, message: 'Credits minted (mock)' });
});

app.post('/api/blockchain/transfer-credits', (req, res) => {
  const { tokenId, to, amount } = req.body;
  const credit = blockchainCredits.find(c => c.tokenId === tokenId);
  if (!credit) return res.status(404).json({ error: 'Credit not found' });
  if (credit.status === 'RETIRED') return res.status(400).json({ error: 'Credit already retired' });

  credit.currentOwner = to;
  const txHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
  return res.json({ transaction: { hash: txHash, tokenId, to, amount } });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Blue Carbon Registry Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});

module.exports = app;
