-- Migration: Add non-negative check constraints for product charges columns
-- Purpose: Ensure shipping, packing, manufacturing, and other charges are never negative.

ALTER TABLE products
  ADD CONSTRAINT check_shipping_charge CHECK (shipping_charge >= 0.00),
  ADD CONSTRAINT check_packing_charge CHECK (packing_charge >= 0.00),
  ADD CONSTRAINT check_manufacturing_charge CHECK (manufacturing_charge >= 0.00),
  ADD CONSTRAINT check_other_charge CHECK (other_charge >= 0.00);
