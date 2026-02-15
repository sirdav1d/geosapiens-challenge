-- @format

CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serial_number VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  acquisition_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT assets_serial_number_uk UNIQUE (serial_number),
  CONSTRAINT assets_category_chk CHECK (category IN ('COMPUTER', 'MONITOR', 'PERIPHERAL')),
  CONSTRAINT assets_status_chk CHECK (status IN ('IN_USE', 'IN_STOCK', 'MAINTENANCE', 'RETIRED')),
  CONSTRAINT assets_acquisition_date_chk CHECK (acquisition_date <= CURRENT_DATE)
);

CREATE INDEX assets_category_idx ON assets (category);
CREATE INDEX assets_status_idx ON assets (status);
CREATE INDEX assets_acquisition_date_idx ON assets (acquisition_date);
CREATE INDEX assets_name_idx ON assets (name);
