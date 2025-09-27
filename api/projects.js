// Vercel serverless function for projects
const projects = [
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

function generateProjectId() {
  return 'PRJ-' + Date.now().toString(36).toUpperCase();
}

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
  const { role, userId, path } = query;

  // GET /api/projects - List projects
  if (method === 'GET' && !path) {
    let filteredProjects = projects;

    if (role === 'NGO') {
      filteredProjects = projects.filter(p => p.submitterId === userId);
    } else if (role === 'BUYER') {
      filteredProjects = projects.filter(p => p.status === 'VERIFIED');
    }

    return res.json({
      projects: filteredProjects,
      total: filteredProjects.length
    });
  }

  // GET /api/projects/:id - Get specific project
  if (method === 'GET' && path && path.length === 1) {
    const project = projects.find(p => p.id === path[0]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  }

  // POST /api/projects - Create project (simplified for demo)
  if (method === 'POST') {
    const newProject = {
      id: generateProjectId(),
      title: req.body.title || 'New Project',
      description: req.body.description || '',
      ecosystem: req.body.ecosystem || 'MANGROVE',
      location: req.body.location || '',
      coordinates: {
        latitude: parseFloat(req.body.latitude) || 0,
        longitude: parseFloat(req.body.longitude) || 0
      },
      area: parseInt(req.body.area) || 0,
      carbonCreditsEstimated: parseInt(req.body.carbonCreditsEstimated) || 0,
      carbonCreditsIssued: 0,
      methodology: req.body.methodology || '',
      timeline: req.body.timeline || '',
      status: 'PENDING',
      submitterId: req.body.submitterId || 'unknown',
      submitterName: req.body.submitterName || 'Unknown User',
      submitterOrganization: req.body.submitterOrganization || '',
      evidenceFiles: [],
      submissionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // In a real app, save to database
    // For demo, just return success
    return res.status(201).json({
      project: newProject,
      message: 'Project submitted successfully'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}