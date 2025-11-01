# form Frontend

Modern React + TypeScript frontend for the form application with complete authentication integration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:5173` after starting the dev server.

## ✨ Features

- ⚡️ **React 19** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🔐 **Complete Authentication** (Register, Login, Refresh Token)
- 🔄 **React Query** for data fetching and caching
- 🛣️ **React Router** for navigation
- 🌐 **Ky** HTTP client with automatic token management
- 📱 **Responsive Design** ready
- 🔒 **Protected Routes** component
- 🎯 **Type-Safe** API integration

## 📁 Project Structure

```
fe/
├── src/
│   ├── app/
│   │   ├── pages/              # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── router.tsx          # Route configuration
│   │   ├── index.tsx           # App component
│   │   └── providers.tsx       # React Query provider
│   ├── features/
│   │   └── auth/               # Authentication feature
│   │       ├── api/            # Auth API calls
│   │       ├── components/     # Login/Register forms
│   │       ├── hooks/          # Auth hooks
│   │       └── types/          # TypeScript types
│   ├── utils/
│   │   └── api.ts              # Configured HTTP client
│   └── examples/
│       └── AuthExamples.tsx    # Usage examples
├── .env                        # Environment variables
├── AUTH_INTEGRATION.md         # Integration guide
├── AUTH_FEATURES.md            # Features reference
├── QUICK_START.md              # Setup instructions
├── TROUBLESHOOTING.md          # Common issues
└── package.json
```

## 🔐 Authentication

The authentication system is fully integrated with the Go backend.

### Available Hooks

- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useUser()` - Get current user
- `useLogout()` - Logout user
- `useIsAuthenticated()` - Check auth status
- `useRefreshToken()` - Refresh access token

### Quick Example

```tsx
import { useLogin, useUser, useLogout } from '@/features/auth';

function MyComponent() {
  const { mutate: login } = useLogin();
  const { data: user } = useUser();
  const logout = useLogout();

  const handleLogin = () => {
    login({ email: 'user@example.com', password: 'pass123' });
  };

  return (
    <div>
      {user ? (
        <>
          <p>Hello, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

See [AUTH_FEATURES.md](./AUTH_FEATURES.md) for complete documentation.

## 🛣️ Available Routes

- `/` - Home page (public)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard (requires auth)

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Backend Connection

Ensure the backend is running on `http://localhost:8080`:

```bash
cd ../be
go run main.go
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Complete setup guide
- **[AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md)** - Detailed integration docs
- **[AUTH_FEATURES.md](./AUTH_FEATURES.md)** - Features reference
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Summary of changes

## 🧩 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router 7** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Ky** - HTTP client

## 🔧 Development

### Install Dependencies

```bash
npm install
```

### Start Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 🌐 API Integration

The app communicates with a Go backend via REST API:

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Refresh: `POST /api/auth/refresh`
- Get User: `GET /api/auth/me`

See backend API docs at `http://localhost:8080/docs`

## 🔒 Authentication Flow

1. User logs in or registers
2. Backend returns access token + refresh token
3. Tokens stored in localStorage
4. Access token automatically added to requests
5. On 401 error, token automatically refreshed
6. On refresh failure, user redirected to login

## 🎯 Next Steps

- [ ] Add form validation (Zod, React Hook Form)
- [ ] Add toast notifications
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Create order management features
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add tests (Vitest + Testing Library)

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

Quick fixes:
- **CORS errors?** Make sure backend is running
- **Can't login?** Check backend logs and database
- **Tokens not persisting?** Clear localStorage and try again

## 📖 Learn More

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vite.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
