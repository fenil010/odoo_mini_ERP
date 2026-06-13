-- Update sale_price for raw materials and sub-assemblies to reasonable retail prices based on cost_price

UPDATE products SET sale_price = 1200.00 WHERE sku = 'SA-TABLE-TOP';
UPDATE products SET sale_price = 850.00 WHERE sku = 'SA-LEG-ASSY';
UPDATE products SET sale_price = 1000.00 WHERE sku = 'SA-CHAIR-FRAME';
UPDATE products SET sale_price = 600.00 WHERE sku = 'SA-SEAT-CUSH';

UPDATE products SET sale_price = 75.00 WHERE sku = 'RM-SCREW-M6-50';
UPDATE products SET sale_price = 350.00 WHERE sku = 'RM-STEEL-ROD';
UPDATE products SET sale_price = 500.00 WHERE sku = 'RM-TUBE-25';
UPDATE products SET sale_price = 40.00 WHERE sku = 'RM-RUBBER-CAP';
UPDATE products SET sale_price = 25.00 WHERE sku = 'RM-SANDPAPER';
UPDATE products SET sale_price = 200.00 WHERE sku = 'RM-FOAM-50';
UPDATE products SET sale_price = 300.00 WHERE sku = 'RM-FABRIC';
UPDATE products SET sale_price = 450.00 WHERE sku = 'RM-WHEEL-5';
UPDATE products SET sale_price = 550.00 WHERE sku = 'RM-WOOD-PANEL';
UPDATE products SET sale_price = 280.00 WHERE sku = 'RM-VARNISH';
UPDATE products SET sale_price = 100.00 WHERE sku = 'RM-WELD-ROD';
UPDATE products SET sale_price = 30.00 WHERE sku = 'RM-LEG-001';
UPDATE products SET sale_price = 150.00 WHERE sku = 'RM-TOP-001';
UPDATE products SET sale_price = 40.00 WHERE sku = 'RM-VARNISH-001';
UPDATE products SET sale_price = 12.00 WHERE sku = 'RM-SCREW-001';
UPDATE products SET sale_price = 15.00 WHERE sku = 'RM-BOLT-M8';
