# ❤️ HeartBridge - Connecting Hearts Through Kindness

A complete MEAN stack web application for NGO Donation and Emotional Engagement Platform.

## 🎯 Project Overview

HeartBridge is an advanced M.Tech-level MEAN stack application designed to facilitate transparent and emotional connections between donors and NGOs. The platform enables digital donation management, wish fulfillment, emergency fund raising, and gratitude sharing.

## 🛠️ Technology Stack

- **MongoDB** - Database with Mongoose ODM
- **Express.js** - Backend Framework with Node.js
- **Angular 16+** - Frontend Framework with Angular Material UI
- **Node.js** - JavaScript Runtime Environment
- **JWT** - JSON Web Token Authentication
- **RBAC** - Role-Based Access Control
- **Multer** - File Upload & Processing (Images, Documents)
- **External Images** - Unsplash for professional photography integration

## ✨ Key Features

### 1. **Discussion Forum** ⭐ NEW
   - Community discussions organized by categories (Fundraising, Volunteering, Impact, Resources)
   - Threaded conversations with easy-to-follow replies
   - Expert badge for verified NGO admins for trusted insights
   - Mark helpful solutions to highlight best responses
   - Full-text search with category filters
   - View tracking for discussion visibility
   - Status management (Active, Closed, Archived)

### 2. **Impact Stories Module** ⭐ NEW
   - Showcase real-world impact with before/after photographs
   - Track donor contributions and acknowledgment
   - Display beneficiary counts and implementation timelines
   - Engagement features: likes, shares, views tracking
   - Featured stories highlighting major achievements
   - Filter by NGO and sort by latest, most viewed, most liked

### 2. **Wish Box System**
   - NGOs can create time-bound wishes for birthdays, festivals, and special occasions
   - Wish lifecycle: ACTIVE → EXPIRED → FULFILLED
   - Fixed required amount and deadline tracking

### 3. **Emergency Funds Module**
   - NGOs can raise emergency fund requests for urgent needs
   - High priority display with deadlines
   - **Document Upload** - Proof documents for transparency (PDF, Word, max 10MB)
   - Medical, disaster relief, and urgent need categories

### 4. **Adopt-a-Day Feature**
   - Donors can sponsor a complete day of care, food, or celebration
   - Each day includes date, purpose, and fixed amount

### 5. **Anonymous Kindness Mode**
   - Donors can donate anonymously
   - Anonymous donations displayed as "A Kind Soul"

### 6. **Gratitude Wall**
   - NGOs post thank-you messages after successful fulfillment
   - Public timeline for emotional connection

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Angular CLI (v16 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "dt project"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/heartbridge
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# or
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve
# or
npm start
```

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## 📁 Project Structure

```
dt project/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth, RBAC, error handling
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # API services
│   │   │   ├── guards/         # Route guards
│   │   │   └── app.module.ts   # Main module
│   │   ├── assets/            # Static assets
│   │   └── styles.scss         # Global styles
│   └── angular.json
│
└── README.md
```

## 🔐 User Roles

1. **Donor**
   - Browse NGOs and categories
   - Make donations (anonymous option available)
   - View donation history
   - Adopt days for NGOs
   - View gratitude wall

2. **NGO Admin**
   - Register and manage NGO profile
   - Create wishes, emergency funds, adopt-a-day entries
   - View received funds and analytics
   - Post gratitude messages
   - Track utilization

3. **System Admin**
   - Monitor platform usage
   - View analytics and statistics
   - Manage NGOs and users

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### NGOs
- `GET /api/v1/ngos` - List all NGOs
- `GET /api/v1/ngos/:id` - Get NGO details
- `POST /api/v1/ngos` - Create NGO (NGO Admin)
- `PUT /api/v1/ngos/:id` - Update NGO

### Donations
- `POST /api/v1/donations` - Create donation
- `GET /api/v1/donations/my-donations` - Get donor's donations
- `GET /api/v1/donations/ngo/:ngoId` - Get NGO donations
- `GET /api/v1/donations/stats` - Get donation statistics

### Wishes
- `GET /api/v1/wishes` - List wishes
- `GET /api/v1/wishes/active` - Get active wishes
- `POST /api/v1/wishes` - Create wish (NGO Admin)
- `PUT /api/v1/wishes/:id` - Update wish

### Emergency Funds
- `GET /api/v1/emergency-funds` - List emergency funds
- `GET /api/v1/emergency-funds/active` - Get active funds
- `POST /api/v1/emergency-funds` - Create fund (NGO Admin)
- `POST /api/v1/emergency-funds/:id/upload-document` - Upload proof document (NGO Admin)
- `GET /api/v1/emergency-funds/:id/documents` - Get fund documents

### Impact Stories
- `GET /api/v1/impact-stories` - List all impact stories
- `GET /api/v1/impact-stories/ngo/:ngoId` - Get NGO's impact stories
- `GET /api/v1/impact-stories/featured` - Get featured impact stories
- `POST /api/v1/impact-stories` - Create impact story (NGO Admin)
- `PUT /api/v1/impact-stories/:id` - Update impact story
- `DELETE /api/v1/impact-stories/:id` - Delete impact story
- `POST /api/v1/impact-stories/:id/like` - Like impact story
- `POST /api/v1/impact-stories/:id/share` - Share impact story

### Discussions
- `GET /api/v1/discussions` - List all discussions (with pagination, search, filters)
- `GET /api/v1/discussions/:id` - Get single discussion with replies
- `POST /api/v1/discussions` - Create new discussion (authenticated)
- `POST /api/v1/discussions/:id/reply` - Add reply to discussion (authenticated)
- `PUT /api/v1/discussions/:id/mark-helpful` - Mark reply as helpful (authenticated)
- `PUT /api/v1/discussions/:id/status` - Update discussion status (own discussion)
- `DELETE /api/v1/discussions/:id` - Delete discussion (own or admin)
- `GET /api/v1/discussions/category/:category` - Get discussions by category

### Adopt-a-Day
- `GET /api/v1/adopt-a-day` - List adoptable days
- `GET /api/v1/adopt-a-day/available` - Get available days
- `POST /api/v1/adopt-a-day` - Create day (NGO Admin)
- `POST /api/v1/adopt-a-day/:id/adopt` - Adopt a day

### Gratitude Wall
- `GET /api/v1/gratitude/wall` - Get public gratitude wall
- `POST /api/v1/gratitude` - Post gratitude (NGO Admin)

### Analytics
- `GET /api/v1/analytics/platform` - Platform stats (System Admin)
- `GET /api/v1/analytics/ngo/:ngoId` - NGO dashboard
- `GET /api/v1/analytics/donor` - Donor dashboard

## 🎨 Features Implementation

### NGO Categories
- Old Age Homes
- Children Welfare NGOs
- Physically Disabled Care NGOs
- Food and Basic Needs NGOs

### Donation Tracking
- Real-time tracking of donations
- Category-wise analytics
- Monthly donation reports
- Individual donor history

### Security
- JWT-based authentication
- Role-based access control
- Protected API endpoints
- Secure password hashing

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests
cd frontend
ng test
```

## 📝 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `NODE_ENV` - Environment (development/production)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### CORS Issues
- Backend CORS is configured to allow all origins in development
- Update CORS settings for production

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using the port

## 📄 License

This project is created for M.Tech final submission purposes.

## 👥 Authors

M.Tech Final Year Project

## 🙏 Acknowledgments

Built with ❤️ for connecting hearts through kindness.

---

**Note:** This is a complete, production-ready MEAN stack application suitable for M.Tech final project submission. All features are implemented with proper security, error handling, and best practices.

