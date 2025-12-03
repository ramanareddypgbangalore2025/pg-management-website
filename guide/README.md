# 🏠 PG Management System

A complete, colorful, and animated web-based Paying Guest (PG) Management System with real-time updates, built with **Netlify** (static frontend) and **Supabase** (backend database).

## ✨ Features

### 🔐 Authentication & Security
- Hardcoded admin login (admin1/Admin@123, admin2/Admin@456)
- Session management without auto-logout (manual logout required)
- Login/logout tracking with timestamps

### 📊 Dashboard
- Real-time statistics for all guests and buildings
- Payment status overview (Paid, Pending, Breached)
- Building-wise breakdowns (Building 1 & 2)
- Recent payment due dates

### 👥 Guest Management
- **14 comprehensive fields** per guest:
  1. Joining Date
  2. Building (Building-1 or Building-2)
  3. Room Number (floor-wise: G01-G03, 101-103, 201-203, etc.)
  4. Sharing Type (1/2/3/4/5 sharing)
  5. Name
  6. Mobile
  7. Advance Payment
  8. Monthly Payment Amount
  9. Monthly Payment Status (Paid/Partial Paid/Pending/Breached)
  10. Monthly Payment Date
  11. Upcoming Payment Due Date (auto-calculated)
  12. Days Left (auto-calculated)
  13. Room Vacated (Yes/No)
  14. Remarks

### 🚪 Room Status
- Visual representation of all rooms
- Color-coded occupancy status:
  - **Green**: Fully Occupied
  - **Orange**: Partially Occupied
  - **Red**: Vacant
- Click to view detailed room information with all member details

### 📈 Reports
- Monthly reports with filtering
- Building-wise reports
- Revenue tracking (total vs collected)
- Exportable reports (print to PDF)

### 💾 Storage & Backup
- Manual backup creation
- Automatic monthly backups (on 5th of each month)
- Backup download and restore functionality
- Data export in JSON format
- Archive management

### 👨‍💼 Admin Profile
- Admin user credentials display
- Login history tracking
- Session duration tracking
- Admin-wise statistics

## 🏗️ Architecture

### Frontend
- **Pure HTML/CSS/JavaScript** (no frameworks)
- **Colorful animated UI** with gradient backgrounds
- **Responsive design** for all devices
- **Font Awesome icons** for visual enhancement
- **Session storage** for authentication

### Backend
- **Supabase** for PostgreSQL database
- **Supabase Auth** for session management
- **Real-time updates** capability
- **RESTful API** through Supabase client

## 🚀 Quick Start

### Prerequisites
1. A Supabase account (free tier works perfectly)
2. A Netlify account (free tier works perfectly)
3. A GitHub account (for deployment)

### Step 1: Supabase Setup

See **SETUP_GUIDE.md** for detailed step-by-step instructions.

### Step 2: Configure the Application

1. Open `js/config.js`
2. Replace placeholders with your Supabase credentials:
```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // Example: https://xyzcompany.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

### Step 3: Deploy to Netlify

See **SETUP_GUIDE.md** for detailed deployment instructions.

## 📁 Project Structure

```
project-root/
├── index.html # Login page
├── dashboard.html # Main dashboard
├── guest-form.html # Add/Edit guest form
├── guest-list.html # Guest list with filters
├── room-status.html # Room occupancy view
├── reports.html # Monthly reports
├── storage.html # Backup & restore
├── admin-profile.html # Admin management
├── manifest.json # PWA manifest
├── service-worker.js # Service worker for offline support
├── css/
│ └── style.css # Main stylesheet
├── js/
│ ├── auth.js # Authentication logic
│ ├── config.js # Configuration
│ ├── supabase-client.js # Database client
│ ├── dashboard.js # Dashboard logic
│ ├── guest-form.js # Form handling
│ ├── guest-list.js # List management
│ ├── room-status.js # Room tracking
│ ├── reports.js # Report generation
│ └── storage.js # Backup/restore
└── assets/
├── icon-192.png # App icon (192x192)
└── icon-512.png # App icon (512x512)

```

## 🔄 Business Logic

### Payment Due Date Calculation
- **Joining Date**: Determines the billing cycle day
- **Upcoming Due Date**: Next occurrence of joining day in upcoming month
- **Days Left**: Auto-calculated difference from today
- **Breached Status**: Automatically set if due date passed without payment

### Payment Status Updates
1. **On-time Payment**: Status = "Paid", next due date calculated
2. **Late Payment**: Status = "Breached" (auto), turns red
3. **After Late Payment**: Status back to "Paid", new cycle starts

### Auto-save & Backup
- Guest form auto-saves every 30 seconds to prevent data loss
- Automatic monthly backup on 5th of each month
- Manual backup anytime from Storage page

## 🎨 UI Features

- **Gradient backgrounds** with smooth animations
- **Pulse animations** on key icons
- **Hover effects** on all interactive elements
- **Color-coded status badges**
- **Smooth transitions** throughout
- **Responsive tables** with horizontal scroll
- **Modal dialogs** for detailed views

## 🔒 Security Features

- Admin-only access (hardcoded credentials)
- Session-based authentication
- No auto-logout (manual only)
- XSS protection headers (Netlify)
- Secure Supabase connection

## 📱 Responsive Design

- **Desktop**: Full-width tables and multi-column grids
- **Tablet**: 2-column layouts and touch-friendly buttons
- **Mobile**: Single-column stacked layouts

## 🆓 Free Hosting Limits

### Supabase Free Tier
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests
- 2 GB bandwidth

### Netlify Free Tier
- 100 GB bandwidth
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment

## 🛠️ Maintenance

### Regular Tasks
1. **Weekly**: Review payment statuses
2. **Monthly**: Check automatic backup (5th of month)
3. **Quarterly**: Archive old guest data
4. **Yearly**: Review and clean inactive guests

## 📞 Support

For detailed setup instructions, see **SETUP_GUIDE.md**.

## 📄 License

This project is provided as-is for use in your PG management operations.

## 🙏 Credits

- **UI Framework**: Custom CSS with gradient designs
- **Icons**: Font Awesome 6.5.1
- **Backend**: Supabase PostgreSQL
- **Hosting**: Netlify Static Hosting
- **Animations**: Pure CSS keyframe animations

---

**Made with ❤️ for efficient PG management**
