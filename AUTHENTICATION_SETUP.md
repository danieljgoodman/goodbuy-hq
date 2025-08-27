# 🔐 Authentication & Database Setup Guide

This guide will help you set up authentication and database functionality for GoodBuy HQ.

## 🗄️ Database Setup

### Prerequisites
- PostgreSQL 14+ installed and running
- Environment variables configured

### 1. Configure Database Connection

Update your `.env.local` file with your PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/goodbuy_hq"
```

### 2. Create Database

```bash
# Create the database
createdb goodbuy_hq

# Or using PostgreSQL command line
psql -c "CREATE DATABASE goodbuy_hq;"
```

### 3. Run Migrations

```bash
# Push the schema to your database
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. View Database (Optional)

```bash
# Open Prisma Studio to view/edit data
npm run db:studio
```

## 🔐 Authentication Setup

### NextAuth.js Configuration

The application uses NextAuth.js with multiple authentication providers:

- **Email/Password**: Traditional registration with email verification
- **Google OAuth**: Social login with Google
- **LinkedIn OAuth**: Social login for business professionals
- **Microsoft Azure AD**: Enterprise authentication (optional)

### 1. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

Update `.env.local`:
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### LinkedIn OAuth Setup

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new application
3. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback/linkedin` (development)
   - `https://yourdomain.com/api/auth/callback/linkedin` (production)

Update `.env.local`:
```bash
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

### 2. Configure Email Service

For email verification and notifications, configure SMTP:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"  # Use App Password for Gmail
```

### 3. Set NextAuth Secret

Generate a secure secret for NextAuth:

```bash
# Generate a random secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="your-generated-secret-here"
```

## 👥 User Types & Permissions

The application supports four user types with different permissions:

### 🏢 Business Owner
- Create and manage business listings
- View inquiries from buyers
- Access basic analytics
- Update business information

### 💼 Buyer
- Browse business listings
- Save favorite businesses
- Submit inquiries
- Access evaluation reports

### 🤝 Broker
- Manage multiple client listings
- Create professional evaluations
- Access advanced analytics
- Manage client relationships

### ⚡ Admin
- Full system access
- User management
- System configuration
- Advanced analytics

## 🔒 Security Features

### Email Verification
- All new accounts require email verification
- Verification tokens expire in 24 hours
- Automatic welcome emails on verification

### Password Security
- Minimum 8 characters required
- Passwords hashed with bcrypt (12 rounds)
- Secure password reset flow

### Session Management
- JWT-based sessions
- 30-day session lifetime
- Secure cookie configuration
- Automatic session refresh

### Protected Routes
- Middleware-based route protection
- Role-based access control
- Automatic redirects for unauthorized access

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. Set Up Database
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Authentication
- Visit `http://localhost:3000/auth/signin`
- Create a new account or sign in with OAuth
- Access dashboard at `http://localhost:3000/dashboard`

## 🧪 Testing

### Test User Registration
1. Go to `/auth/signup`
2. Fill in the registration form
3. Check email for verification link
4. Complete verification process
5. Sign in and access dashboard

### Test OAuth Providers
1. Configure OAuth credentials
2. Go to `/auth/signin`
3. Click on Google/LinkedIn buttons
4. Complete OAuth flow
5. Verify user creation in database

## 📊 Database Schema

The database includes the following main entities:

- **Users**: User accounts with profile information
- **Accounts**: OAuth provider accounts
- **Sessions**: Active user sessions
- **Businesses**: Business listings
- **Evaluations**: Professional business evaluations
- **Favorites**: User's saved businesses
- **Inquiries**: Business inquiries from buyers
- **VerificationTokens**: Email verification tokens

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

#### OAuth Issues
- Check client ID/secret configuration
- Verify redirect URLs match exactly
- Ensure OAuth APIs are enabled

#### Email Issues
- Check SMTP configuration
- Verify app password for Gmail
- Test email connectivity

### Useful Commands

```bash
# Reset database
npm run db:push --force-reset

# View database in browser
npm run db:studio

# Check Prisma schema
npx prisma validate

# Format Prisma schema
npx prisma format
```

## 📝 Next Steps

After setting up authentication, you can:

1. **Create Business Listings**: Implement business creation forms
2. **Add Evaluation System**: Build professional evaluation tools
3. **Implement Search**: Add business search and filtering
4. **Add File Uploads**: Enable document and image uploads
5. **Build Analytics**: Create dashboards and reporting

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review environment configuration
3. Check database connectivity
4. Verify OAuth provider settings

For additional help, refer to the documentation:
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)