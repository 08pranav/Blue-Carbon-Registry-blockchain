const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Demo NGO wallet that owns the seeded sample projects (same default as src/utils/fixedWallets.ts)
const DEMO_NGO_WALLET = process.env.DEMO_NGO_WALLET || '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656';
// Price (in ETH per credit) a listing gets when the auditor approves a project
const DEFAULT_PRICE_ETH = process.env.DEFAULT_PRICE_ETH || '0.001';
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

// Create directories if they don't exist. Serverless platforms only allow writing to /tmp.
const uploadsDir = process.env.UPLOADS_DIR || (process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads'));
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

// In-memory storage (resets when the server restarts; a real deployment needs a database)
const sampleProject = (overrides) => ({
  status: 'PENDING',
  submitterId: DEMO_NGO_WALLET.toLowerCase(),
  ngoAddress: DEMO_NGO_WALLET,
  evidenceFiles: [],
  ...overrides
});

let projects = [
  sampleProject({
    id: 'PRJ-DEMO1',
    title: 'Sundarbans Mangrove Restoration Phase-I',
    description: 'Large-scale mangrove restoration project in the Sundarbans delta region.',
    ecosystem: 'MANGROVE',
    location: 'West Bengal, India',
    coordinates: { latitude: 21.9497, longitude: 88.2636 },
    area: 150,
    carbonCreditsEstimated: 2500,
    species: 'Rhizophora mucronata, Avicennia marina',
    methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
    timeline: '3 years (2021-2024)',
    submitterName: 'Coastal Conservation NGO',
    submitterOrganization: 'Coastal Conservation Trust',
    submissionDate: '2024-01-15T00:00:00Z',
    lastUpdated: '2024-01-15T00:00:00Z'
  }),
  sampleProject({
    id: 'PRJ-DEMO2',
    title: 'Kerala Backwater Seagrass Conservation',
    description: 'Seagrass meadow restoration project in Kerala backwaters.',
    ecosystem: 'SEAGRASS',
    location: 'Kerala, India',
    coordinates: { latitude: 9.9312, longitude: 76.2673 },
    area: 75,
    carbonCreditsEstimated: 1200,
    species: 'Zostera marina, Halophila ovalis',
    methodology: 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
    timeline: '2 years (2022-2024)',
    submitterName: 'Marine Foundation Kerala',
    submitterOrganization: 'Kerala Marine Conservation Society',
    submissionDate: '2024-02-10T00:00:00Z',
    lastUpdated: '2024-02-10T00:00:00Z'
  })
];
// Credit listings created when an auditor approves a project (editable by the NGO)
let listings = [];
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

// Utility: Haversine distance in meters
function haversine(lat1, lon1, lat2, lon2) {
  function toRad(d) { return d * Math.PI / 180; }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function aiReviewEvidence(files, projectCoords, ecosystem) {
  const exifr = require('exifr');
  const sizeOf = require('image-size');
  let sharp;
  try { sharp = require('sharp'); } catch (e) { sharp = null; }
  const results = [];
  let score = 0;
  let semanticHits = 0;
  for (const f of files) {
    const checks = [];
    // Type check
    const okType = /jpeg|jpg|png/.test((f.mimetype || '').toLowerCase());
    if (!okType) checks.push('Unsupported file type'); else score += 1;
    // Size check
    if (f.size < 30 * 1024) checks.push('Image too small (<30KB)'); else score += 1;
    if (f.size > 10 * 1024 * 1024) checks.push('Image too large (>10MB)');
    // Dimension check
    try {
      const dim = sizeOf(f.path);
      if (dim.width < 800 || dim.height < 600) {
        checks.push(`Low resolution (${dim.width}x${dim.height})`);
      } else {
        score += 1;
      }
    } catch (e) {
      // ignore
    }
    // EXIF GPS check (if available)
    try {
      const exif = await exifr.parse(f.path, { gps: true });
      if (exif && exif.latitude && exif.longitude && projectCoords) {
        const d = haversine(exif.latitude, exif.longitude, projectCoords.latitude, projectCoords.longitude);
        if (d > 1000) {
          checks.push(`Geo mismatch: EXIF shows ${(d/1000).toFixed(1)}km from project location`);
        } else {
          score += 1;
        }
      }
    } catch (e) { /* ignore */ }

    // Simple semantic checks
    const signals = { filenameKeyword: false, greenDominance: false };
    try {
      const name = (f.originalname || f.filename || '').toLowerCase();
      if (ecosystem === 'MANGROVE' && name.includes('mangrove')) signals.filenameKeyword = true;
      if (ecosystem === 'SEAGRASS' && (name.includes('seagrass') || name.includes('sea grass'))) signals.filenameKeyword = true;
      if (ecosystem === 'SALT_MARSH' && (name.includes('saltmarsh') || (name.includes('salt') && name.includes('marsh')))) signals.filenameKeyword = true;

      // Color dominance heuristic (requires sharp)
      if (sharp && /jpeg|jpg|png/.test((f.mimetype || '').toLowerCase())) {
        const stats = await sharp(f.path).stats();
        const r = stats.channels[0]?.mean || 0;
        const g = stats.channels[1]?.mean || 0;
        const b = stats.channels[2]?.mean || 0;
        if (g > Math.max(r, b) + 10 && g > 90) {
          signals.greenDominance = true;
        }
      }
    } catch (e) {
      // ignore semantic errors
    }

    if (signals.filenameKeyword || signals.greenDominance) {
      semanticHits += 1;
    }

    results.push({ file: f.originalname || f.filename, ok: checks.length === 0, issues: checks, signals });
  }

  let status = 'NEEDS_REVIEW';
  const basicPass = results.every(r => r.ok) && score >= Math.max(3, files.length * 2);
  const semanticOk = semanticHits >= 1; // at least one semantic signal across evidence
  if (results.filter(r => !r.ok).length >= Math.ceil(files.length / 2)) status = 'REJECT';
  else if (basicPass && semanticOk && files.length > 0) status = 'APPROVE';
  else status = 'NEEDS_REVIEW';

  return { status, score, results, ecosystem, semanticOk, basicPass };
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
    filteredProjects = projects.filter(p => String(p.submitterId).toLowerCase() === String(userId || '').toLowerCase());
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

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const [removed] = projects.splice(idx, 1);
  // Also remove related transactions (mock)
  for (let i = transactions.length - 1; i >= 0; i--) {
    if (transactions[i].projectId === req.params.id) {
      transactions.splice(i, 1);
    }
  }
  return res.json({ message: 'Project deleted', project: removed });
});

app.post('/api/projects', upload.array('files', 10), async (req, res) => {
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
      submitterAddress,
      submitterName,
      submitterOrganization
    } = req.body;

    // Validate required fields
    if (!title || !description || !ecosystem || !location || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['MANGROVE', 'SEAGRASS', 'SALT_MARSH'].includes(ecosystem)) {
      return res.status(400).json({ error: 'ecosystem must be MANGROVE, SEAGRASS or SALT_MARSH' });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!(lat >= -90 && lat <= 90) || !(lon >= -180 && lon <= 180)) {
      return res.status(400).json({ error: 'latitude/longitude out of range' });
    }
    if (submitterAddress && !ADDRESS_RE.test(submitterAddress)) {
      return res.status(400).json({ error: 'submitterAddress is not a valid Ethereum address' });
    }
    const ngoAddress = submitterAddress || DEMO_NGO_WALLET;

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

    // AI review of evidence
    const coords = { latitude: lat, longitude: lon };
    const aiReview = await aiReviewEvidence(evidenceFiles.map(ef => ({
      path: ef.path,
      mimetype: ef.type,
      size: ef.size,
      originalname: ef.name,
      filename: ef.filename
    })), coords, ecosystem);

    // Create new project
    const newProject = {
      id: generateProjectId(),
      title,
      description,
      ecosystem,
      location,
      coordinates: coords,
      area: parseFloat(area) || 0,
      carbonCreditsEstimated: parseInt(carbonCreditsEstimated) || 0,
      species: species || '',
      methodology: methodology || '',
      timeline: timeline || '',
      status: 'PENDING',
      submitterId: ngoAddress.toLowerCase(),
      ngoAddress,
      submitterName: submitterName || 'Unknown User',
      submitterOrganization: submitterOrganization || 'Unknown Organization',
      evidenceFiles,
      aiReview,
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Add to projects array
    projects.push(newProject);

    console.log(`New project submitted: ${title} by ${submitterName} [AI: ${aiReview.status}]`);

    res.status(201).json({
      message: aiReview.status === 'REJECT' ? 'Evidence failed AI checks. Please review issues.' : 'Project submitted successfully',
      project: newProject,
      aiReview
    });

  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

// Update project status (auditor). Approving records the on-chain issuance and creates a listing.
app.patch('/api/projects/:id/status', (req, res) => {
  const { status, notes, allocatedCredits, mintTxHash } = req.body;
  const project = projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (!['UNDER_REVIEW', 'VERIFIED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'status must be UNDER_REVIEW, VERIFIED or REJECTED' });
  }
  if (project.status === 'VERIFIED') {
    return res.status(409).json({ error: 'Project is already verified' });
  }

  if (status === 'VERIFIED') {
    const credits = Number(allocatedCredits);
    if (!Number.isInteger(credits) || credits <= 0) {
      return res.status(400).json({ error: 'allocatedCredits must be a positive integer' });
    }
    if (!TX_HASH_RE.test(mintTxHash || '')) {
      return res.status(400).json({ error: 'mintTxHash must be the transaction hash of the on-chain issuance' });
    }
    project.allocatedCredits = credits;
    project.carbonCreditsIssued = credits;
    project.mintTxHash = mintTxHash;
    project.verifiedAt = new Date().toISOString();
    upsertListing(project, { credits, pricePerCredit: DEFAULT_PRICE_ETH });
  }

  project.status = status;
  project.verificationNotes = notes;
  project.lastUpdated = new Date().toISOString();

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

// Create or update the listing for a verified project
function upsertListing(project, { credits, pricePerCredit }) {
  const id = `LST-${project.id}`;
  let listing = listings.find(l => l.id === id);
  if (!listing) {
    listing = { id, projectId: project.id, createdAt: new Date().toISOString() };
    listings.push(listing);
  }
  listing.credits = credits;
  listing.pricePerCredit = String(pricePerCredit);
  listing.updatedAt = new Date().toISOString();
  return listing;
}

function toPublicListing(listing) {
  const project = projects.find(p => p.id === listing.projectId);
  return {
    id: listing.id,
    projectId: listing.projectId,
    projectName: project.title,
    description: project.description,
    ecosystem: project.ecosystem,
    location: project.location,
    area: project.area,
    coordinates: project.coordinates,
    ngoAddress: project.ngoAddress,
    ngoName: project.submitterName,
    credits: listing.credits,
    pricePerCredit: listing.pricePerCredit, // ETH per credit
    vintage: new Date(project.verifiedAt || project.submissionDate).getFullYear().toString(),
    certification: 'Auditor-verified, issued on-chain as BCC',
    mintTxHash: project.mintTxHash,
    listedDate: listing.createdAt
  };
}

app.get('/api/marketplace/listings', (req, res) => {
  const active = listings.filter(l => l.credits > 0).map(toPublicListing);
  const totalCredits = active.reduce((sum, l) => sum + l.credits, 0);
  res.json({
    listings: active,
    marketStats: {
      activeListings: active.length,
      totalCredits,
      averagePriceEth: active.length
        ? active.reduce((sum, l) => sum + Number(l.pricePerCredit), 0) / active.length
        : 0
    }
  });
});

// The NGO sets how many of its verified credits are for sale, and at what price (ETH per credit)
app.post('/api/marketplace/listings', (req, res) => {
  const { projectId, credits, pricePerCredit, ngoAddress } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project || project.status !== 'VERIFIED') {
    return res.status(404).json({ error: 'Verified project not found' });
  }
  if (!ADDRESS_RE.test(ngoAddress || '') || ngoAddress.toLowerCase() !== project.ngoAddress.toLowerCase()) {
    return res.status(403).json({ error: 'Only the NGO that owns this project can list its credits' });
  }
  const qty = Number(credits);
  const price = Number(pricePerCredit);
  if (!Number.isInteger(qty) || qty <= 0 || qty > project.allocatedCredits) {
    return res.status(400).json({ error: `credits must be a whole number between 1 and ${project.allocatedCredits}` });
  }
  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'pricePerCredit must be a positive number (ETH)' });
  }
  const sold = transactions
    .filter(t => t.projectId === project.id)
    .reduce((sum, t) => sum + t.credits, 0);
  if (qty > project.allocatedCredits - sold) {
    return res.status(400).json({ error: `Only ${project.allocatedCredits - sold} credits of this project are unsold` });
  }
  const listing = upsertListing(project, { credits: qty, pricePerCredit: price });
  res.status(201).json({ listing: toPublicListing(listing) });
});

// Called after the buyer's on-chain Marketplace.executeTrade() transaction is confirmed.
// The backend only records the sale; the chain is the source of truth for the transfer.
// NOTE: it trusts the client-reported tx hash (no on-chain receipt check yet).
app.post('/api/marketplace/purchase', (req, res) => {
  const { listingId, quantity, buyerAddress, txHash } = req.body;

  if (!listingId || !quantity || !ADDRESS_RE.test(buyerAddress || '') || !TX_HASH_RE.test(txHash || '')) {
    return res.status(400).json({ error: 'listingId, quantity, buyerAddress and a valid txHash are required' });
  }
  const listing = listings.find(l => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0 || qty > listing.credits) {
    return res.status(400).json({ error: 'Invalid quantity or insufficient credits available' });
  }
  if (transactions.some(t => t.blockchainTxHash === txHash)) {
    return res.status(409).json({ error: 'This transaction has already been recorded' });
  }

  const project = projects.find(p => p.id === listing.projectId);
  const transaction = {
    id: 'TX-' + Date.now().toString(36).toUpperCase(),
    listingId,
    projectId: project.id,
    projectName: project.title,
    credits: qty,
    pricePerCredit: listing.pricePerCredit,
    totalAmountEth: String(Number(listing.pricePerCredit) * qty),
    buyerAddress,
    sellerAddress: project.ngoAddress,
    sellerName: project.submitterName,
    status: 'completed',
    transactionDate: new Date().toISOString(),
    blockchainTxHash: txHash
  };
  transactions.push(transaction);
  listing.credits -= qty;

  console.log(`Recorded purchase: ${qty} credits from ${project.title} by ${buyerAddress} (${txHash})`);
  res.status(201).json({ message: 'Purchase recorded', transaction });
});

app.get('/api/marketplace/transactions', (req, res) => {
  const { address } = req.query;
  const lower = String(address || '').toLowerCase();
  const filtered = address
    ? transactions.filter(t => t.buyerAddress.toLowerCase() === lower || t.sellerAddress.toLowerCase() === lower)
    : transactions;
  res.json({
    transactions: [...filtered].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
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
    marketplaceListings: listings.filter(l => l.credits > 0).length
  });
});

// AI endpoints
app.get('/api/ai/review/:id', async (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const files = project.evidenceFiles || [];
  const coords = project.coordinates;
  const aiReview = await aiReviewEvidence(files.map(ef => ({
    path: ef.path,
    mimetype: ef.type,
    size: ef.size,
    originalname: ef.name,
    filename: ef.filename
  })), coords, project.ecosystem);
  project.aiReview = aiReview;
  project.lastUpdated = new Date().toISOString();
  return res.json({ aiReview });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || /^Only images/.test(error.message)) {
    return res.status(400).json({ error: error.message });
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
