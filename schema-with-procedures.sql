-- ============================================
-- MediStock Users Table - Complete Setup
-- Database: master
-- ============================================

-- 1. Rebuild and Optimize Indexes
ALTER INDEX ALL ON master.dbo.users REBUILD;

-- 2. Update Statistics
UPDATE STATISTICS master.dbo.users;

-- ============================================
-- 3. Drop Existing Table (if needed)
-- ============================================
-- UNCOMMENT TO RECREATE TABLE
-- IF OBJECT_ID('dbo.users', 'U') IS NOT NULL
--   DROP TABLE dbo.users;

-- ============================================
-- 4. Create Users Table
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY IDENTITY(1,1),
  email NVARCHAR(255) NOT NULL UNIQUE,
  password NVARCHAR(255) NOT NULL,
  fullName NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Nurse')),
  department NVARCHAR(100) NULL,
  phone NVARCHAR(20) NULL,
  createdAt DATETIME DEFAULT GETUTCDATE(),
  lastLogin DATETIME NULL,
  isActive BIT DEFAULT 1,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_isActive (isActive)
);

-- ============================================
-- 5. Create Stored Procedure - Register User
-- ============================================
CREATE OR ALTER PROCEDURE sp_RegisterUser
  @email NVARCHAR(255),
  @password NVARCHAR(255),
  @fullName NVARCHAR(255),
  @role NVARCHAR(50),
  @department NVARCHAR(100) = NULL,
  @phone NVARCHAR(20) = NULL,
  @userId INT OUTPUT
AS
BEGIN
  BEGIN TRY
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = @email)
    BEGIN
      RAISERROR('Email already registered', 16, 1);
      RETURN;
    END

    -- Insert new user
    INSERT INTO users (email, password, fullName, role, department, phone, createdAt, isActive)
    VALUES (@email, @password, @fullName, @role, @department, @phone, GETUTCDATE(), 1);

    SET @userId = SCOPE_IDENTITY();
  END TRY
  BEGIN CATCH
    RAISERROR('Registration failed', 16, 1);
  END CATCH
END;
GO

-- ============================================
-- 6. Create Stored Procedure - Authenticate User
-- ============================================
CREATE OR ALTER PROCEDURE sp_AuthenticateUser
  @email NVARCHAR(255),
  @userId INT OUTPUT,
  @fullName NVARCHAR(255) OUTPUT,
  @role NVARCHAR(50) OUTPUT,
  @password NVARCHAR(255) OUTPUT
AS
BEGIN
  BEGIN TRY
    SELECT 
      @userId = id,
      @fullName = fullName,
      @role = role,
      @password = password
    FROM users 
    WHERE email = @email AND isActive = 1;

    IF @userId IS NULL
    BEGIN
      RAISERROR('User not found', 16, 1);
      RETURN;
    END

    -- Update last login
    UPDATE users SET lastLogin = GETUTCDATE() WHERE id = @userId;
  END TRY
  BEGIN CATCH
    RAISERROR('Authentication failed', 16, 1);
  END CATCH
END;
GO

-- ============================================
-- 7. Create Stored Procedure - Get User by Email
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetUserByEmail
  @email NVARCHAR(255)
AS
BEGIN
  SELECT id, email, fullName, role, department, phone, createdAt, lastLogin, isActive
  FROM users
  WHERE email = @email;
END;
GO

-- ============================================
-- 8. Create Stored Procedure - Update Last Login
-- ============================================
CREATE OR ALTER PROCEDURE sp_UpdateLastLogin
  @userId INT
AS
BEGIN
  UPDATE users SET lastLogin = GETUTCDATE() WHERE id = @userId;
END;
GO

-- ============================================
-- 9. Create Stored Procedure - Deactivate User
-- ============================================
CREATE OR ALTER PROCEDURE sp_DeactivateUser
  @userId INT
AS
BEGIN
  UPDATE users SET isActive = 0 WHERE id = @userId;
END;
GO

-- ============================================
-- 10. Create Stored Procedure - Get All Active Users
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetActiveUsers
  @role NVARCHAR(50) = NULL
AS
BEGIN
  IF @role IS NULL
    SELECT id, email, fullName, role, department, phone, createdAt, lastLogin
    FROM users
    WHERE isActive = 1
    ORDER BY createdAt DESC;
  ELSE
    SELECT id, email, fullName, role, department, phone, createdAt, lastLogin
    FROM users
    WHERE isActive = 1 AND role = @role
    ORDER BY createdAt DESC;
END;
GO

-- ============================================
-- 11. Create Stored Procedure - Update User Profile
-- ============================================
CREATE OR ALTER PROCEDURE sp_UpdateUserProfile
  @userId INT,
  @fullName NVARCHAR(255) = NULL,
  @department NVARCHAR(100) = NULL,
  @phone NVARCHAR(20) = NULL
AS
BEGIN
  UPDATE users
  SET 
    fullName = ISNULL(@fullName, fullName),
    department = ISNULL(@department, department),
    phone = ISNULL(@phone, phone)
  WHERE id = @userId;
END;
GO

-- ============================================
-- 12. Create Stored Procedure - Reset Password
-- ============================================
CREATE OR ALTER PROCEDURE sp_ResetPassword
  @userId INT,
  @newPassword NVARCHAR(255)
AS
BEGIN
  UPDATE users SET password = @newPassword WHERE id = @userId;
END;
GO

-- ============================================
-- 13. View - All Users (Active)
-- ============================================
CREATE OR ALTER VIEW vw_ActiveUsers AS
SELECT id, email, fullName, role, department, phone, createdAt, lastLogin
FROM users
WHERE isActive = 1;
GO

-- ============================================
-- 14. Verify Table Creation
-- ============================================
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users';

-- ============================================
-- 15. List All Indexes
-- ============================================
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('users');

-- ============================================
-- 16. Test Data (Optional)
-- ============================================
-- Uncomment to insert test users
-- INSERT INTO users (email, password, fullName, role, department, phone)
-- VALUES 
--   ('admin@medistock.com', 'hashed_password_here', 'Admin User', 'Admin', 'Administration', '+1-555-0001'),
--   ('doctor@medistock.com', 'hashed_password_here', 'Dr. John Smith', 'Doctor', 'General', '+1-555-0002'),
--   ('nurse@medistock.com', 'hashed_password_here', 'Jane Nurse', 'Nurse', 'General', '+1-555-0003');

-- ============================================
-- 17. Maintenance Queries
-- ============================================

-- Check table size
SELECT 
  OBJECT_NAME(p.object_id) AS TableName,
  SUM(p.rows) AS RowCount,
  SUM(a.total_pages) * 8 AS TotalSizeKB
FROM sys.partitions p
INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
WHERE OBJECT_NAME(p.object_id) = 'users'
GROUP BY p.object_id;

-- Check for fragmentation
SELECT 
  OBJECT_NAME(ps.object_id) AS TableName,
  i.name AS IndexName,
  ps.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.object_id = i.object_id 
  AND ps.index_id = i.index_id
WHERE OBJECT_NAME(ps.object_id) = 'users'
  AND ps.avg_fragmentation_in_percent > 0
ORDER BY ps.avg_fragmentation_in_percent DESC;
