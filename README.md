# C TECH Inventory Management System

A comprehensive inventory management system for C TECH, designed to track inventory, manage orders, and handle supplier relationships.

## Project Structure

This project is organized into three main components:

### Frontend
- Located in the `/frontend` directory
- Built with React, TypeScript, Vite, and Tailwind CSS
- Provides a modern, responsive user interface for the inventory management system

### Backend
- Located in the `/backend` directory
- Built with Node.js and Express
- Provides RESTful API endpoints for the frontend to interact with the database

### Database
- Located in the `/database` directory
- Uses PostgreSQL
- Contains schema definitions and database setup instructions

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL

### Installation and Setup

1. **Database Setup**
   ```
   cd database
   # Follow instructions in database/README.md
   ```

2. **Backend Setup**
   ```
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```
   cd frontend
   npm install
   npm run dev
   ```

## Development

- Frontend development server runs on http://localhost:8080
- Backend API server runs on http://localhost:5000

## Deployment

For production deployment, build the frontend:
```
cd frontend
npm run build
```

The backend can be deployed to any Node.js hosting service, and the database should be hosted on a reliable database service.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
