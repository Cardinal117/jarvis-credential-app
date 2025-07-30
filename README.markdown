# JARVIS Credential Vault:

Welcome to the **JARVIS Credential Vault**, an Iron Man-themed credential management system built for a rapidly growing company called Cool-Tech. This full-stack web app allows users to store and manage sensitive credentials while admins oversee divisions, OUs, and user roles via a sleek interface. With this epic and sleek design inspired by Tony Stark’s suit HUD, the vault ensures data integrity and access control, powered by an arch reactor.

## Features

- **Credential Management**: Users add, update, and view credentials for their assigned divisions, stored in MongoDB.
- **Admin Console**: Admins (e.g., TonyStark) manage users, assign OUs/divisions, and update roles via `/admin-panel`.
- **Division Selection**: Admins switch between divisions (e.g., NewsFinance, Operations) to view credentials.
- **Role-Based Access**: Admins see all divisions; normal users (e.g., Ultron) access only their assigned division.
- **Toast Notifications**: `react-toastify` alerts, with auto-close and slide animations.
- **Secure Authentication**: JWT-based login with token validation and session expiry handling.

## Tech Stack

- **Frontend**: React, react-router-dom, axios, react-toastify
  - Allows for: Dynamic UI with navigation, API calls, and themed notifications.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
  - Allows for: REST API for CRUD operations, authentication, and data storage.
- **Database**: MongoDB Atlas
  - Allows for: Storing of users, OUs, divisions, and credential repositories.

## Setup Instructions

Follow these steps to deploy the JARVIS Credential Vault locally:

### Requirements

- Node.js (v16+)
- MongoDB Atlas account
- Git
- Postman (for testing)

### Steps

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Cardinal117/jarvis-credential-app
   cd jarvis-credential-app
   ```

2. **Set Up Backend**:

   - Navigate to server:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create `.env` in `server/`:
     ```env
     PORT=8000
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jarvisDB?retryWrites=true&w=majority
     JWT_SECRET=<your-secret-key>
     ```
     - Replace `<username>`, `<password>`, and `<your-secret-key>` (e.g., `mySecret123`).
   - Seed MongoDB with test data (users: TonyStark, Ultron; divisions: NewsFinance, Operations):
     ```bash
     node seed.js
     ```

3. **Set Up Frontend**:

   - Navigate to client:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create `.env` in `client/`:
     ```env
     REACT_APP_API_URL=http://localhost:8000
     ```

4. **Run the App**:
   - Start backend:
     ```bash
     cd server
     npm run dev
     ```
   - Start frontend (in a new terminal):
     ```bash
     cd client
     npm start
     ```
   - Access the app at `http://localhost:3000`.

## Postman Testing

Test the vault’s API endpoints using Postman, like firing repulsors at targets. Below are example requests:

### 1. Login

- **Request**:
  ```http
  POST http://localhost:8000/api/login
  Content-Type: application/json
  {
    "username": "TonyStark",
    "password": "ironman456"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Get Divisions (Admin Only)

- **Request**:
  ```http
  GET http://localhost:8000/api/divisions
  Authorization: Bearer <TonyStark’s token>
  ```
- **Response** (200 OK):
  ```json
  [
    { "_id": "68889d3d1c6fa4ef2c45d356", "name": "NewsFinance" },
    { "_id": "789", "name": "Operations" }
  ]
  ```

### 3. Get Users (Admin Only)

- **Request**:
  ```http
  GET http://localhost:8000/api/users
  Authorization: Bearer <TonyStark’s token>
  ```
- **Response** (200 OK):
  ```json
  [
    {
      "_id": "507f191e810c19729de860ea",
      "username": "TonyStark",
      "role": "admin",
      "ous": [],
      "divisions": []
    },
    {
      "_id": "507f191e810c19729de860eb",
      "username": "Ulrton",
      "role": "normal",
      "ous": [],
      "divisions": [{ "_id": "789", "name": "Operations" }]
    }
  ]
  ```

### 4. Add Credential

- **Request**:
  ```http
  POST http://localhost:8000/api/credentials/68889d3d1c6fa4ef2c45d356
  Authorization: Bearer <TonyStark’s token>
  Content-Type: application/json
  {
    "key": "api_key",
    "value": "api_remove_ultron"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "credentials": [{ "_id": "abc123", "key": "api_key", "value": "xyz123" }]
  }
  ```

## Access Points

- **Frontend**: `http://localhost:3000`
  - Login as:
    - Admin: `username: IronMan`, `password: ironman456`
    - User: `username: Ultron`, `password: spidermanNY`
- **Backend**: `http://localhost:8000`
  - API endpoints: `/api/login`, `/api/divisions`, `/api/users`, `/api/credentials`
- **MongoDB**: Atlas via `MONGO_URI` in `server/.env`
  - Database: `jarvisDB`
  - Collections: `users`, `ous`, `divisions`, `credentialRepos`

## Screenshots

-# `/login`: Login page.
![Login Page](screenshots/login.png)
-# `/register`: Registration page.
![Registration Page](screenshots/register.png)
-# `/credentials`: Division dropdown and credential table.
![Credentials Page](screenshots/credentials.png)
-# `/admin-panel`: User management with OU/division assignments.
![Admin Panel](screenshots/admin-panel.png)

## License

MIT License © 2025 Cardinal117.
