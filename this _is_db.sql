USE [medixora];

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

/*
	Medixora database helper script
	- Creates missing tables
	- Adds simple views for the dashboard and list pages
	- Keeps queries straightforward so the app can read from one place
*/

/* -------------------------------------------------------------------------- */
/* Core tables                                                                */
/* -------------------------------------------------------------------------- */

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

IF NOT EXISTS (
	SELECT 1
	FROM sys.indexes
	WHERE name = 'UX_users_email' AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
	CREATE UNIQUE INDEX UX_users_email ON dbo.users(email);
END;

IF OBJECT_ID('dbo.suppliers', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.suppliers (
		supplier_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		supplier_name NVARCHAR(255) NOT NULL,
		contact_person NVARCHAR(255) NULL,
		phone NVARCHAR(50) NULL,
		email NVARCHAR(255) NULL,
		address NVARCHAR(500) NULL,
		status NVARCHAR(20) NOT NULL CONSTRAINT DF_suppliers_status DEFAULT ('active')
	);
END;

IF OBJECT_ID('dbo.doctors', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.doctors (
		doctor_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		doctor_name NVARCHAR(255) NOT NULL,
		email NVARCHAR(255) NULL,
		phone NVARCHAR(50) NULL,
		specialization NVARCHAR(255) NULL,
		qualifications NVARCHAR(500) NULL,
		experience_years INT NULL,
		consultation_fee DECIMAL(18, 2) NULL,
		availability NVARCHAR(255) NULL,
		shift_start NVARCHAR(20) NULL,
		shift_end NVARCHAR(20) NULL,
		status NVARCHAR(20) NOT NULL CONSTRAINT DF_doctors_status DEFAULT ('active')
	);
END;

IF OBJECT_ID('dbo.inventory', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.inventory (
		medicine_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		item_code VARCHAR(100) NULL,
		medicine_name VARCHAR(255) NOT NULL,
		category VARCHAR(255) NULL,
		supplier_id INT NULL,
		stock_quantity INT NOT NULL CONSTRAINT DF_inventory_stock DEFAULT (0),
		minimum_stock_level INT NOT NULL CONSTRAINT DF_inventory_minimum DEFAULT (0),
		unit_price DECIMAL(18, 2) NOT NULL CONSTRAINT DF_inventory_price DEFAULT (0),
		expiry_date DATE NOT NULL,
		status VARCHAR(20) NOT NULL CONSTRAINT DF_inventory_status DEFAULT ('In Stock'),
		created_at DATETIME NOT NULL CONSTRAINT DF_inventory_created_at DEFAULT GETDATE()
	);
END;

IF NOT EXISTS (
	SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_inventory_suppliers'
)
BEGIN
	ALTER TABLE dbo.inventory
	ADD CONSTRAINT FK_inventory_suppliers
	FOREIGN KEY (supplier_id) REFERENCES dbo.suppliers(supplier_id);
END;

IF OBJECT_ID('dbo.patients', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.patients (
		patient_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		patient_name NVARCHAR(255) NOT NULL,
		email NVARCHAR(255) NULL,
		phone NVARCHAR(50) NULL,
		date_of_birth DATE NULL,
		gender NVARCHAR(20) NULL,
		address NVARCHAR(500) NULL,
		emergency_contact NVARCHAR(255) NULL,
		emergency_phone NVARCHAR(50) NULL,
		blood_type NVARCHAR(10) NULL,
		allergies NVARCHAR(500) NULL,
		status NVARCHAR(20) NOT NULL CONSTRAINT DF_patients_status DEFAULT ('active'),
		created_at DATETIME2 NOT NULL CONSTRAINT DF_patients_created_at DEFAULT SYSUTCDATETIME(),
		updated_at DATETIME2 NOT NULL CONSTRAINT DF_patients_updated_at DEFAULT SYSUTCDATETIME()
	);
END;

IF OBJECT_ID('dbo.medical_records', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.medical_records (
		record_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		patient_id INT NOT NULL,
		doctor_id INT NULL,
		visit_date DATETIME2 NOT NULL CONSTRAINT DF_medical_records_visit_date DEFAULT SYSUTCDATETIME(),
		diagnosis NVARCHAR(MAX) NULL,
		treatment NVARCHAR(MAX) NULL,
		prescription NVARCHAR(MAX) NULL,
		notes NVARCHAR(MAX) NULL,
		status NVARCHAR(20) NOT NULL CONSTRAINT DF_medical_records_status DEFAULT ('completed'),
		created_at DATETIME2 NOT NULL CONSTRAINT DF_medical_records_created_at DEFAULT SYSUTCDATETIME()
	);
END;

IF NOT EXISTS (
	SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_medical_records_patients'
)
BEGIN
	ALTER TABLE dbo.medical_records
	ADD CONSTRAINT FK_medical_records_patients
	FOREIGN KEY (patient_id) REFERENCES dbo.patients(patient_id) ON DELETE CASCADE;
END;

IF NOT EXISTS (
	SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_medical_records_doctors'
)
BEGIN
	ALTER TABLE dbo.medical_records
	ADD CONSTRAINT FK_medical_records_doctors
	FOREIGN KEY (doctor_id) REFERENCES dbo.doctors(doctor_id);
END;

/* -------------------------------------------------------------------------- */
/* Helpful views                                                               */
/* -------------------------------------------------------------------------- */

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_dashboard_summary
AS
SELECT
	(SELECT COUNT(1) FROM dbo.users) AS staffAccounts,
	(SELECT COUNT(1) FROM dbo.users WHERE LOWER(status) = ''active'') AS activeStaff,
	(SELECT COUNT(1) FROM dbo.inventory) AS totalMedicines,
	(SELECT COUNT(1)
	 FROM dbo.inventory
	 WHERE COALESCE(stock_quantity, 0) <= COALESCE(minimum_stock_level, 0)
	) AS lowStockMedicines,
	(SELECT COUNT(1)
	 FROM dbo.inventory
	 WHERE expiry_date < CAST(GETDATE() AS date)
	) AS expiredMedicines,
	(SELECT CAST(SUM(COALESCE(stock_quantity, 0) * COALESCE(unit_price, 0)) AS DECIMAL(18, 2))
	 FROM dbo.inventory
	) AS inventoryValue,
	(SELECT COUNT(1) FROM dbo.suppliers) AS totalSuppliers;
');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_recent_inventory
AS
SELECT TOP 5
	i.medicine_id AS id,
	i.medicine_name AS name,
	i.category,
	s.supplier_name AS supplier,
	COALESCE(i.stock_quantity, 0) AS stock,
	COALESCE(i.minimum_stock_level, 0) AS minimum,
	CAST(COALESCE(i.unit_price, 0) AS DECIMAL(18, 2)) AS price,
	CONVERT(VARCHAR(10), i.expiry_date, 23) AS expiryDate,
	CASE
		WHEN i.expiry_date < CAST(GETDATE() AS date) THEN ''Expired''
		WHEN COALESCE(i.stock_quantity, 0) <= 0 THEN ''Out of Stock''
		WHEN COALESCE(i.stock_quantity, 0) < COALESCE(i.minimum_stock_level, 0) THEN ''Low Stock''
		ELSE ''In Stock''
	END AS status
FROM dbo.inventory i
LEFT JOIN dbo.suppliers s ON s.supplier_id = i.supplier_id
ORDER BY i.medicine_id DESC;
');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_low_stock_inventory
AS
SELECT TOP 5
	i.medicine_id AS id,
	i.medicine_name AS name,
	i.category,
	s.supplier_name AS supplier,
	COALESCE(i.stock_quantity, 0) AS stock,
	COALESCE(i.minimum_stock_level, 0) AS minimum,
	CAST(COALESCE(i.unit_price, 0) AS DECIMAL(18, 2)) AS price,
	CONVERT(VARCHAR(10), i.expiry_date, 23) AS expiryDate,
	CASE
		WHEN COALESCE(i.stock_quantity, 0) <= 0 THEN ''Out of Stock''
		ELSE ''Low Stock''
	END AS status
FROM dbo.inventory i
LEFT JOIN dbo.suppliers s ON s.supplier_id = i.supplier_id
WHERE COALESCE(i.stock_quantity, 0) <= COALESCE(i.minimum_stock_level, 0)
ORDER BY COALESCE(i.stock_quantity, 0) ASC, i.medicine_id DESC;
');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_patients
AS
SELECT
	patient_id,
	patient_name,
	email,
	phone,
	date_of_birth,
	gender,
	address,
	emergency_contact,
	emergency_phone,
	blood_type,
	allergies,
	status,
	created_at,
	updated_at
FROM dbo.patients;
');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_doctors
AS
SELECT
	doctor_id,
	doctor_name,
	email,
	phone,
	specialization,
	qualifications,
	experience_years,
	consultation_fee,
	availability,
	shift_start,
	shift_end,
	status
FROM dbo.doctors;
');

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_medical_records
AS
SELECT
	mr.record_id,
	mr.patient_id,
	p.patient_name,
	mr.doctor_id,
	d.doctor_name,
	mr.visit_date,
	mr.diagnosis,
	mr.treatment,
	mr.prescription,
	mr.notes,
	mr.status,
	mr.created_at
FROM dbo.medical_records mr
LEFT JOIN dbo.patients p ON p.patient_id = mr.patient_id
LEFT JOIN dbo.doctors d ON d.doctor_id = mr.doctor_id;
');

/* -------------------------------------------------------------------------- */
/* Common read queries                                                         */
/* -------------------------------------------------------------------------- */

SELECT * FROM dbo.vw_dashboard_summary;
SELECT * FROM dbo.vw_recent_inventory;
SELECT * FROM dbo.vw_low_stock_inventory;
SELECT * FROM dbo.vw_patients ORDER BY patient_id DESC;
SELECT * FROM dbo.vw_doctors ORDER BY doctor_id DESC;
SELECT * FROM dbo.vw_medical_records ORDER BY visit_date DESC;

/* -------------------------------------------------------------------------- */
/* invoices + invoice_items tables                                             */
/* -------------------------------------------------------------------------- */

IF OBJECT_ID('dbo.invoices', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.invoices (
		invoice_id     INT IDENTITY(1,1)  NOT NULL PRIMARY KEY,
		invoice_number NVARCHAR(30)       NOT NULL CONSTRAINT DF_invoices_number DEFAULT (''),
		patient_id     INT                NULL,
		patient_name   NVARCHAR(255)      NOT NULL,
		doctor_id      INT                NULL,
		invoice_date   DATE               NOT NULL CONSTRAINT DF_invoices_date   DEFAULT CAST(GETDATE() AS date),
		due_date       DATE               NULL,
		treatment_cost DECIMAL(18,2)      NOT NULL CONSTRAINT DF_invoices_treat  DEFAULT (0),
		medicine_cost  DECIMAL(18,2)      NOT NULL CONSTRAINT DF_invoices_med    DEFAULT (0),
		discount       DECIMAL(18,2)      NOT NULL CONSTRAINT DF_invoices_disc   DEFAULT (0),
		total_amount   DECIMAL(18,2)      NOT NULL CONSTRAINT DF_invoices_total  DEFAULT (0),
		payment_method NVARCHAR(50)       NULL,
		status         NVARCHAR(20)       NOT NULL CONSTRAINT DF_invoices_status DEFAULT ('Pending'),
		notes          NVARCHAR(MAX)      NULL,
		created_by     INT                NULL,
		created_at     DATETIME2          NOT NULL CONSTRAINT DF_invoices_cat    DEFAULT SYSUTCDATETIME(),
		updated_at     DATETIME2          NOT NULL CONSTRAINT DF_invoices_uat    DEFAULT SYSUTCDATETIME()
	);
END;

-- Optional FK to patients / doctors (safe – only added if parent tables exist)
IF OBJECT_ID('dbo.patients','U') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_invoices_patients')
	ALTER TABLE dbo.invoices ADD CONSTRAINT FK_invoices_patients
	FOREIGN KEY (patient_id) REFERENCES dbo.patients(patient_id) ON DELETE SET NULL;

IF OBJECT_ID('dbo.doctors','U') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_invoices_doctors')
	ALTER TABLE dbo.invoices ADD CONSTRAINT FK_invoices_doctors
	FOREIGN KEY (doctor_id) REFERENCES dbo.doctors(doctor_id) ON DELETE SET NULL;

IF OBJECT_ID('dbo.invoice_items', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.invoice_items (
		item_id      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
		invoice_id   INT               NOT NULL REFERENCES dbo.invoices(invoice_id) ON DELETE CASCADE,
		description  NVARCHAR(255)     NOT NULL,
		item_type    NVARCHAR(50)      NOT NULL,   -- Treatment | Medicine | Other
		quantity     INT               NOT NULL CONSTRAINT DF_invoice_items_qty DEFAULT (1),
		unit_price   DECIMAL(18,2)     NOT NULL,
		line_total   AS (quantity * unit_price) PERSISTED
	);
END;

/* -------------------------------------------------------------------------- */
/* vw_invoices – used by billing list page                                     */
/* -------------------------------------------------------------------------- */

EXEC(N'
CREATE OR ALTER VIEW dbo.vw_invoices
AS
SELECT
	inv.invoice_id,
	inv.invoice_number,
	inv.patient_id,
	inv.patient_name,
	inv.doctor_id,
	d.doctor_name,
	inv.invoice_date,
	inv.due_date,
	CAST(inv.treatment_cost AS decimal(18,2)) AS treatment_cost,
	CAST(inv.medicine_cost  AS decimal(18,2)) AS medicine_cost,
	CAST(inv.discount       AS decimal(18,2)) AS discount,
	CAST(inv.total_amount   AS decimal(18,2)) AS total_amount,
	inv.payment_method,
	inv.status,
	inv.notes,
	inv.created_at,
	inv.updated_at
FROM dbo.invoices inv
LEFT JOIN dbo.doctors d ON d.doctor_id = inv.doctor_id;
');

SELECT * FROM dbo.vw_invoices ORDER BY invoice_id DESC;

