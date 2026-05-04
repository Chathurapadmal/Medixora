USE [medixora];

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- Create Users Table
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    username NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    [role] NVARCHAR(50) NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_users_status DEFAULT ('active'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSUTCDATETIME()
  );
END;

-- Unique index on email
IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'UX_users_email' AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
  CREATE UNIQUE INDEX UX_users_email ON dbo.users(email);
END;

-- Index on role
IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_users_role' AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
  CREATE INDEX IX_users_role ON dbo.users([role]);
END;

-- Index on status
IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_users_status' AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
  CREATE INDEX IX_users_status ON dbo.users(status);
END;

-- Register User Procedure
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_RegisterUser
  @username NVARCHAR(255),
  @email NVARCHAR(255),
  @password_hash NVARCHAR(255),
  @role NVARCHAR(50),
  @status NVARCHAR(20) = ''active'',
  @user_id INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM dbo.users WHERE email = @email)
  BEGIN
    RAISERROR(''Email already registered'', 16, 1);
    RETURN;
  END;

  INSERT INTO dbo.users (username, email, password_hash, [role], status)
  VALUES (@username, @email, @password_hash, @role, @status);

  SET @user_id = CONVERT(INT, SCOPE_IDENTITY());
END');

-- Authenticate User Procedure
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_AuthenticateUser
  @email NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    user_id,
    username,
    email,
    password_hash,
    [role],
    status,
    created_at
  FROM dbo.users
  WHERE email = @email;
END');

-- Get User by Email Procedure
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_GetUserByEmail
  @email NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    user_id,
    username,
    email,
    password_hash,
    [role],
    status,
    created_at
  FROM dbo.users
  WHERE email = @email;
END');

-- Deactivate User Procedure
EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_DeactivateUser
  @user_id INT
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.users
  SET status = ''inactive''
  WHERE user_id = @user_id;
END');

EXEC(N'
CREATE OR ALTER PROCEDURE dbo.sp_GetActiveUsers
  @role NVARCHAR(50) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @role IS NULL
  BEGIN
    SELECT user_id, username, email, [role], status, created_at
    FROM dbo.users
    WHERE status = ''active''
    ORDER BY created_at DESC;
  END
  ELSE
  BEGIN
    SELECT user_id, username, email, [role], status, created_at
    FROM dbo.users
    WHERE status = ''active'' AND [role] = @role
    ORDER BY created_at DESC;
  END;
END');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_ActiveUsers
AS
SELECT user_id, username, email, [role], status, created_at
FROM dbo.users
WHERE status = ''active''');

-- Verify Schema
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = 'users';
