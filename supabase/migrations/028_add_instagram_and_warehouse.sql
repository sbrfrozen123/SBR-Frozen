-- Add Instagram to branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS instagram varchar(255);

-- Add warehouse_id to transactions to track which warehouse the sale deducted from
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES warehouses(id);
