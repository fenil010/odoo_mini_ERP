-- Extend audit_logs table with intelligence and compliance tracking columns
ALTER TABLE audit_logs 
ADD COLUMN event_category VARCHAR(50) DEFAULT 'SYSTEM',
ADD COLUMN severity VARCHAR(20) DEFAULT 'INFO',
ADD COLUMN entity_name VARCHAR(255),
ADD COLUMN action_summary TEXT,
ADD COLUMN metadata JSONB,
ADD COLUMN impact_type VARCHAR(50),
ADD COLUMN impact_value DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN is_system_event BOOLEAN DEFAULT FALSE,
ADD COLUMN related_entity_type VARCHAR(100),
ADD COLUMN related_entity_id INT;

-- Populate existing logs with rich categorization, severity, and actor details
UPDATE audit_logs SET
  event_category = CASE
    WHEN entity_type = 'sales_orders' THEN 'SALES'
    WHEN entity_type = 'purchase_orders' THEN 'PURCHASE'
    WHEN entity_type = 'manufacturing_orders' THEN 'MANUFACTURING'
    WHEN entity_type = 'products' THEN 'INVENTORY'
    WHEN entity_type = 'inventory' THEN 'INVENTORY'
    WHEN entity_type = 'customers' THEN 'SALES'
    WHEN entity_type = 'vendors' THEN 'PURCHASE'
    WHEN entity_type = 'users' THEN 'AUTHENTICATION'
    ELSE 'SYSTEM'
  END,
  severity = CASE
    WHEN action IN ('DELETE', 'CANCEL') THEN 'WARNING'
    WHEN action IN ('RECEIVE', 'COMPLETE', 'DELIVER') THEN 'SUCCESS'
    ELSE 'INFO'
  END,
  action_summary = CASE
    WHEN action = 'CREATE' THEN CONCAT('Created new ', REPLACE(entity_type, '_', ' '), ' record')
    WHEN action = 'UPDATE' THEN CONCAT('Updated ', REPLACE(entity_type, '_', ' '), ' details')
    WHEN action = 'DELETE' THEN CONCAT('Deleted ', REPLACE(entity_type, '_', ' '), ' record')
    ELSE CONCAT(action, ' action on ', REPLACE(entity_type, '_', ' '))
  END,
  is_system_event = CASE WHEN user_id = 1 THEN TRUE ELSE FALSE END;
