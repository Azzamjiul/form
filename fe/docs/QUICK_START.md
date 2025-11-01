# Quick Start Guide

This guide will help you get the authentication system up and running.

## Prerequisites

- Go 1.21+ installed
- Node.js 18+ installed
- PostgreSQL database running

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd be
   ```

2. **Install dependencies:**
   ```bash
   go mod download
   ```

3. **Configure environment variables:**
   Create a `.env` file or set the following environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_USER=your_db_user
   export DB_PASSWORD=your_db_password
   export DB_NAME=form
   export JWT_SECRET=your_secret_key_here
   export JWT_REFRESH_SECRET=your_refresh_secret_key_here
   export SERVER_PORT=8080
   ```

4. **Run the backend server:**
   ```bash
   go run main.go
   ```

   The server will start on `http://localhost:8080`

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   The `.env` file has already been created with:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Testing the Integration

### 1. Register a New User

1. Open your browser and go to `http://localhost:5173/register`
2. Fill in the registration form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
3. Click "Register"
4. You should be redirected to the home page and see your profile

### 2. Logout and Login

1. Click the "Logout" button on the home page
2. You'll be redirected to the login page
3. Login with the credentials you just created:
   - Email: john@example.com
   - Password: password123
4. You should be redirected back to the home page

### 3. View API Documentation

Visit `http://localhost:8080/docs` to see the interactive API documentation powered by Swagger.

## Available Routes

### Backend API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (requires authentication)
- `GET /docs` - API documentation

### Frontend Routes
- `/` - Home page (shows user profile if logged in)
- `/login` - Login page
- `/register` - Registration page

## Troubleshooting

### Backend Issues

**"Connection refused" error:**
- Make sure PostgreSQL is running
- Check your database credentials in the environment variables

**"Failed to migrate database" error:**
- Ensure the database exists
- Check that your database user has proper permissions

### Frontend Issues

**"Network Error" or CORS issues:**
- Make sure the backend server is running on port 8080
- Check that CORS is properly configured in the backend (it should be by default)

**"Cannot find module" errors:**
- Run `npm install` to ensure all dependencies are installed
- Clear your browser cache and restart the dev server

**Authentication not working:**
- Check the browser console for errors
- Verify the `VITE_API_BASE_URL` in `.env` is correct
- Clear localStorage: Open browser DevTools > Application > Local Storage > Clear

## Project Structure

```
form/
├── be/                           # Backend (Go)
│   ├── main.go                  # Entry point
│   ├── config/                  # Configuration
│   ├── handlers/                # HTTP handlers
│   ├── middleware/              # Auth middleware
│   ├── models/                  # Data models
│   ├── services/                # Business logic
│   └── utils/                   # JWT utilities
│
└── fe/                           # Frontend (React + TypeScript)
    ├── src/
    │   ├── app/
    │   │   ├── pages/           # Page components
    │   │   ├── router.tsx       # Route configuration
    │   │   └── providers.tsx    # React Query provider
    │   ├── features/
    │   │   └── auth/            # Auth feature module
    │   │       ├── api/         # API functions
    │   │       ├── components/  # UI components
    │   │       ├── hooks/       # React hooks
    │   │       └── types/       # TypeScript types
    │   └── utils/
    │       └── api.ts           # HTTP client config
    ├── .env                     # Environment variables
    └── package.json
```

## Next Steps

1. **Add Protected Routes**: Use the `ProtectedRoute` component to protect routes that require authentication
2. **Implement Order Management**: Create the order feature following the same pattern as auth
3. **Add Error Handling**: Implement proper error boundaries and toast notifications
4. **Enhance UI**: Style the components to match your design system
5. **Add Form Validation**: Implement client-side validation for better UX

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)
- [Ky HTTP Client](https://github.com/sindresorhus/ky)
- [Gin Framework](https://gin-gonic.com/)

## Support

For detailed integration information, see [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md)
