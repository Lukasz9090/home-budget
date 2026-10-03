-- Accounts. Emails are stored already normalised (trimmed, lower-case), so a plain unique index
-- enforces case-insensitive uniqueness.

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_uk ON users (email);
