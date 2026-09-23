# RentRide

RentRide is a comprehensive vehicle rental platform that allows users to easily discover, rent, and pay for vehicles (Bikes, EV Bikes, and Cycles). The platform includes a seamless frontend interface for customers, and a robust admin dashboard for managing vehicles, rentals, and payments.

## Features

- **User Authentication:** OTP-based email login, and Google OAuth integration.
- **Vehicle Catalog:** Browse vehicles with dynamic filtering by category, search, and sorting.
- **Rental Management:** Easy booking flow with Razorpay payment integration, calculating dates, deposits, and per-day pricing.
- **Admin Dashboard:** Fully functional admin panel to create, update, delete vehicles and manage ongoing rentals.
- **Mobile Responsive:** Clean, modern, app-like mobile experience.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Payments:** Razorpay
- **Image Storage:** Cloudinary
- **Emails:** Nodemailer / SMTP

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v16 or higher)
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/anjadkt/Rent_Me.git
cd Rent_Me
```

### 2. Environment Variables Setup

You will need to configure environment variables for both the frontend (`client`) and the backend (`server`). 

#### Server Environment Variables
Create a `.env` file inside the `server/` directory and add the following keys. Fill in your respective credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5174

# MongoDB
DATABASE_URL=mongodb+srv://<your-db-user>:<your-db-password>@cluster0.mongodb.net/rentme_db

# Authentication (JWT)
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP (For OTP Emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com
```

#### Client Environment Variables
Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Install Dependencies

You need to install dependencies for both the frontend and the backend.

Open your terminal and run:

```bash
# Install Server dependencies
cd server
npm install

# In a new terminal, install Client dependencies
cd client
npm install
```

### 4. Seed the Database

Before starting the app, you should populate the database with the initial vehicles and the admin user account.

In the `server` directory, run:
```bash
npm run seed
```
*This command clears existing vehicles/admins and adds default vehicles, along with a default admin user (`admin@rentride.com`).*

### 5. Start the Application

You need to start both the backend server and the frontend client simultaneously.

**Start the Server (Terminal 1):**
```bash
cd server
npm run dev
```

**Start the Client (Terminal 2):**
```bash
cd client
npm run dev
```

### 6. Access the Application

- **Frontend:** Open your browser and navigate to `http://localhost:5174` (or whatever port Vite specifies).
- **Backend API:** Running on `http://localhost:5000`

### Admin Access
To log into the Admin Dashboard, use the email that was created during the seeding process:
- **Email:** `admin@rentride.com`
- **OTP:** `000000` (Guest Admin bypass)
