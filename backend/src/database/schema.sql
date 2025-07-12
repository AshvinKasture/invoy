-- Invoy Invoice Application Database Schema (MSSQL/Azure SQL)
-- Complete schema for invoice management application

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'manager')) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create index on email for faster lookups
CREATE INDEX IX_users_email ON users(email);
CREATE INDEX IX_users_role ON users(role);

-- Parties Table (Customers/Vendors)
CREATE TABLE parties (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    party_type VARCHAR(20) CHECK (party_type IN ('customer', 'vendor', 'both')) NOT NULL,
    email NVARCHAR(255),
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    gst_number NVARCHAR(50),
    pan_number NVARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create indexes for parties
CREATE INDEX IX_parties_type ON parties(party_type);
CREATE INDEX IX_parties_name ON parties(name);
CREATE INDEX IX_parties_email ON parties(email);

-- Items Table
CREATE TABLE items (
    id INT PRIMARY KEY IDENTITY(1,1),
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    unit_of_measure NVARCHAR(50) NOT NULL,
    base_price DECIMAL(18,2) NOT NULL,
    tax_percent DECIMAL(5,2),
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create indexes for items
CREATE INDEX IX_items_code ON items(code);
CREATE INDEX IX_items_name ON items(name);

-- Banks Table
CREATE TABLE banks (
    id INT PRIMARY KEY IDENTITY(1,1),
    bank_name NVARCHAR(255) NOT NULL,
    account_number NVARCHAR(50) NOT NULL,
    ifsc_code NVARCHAR(20) NOT NULL,
    branch_name NVARCHAR(100),
    account_type VARCHAR(20) CHECK (account_type IN ('savings', 'current')) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Create indexes for banks
CREATE INDEX IX_banks_account_number ON banks(account_number);
CREATE INDEX IX_banks_ifsc ON banks(ifsc_code);

-- Invoices Table
CREATE TABLE invoices (
    id INT PRIMARY KEY IDENTITY(1,1),
    invoice_number NVARCHAR(100) UNIQUE NOT NULL,
    party_id INT NOT NULL,
    invoice_type VARCHAR(20) CHECK (invoice_type IN ('purchase', 'sale')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'finalized', 'paid', 'unpaid')) NOT NULL,
    invoice_date DATE NOT NULL,
    notes TEXT,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_invoices_party_id FOREIGN KEY (party_id) REFERENCES parties(id),
    CONSTRAINT FK_invoices_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for invoices
CREATE INDEX IX_invoices_number ON invoices(invoice_number);
CREATE INDEX IX_invoices_party_id ON invoices(party_id);
CREATE INDEX IX_invoices_type ON invoices(invoice_type);
CREATE INDEX IX_invoices_status ON invoices(status);
CREATE INDEX IX_invoices_date ON invoices(invoice_date);
CREATE INDEX IX_invoices_created_by ON invoices(created_by);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    invoice_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity DECIMAL(18,2) NOT NULL,
    rate DECIMAL(18,2) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_invoice_items_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT FK_invoice_items_item_id FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Create indexes for invoice items
CREATE INDEX IX_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IX_invoice_items_item_id ON invoice_items(item_id);

-- Transactions Table
CREATE TABLE transactions (
    id INT PRIMARY KEY IDENTITY(1,1),
    bank_id INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('debit', 'credit')) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number NVARCHAR(100),
    notes TEXT,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    -- Foreign key constraints
    CONSTRAINT FK_transactions_bank_id FOREIGN KEY (bank_id) REFERENCES banks(id),
    CONSTRAINT FK_transactions_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for transactions
CREATE INDEX IX_transactions_bank_id ON transactions(bank_id);
CREATE INDEX IX_transactions_type ON transactions(transaction_type);
CREATE INDEX IX_transactions_date ON transactions(transaction_date);
CREATE INDEX IX_transactions_reference ON transactions(reference_number);
CREATE INDEX IX_transactions_created_by ON transactions(created_by);

-- Invoice Transaction Links Table
CREATE TABLE invoice_transaction_links (
    id INT PRIMARY KEY IDENTITY(1,1),
    transaction_id INT NOT NULL,
    invoice_id INT NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT FK_invoice_transaction_links_transaction_id FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT FK_invoice_transaction_links_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate links
    CONSTRAINT UQ_invoice_transaction_links UNIQUE (transaction_id, invoice_id)
);

-- Create indexes for invoice transaction links
CREATE INDEX IX_invoice_transaction_links_transaction_id ON invoice_transaction_links(transaction_id);
CREATE INDEX IX_invoice_transaction_links_invoice_id ON invoice_transaction_links(invoice_id);
