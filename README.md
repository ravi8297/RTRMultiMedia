<<<<<<< HEAD
# RTR Media Solutions - Training Platform

RTR Media Solutions is a professional training platform built with Next.js 14, MongoDB, and NextAuth.js. It offers courses in Excel, Python, SAP, Java, Web Development, and more.

## Features

- **Student Portal**: Browse courses, enroll, track progress, and manage profile
- **Admin Dashboard**: Manage students, courses, blog posts, view revenue stats
- **Blog Module**: Public blog listing, individual blog posts, admin CRUD
- **Contact Form**: Public contact form with message storage
- **Payment Integration**: Razorpay payment processing for course enrollment
- **Authentication**: Secure login/register with NextAuth.js and JWT

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (Credentials Provider)
- **Payment**: Razorpay
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React hooks

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
├── components/          # Reusable React components
├── lib/                 # Utility functions and configs
├── models/              # Mongoose models
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
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes |

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

## License

MIT
=======
# RTRMultiMedia
>>>>>>> c79f651e3fc6ad0c02a896b2c79b9bc1bb8b6147
