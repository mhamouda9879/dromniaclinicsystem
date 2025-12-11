# Login Credentials

## Default Test Users

Once the database is set up and users are seeded, you can use these credentials:

### 🔐 Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (access to all dashboards)

### 🏥 Reception User
- **Username:** `reception`
- **Password:** `reception123`
- **Role:** Reception (access to Reception Dashboard)

### 👨‍⚕️ Doctor User
- **Username:** `doctor`
- **Password:** `doctor123`
- **Role:** Doctor (access to Doctor Dashboard)

---

## How to Create Users

### Option 1: Run the Seed Script (Recommended)

First, make sure PostgreSQL is running and the database is created:

```bash
# Create database
createdb obgyn_clinic

# Or using psql:
psql -U postgres
CREATE DATABASE obgyn_clinic;
\q
```

Then run the seed script:

```bash
cd backend
npm run seed:users
```

### Option 2: Register via API

Once the backend is running, you can register users via the API:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@clinic.com",
    "password": "admin123",
    "fullName": "Admin User",
    "role": "admin"
  }'
```

### Option 3: Create Users Directly in Database

If you have database access:

```sql
-- Note: Password must be hashed with bcrypt
-- Use an online bcrypt generator or hash it programmatically
-- Example hash for "admin123": $2b$10$rN8HXzXzXzXzXzXzXzXzXuXzXzXzXzXzXzXzXzXzXzXzXzXzX

INSERT INTO users (id, username, email, password, "fullName", role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@clinic.com',
  '$2b$10$rN8HXzXzXzXzXzXzXzXzXuXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzXzX',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);
```

---

## Quick Setup for Testing

1. **Start PostgreSQL:**
   ```bash
   # On macOS with Homebrew:
   brew services start postgresql
   
   # Or start manually:
   pg_ctl -D /usr/local/var/postgres start
   ```

2. **Create Database:**
   ```bash
   createdb obgyn_clinic
   ```

3. **Update .env file** (if needed):
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=obgyn_clinic
   ```

4. **Run Seed Script:**
   ```bash
   cd backend
   npm run seed:users
   ```

5. **Start Backend:**
   ```bash
   npm run start:dev
   ```

6. **Start Frontend:**
   ```bash
   cd ../frontend
   npm start
   ```

7. **Login at:** http://localhost:3001
   - Use any of the credentials above

---

## Testing Without Database

If you just want to see the UI without backend functionality:

1. Open http://localhost:3001 in your browser
2. You'll see the login page
3. The login won't work without the backend, but you can see the UI structure

---

## Notes

- All passwords are in plain text for testing purposes
- Change passwords in production!
- The seed script will skip users that already exist
- Admin users can access all dashboards
- Reception and Doctor users have role-based access restrictions

