# 🗄️ Database Architecture - Blue Carbon Registry

## 📊 **Current Database Setup**

### **🔗 Hybrid Architecture: Web2 + Web3**

The Blue Carbon Registry uses a **hybrid database architecture** combining traditional databases with blockchain storage for optimal performance and transparency.

---

## 🏗️ **Database Layers**

### **1. Traditional Database (Web2) - PRIMARY STORAGE**
- **Technology**: PostgreSQL/MySQL (via Express.js backend)
- **Port**: 3001 (Backend API server)
- **Purpose**: Fast queries, user experience, temporary data
- **Stores**:
  - User profiles and authentication
  - Project drafts and submissions
  - File uploads and metadata
  - Search indices and caching
  - Analytics and reporting data
  - UI state and preferences

### **2. Blockchain Database (Web3) - PROOF LAYER**
- **Technology**: Ethereum Sepolia Testnet
- **Purpose**: Immutable proofs, transparency, trust
- **Stores**:
  - NGO verification records
  - Carbon credit allocations (BCC tokens)
  - Trading transactions
  - Admin approval decisions
  - Ownership transfers

---

## 🔄 **Data Flow Architecture**

```
📝 User Input → 💾 Web2 DB → 👑 Admin Review → ⛓️ Blockchain → 🌐 Public Proof
```

### **Step-by-Step Process:**

1. **Project Submission** 📋
   ```
   NGO submits project → Express.js API → PostgreSQL
   Status: "Pending Review"
   ```

2. **Admin Review** 👨‍💼
   ```
   Admin reviews in UI → Web2 DB queries → Decision made
   ```

3. **Blockchain Verification** ⛓️
   ```
   Admin approval → Smart Contract → Permanent record
   NGO verification + BCC token minting
   ```

4. **Public Transparency** 🌍
   ```
   Transaction hash → Etherscan → Public verification
   Anyone can verify authenticity
   ```

---

## 🔍 **Database Status Check**

### **✅ Web2 Database (Connected)**
- **Backend Server**: Running on `http://localhost:3001`
- **Database**: Active and processing requests
- **Features**: File uploads, user management, project storage

### **✅ Web3 Database (Connected)**
- **Sepolia Network**: Connected via MetaMask
- **Smart Contracts**: Deployed and functional
- **Status**: All blockchain operations working

---

## 📂 **Data Distribution**

### **🖥️ Web2 Database Stores:**
```json
{
  "users": {
    "profiles": "PostgreSQL",
    "authentication": "Local/Firebase",
    "preferences": "Local storage"
  },
  "projects": {
    "drafts": "PostgreSQL", 
    "submissions": "PostgreSQL",
    "files": "File system + PostgreSQL metadata"
  },
  "analytics": {
    "usage_stats": "PostgreSQL",
    "performance_metrics": "PostgreSQL"
  }
}
```

### **⛓️ Web3 Database Stores:**
```json
{
  "verification": {
    "ngo_approvals": "Smart Contract Events",
    "admin_decisions": "Blockchain Transactions"
  },
  "tokens": {
    "bcc_balances": "ERC20 Contract State",
    "allocations": "Mint Transaction History"
  },
  "trading": {
    "ownership": "Blockchain State",
    "transaction_history": "Event Logs"
  }
}
```

---

## 🚀 **Why This Architecture?**

### **💡 Best of Both Worlds:**

1. **Speed** ⚡
   - Web2 DB handles UI interactions instantly
   - No waiting for blockchain confirmations during browsing

2. **Trust** 🛡️
   - Critical actions are blockchain-verified
   - Public transparency without compromising UX

3. **Cost Efficiency** 💰
   - Only important transactions pay gas fees
   - Bulk data stored off-chain cheaply

4. **Scalability** 📈
   - Traditional DB handles millions of queries
   - Blockchain handles thousands of proofs

---

## 🔧 **Backend Configuration**

### **📁 Backend Structure:**
```
backend/
├── server.js          # Express.js server (Port 3001)
├── models/            # Database models
├── routes/            # API endpoints
├── middleware/        # Authentication & validation
└── uploads/           # File storage
```

### **🌐 API Endpoints:**
- `POST /api/auth/*` - User authentication
- `GET /api/projects` - Project listings
- `POST /api/projects` - Project submissions
- `POST /api/upload` - File uploads
- `GET /api/analytics` - Dashboard data

---

## 📊 **Database Health Check**

### **Current Status:**
- ✅ **Backend API**: Running (`localhost:3001`)
- ✅ **Frontend**: Running (`localhost:8081`)
- ✅ **Blockchain**: Connected (Sepolia)
- ✅ **Smart Contracts**: Deployed and verified

### **✅ Everything Connected!**

Your Blue Carbon Registry has a **robust hybrid database architecture** that provides:
- **Instant user experience** via traditional database
- **Immutable proof** via blockchain verification
- **Public transparency** via Etherscan links
- **Cost-effective** operation with minimal gas usage

The system is **fully operational** with both Web2 and Web3 databases working in harmony! 🌊