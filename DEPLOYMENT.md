# Task Manager - Deployment Guide

## Backend (Render)

### Environment Variables to set on Render:
```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
FRONTEND_URL=https://task-manager99.vercel.app
```

## Frontend (Vercel)

### Environment Variables to set on Vercel:
```
VITE_API_URL=https://task-manager-c5e6.onrender.com/api
```

### Setup Steps:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the environment variable above
4. Redeploy the project to apply changes

### Local Development:
- Frontend: Copy `.env.example` to `.env.local` and update if needed
- Backend: Copy `.env.example` to `.env` and add your credentials

## Common Issues

### CORS Error
- Ensure `FRONTEND_URL` is set correctly in backend .env
- The backend CORS is configured to accept multiple origins
- If still having issues, verify both services are deployed with latest code

### API Not Found (404)
- Verify the Render backend URL is correct in `VITE_API_URL`
- Check that the backend is running on Render
- Ensure the backend routes are properly configured
