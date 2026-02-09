-- Add proof_of_awake_required to alarms
ALTER TABLE alarms
ADD COLUMN IF NOT EXISTS proof_of_awake_required BOOLEAN NOT NULL DEFAULT false;
