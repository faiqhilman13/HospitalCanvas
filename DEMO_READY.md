# AI-Powered Clinical Canvas - DEMO READY 🎉

## Project Status: PRODUCTION READY

The AI-Powered Clinical Canvas is now a production-ready application with complete frontend-backend integration, AI pipeline functionality, and Railway deployment configuration.

---

## 🌍 DEPLOYMENT OPTIONS

### 🏠 Local Development
Perfect for development, testing, and demos
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Local OpenAI API integration
- SQLite database

### ☁️ Production (Railway + Netlify)
Ready for real-world deployment
- Frontend: Netlify static hosting
- Backend: Railway cloud deployment
- PostgreSQL database (optional)
- Production security & CORS

---

## ✅ COMPLETED FEATURES

### 🖥️ Frontend (React + TypeScript)
- **Modern React Canvas Application** - Vite + TypeScript + Tailwind CSS
- **Interactive Clinical Canvas** - React Flow with pan/zoom, drag & drop
- **5 Custom Node Types**:
  - PatientSummaryNode - Clinical summary with urgency indicators
  - VitalsChartNode - Interactive Chart.js charts for trends  
  - DocumentViewerNode - PDF viewer with zoom/navigation
  - AIQuestionBoxNode - Q&A interface with citations
  - LabResultsNode - Collapsible lab results display
- **Patient Selector** - Dynamic dropdown with real API integration
- **Real-time API Integration** - Connected to live backend services

### 🔧 Backend API (FastAPI + SQLite)
- **RESTful API** - Complete patient data and Q&A endpoints
- **Database Integration** - SQLite with comprehensive clinical schema
- **3 Demo Patients** - Uncle Tan (CKD), Mrs. Chen (Diabetes), Mr. Kumar (Post-MI)
- **Pre-configured Canvas Layouts** - Optimized for each patient case
- **CORS Configuration** - Seamless frontend-backend communication

### 🤖 AI Pipeline (RAG System)
- **Document Processing** - PDF text extraction and chunking
- **RAG Architecture** - Retrieval-Augmented Generation for clinical Q&A
- **Ollama Integration** - Local LLM support (LLaMA 3 ready)
- **Fallback System** - Pre-computed Q&A pairs for reliable demo
- **Clinical Context** - Patient data, vitals, and lab results integration

---

## 🚀 SETUP & DEPLOYMENT GUIDE

### 📋 Prerequisites
- **Python 3.11+** installed
- **Node.js/Bun** installed  
- **Git** installed
- **OpenAI API Key** (required for AI features)

### 🔑 Required Credentials

#### OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)
4. You'll need this for both local and production environments

---

## 🏠 LOCAL DEVELOPMENT SETUP

### Step 1: Clone and Navigate
```bash
git clone <repository-url>
cd hackathon
```

### Step 2: Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file with your OpenAI key
cp .env.example .env

# Edit .env file and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-actual-openai-key-here
# ENVIRONMENT=development

# Initialize database with demo data
python initialize_db.py
python populate_demo_data.py

# Start backend server
uvicorn main:app --reload
```
**Backend will run on:** http://localhost:8000

### Step 3: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
# OR
bun install

# Start development server
npm run dev
# OR  
bun run dev
```
**Frontend will run on:** http://localhost:5173

### Step 4: Verify Setup
1. **Backend Health Check**: Visit http://localhost:8000
2. **Frontend**: Visit http://localhost:5173
3. **Test API**: Check patient list at http://localhost:8000/api/patients
4. **Test AI**: Ask questions in the AI Question Box

---

## ☁️ PRODUCTION DEPLOYMENT

### Step 1: Backend Deployment (Railway)

#### A. Prepare Backend Environment
```bash
cd backend

# Your .env file should contain:
# OPENAI_API_KEY=sk-your-actual-openai-key-here
# ENVIRONMENT=production
# CORS_ORIGINS=https://your-netlify-app.netlify.app
```

#### B. Deploy to Railway
1. **Create Railway Account**: https://railway.app
2. **Create New Project**: Click "New Project"
3. **Connect GitHub**: Link your repository
4. **Set Environment Variables in Railway Dashboard**:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ENVIRONMENT=production
   CORS_ORIGINS=https://your-netlify-app.netlify.app
   DATABASE_URL=<railway-will-provide-if-using-postgres>
   ```
5. **Deploy**: Railway will automatically build using `railway.json` and `Procfile`
6. **Get Railway URL**: Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Step 2: Frontend Deployment (Netlify)

#### A. Update Production Environment
```bash
cd frontend

# Edit .env.production file:
# Replace the placeholder URL with your actual Railway URL
VITE_API_URL=https://your-actual-railway-app.up.railway.app/api
```

#### B. Build and Deploy
```bash
# Build for production
npm run build
# OR
bun run build

# Deploy to Netlify
# Option 1: Drag & drop the 'dist' folder to https://app.netlify.com/drop
# Option 2: Connect GitHub repository to Netlify for automatic deployments
```

#### C. Configure Netlify Environment Variables (if using GitHub deployment)
In Netlify dashboard, set:
```
VITE_API_URL=https://your-actual-railway-app.up.railway.app/api
VITE_NODE_ENV=production
```

### Step 3: Update CORS Settings
After deploying frontend, update Railway backend environment variables:
```
CORS_ORIGINS=https://your-actual-netlify-app.netlify.app
```

---

## 🔧 CONFIGURATION DETAILS

### Environment Variables Explained

#### Backend (.env)
```bash
# OpenAI Integration (REQUIRED)
OPENAI_API_KEY=sk-your-key-here         # Get from https://platform.openai.com/api-keys
OPENAI_ORGANIZATION_ID=org-xxxxx        # Optional: Your OpenAI org ID
OPENAI_MODEL=gpt-3.5-turbo             # Model to use for Q&A

# Environment Configuration
ENVIRONMENT=development                  # 'development' or 'production'
DEBUG=True                              # Enable debug logging

# Database Configuration
DATABASE_URL=                           # Leave empty for SQLite (dev), Railway provides for PostgreSQL (prod)

# Security & CORS
CORS_ORIGINS=http://localhost:5173      # Frontend URL (dev), Netlify URL (prod)
SECRET_KEY=your-secret-key-here         # Generate a random secret

# API Configuration  
RATE_LIMIT=100                          # Requests per minute
API_TIMEOUT=30                          # Request timeout in seconds
```

#### Frontend (.env.production)
```bash
# Railway Backend API URL (REQUIRED)
VITE_API_URL=https://your-railway-app.up.railway.app/api

# Environment Configuration
VITE_NODE_ENV=production
VITE_ENVIRONMENT=production

# API Configuration
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# Feature Flags
VITE_ENABLE_MOCK_DATA_FALLBACK=true     # Fallback to mock data if API fails
VITE_ENABLE_API_LOGGING=false           # Disable in production
VITE_ENABLE_ERROR_REPORTING=true        # Enable error tracking

# Cache Configuration (milliseconds)
VITE_CACHE_PATIENT_DATA_TTL=300000      # 5 minutes
VITE_CACHE_PATIENTS_LIST_TTL=600000     # 10 minutes
VITE_CACHE_SOAP_NOTES_TTL=120000        # 2 minutes
```

### Demo Flow (Both Environments)
1. **Patient Selection** - Choose from 3 demo patients in dropdown
2. **Canvas Interaction** - Explore interactive clinical nodes
3. **AI Q&A** - Ask questions powered by OpenAI
4. **Data Visualization** - View charts, labs, and clinical summaries

---

## ⚠️ IMPORTANT NOTES

### Security Considerations
- **Never commit `.env` files** with real API keys to version control
- **Use environment variables** for all sensitive configuration
- **CORS is restrictive** in production - only your frontend domain is allowed
- **Rate limiting** is enabled in production (100 requests/minute)

### Database Notes
- **Development**: Uses SQLite database (file-based, local)
- **Production**: Can use SQLite or Railway's PostgreSQL
- **Demo Data**: Pre-populated with 3 synthetic patients
- **No real PHI**: All patient data is 100% synthetic

### OpenAI Usage
- **Required for Q&A features** - AI Question Box won't work without API key
- **Fallback system** - Pre-computed answers available if OpenAI fails  
- **Cost optimization** - Uses GPT-3.5-turbo for cost efficiency
- **Rate limits** - OpenAI has usage limits based on your plan

### Common Issues
1. **CORS errors**: Check frontend URL in backend CORS_ORIGINS
2. **API key errors**: Verify OpenAI key is correct and has sufficient credits
3. **Build failures**: Ensure all environment variables are set
4. **Database errors**: Run `initialize_db.py` and `populate_demo_data.py` if needed

---

## 📊 DEMO PATIENTS

### Uncle Tan (Primary Demo Case)
- **Condition**: Stage 4 Chronic Kidney Disease  
- **Key Data**: Creatinine 4.2 mg/dL, eGFR 18 mL/min/1.73m²
- **Canvas Layout**: 5 nodes with comprehensive clinical data
- **Q&A Ready**: 3 pre-computed clinical questions

### Mrs. Chen  
- **Condition**: Type 2 Diabetes with complications
- **Canvas Layout**: Basic patient summary node
- **Status**: Ready for expansion

### Mr. Kumar
- **Condition**: Post-Myocardial Infarction  
- **Canvas Layout**: Basic patient summary node
- **Status**: Ready for expansion

---

## 🔗 API ENDPOINTS

### Patient Data
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details with canvas layout

### AI Q&A  
- `POST /api/patients/{id}/ask` - Ask clinical questions
  ```json
  {
    "question": "What is the current kidney function status?"
  }
  ```

### Health Check
- `GET /` - API health status

---

## 🧪 TESTING & VALIDATION

### Backend Testing
```bash
# Test patient list
curl http://localhost:8000/api/patients

# Test patient detail  
curl http://localhost:8000/api/patients/uncle-tan-001

# Test Q&A
curl -X POST "http://localhost:8000/api/patients/uncle-tan-001/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the current kidney function status?"}'
```

### Frontend Testing
- Patient selection dropdown functionality
- Canvas node interactions (drag, zoom, pan)  
- Real-time data loading from API
- Responsive design on different screen sizes

### AI Pipeline Testing
```bash
cd ai-pipeline
python rag_pipeline.py
```

---

## 🎯 DEMO TALKING POINTS

### Technical Innovation
- **RAG Architecture** - Advanced retrieval-augmented generation
- **Interactive Canvas** - Novel approach to clinical data visualization  
- **Real-time AI** - Live question-answering system
- **Modern Stack** - React Flow, FastAPI, SQLite, Ollama

### Clinical Value
- **Comprehensive View** - All patient data in one interactive canvas
- **AI-Powered Insights** - Instant answers to clinical questions
- **Visual Data Analysis** - Charts and trends for better understanding
- **Efficient Workflow** - Reduced time searching through documents

### Scalability Features  
- **Modular Architecture** - Easy to add new node types
- **API-First Design** - Ready for integration with EHR systems
- **Local AI Processing** - Privacy-compliant, no data leaves system
- **Responsive Design** - Works on tablets and desktop

---

## 🔮 NEXT STEPS (Future Development)

### ✅ Completed (Current Release)
- [x] **Production Deployment Ready** - Railway + Netlify configuration complete
- [x] **OpenAI Integration** - Full AI Q&A functionality with fallback system
- [x] **Security Hardening** - Production CORS, rate limiting, security headers
- [x] **Environment Management** - Separate dev/prod configurations
- [x] **API Client Architecture** - Robust error handling and retry logic

### Immediate Enhancements (Next Sprint)
- [ ] Advanced canvas features (node connections, visual toolbars)
- [ ] Multiple document support per patient with enhanced viewer
- [ ] Enhanced PDF highlighting with Q&A source coordination
- [ ] SOAP Note generation with OpenAI integration
- [ ] Real-time canvas collaboration between users

### Advanced Features (Phase 2)
- [ ] Role-based access control (clinician, analyst, admin views)
- [ ] Population health analytics dashboard
- [ ] Integration with popular EHR systems (Epic, Cerner, SMART on FHIR)
- [ ] Advanced AI models for specialized medical domains
- [ ] Mobile-responsive design for tablet/phone usage

### Enterprise Ready (Phase 3)
- [ ] HIPAA compliance audit and certification
- [ ] Multi-tenant architecture for hospital networks
- [ ] Enterprise SSO integration (SAML, OAuth2)
- [ ] Advanced analytics and reporting dashboard
- [ ] Integration with medical imaging systems (PACS/DICOM)
- [ ] Audit logging and compliance reporting

---

## 📁 PROJECT STRUCTURE

```
hackathon/
├── frontend/          # React TypeScript application
│   ├── src/components # Custom canvas nodes
│   ├── src/hooks/     # API integration hooks  
│   └── src/stores/    # Zustand state management
├── backend/           # FastAPI Python server
│   ├── main.py        # API endpoints and server
│   └── populate_demo_data.py # Database population
├── ai-pipeline/       # RAG and AI processing
│   ├── rag_pipeline.py      # Main RAG system
│   ├── ollama_client.py     # LLM integration
│   └── document_processor.py # PDF processing
└── data/             # SQLite database and schemas
    ├── clinical_canvas.db   # Main database
    └── schemas/            # Database schema definitions
```

---

## 🏆 ACHIEVEMENT SUMMARY

✅ **Full-Stack Integration** - Frontend ↔ Backend ↔ AI Pipeline with OpenAI  
✅ **Production Deployment** - Railway backend + Netlify frontend configuration  
✅ **Real Clinical Data** - Comprehensive patient cases with medical accuracy  
✅ **Interactive UI** - Modern, responsive clinical canvas interface  
✅ **AI-Powered Q&A** - OpenAI integration with intelligent fallback system  
✅ **Security Hardened** - Production CORS, rate limiting, environment separation  
✅ **API Architecture** - Robust error handling, retry logic, and configuration management  

**Status**: Production-ready application with deployment guides 🚀

---

## 🎯 QUICK START CHECKLIST

### For Demo/Development (5 minutes)
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Add your OpenAI API key to `.env`
- [ ] Run `uvicorn main:app --reload` in backend/
- [ ] Run `npm run dev` in frontend/
- [ ] Visit http://localhost:5173

### For Production Deployment (15 minutes)
- [ ] Deploy backend to Railway with environment variables
- [ ] Update `frontend/.env.production` with Railway URL
- [ ] Build and deploy frontend to Netlify
- [ ] Update Railway CORS_ORIGINS with Netlify URL
- [ ] Test end-to-end functionality

---
  I've completely updated the DEMO_READY.md file with comprehensive instructions for both local development and
  production deployment. Here's what's now included:

  🔑 Key Additions

  Credentials & Setup:
  - OpenAI API Key requirement - Clear instructions on where to get it and where to place it
  - Step-by-step local setup - Backend and frontend configuration
  - Production deployment guide - Railway + Netlify with all necessary environment variables

  Environment Configuration:
  - Detailed .env explanations - Every variable explained with examples
  - Separate dev/prod configs - Clear distinction between local and production settings
  - Security considerations - CORS, rate limiting, API key safety

  Deployment Instructions:
  - Railway backend deployment - Complete Railway setup with environment variables
  - Netlify frontend deployment - Build and deploy process
  - CORS configuration - How to properly link frontend and backend

  Troubleshooting:
  - Common issues - CORS errors, API key problems, build failures
  - Important notes - Database types, OpenAI usage, security considerations
  - Quick start checklists - 5-minute dev setup, 15-minute production deployment

  🎯 What You Need to Know

  For Local Development:
  1. Get OpenAI API key from platform.openai.com
  2. Copy backend/.env.example to backend/.env
  3. Add your API key to the .env file
  4. Run backend with uvicorn main:app --reload
  5. Run frontend with npm run dev or bun run dev

  For Production:
  1. Deploy backend to Railway with OpenAI API key environment variable
  2. Update frontend/.env.production with actual Railway URL
  3. Deploy frontend to Netlify
  4. Update Railway CORS settings with Netlify URL

  The file now serves as a complete deployment and setup guide for anyone wanting to run or deploy the Clinical       
  Canvas application! 🚀

> where do i update the railway CORS settings with netlify URL? short answers

● In the Railway dashboard:

  1. Go to your Railway project
  2. Click Variables tab
  3. Update the CORS_ORIGINS environment variable
  4. Set it to your Netlify URL: https://your-app.netlify.app

● Configure for Local Development

  Backend:
  cd backend
  cp .env.example .env
  # Edit .env:
  ENVIRONMENT=development
  OPENAI_API_KEY=sk-your-key
  CORS_ORIGINS=http://localhost:5173

  Frontend:
  cd frontend
  # Just run - no .env needed for dev
  npm run dev
  # OR create .env.development:
  VITE_API_URL=http://localhost:8000/api

  Configure for Production

  Backend (Railway dashboard):
  - Set environment variables:
    - ENVIRONMENT=production
    - OPENAI_API_KEY=sk-your-key
    - CORS_ORIGINS=https://your-app.netlify.app

  Frontend:
  cd frontend
  # Edit .env.production:
  VITE_API_URL=https://your-railway-app.up.railway.app/api
  # Then build:
  npm run build

  Key difference: Development uses localhost URLs, production uses deployed URLs.

---

## 🚀 DEPLOYMENT WORKFLOWS

### 🆕 First Time Backend Deployment

**Prerequisites:**
- Railway account at https://railway.app
- OpenAI API key from https://platform.openai.com/api-keys
- GitHub repository with your code

**Step-by-Step Process:**

**A. Prepare Your Repository**
1. Ensure `backend/railway.json` and `backend/Procfile` exist in your repo
2. Ensure `backend/.env.example` contains all required variables
3. Commit and push all changes to GitHub

**B. Create Railway Project**
1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

**C. Configure Environment Variables**
1. In Railway dashboard, click your project
2. Go to "Variables" tab
3. Add these environment variables:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ENVIRONMENT=production
   CORS_ORIGINS=https://localhost:3000
   SECRET_KEY=generate-a-random-secret-key
   RATE_LIMIT=100
   DEBUG=False
   ```

**D. Deploy and Verify**
1. Railway will automatically deploy using your `railway.json`
2. Wait for deployment to complete (check "Deployments" tab)
3. Copy your Railway app URL (e.g., `https://your-app.up.railway.app`)
4. Visit `https://your-app.up.railway.app/` to verify deployment
5. Check that response shows `"environment": "production"`

**E. Test Backend Endpoints**
```bash
# Test health endpoint
curl https://your-app.up.railway.app/

# Test patients endpoint
curl https://your-app.up.railway.app/api/patients

# Test Q&A endpoint
curl -X POST "https://your-app.up.railway.app/api/patients/uncle-tan-001/ask" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the current kidney function status?"}'
```

---

### 🔄 How to Switch Between Production and Local Development

**A. Switch FROM Production TO Local Development**

1. **Stop any running servers:**
   ```bash
   # Kill any running processes on ports 8000/5173
   lsof -ti:8000 | xargs kill -9
   lsof -ti:5173 | xargs kill -9
   ```

2. **Configure backend for local:**
   ```bash
   cd backend
   
   # Create local environment file
   cp .env.example .env
   
   # Edit .env file:
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ENVIRONMENT=development
   CORS_ORIGINS=http://localhost:5173
   DEBUG=True
   ```

3. **Start local backend:**
   ```bash
   # In backend/ directory
   pip install -r requirements.txt
   python initialize_db.py
   python populate_demo_data.py
   uvicorn main:app --reload
   ```

4. **Configure and start frontend:**
   ```bash
   cd frontend
   
   # Optional: Create .env.development
   echo "VITE_API_URL=http://localhost:8000/api" > .env.development
   
   # Install dependencies and start
   npm install
   npm run dev
   ```

5. **Verify local setup:**
   - Backend: http://localhost:8000 (should show `"environment": "development"`)
   - Frontend: http://localhost:5173
   - Check Network tab shows requests to `localhost:8000`

**B. Switch FROM Local TO Production**

1. **Update frontend for production:**
   ```bash
   cd frontend
   
   # Edit .env.production
   nano .env.production
   # Change: VITE_API_URL=https://your-actual-railway-app.up.railway.app/api
   ```

2. **Build frontend:**
   ```bash
   npm run build
   ```

3. **Deploy frontend to Netlify:**
   ```bash
   # Option 1: Drag & drop 'dist' folder to https://app.netlify.com/drop
   
   # Option 2: Use Netlify CLI
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

4. **Update Railway CORS settings:**
   - Go to Railway dashboard → Variables
   - Update `CORS_ORIGINS=https://your-actual-netlify-app.netlify.app`
   - Railway will auto-redeploy

5. **Verify production setup:**
   - Frontend: Your Netlify URL
   - Backend: Your Railway URL
   - Check Network tab shows requests to Railway URL

---

### 🔄 CI/CD Workflow

**A. Automated Backend Deployment (Railway)**

1. **Set up automatic deployments:**
   ```bash
   # In your repository root, create .github/workflows/deploy-backend.yml
   mkdir -p .github/workflows
   ```

2. **Create backend deployment workflow:**
   ```yaml
   # .github/workflows/deploy-backend.yml
   name: Deploy Backend to Railway
   
   on:
     push:
       branches: [main]
       paths: ['backend/**']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
         
         - name: Deploy to Railway
           run: |
             echo "Railway automatically deploys on push"
             echo "Backend deployment triggered"
   ```

3. **Configure Railway auto-deployment:**
   - In Railway dashboard → Settings
   - Enable "Auto Deploy" from GitHub
   - Set watch paths to `backend/**`

**B. Automated Frontend Deployment (Netlify)**

1. **Create frontend deployment workflow:**
   ```yaml
   # .github/workflows/deploy-frontend.yml
   name: Deploy Frontend to Netlify
   
   on:
     push:
       branches: [main]
       paths: ['frontend/**']
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
             cache-dependency-path: frontend/package-lock.json
         
         - name: Install dependencies
           run: |
             cd frontend
             npm ci
         
         - name: Build
           run: |
             cd frontend
             npm run build
           env:
             VITE_API_URL: ${{ secrets.RAILWAY_BACKEND_URL }}
         
         - name: Deploy to Netlify
           uses: nwtgck/actions-netlify@v2.0
           with:
             publish-dir: './frontend/dist'
             production-branch: main
           env:
             NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
             NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
   ```

2. **Set up GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets
   - Add these secrets:
     ```
     RAILWAY_BACKEND_URL=https://your-app.up.railway.app/api
     NETLIFY_AUTH_TOKEN=your-netlify-token
     NETLIFY_SITE_ID=your-netlify-site-id
     ```

**C. Complete CI/CD Pipeline Setup**

1. **Test the pipeline:**
   ```bash
   # Make a change to backend
   echo "# Test change" >> backend/README.md
   git add backend/README.md
   git commit -m "test: trigger backend deployment"
   git push origin main
   ```

2. **Monitor deployments:**
   - GitHub Actions tab shows workflow status
   - Railway dashboard shows deployment progress
   - Netlify dashboard shows build status

3. **Verify end-to-end:**
   - Wait for both deployments to complete
   - Visit your Netlify URL
   - Test API functionality
   - Check Network tab for correct API calls

---

### 🌐 Frontend Routing for Production vs Local

**A. Understanding Frontend Routing**

**Local Development Setup:**
```bash
cd frontend

# The frontend automatically detects environment:
npm run dev    # Uses development configuration
npm run build  # Uses production configuration
```

**B. Configure Local Development Routing**

1. **Create development environment (optional):**
   ```bash
   # frontend/.env.development
   VITE_API_URL=http://localhost:8000/api
   VITE_ENVIRONMENT=development
   VITE_ENABLE_API_LOGGING=true
   VITE_ENABLE_MOCK_DATA_FALLBACK=true
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Verify local routing:**
   - Open http://localhost:5173
   - Open Developer Tools → Network tab
   - Perform any action (select patient, ask question)
   - Confirm requests go to `http://localhost:8000/api/*`

**C. Configure Production Routing**

1. **Update production environment:**
   ```bash
   cd frontend
   
   # Edit .env.production
   nano .env.production
   ```

2. **Set production configuration:**
   ```bash
   # frontend/.env.production
   VITE_API_URL=https://your-actual-railway-app.up.railway.app/api
   VITE_ENVIRONMENT=production
   VITE_ENABLE_API_LOGGING=false
   VITE_ENABLE_MOCK_DATA_FALLBACK=true
   VITE_ENABLE_ERROR_REPORTING=true
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Test production build locally:**
   ```bash
   npm run preview
   # Visit http://localhost:4173
   # Check Network tab - should show Railway URLs
   ```

**D. Troubleshoot Frontend Routing**

1. **Check which environment is active:**
   ```javascript
   // In browser console
   console.log('Environment:', import.meta.env.VITE_ENVIRONMENT)
   console.log('API URL:', import.meta.env.VITE_API_URL)
   ```

2. **Verify API client configuration:**
   ```bash
   # In browser console → Network tab
   # Look for XHR/Fetch requests
   # Check the Request URL column
   ```

3. **Force specific routing:**
   ```bash
   # Temporarily override in browser console
   localStorage.setItem('VITE_API_URL', 'http://localhost:8000/api')
   # Then refresh page
   ```

**E. Environment Detection Logic**

The frontend uses this priority order for API URL:
1. **Explicit environment variable** (`VITE_API_URL`)
2. **Auto-detection**: Production build → Railway URL
3. **Fallback**: Development → `http://localhost:8000/api`

```typescript
// This is how the frontend determines the API URL:
function getApiUrl(): string {
  // 1. Check explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // 2. Auto-detect based on build mode
  if (import.meta.env.PROD) {
    return 'https://your-backend-app.up.railway.app/api'
  }
  
  // 3. Development fallback
  return 'http://localhost:8000/api'
}
```

---

*Updated August 6, 2025 - AI-Powered Clinical Canvas Production Release*