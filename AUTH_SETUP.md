# MediStock Authentication Setup Guide

## Quick Start

Your login and register pages are now connected to a SQL Server backend for secure authentication.

### 1. Configure SQL Server Connection

Copy `.env.local.example` to `.env.local` and update with your SQL Server credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
DB_SERVER=your-server-name    # e.g., localhost or 192.168.1.100
DB_NAME=medixora              # Database name
DB_USER=sa                    # SQL Server user
DB_PASSWORD=YourPassword123!  # SQL Server password
```

### 2. Create Database Schema

Run the provided SQL script in SQL Server Management Studio:

```sql
-- Open and execute schema.sql
```

This creates the `users` table with the following fields:
- `id` - Auto-increment primary key
- `email` - Unique email address
- `password` - Bcrypt-hashed password
- `fullName` - Staff member name
- `role` - Admin, Doctor, or Nurse
- `department` - Department assignment
- `phone` - Contact phone
- `createdAt` - Registration timestamp
- `lastLogin` - Last login timestamp
- `isActive` - Account status flag

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`:
- **Register**: Create new staff accounts at `/register`
- **Login**: Authenticate at `/login`

## Features Implemented

### Registration (`/api/auth/register`)
- ✅ Email validation & duplicate check
- ✅ Password hashing (bcryptjs)
- ✅ 8+ character password requirement
- ✅ Client-side validation
- ✅ Error feedback

### Login (`/api/auth/login`)
- ✅ Email/password authentication
- ✅ Role-based login (optional role filter)
- ✅ Token generation
- ✅ Last login tracking
- ✅ Secure error handling

### Form UI
- ✅ Professional healthcare branding
- ✅ Real-time form validation
- ✅ Error/success messages
- ✅ Loading states
- ✅ Responsive design

## Security Considerations

For production deployment:

1. **Environment Variables**: Never commit `.env.local`
2. **HTTPS**: Use HTTPS in production
3. **SSL Certificates**: Update `trustServerCertificate: false` in `lib/db.ts` with proper certs
4. **JWT Tokens**: Replace base64 token generation with proper JWT implementation
5. **Password Policy**: Add complexity requirements (uppercase, numbers, symbols)
6. **Rate Limiting**: Implement rate limiting on auth endpoints
7. **Sessions**: Store sessions in database instead of localStorage
8. **CORS**: Configure CORS headers for API security

## Database Connection Troubleshooting

If you get connection errors:

1. **Check SQL Server is running**
   ```bash
   # Windows
   Services > SQL Server (SQLEXPRESS)
   
   # Or via PowerShell
   Get-Service -Name MSSQLSERVER
   ```

2. **Verify credentials**
   ```bash
   sqlcmd -S localhost -U sa -P "YourPassword123!"
   ```

3. **Check database exists**
   ```sql
   SELECT * FROM sys.databases WHERE name = 'medixora'
   ```

4. **Check users table**
   ```sql
   SELECT * FROM users
   ```

## API Endpoints

### Register
**POST** `/api/auth/register`

Request:
```json
{
  "fullName": "Dr. Sarah Jenkins",
  "email": "sarah@medistock.com",
  "password": "SecurePassword123!",
  "role": "Doctor",
  "department": "General",
  "phone": "+1-555-0000"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": 1
}
```

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "sarah@medistock.com",
  "password": "SecurePassword123!",
  "role": "Doctor"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "token": "base64-encoded-token"
}
```

## Next Steps

1. Test registration and login flows
2. Implement JWT-based session management
3. Add password reset functionality
4. Add email verification for registrations
5. Implement role-based access control (RBAC)
6. Add 2FA for sensitive accounts
