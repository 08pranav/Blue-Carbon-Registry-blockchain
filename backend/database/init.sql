-- Blue Carbon Registry Database Schema
-- Production-ready PostgreSQL initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('ADMIN', 'AUDITOR', 'NGO', 'BUYER');
CREATE TYPE project_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE ecosystem_type AS ENUM ('MANGROVE', 'SEAGRASS', 'SALT_MARSH');
CREATE TYPE credit_status AS ENUM ('MINTED', 'TRADED', 'RETIRED');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'NGO',
    organization VARCHAR(255),
    wallet_address VARCHAR(42),
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    ecosystem ecosystem_type NOT NULL,
    location VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area DECIMAL(10, 2) NOT NULL,
    carbon_credits_estimated INTEGER NOT NULL DEFAULT 0,
    carbon_credits_issued INTEGER DEFAULT 0,
    species TEXT,
    methodology VARCHAR(500),
    timeline VARCHAR(100),
    status project_status DEFAULT 'PENDING',
    submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verifier_id UUID REFERENCES users(id),
    token_id VARCHAR(100),
    blockchain_tx_hash VARCHAR(66),
    verification_notes TEXT,
    rejected_reason TEXT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence files table
CREATE TABLE evidence_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    ipfs_hash VARCHAR(100),
    evidence_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carbon credits table
CREATE TABLE carbon_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id),
    token_id VARCHAR(100) UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    current_owner_id UUID NOT NULL REFERENCES users(id),
    status credit_status DEFAULT 'MINTED',
    blockchain_tx_hash VARCHAR(66) NOT NULL,
    mint_price DECIMAL(10, 2),
    current_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_id UUID NOT NULL REFERENCES carbon_credits(id),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    price_per_credit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'PURCHASE', 'RETIRE', 'TRANSFER'
    blockchain_tx_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification activities table
CREATE TABLE verification_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id),
    verifier_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- 'STATUS_CHANGE', 'NOTE_ADDED', 'DOCUMENT_UPLOADED'
    old_status project_status,
    new_status project_status,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace listings table
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_id UUID NOT NULL REFERENCES carbon_credits(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    quantity INTEGER NOT NULL,
    price_per_credit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_submitter ON projects(submitter_id);
CREATE INDEX idx_projects_ecosystem ON projects(ecosystem);
CREATE INDEX idx_evidence_files_project ON evidence_files(project_id);
CREATE INDEX idx_carbon_credits_project ON carbon_credits(project_id);
CREATE INDEX idx_carbon_credits_owner ON carbon_credits(current_owner_id);
CREATE INDEX idx_transactions_credit ON transactions(credit_id);
CREATE INDEX idx_verification_activities_project ON verification_activities(project_id);
CREATE INDEX idx_marketplace_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_active ON marketplace_listings(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carbon_credits_updated_at BEFORE UPDATE ON carbon_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo/admin users (passwords should be hashed in production)
INSERT INTO users (id, name, email, password_hash, role, organization, is_email_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Dr. Rajesh Kumar', 'admin@bluecarbon.org', '$2b$10$placeholder_admin_hash', 'ADMIN', 'NCCR', TRUE),
    ('550e8400-e29b-41d4-a716-446655440001', 'Dr. Michael Chen', 'auditor@coastal.org', '$2b$10$placeholder_auditor_hash', 'AUDITOR', 'Global Audit Partners', TRUE),
    ('550e8400-e29b-41d4-a716-446655440002', 'Anjali Patel', 'ngo@ocean.org', '$2b$10$placeholder_ngo_hash', 'NGO', 'Ocean Conservation NGO', TRUE),
    ('550e8400-e29b-41d4-a716-446655440003', 'Sarah Johnson', 'buyer@corp.com', '$2b$10$placeholder_buyer_hash', 'BUYER', 'ClimateCorp Industries', TRUE);

-- Insert demo projects
INSERT INTO projects (id, title, description, ecosystem, location, latitude, longitude, area, carbon_credits_estimated, carbon_credits_issued, species, methodology, timeline, status, submitter_id, verified_at) VALUES
    ('PRJ-DEMO1', 'Sundarbans Mangrove Restoration Phase-I', 'Large-scale mangrove restoration project in the Sundarbans delta region.', 'MANGROVE', 'West Bengal, India', 21.9497, 88.2636, 150.00, 2500, 2500, 'Rhizophora mucronata, Avicennia marina', 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration', '3 years (2021-2024)', 'VERIFIED', '550e8400-e29b-41d4-a716-446655440002', '2024-09-15T00:00:00Z'),
    ('PRJ-DEMO2', 'Kerala Backwater Seagrass Conservation', 'Seagrass meadow restoration project in Kerala backwaters.', 'SEAGRASS', 'Kerala, India', 9.9312, 76.2673, 75.00, 1200, 1200, 'Zostera marina, Halophila ovalis', 'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration', '2 years (2022-2024)', 'VERIFIED', '550e8400-e29b-41d4-a716-446655440002', '2024-09-10T00:00:00Z');