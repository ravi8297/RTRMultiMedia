# RTR Media Solutions - Training Platform

RTR Media Solutions is a professional training platform built with Next.js 14, MongoDB, and NextAuth.js. It offers courses in Excel, Python, SAP, Java, Web Development, and more.

## Features

- **Student Portal**: Browse courses, enroll, track progress, and manage profile
- **Admin Dashboard**: Manage students, courses, blog posts, view revenue stats
- **Blog Module**: Public blog listing, individual blog posts, admin CRUD
- **Contact Form**: Public contact form with message storage
- **Payment Integration**: Razorpay payment processing for course enrollment
- **Authentication**: Secure login/register with NextAuth.js and JWT
- **Account Activation**: Email verification with secure, rate-limited code verification

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials Provider)
- **Payment**: Razorpay
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React hooks
- **Verification**: Custom verification-code system with bcrypt hashing and rate limiting

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- MongoDB Atlas account (or local MongoDB)
- Razorpay account (for payment features)

### 1. Clone the repository

```bash
git clone <repository-url>
cd rtrproj
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rtr-media-solutions

# NextAuth
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000

# Razorpay (get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Resend (for verification email delivery)
RESEND_API_KEY=re_xxx
RESEND_FROM=noreply@your-domain.com
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create an admin user

Run the admin creation script after the first run:

```bash
node scripts/createAdmin.js
```

## Account Activation (Verification System)

The platform includes a secure account activation system to ensure account ownership and prevent unauthorized access.

### How It Works

1. **Registration**: When a new user registers, their account is created with `isVerified: false`. An automated 6-digit verification code is immediately generated and sent to their email.

2. **Verification**: The user visits the `/verify` page to enter the 6-digit code they received.

3. **Security Features**:
   - **Rate Limiting**: 5 codes per hour per user, and 20 requests per hour per IP
   - **One-Time Use**: Each code can only be used once
   - **Time-Limited**: Codes expire after 5-10 minutes
   - **Rate Limiting**: 3 failed attempts lock the code for the duration
   - **Hashing**: Codes are hashed with bcrypt (cost 12) for security
   - **No Enumeration**: All responses use the same generic messages to prevent email enumeration

4. **Login Restrictions**: Only verified accounts (`isVerified: true`) can log in. Unverified users see a "Resend activation code" link to get a new code.

### Verification Code System

- **Generation**: Cryptographically secure 6-digit codes (100000-999999)
- **Delivery**: Configured email provider (Resend by default, with console logging for dev)
- **Security**: bcrypt hashing, rate limits, attempt tracking, and expiry
- **User Experience**: Clean, accessible interface with auto-submit and resend functionality

### Security

- **Brute Force Protection**: 3 attempts per code + 5 codes/hour user limit
- **Inbox Flooding Prevention**: Per-user and per-IP rate limits
- **Timing Attacks**: Constant-time bcrypt comparisons
- **Enumeration Prevention**: Identical responses for all failure cases

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
rtrproj/
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   │   ├── auth/        # NextAuth routes
│   │   ├── blog/        # Blog API routes
│   │   ├── courses/     # Course API routes
│   │   ├── contact/     # Contact form API
│   │   ├── payment/     # Razorpay payment API
│   │   └── admin/       # Admin API routes
│   ├── admin/           # Admin dashboard pages
│   ├── auth/            # Login/Register pages
│   ├── blog/            # Public blog pages
│   ├── courses/         # Course pages
│   ├── contact/         # Contact page
│   ├── dashboard/       # User dashboard
│   ├── about/           # About page
│   ├── trainers/        # Trainers page
│   └── page.tsx         # Home page
├── app/api/verification/  # Verification system APIs
│   ├── send/           # Send verification code
│   └── validate/       # Validate verification code
├── components/          # Reusable React components
├── lib/                 # Utility functions and configs
│   ├── verification.ts # Verification code system
│   └── auth.ts        # NextAuth configuration
├── models/              # Mongoose models
│   └── User.ts         # User model with isVerified field
├── scripts/             # Setup scripts
├── public/              # Static assets
├── tailwind.config.js   # Tailwind CSS config
├── next.config.js       # Next.js config
├── tsconfig.json        # TypeScript config
└── package.json         # Project dependencies
```

## Environment Variables

All sensitive values should be stored in `.env.local` and never committed to version control:

| Variable | Description | Required |
|----------├-----------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |

| `NEXTAUTH_URL` | Application URL | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes |
| `RESEND_API_KEY` | Resend API key for email delivery | Recommended |

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Local Production

```bash
npm run build
npm run start
```

## Security Audit (2025-10-05)

A comprehensive code review was performed on all API routes, database connections, and models. Key findings:

### Critical Issues Fixed
- **Password double-hashing bug** in `app/api/profile/route.ts` — manual `bcrypt.hash()` before `user.save()` caused passwords to be hashed twice, locking users out after password change.
- **Missing payment ownership authorization** in `app/api/payment/verify/route.ts` — Razorpay signature was verified but not cross-referenced against the user's order document, allowing potential enrollment fraud.

### High Severity Issues
- **MongoDB session leak risk** in payment verification transaction — session not guaranteed to close on error.
- **N+1 query problem** in admin students endpoint — separate DB query per student.
- **Missing `dbConnect()` calls** before queries in verification endpoints (cold-start failures).

### Medium/Low Issues
- Missing `runValidators: true` on update operations.
- No ObjectId validation on route params.
- No upper bound on pagination `limit`.
- Dead code: `lib/dbConnect.js` (duplicate of `lib/mongodb.ts`).
- Misleading env var error message in MongoDB connection.
- Various input validation gaps.

Fixes for critical and high-severity issues should be prioritized before production deployment.

## License

MIT