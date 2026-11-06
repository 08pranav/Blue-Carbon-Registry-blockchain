# Vercel Deployment Guide

## Quick Deploy

### Method 1: GitHub Integration (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `blue-carbon-new-frontend` repository
5. Vercel will automatically detect the configuration
6. Click "Deploy"

### Method 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd /path/to/blue-carbon-new-frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - What's your project's name? blue-carbon-new-frontend
# - In which directory is your code located? ./
```

## Configuration

The project is pre-configured with:

- ✅ `vercel.json` - Serverless function configuration
- ✅ `/api/` directory - Backend API endpoints
- ✅ `.env.production` - Production environment variables
- ✅ CORS headers for cross-origin requests
- ✅ Demo data for immediate functionality

## API Endpoints

Once deployed, your API will be available at:

- `https://your-app.vercel.app/api/auth/login` - User authentication
- `https://your-app.vercel.app/api/auth/profile` - User profile
- `https://your-app.vercel.app/api/projects` - Projects list/create
- `https://your-app.vercel.app/api/projects/[id]` - Specific project
- `https://your-app.vercel.app/api/admin/stats` - Admin statistics
- `https://your-app.vercel.app/api/admin/users` - User management

## Demo Credentials

The deployment includes demo users:

- **Admin**: admin@bluecarbon.org / demo123
- **Auditor**: auditor@coastal.org / demo123  
- **NGO**: ngo@ocean.org / demo123
- **Buyer**: buyer@corp.com / demo123

## Features Working

✅ User authentication and roles
✅ Project submission and listing
✅ Admin dashboard
✅ Marketplace functionality
✅ Camera functionality (in supported browsers)
✅ Responsive design
✅ Demo data for testing

## Limitations

⚠️ **File uploads**: Limited to demo mode (no persistent storage)
⚠️ **Data persistence**: Uses in-memory storage (data resets on function restart)
⚠️ **Database**: Not connected to real database

## Next Steps for Production

For a production deployment, consider:

1. **Database Integration**: Connect to PostgreSQL/MongoDB
2. **File Storage**: Use AWS S3, Cloudinary, or Vercel Blob
3. **Authentication**: Implement JWT with proper secret management
4. **Environment Variables**: Set up production secrets in Vercel dashboard
5. **Monitoring**: Add error tracking (Sentry) and analytics

## Troubleshooting

### Build Failures
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build`

### API Not Working
- Verify CORS headers in browser developer tools
- Check function logs in Vercel dashboard
- Ensure API routes match the configuration

### Environment Variables
Set in Vercel dashboard under Project Settings > Environment Variables:
- `NODE_ENV=production`
- `VITE_API_BASE_URL=` (leave empty for serverless functions)