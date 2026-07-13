-- Supabase PostgreSQL schema for Container Barcode Scanner
-- Compatible with Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_by UUID NULL,
    closed_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_containers_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_containers_closed_by
        FOREIGN KEY (closed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS barcode_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID NOT NULL,
    barcode TEXT NOT NULL,
    scanned_by UUID NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_barcode_scans_container
        FOREIGN KEY (container_id)
        REFERENCES containers(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_barcode_scans_scanned_by
        FOREIGN KEY (scanned_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NULL,
    description TEXT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_containers_created_by ON containers(created_by);
CREATE INDEX IF NOT EXISTS idx_containers_closed_by ON containers(closed_by);
CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_container_id ON barcode_scans(container_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_by ON barcode_scans(scanned_by);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_scanned_at ON barcode_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_containers_updated_at
BEFORE UPDATE ON containers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO settings (setting_key, setting_value, description)
VALUES
    ('app_name', 'Container Scanner', 'Application display name'),
    ('default_status', 'OPEN', 'Default container status'),
    ('audit_enabled', 'true', 'Enable audit logging'),
    ('require_barcode', 'true', 'Require barcode for scans')
ON CONFLICT (setting_key) DO NOTHING;
