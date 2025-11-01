# Troubleshooting Guide

Common issues and solutions for the authentication integration.

## 🔴 Backend Issues

### Issue: "Connection refused" error

**Symptoms:**
- Frontend can't connect to backend
- Network errors in browser console

**Solutions:**
1. Check if backend is running:
   ```bash
   # Should see process on port 8080
   lsof -i :8080
   ```

2. Start the backend:
   ```bash
   cd be
   go run main.go
   ```

3. Verify the port in `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

---

### Issue: "Failed to migrate database"

**Symptoms:**
- Backend crashes on startup
- Database migration errors in logs

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   # or
   systemctl status postgresql
   ```

2. Start PostgreSQL:
   ```bash
   brew services start postgresql
   ```

3. Verify database exists:
   ```bash
   psql -U postgres -c "\l" | grep memotoko
   ```

4. Create database if needed:
   ```bash
   psql -U postgres -c "CREATE DATABASE memotoko;"
   ```

5. Check environment variables:
   ```bash
   echo $DB_HOST $DB_PORT $DB_USER $DB_NAME
   ```

---

### Issue: "Invalid JWT secret"

**Symptoms:**
- Token validation fails
- 401 errors even with valid tokens

**Solutions:**
1. Verify JWT secrets are set:
   ```bash
   echo $JWT_SECRET
   echo $JWT_REFRESH_SECRET
   ```

2. Set secrets if missing:
   ```bash
   export JWT_SECRET=your_very_long_random_secret_key_here
   export JWT_REFRESH_SECRET=your_other_very_long_random_secret_key
   ```

3. Restart backend after setting secrets

---

## 🔴 Frontend Issues

### Issue: CORS errors

**Symptoms:**
- "CORS policy" errors in console
- Requests blocked by browser

**Solutions:**
1. Backend already has CORS enabled - verify it's running

2. Check the CORS middleware in `be/handlers/router.go`:
   ```go
   c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
   ```

3. Clear browser cache and try again

4. Try in incognito mode to rule out extension issues

---

### Issue: "Cannot find module" errors

**Symptoms:**
- TypeScript errors about missing modules
- Import errors in VS Code

**Solutions:**
1. Install dependencies:
   ```bash
   cd fe
   npm install
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Restart TypeScript server in VS Code:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "TypeScript: Restart TS Server"

4. Verify path aliases in `tsconfig.app.json`:
   ```json
   "baseUrl": ".",
   "paths": {
     "@/*": ["./src/*"]
   }
   ```

---

### Issue: Authentication not persisting

**Symptoms:**
- Logged out on page refresh
- Tokens disappear

**Solutions:**
1. Check if tokens are being saved:
   - Open DevTools → Application → Local Storage
   - Look for `access_token` and `refresh_token`

2. Check browser's localStorage quota

3. Verify no browser extensions are clearing storage

4. Check if in private/incognito mode (has separate storage)

5. Test in different browser

---

### Issue: Infinite redirect loop

**Symptoms:**
- Page keeps redirecting
- "Too many redirects" error

**Solutions:**
1. Clear localStorage:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. Check ProtectedRoute logic doesn't conflict with auth checks

3. Verify `useIsAuthenticated()` returns correct value:
   ```javascript
   // In browser console
   console.log(!!localStorage.getItem('access_token'));
   ```

---

### Issue: 401 Unauthorized errors

**Symptoms:**
- Requests fail with 401
- Token refresh not working

**Solutions:**
1. Check if access token is in localStorage:
   ```javascript
   console.log(localStorage.getItem('access_token'));
   ```

2. Check token format:
   - Should be a JWT (three parts separated by dots)
   - Example: `eyJhbGc...`

3. Verify token is being added to requests:
   - Open DevTools → Network tab
   - Check request headers for `Authorization: Bearer ...`

4. Check if token expired:
   - Decode JWT at jwt.io
   - Check `exp` claim

5. Clear tokens and login again:
   ```javascript
   localStorage.clear();
   // Then login again
   ```

---

### Issue: React Query cache not updating

**Symptoms:**
- User data not showing after login
- Stale data displayed

**Solutions:**
1. Verify `queryClient.setQueryData()` is called in hooks

2. Check React Query DevTools (if installed):
   ```bash
   npm install @tanstack/react-query-devtools
   ```

3. Manually refetch:
   ```typescript
   const { refetch } = useUser();
   refetch();
   ```

4. Clear query cache:
   ```typescript
   const queryClient = useQueryClient();
   queryClient.clear();
   ```

---

## 🔴 Common Workflow Issues

### Issue: Cannot register user

**Possible causes and solutions:**

1. **Email already exists:**
   - Use different email
   - Check database: `SELECT * FROM users WHERE email = 'email@example.com';`

2. **Password too short:**
   - Must be at least 6 characters (backend validation)

3. **Invalid email format:**
   - Use valid email: `user@example.com`

4. **Network error:**
   - Check backend is running
   - Verify API URL in `.env`

---

### Issue: Cannot login

**Possible causes and solutions:**

1. **Incorrect credentials:**
   - Verify email and password
   - Check if account exists in database

2. **Password mismatch:**
   - Passwords are hashed - must use exact password from registration

3. **Backend not running:**
   - Start backend: `cd be && go run main.go`

---

### Issue: Token refresh not working

**Symptoms:**
- 401 errors persist
- Not automatically refreshed

**Solutions:**
1. Check refresh token in localStorage:
   ```javascript
   console.log(localStorage.getItem('refresh_token'));
   ```

2. Verify `afterResponse` hook in `utils/api.ts`:
   ```typescript
   afterResponse: [
     async (request, _options, response) => {
       if (response.status === 401) {
         // ... refresh logic
       }
     }
   ]
   ```

3. Check backend `/api/auth/refresh` endpoint is working:
   ```bash
   curl -X POST http://localhost:8080/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
   ```

---

## 🔧 Development Tips

### Enable Detailed Logging

**Backend:**
```go
// In main.go, add before engine.Run()
gin.SetMode(gin.DebugMode)
```

**Frontend:**
```typescript
// In utils/api.ts, add to hooks
beforeRequest: [
  (request) => {
    console.log('Request:', request.method, request.url);
  }
],
afterResponse: [
  async (request, _options, response) => {
    console.log('Response:', response.status, request.url);
    // ... existing code
  }
]
```

---

### Test API Endpoints Directly

**Using curl:**
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user (replace TOKEN)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### Reset Everything

If all else fails, reset everything:

```bash
# 1. Stop all servers
# 2. Clear database
psql -U postgres -d memotoko -c "DROP TABLE users;"

# 3. Clear frontend
cd fe
rm -rf node_modules package-lock.json
npm install
# Clear browser localStorage

# 4. Restart backend
cd be
go run main.go

# 5. Restart frontend
cd fe
npm run dev

# 6. Register new user
```

---

## 🐛 Debugging Checklist

When something doesn't work, check:

- [ ] Backend is running on port 8080
- [ ] PostgreSQL database is running
- [ ] Database has been migrated (users table exists)
- [ ] Frontend is running on port 5173
- [ ] `.env` file exists and has correct API URL
- [ ] JWT secrets are set in backend
- [ ] No CORS errors in console
- [ ] Tokens exist in localStorage
- [ ] Network requests reach backend (check Network tab)
- [ ] No TypeScript errors (check VS Code)
- [ ] Dependencies are installed (`node_modules` exists)

---

## 📞 Getting More Help

### Check the logs

**Backend logs:**
- Run backend and watch terminal output
- Look for error messages and stack traces

**Frontend logs:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Verify API documentation

Visit `http://localhost:8080/docs` when backend is running to see:
- Available endpoints
- Request/response formats
- Try endpoints directly

### Inspect network requests

In browser DevTools → Network:
1. Filter by XHR/Fetch
2. Click on request
3. Check:
   - Request URL
   - Request headers (especially Authorization)
   - Request payload
   - Response status
   - Response body

---

## 📚 Additional Resources

- [Backend Swagger Docs](http://localhost:8080/docs)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Ky Documentation](https://github.com/sindresorhus/ky)
- [JWT Debugger](https://jwt.io)

---

**Still having issues?** Check the code examples in `src/examples/AuthExamples.tsx` for working implementations.
