# Training Management System (TMS)

A comprehensive full-stack web application designed for managing training operations, including batches, students, trainers, attendance, exams, results, and certificates.

## 🚀 Features

- **User Authentication**: Secure login and role-based access control.
- **Batch Management**: Create, schedule, and oversee training batches.
- **Profiles Dashboard**: Manage detailed records for students and trainers.
- **Daily Attendance System**: Streamlined tracking of daily attendance for both students and trainers.
- **Exam & Result Handling**: Manage exams and safely retain student results.
- **Certificate Issuance**: Issue, manage, and verify certificates for completed courses.
- **Lab & Resources**: Track lab allocations and assignments.
- **Holiday Management**: Keep schedules in check with an integrated holiday declaration system.

## 🛠️ Tech Stack

### Frontend (`/client`)
- **React 19**
- **Vite**
- **Tailwind CSS**
- **React Router DOM**
- **Axios** (for API calls)

### Backend (`/server`)
- **Node.js**
- **Express.js**
- **MongoDB** (via Mongoose)
- **JSON Web Token (JWT)**
- **Express Validator** & **Helmet** (for security & validation)

## 📦 Project Structure

The directory is divided between the separate client and server sub-projects:

- `client/` - Contains the React single-page application.
- `server/` - Contains the Node.js/Express REST API backend.

## ⚙️ Getting Started

### Prerequisites
Ensure you have the following installed to run this project smoothly:
- Node.js
- MongoDB

### Installation

1. **Client Setup**
   ```bash
   cd client
   npm install
   ```
2. **Server Setup**
   ```bash
   cd server
   npm install
   ```

### Configuration

Create a `.env` file in the `server` directory and configure the environment variables:

```env
# Example server/.env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tms
JWT_SECRET=your_super_secret_jwt_key
```

### Running the Application

To start the application, you'll need to run both the frontend and backend servers.

**Run Backend (Server)**
```bash
cd server
npm run dev
```

**Run Frontend (Client)**
```bash
cd client
npm run dev
```

## 📄 Documentation

For further information regarding specs and requirements, refer to the included `Documentation.pdf` present at the root of the project.

## 📜 License
ISC License
