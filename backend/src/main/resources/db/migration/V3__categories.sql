-- Categories (envelopes) owned by an account. Names are unique per owner, case-insensitively;
-- the unique index also serves as the owner_id index (owner_id is its first column).

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(40) NOT NULL,
    kind VARCHAR(16) NOT NULL CHECK (kind IN ('FLOW', 'CUMULATIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX categories_owner_name_uk ON categories (owner_id, lower(name));
