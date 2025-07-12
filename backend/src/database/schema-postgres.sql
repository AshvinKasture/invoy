-- Invoy Invoice Application Database Schema (PostgreSQL)
-- Complete schema for invoice management application

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'manager')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Parties Table (Customers/Vendors)
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    party_type VARCHAR(20) CHECK (party_type IN ('customer', 'vendor', 'both')) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(50),
    pan_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for parties
CREATE INDEX idx_parties_type ON parties(party_type);
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_email ON parties(email);

-- Items Table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    base_price DECIMAL(18,2) NOT NULL,
    tax_percent DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for items
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_items_name ON items(name);

-- Banks Table
CREATE TABLE banks (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(100),
    account_type VARCHAR(20) CHECK (account_type IN ('savings', 'current')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for banks
CREATE INDEX idx_banks_account_number ON banks(account_number);
CREATE INDEX idx_banks_ifsc ON banks(ifsc_code);

-- Invoices Table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    party_id INTEGER NOT NULL,
    invoice_type VARCHAR(20) CHECK (invoice_type IN ('purchase', 'sale')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'finalized', 'paid', 'unpaid')) NOT NULL,
    invoice_date DATE NOT NULL,
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_invoices_party_id FOREIGN KEY (party_id) REFERENCES parties(id),
    CONSTRAINT fk_invoices_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_party_id ON invoices(party_id);
CREATE INDEX idx_invoices_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);

-- Invoice Items Table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity DECIMAL(18,2) NOT NULL,
    rate DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_invoice_items_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_item_id FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Create indexes for invoice items
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_item_id ON invoice_items(item_id);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('debit', 'credit')) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_transactions_bank_id FOREIGN KEY (bank_id) REFERENCES banks(id),
    CONSTRAINT fk_transactions_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_bank_id ON transactions(bank_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);

-- Invoice Transaction Links Table
CREATE TABLE invoice_transaction_links (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL,
    invoice_id INTEGER NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_invoice_transaction_links_transaction_id FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_transaction_links_invoice_id FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate links
    CONSTRAINT uq_invoice_transaction_links UNIQUE (transaction_id, invoice_id)
);

-- Create indexes for invoice transaction links
CREATE INDEX idx_invoice_transaction_links_transaction_id ON invoice_transaction_links(transaction_id);
CREATE INDEX idx_invoice_transaction_links_invoice_id ON invoice_transaction_links(invoice_id);

-- PostgreSQL-specific optimizations
-- Update triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_parties_modtime BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_items_modtime BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_banks_modtime BEFORE UPDATE ON banks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_invoice_items_modtime BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
