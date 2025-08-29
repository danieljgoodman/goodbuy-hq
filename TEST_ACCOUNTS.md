# 🧪 Test Environment - GoodBuy HQ

## 🌐 Development Server
**Live Site**: [http://localhost:3000](http://localhost:3000)

---

## 👥 Test Account Credentials


### 🏢 Business Owner Account
- **Email**: `testowner@goodbuyhq.com`
- **Password**: `TestOwner123!`
- **Dashboard**: `/dashboard/business-owner`
- **Features**: 
  - View 3 active business listings
  - Analytics dashboard with 156 total views
  - Inquiry management (3 active inquiries)
  - Performance tracking with growth metrics
  - Create and manage business listings

### 🛍️ Buyer Account
- **Email**: `testbuyer@goodbuyhq.com`
- **Password**: `TestBuyer123!`
- **Dashboard**: `/dashboard/buyer`
- **Features**:
  - 4 saved favorite businesses
  - 3 active inquiries tracking
  - Investment preferences (Retail: 2, Services: 2)
  - Saved searches with email alerts
  - Recently viewed businesses (101 total views)

### 🤝 Broker Account
- **Email**: `testbroker@goodbuyhq.com`
- **Password**: `TestBroker123!`
- **Dashboard**: `/dashboard/broker`
- **Features**:
  - Client business management
  - Professional evaluations
  - Commission tracking
  - Deal pipeline management

### 👨‍💼 Admin Account
- **Email**: `testadmin@goodbuyhq.com`
- **Password**: `TestAdmin123!`
- **Dashboard**: `/dashboard/admin`
- **Features**:
  - System overview and analytics
  - User management
  - Platform monitoring
  - Content moderation

---

## 🗄️ Database Information

### PostgreSQL Database
- **Database**: `goodbuy_hq_dev`
- **Connection**: Available via DATABASE_URL environment variable
- **Prisma Studio**: Background service running for database management

### Sample Data Included
- ✅ **Businesses**: 6+ sample businesses with realistic data
- ✅ **Users**: 4 test users with different roles
- ✅ **Favorites**: Buyer has 4 saved businesses
- ✅ **Inquiries**: 3 active inquiries from buyer to businesses
- ✅ **Views**: Analytics data with 156 total business views
- ✅ **Evaluations**: Professional evaluations by brokers
- ✅ **Saved Searches**: "Tech Businesses Under $2M" with alerts

---

## 🚀 Quick Start Testing Guide

1. **Start the server**: `npm run dev` (already running on port 3000)
2. **Visit**: [http://localhost:3000](http://localhost:3000)
3. **Click "Sign In"** in the top navigation
4. **Choose a test account** from the credentials above
5. **Explore the dashboard** features for that user role

---

## 📊 Dashboard Features to Test

### Business Owner Dashboard
- [ ] View active listings (should show 3)
- [ ] Check analytics metrics (156 views, +100% growth)
- [ ] Review recent buyer inquiries
- [ ] Use quick actions (Create Listing, My Listings, etc.)
- [ ] Examine top performing listings with detailed stats

### Buyer Dashboard
- [ ] Browse saved businesses (4 favorites)
- [ ] Switch between tabs (Saved, Inquiries, Searches, Recently Viewed)
- [ ] View investment preferences and categories
- [ ] Check inquiry status and details
- [ ] Test saved search functionality

### Role-Based Access
- [ ] Verify buyers cannot access `/dashboard/business-owner`
- [ ] Confirm business owners cannot access `/dashboard/buyer`
- [ ] Test proper redirection to role-specific dashboards

---

## 💾 Data Reset Instructions

If you need to reset the test data:

```bash
# Reset and recreate test users
DATABASE_URL="postgresql://danielgoodman@localhost/goodbuy_hq_dev" npx ts-node scripts/create-test-users.ts

# Reset and recreate dashboard test data
DATABASE_URL="postgresql://danielgoodman@localhost/goodbuy_hq_dev" npx ts-node scripts/setup-dashboard-test-data.ts
```

---

## 📱 Mobile Testing

The dashboards are fully responsive. Test on mobile by:
1. Opening browser developer tools
2. Using device emulation (iPhone, iPad, etc.)
3. Verifying all elements stack properly
4. Ensuring touch interactions work correctly

---

## 🔧 Development Notes

- **Port**: Development server runs on `localhost:3000`
- **Hot Reload**: Changes automatically refresh the browser
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js with session management
- **UI Framework**: Next.js 14 App Router with TypeScript

---

*Last updated: August 28, 2025*
*Environment: Development*
*Status: ✅ Fully Operational*