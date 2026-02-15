-- @format

-- Align category values to the current domain taxonomy.
-- If any previous data used MONITOR, treat it as PERIPHERAL.

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_category_chk;

UPDATE assets
SET category = 'PERIPHERAL'
WHERE category = 'MONITOR';

ALTER TABLE assets
  ADD CONSTRAINT assets_category_chk CHECK (
    category IN ('COMPUTER', 'PERIPHERAL', 'NETWORK_EQUIPMENT', 'SERVER_INFRA', 'MOBILE_DEVICE')
  );

