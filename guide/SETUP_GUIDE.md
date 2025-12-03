# 🚀 Complete Setup Guide - PG Management System

This guide provides **detailed step-by-step instructions** for setting up your PG Management System with Supabase (backend) and Netlify (frontend hosting).

# PG Management System

A modern, full-featured Progressive Web Application (PWA) for managing Paying Guest (PG) accommodations with real-time guest tracking, room management, payment monitoring, and comprehensive reporting.

![PG Management System](assets/icon-512.png)

## 🌟 Features

### Core Functionality
- **📊 Dashboard** - Real-time statistics and analytics with animated cards
- **👥 Guest Management** - Add, edit, delete, and track guest information
- **🏠 Room Status** - Visual room occupancy tracking with colorful status indicators
- **📈 Reports** - Monthly reports with payment analytics and guest summaries
- **💾 Storage & Backup** - Export, backup, and restore guest data
- **👤 Admin Profile** - Admin management with login history tracking

### Technical Features
- **📱 Progressive Web App (PWA)** - Installable on mobile and desktop
- **🔌 Offline Support** - Works without internet connection via Service Worker
- **📲 Android App** - Installable APK via PWABuilder
- **🎨 Modern UI** - Colorful gradients, animations, and responsive design
- **☁️ Cloud Database** - Supabase backend for real-time data sync
- **🔐 Secure Authentication** - Admin login system with session management

## 🚀 Live Demo

**Website:** [Your Netlify URL]  
**Android App:** [Download APK]

### Demo Credentials
- **Admin 1:** `admin1` / `Admin@123`
- **Admin 2:** `admin2` / `Admin@456`

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Custom animations, gradients, responsive grid)
- JavaScript (ES6+)
- Font Awesome Icons

### Backend
- Supabase (PostgreSQL database)
- Supabase Authentication

### Deployment
- Netlify (Web hosting)
- PWABuilder (Android APK generation)

### PWA Components
- `manifest.json` - App configuration
- `service-worker.js` - Offline caching

## 📁 Project Structure

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

---
Using Python open index folder use cmd.
python -m http.server 8080

4. **Open in incognito browser**
http://localhost:8080/index.html

or 
optional (OR using Node.js 
npx http-server)

---

## 📋 Table of Contents

1. [Supabase Setup](#1-supabase-setup)
2. [Database Tables Creation](#2-database-tables-creation)
3. [Configure Application](#3-configure-application)
4. [Netlify Deployment](#4-netlify-deployment)
5. [Testing & Verification](#5-testing--verification)
6. [Troubleshooting](#6-troubleshooting)

---
###################
Supabase
Name**: `ramanareddypgbangalore2025 Project` (or your choice)
*Database Password**: Bangalore2025@    Create a strong password (SAVE THIS!)
*Region**: South asia (mumbai)  Choose closest to your location

Project URL : https://temfpakqmqkdvdyhgetz.supabase.co
anon/public :- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbWZwYWtxbXFrZHZkeWhnZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTgwNDgsImV4cCI6MjA4MDI3NDA0OH0.VKbNOzSqQDOb7o1_jvh0zIzRUIkwhznD1l-khiOv4fc

--->table creation
1. primary databse
Role: postgres

python -m http.server 8080
http://localhost:8080/index.html

#######################################
## 1. 🗄️ Supabase Setup

### Step 1.1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or Email
4. Verify your email address

### Step 1.2: Create New Project

1. Click **"New Project"**
2. Choose your organization (create one if needed)
3. Fill in project details:
   - **Name**: `ramanareddypgbangalore2025 Project` (or your choice)
   - **Database Password**: Bangalore2025@  Create a strong password (SAVE THIS!)
   - **Region**: South asia (mumbai)  Choose closest to your location
   - **Pricing Plan**: Free (perfect for this project)
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

### Step 1.3: Get API Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. Copy and save these values:
   - **Project URL**: `https://xxxxx.supabase.co`   (https://temfpakqmqkdvdyhgetz.supabase.co)
   - **anon/public key**: `eyJhbGc...` (long string)  (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbWZwYWtxbXFrZHZkeWhnZXR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTgwNDgsImV4cCI6MjA4MDI3NDA0OH0.VKbNOzSqQDOb7o1_jvh0zIzRUIkwhznD1l-khiOv4fc)

⚠️ **IMPORTANT**: Save these credentials securely. You'll need them in Step 3.

---

## 2. 📊 Database Tables Creation

### Step 2.1: Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**

### Step 2.2: Create `guests` Table

Copy and paste this SQL code, then click **"Run"**:

```sql
DROP TABLE IF EXISTS guests;

CREATE TABLE guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "joiningDate" DATE NOT NULL,
    building TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "sharingType" INTEGER NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    "advancePayment" DECIMAL(10,2) NOT NULL,
    "paymentAmount" DECIMAL(10,2) NOT NULL,
    "monthlyPaymentStatus" TEXT NOT NULL,
    "monthlyPaymentDate" DATE,
    "upcomingPaymentDueDate" DATE,
    "daysLeft" TEXT,
    "roomVacate" TEXT DEFAULT 'No',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE guests
ADD COLUMN "isCurrentCycleClosed" boolean NOT NULL DEFAULT false;


CREATE INDEX IF NOT EXISTS idx_guests_building ON guests(building);
CREATE INDEX IF NOT EXISTS idx_guests_room ON guests("roomNo");
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests("monthlyPaymentStatus");
CREATE INDEX IF NOT EXISTS idx_guests_vacate ON guests("roomVacate");

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on guests" ON guests;

CREATE POLICY "Allow all operations on guests"
ON guests FOR ALL
USING (true)
WITH CHECK (true);


✅ **Success**: You should see "Success. No rows returned"

### Step 2.3: Create `login_history` Table

Create a new query and run:

```sql
-- Create login history table
CREATE TABLE login_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_login_username ON login_history(username);
CREATE INDEX idx_login_time ON login_history(login_time DESC);

-- Enable Row Level Security
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on login_history" 
ON login_history FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Step 2.4: Create `backups` Table

Create another new query and run:

```sql
-- Create backups table
CREATE TABLE backups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    backup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    type TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_backup_date ON backups(backup_date DESC);

-- Enable Row Level Security
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on backups" 
ON backups FOR ALL 
USING (true) 
WITH CHECK (true);
```

### Step 2.5: Verify Tables

1. Click **"Table Editor"** in sidebar
2. You should see 3 tables:
   - `guests`
   - `login_history`
   - `backups`

---

## 3. ⚙️ Configure Application

### Step 3.1: Extract Project Files

1. Extract the `pg-management-system` folder
2. Open the folder in your code editor

### Step 3.2: Update Configuration

1. Open `js/config.js`
2. Find these lines:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY',
};
```

3. Replace with YOUR credentials from Step 1.3:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // Your actual URL
    anonKey: 'eyJhbGc...',              // Your actual anon key
};
```

4. **Save the file**

### Step 3.3: Test Locally (Optional)

1. Open `index.html` in a browser
2. Try logging in with:
   - Username: `admin1`
   - Password: `Admin@123`
3. If it works, you're ready for deployment!

---

## 4. 🌐 Netlify Deployment

### Method A: Drag & Drop (Easiest)

#### Step 4.1: Prepare Files

1. Make sure `js/config.js` has your Supabase credentials
2. Keep all files in the `pg-management-system` folder

#### Step 4.2: Deploy to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up/Login (use GitHub recommended)
3. Click **"Add new site"** → **"Deploy manually"**
4. **Drag the entire `pg-management-system` folder** into the deployment zone
5. Wait 10-30 seconds for deployment
6. Your site is live! 🎉

#### Step 4.3: Get Your URL

- Netlify assigns a random URL like: `https://random-name-12345.netlify.app`
- Click on the URL to open your PG Management System
- Test the login with admin credentials

#### Step 4.4: (Optional) Custom Domain

1. Click **"Domain settings"**
2. Click **"Options"** → **"Edit site name"**
3. Change to your preferred name: `my-pg-system.netlify.app`
4. Save

---

### Method B: GitHub Integration (Recommended for Updates)

#### Step 4B.1: Create GitHub Repository

1. Go to [https://github.com](https://github.com)
2. Click **"New repository"**
3. Name: `pg-management-system`
4. Set to **Public** or **Private**
5. Click **"Create repository"**

#### Step 4B.2: Push Code to GitHub

Open terminal/command prompt in your project folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PG Management System"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/pg-management-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 4B.3: Deploy from GitHub

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"**
4. Authorize Netlify to access GitHub
5. Select your repository: `pg-management-system`
6. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: (leave empty)
   - **Publish directory**: (leave empty or use `.`)
7. Click **"Deploy site"**
8. Wait for deployment to complete

#### Step 4B.4: Enable Auto-Deploy

With GitHub integration, every time you push code:
```bash
git add .
git commit -m "Updated features"
git push
```
Netlify automatically redeploys! 🚀

---

## 5. ✅ Testing & Verification

### Step 5.1: Test Login

1. Open your Netlify URL
2. Login with:
   - **Admin 1**: `admin1` / `Admin@123`
   - **Admin 2**: `admin2` / `Admin@456`

### Step 5.2: Test Guest Addition

1. Click **"Add Guest"**
2. Fill in all 14 fields
3. Click **"Save Guest"**
4. Verify guest appears in **"Guest List"**

### Step 5.3: Test All Features

✅ Dashboard statistics updated
✅ Guest list showing data
✅ Room status displaying correctly
✅ Reports generating
✅ Backup creation working
✅ Admin profile showing login history

---

## 6. 🔧 Troubleshooting

### Issue: "Error initializing Supabase"

**Solution**:
- Check `js/config.js` has correct URL and key
- Ensure no extra spaces in credentials
- Verify Supabase project is active

### Issue: "Policy violation" errors

**Solution**:
- Run the policy creation SQL commands again
- Ensure RLS policies allow all operations
- Check Supabase logs in dashboard

### Issue: No data showing

**Solution**:
- Open browser console (F12)
- Check for JavaScript errors
- Verify Supabase tables exist
- Check internet connection

### Issue: Login not working

**Solution**:
- Credentials are hardcoded (check auth.js)
- Try: `admin1` / `Admin@123` (case-sensitive)
- Clear browser cache and cookies
- Try incognito mode

### Issue: "Failed to fetch" errors

**Solution**:
- Check Supabase project is not paused
- Verify API credentials are correct
- Check browser console for CORS errors
- Ensure Supabase project URL is https://

---

## 🎯 Next Steps

1. **Add Your First Guest**: Test the complete workflow
2. **Set Up Automatic Backups**: Visit Storage page
3. **Review Room Status**: Ensure rooms display correctly
4. **Generate Reports**: Test monthly reports
5. **Bookmark Your Site**: Add to favorites for easy access

---

## 📞 Quick Reference

### Admin Credentials
- **Admin 1**: `admin1` / `Admin@123`
- **Admin 2**: `admin2` / `Admin@456`

### Important Files to Configure
- `js/config.js` - Supabase credentials

### Support Resources
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Font Awesome**: https://fontawesome.com/icons

---

## 🎉 Congratulations!

Your PG Management System is now live and ready to use!

**Your URLs**:
- **Supabase Dashboard**: https://app.supabase.com
- **Netlify Dashboard**: https://app.netlify.com
- **Your PG System**: https://your-site.netlify.app

---

**Need Help?** Check the troubleshooting section or review the README.md file.

--->
Would you like me to:
Provide the complete updated HTML files with all meta tags?
Create the manifest.json and service-worker.js customized for your project?
Help you generate app icons from your logo?
Guide you through Capacitor APK build for Play Store?

text
□ Add viewport meta tags to all HTML files
□ Create manifest.json
□ Link manifest in all HTML files
□ Create app icons (192x192 and 512x512)
□ Create service-worker.js
□ Register service worker in index.html
□ Add mobile-friendly CSS
□ Deploy to Netlify
□ Test "Add to Home Screen" on Android
--->

Now you need 2 more files to complete PWA setup:
manifest.json - App configuration
service-worker.js - Offline functionality
Would you like me to provide these files now?

---> follow below steps


I understand - you want to make your website work better as an Android app. Let me help you **optimize your existing website to be Android-friendly** and then convert it to an installable app.

***

## **🔧 Step 1: Make Your Website Android-Ready**

Here are the key improvements needed:

### **1. Add Mobile Viewport Meta Tags**

Check that ALL your HTML files have this in the `<head>`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### **2. Add App Icons**

Create a `manifest.json` file in your root directory:

```json
{
  "name": "PG Management System",
  "short_name": "PG Manager",
  "description": "Manage your PG guest data efficiently",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### **3. Link Manifest in ALL HTML Files**

Add this to the `<head>` section of every HTML page:

```html
<link rel="manifest" href="/manifest.json">
<link rel="icon" type="image/png" href="assets/icon-192.png">
<meta name="theme-color" content="#667eea">
```

### **4. Create App Icons**

You need two icon sizes:
- **192x192 pixels** - saved as `assets/icon-192.png`
- **512x512 pixels** - saved as `assets/icon-512.png`

**Quick way to create icons:**
- Use any image editor or online tool like [Canva](https://canva.com)
- Use your PG Management logo/icon
- Export as PNG with transparent background

### **5. Add Service Worker for Offline Support**

Create `service-worker.js` in your root directory:

```javascript
const CACHE_NAME = 'pg-management-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/guest-form.html',
  '/guest-list.html',
  '/room-status.html',
  '/reports.html',
  '/storage.html',
  '/admin-profile.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/guest-list.js',
  '/js/room-status.js',
  '/js/reports.js',
  '/js/storage.js'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Update service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### **6. Register Service Worker**

Add this script to your `index.html` before closing `</body>`:

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
    });
  }
</script>
```

### **7. Improve Touch Interactions**

Add this CSS to your `style.css`:

```css
/* Mobile-friendly touch targets */
button, a, input, select {
  min-height: 44px;
  min-width: 44px;
}

/* Remove tap highlight on mobile */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection on buttons */
button {
  -webkit-user-select: none;
  user-select: none;
}
```

***

## **📱 Step 2: Test on Android**

1. Deploy updated code to Netlify
2. Open your website on Android Chrome
3. Tap the menu (⋮) → **"Add to Home Screen"**
4. Your app icon will appear on the home screen
5. Open it - it will run like a native app!

***

## **🚀 Step 3: Create Standalone APK (Optional)**

If you want a downloadable APK file for distribution:

### **Option A: Use PWABuilder (Easiest)**

1. Go to [pwabuilder.com](https://www.pwabuilder.com)
2. Enter your Netlify URL
3. Click "Build My PWA"
4. Download Android APK
5. Install on any Android device

### **Option B: Use Capacitor (More Control)**

Would you like step-by-step instructions for this?

***

## **✅ Quick Checklist**

```
□ Add viewport meta tags to all HTML files
□ Create manifest.json
□ Link manifest in all HTML files
□ Create app icons (192x192 and 512x512)
□ Create service-worker.js
□ Register service worker in index.html
□ Add mobile-friendly CSS
□ Deploy to Netlify
□ Test "Add to Home Screen" on Android
```

***

**Would you like me to:**

1. **Provide the complete updated HTML files** with all meta tags?
2. **Create the manifest.json and service-worker.js** customized for your project?
3. **Help you generate app icons** from your logo?
4. **Guide you through Capacitor APK build** for Play Store?

Let me know which files you need, and I'll provide them ready to use!

--->

websites list to use for free


https://github.com

https://app.netlify.com

https://supabase.com

https://www.pwabuilder.com/   or https://appinventor.mit.edu/ (see video links)

https://www.iloveimg.com/resize-image

https://jpg2png.com/


provide revised full .css file
provide revised full .html file
provide revised full .js file

StaySafeHome icons with a background of home and "StaySafeHome" letters are in bold letters in front of the house


---> website prompt

Build website with colorful animated UI paying guest website hosting online free for requirements below (Netlify (static frontend) + Supabase (backend database)) and provide every file in zip downloadable file

Building no:1 (have 5 floors(G,1,2,3,4) and along with ground floor and each floor having 3 rooms (sub-rooms for sharing))
Building no:2 (have 5 floors(G,1,2,3,4) and along with ground floor and each floor having 3 rooms (sub-rooms for sharing))

Guest form page details
1. Joining Date (The date on which the tenant joined the PG. This date determines the fixed monthly billing cycle (e.g., joining on the 2nd means every billing cycle ends on the 2nd of each month).
2. Building : (Building-1 or Building-2)
3 Room no (floor wise example (1st floor having 3 rooms with room no's : 101,102,103 and each room in side we have sharing rooms)), (dropdown list), (this we can add,update or remove)
4 Sharing Type : 1/2/3/4/5 sharing (drop down list)
5 Name
6 Mobile
7 Advance Payment
8 Payment amount
9 Monthly Payment status(drop down list (paid/partial paid/pending/Breached due date))
10. Monthly Payment date  (The date on which the tenant last made the monthly payment. This value updates only when a payment is recorded.)
11. Upcoming payment due date:  (This date is automatically calculated whenever the Monthly Payment Date is updated. The Upcoming Payment Due Date is the next occurrence of the tenant’s joining-day in the upcoming month (e.g., joining on the 2nd → next due date is the next month’s 2nd).)
12. Days Left: (The number of days between today and the Upcoming Payment Due Date. If the due date is in the past, Days Left becomes the count of overdue days.)
13. Room is Vacate ( drop down list (yes/no))
14. Remarks

-> Use icons everywhere for better visual and animation in all pages and make it beatiful.
-> Login page UI should elagant and looks beatiful. (should display: admin usernames and admin passwords) and admin only can use to edit,delete,update,select. provide two admin users access and it should be hard coded.
-> Provide one Dashboard on main page (with required details counts all/bulding 1/building 2).
-> Guests form page: All 14 provided columns should be displayed in form. ( also add reset button)
-> Guests lists page : All 14 provided columns should be displayed with all the paying guest details.
-> Room status page: Each room contains multiple sub-rooms or sharing options (e.g., Room 101 may have single, 2-sharing, 3-sharing, and 4-sharing spaces). A room should be shown in green only when all sub-rooms are fully occupied; otherwise, it should display a different color and it should display all memeber information about respective room.
-> reports page: We have to see the reports of old months and current month like all information.
-> storage page: (backup/restore/upload and etc) and Old months data should be present in archives (take automatic backup every month 5th). and should not delete any data after taking backup.
-> Store all guests information in json file. it should be editble(re-useable) for Database CRUD operations.
-> Admin profile page : with all hardcoded logins and all two admin users list should dispaly with login timings and last log out timings.
-> website should not auto logout (refresh/F5/reload or etc), user must click on logout button for logout the session.
-> instruct step by step free hosting on online and storage purpose.
-> provide folder structure of website. and required files for help.
-> provide tables for Supabase and also step by step detailed process.
-> provide detailed step by step process for hosting website in Netlify.
-> Provide detailed step by steps proess connectivity for CRUD operations from website to backend.

NOTE: all functions should work properly(close,save,autosave,delete,update,select,add,remove,backup and etc)

Example for storing in Database (supabase) and logic to apply.
Joining Date: 02-11-2025
Monthly Payment Date: 02-11-2025
Upcoming Payment Due Date: 02-12-2025
Days Left: Difference between today and 02-12-2025 (e.g., 14 days on 18-11-2025)

Business Rules
1. On-time Payment
When the tenant pays on or before the due date:
Monthly Payment Date is updated to the payment date.
Monthly Payment Status becomes “Paid.”
Upcoming Payment Due Date is recalculated automatically for the next cycle.
Days Left is recalculated based on the new due date.

2. Missed / Late Payment (Breached)
If the Upcoming Payment Due Date has passed and no payment is recorded:
Monthly Payment Status automatically becomes “Breached” (displayed in red).
Days Left shows the number of overdue days (increasing daily).

Once the tenant makes the payment:
i. Monthly Payment Date is updated to the actual payment date.
ii. Monthly Payment Status changes back to “Paid.”
iii. A new Upcoming Payment Due Date is generated for the next cycle.
iv. Days Left resets and begins counting toward the next due date.




----->

1.logic for new guests
	i.	joining  date is current date
	ii.	payment date is current date or paid date (future date)
	iii.payment status is paid or partial paid(advance paid)
	iv.	upcoming payment due date will be : subsequnt of joining date
	v.	days left : x days
	
2.for upcoming/subsequent month logics
	i.	 if the guest paid amount on the subsequent month of the date then status is paid and once payment date is updated for the cycle on due date for today.
	ii.  if the guest paid amount early(1 or 2 or 3 or 4 or 5 days before)  for the subsequent month of the date then status is paid and once payment date is updated for the cycle and days left is ( early days+x days).
	iii. if the "due today" is crossed then status shoul be changed to breached automatically and days left count should be auto calculate until payment date is update manually.
	iv.  if the breached status guest paid in future dates, then manually we have to change it to status as paid and monthly payment date updated manually. And days left should be calculate automatically based on cycle.
