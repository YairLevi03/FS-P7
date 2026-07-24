# Nexus Bank - Full Stack Online Banking System

This is a comprehensive full-stack online banking web application built as a final project. It features a complete Node.js/Express backend with a MySQL database and a responsive React frontend styled with custom CSS.

## Features

*   **Role-Based Access Control (RBAC):** Separate interfaces and capabilities for `customer` and `manager`.
*   **Authentication & Security:** JWT-based authentication, bcrypt password hashing, input validation.
*   **Customer Features:** View account balances, transaction history, and execute money transfers between accounts.
*   **Manager Features:** Dashboard with bank-wide statistics and pending transaction approvals.
*   **Modern UI:** Premium dark theme, responsive design, glassmorphism effects, and smooth animations.

## Tech Stack

*   **Frontend:** React (Vite), React Router, Axios, Lucide React (Icons), Vanilla CSS
*   **Backend:** Node.js, Express, MySQL (mysql2 promise wrapper), jsonwebtoken, bcrypt, multer
*   **Database:** MySQL relational database

## Installation & Setup

### Prerequisites
*   Node.js installed
*   MySQL Server installed and running

### 1. Database Setup
1. Log in to your MySQL server (e.g., via command line or MySQL Workbench).
2. Execute the schema file to create the database and tables:
   ```bash
   mysql -u root -p < server/database/schema.sql
   ```
3. Execute the seed file to populate demo data (including a manager and customers):
   ```bash
   mysql -u root -p < server/database/seed.sql
   ```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd bank-app/server
   ```
2. Update the `.env` file in the `server` directory with your MySQL credentials (if they differ from default root/no password).
3. Start the server:
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:5000*

### 3. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd bank-app/client
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   *The client will run on http://localhost:5173*

## Demo Accounts

The `seed.sql` script creates the following accounts (all passwords are `123456`):

**Manager:**
*   Email: `admin@bank.com`
*   Password: `123456`

**Customers:**
*   Email: `john@example.com`
*   Password: `123456`
*   Email: `jane@example.com`
*   Password: `123456`

## Architecture Highlights
*   **MVC Pattern:** The Node backend strictly follows Model-View-Controller, separating database logic (`models/`), business logic (`services/`), and HTTP handling (`controllers/`).
*   **Protected Routes:** Both the React frontend and Express backend protect routes using JWT validation middleware.
*   **Transactions:** MySQL database transactions are used to ensure data integrity during money transfers.
