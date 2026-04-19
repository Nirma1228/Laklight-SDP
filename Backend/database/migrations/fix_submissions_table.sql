-- Migration to fix farmer_submissions table structure
-- Rename 'id' to 'submission_id' to match complete_final_schema.sql
-- Add missing columns
ALTER TABLE farmer_submissions CHANGE id submission_id INT AUTO_INCREMENT;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS variety VARCHAR(100) AFTER product_name;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS transport_method_id INT AFTER harvest_date;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS delivery_date DATE AFTER transport_method_id;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS proposed_date_2 DATE AFTER delivery_date;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS proposed_date_3 DATE AFTER proposed_date_2;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS storage_instructions TEXT AFTER proposed_date_3;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS images JSON AFTER storage_instructions;
ALTER TABLE farmer_submissions ADD COLUMN IF NOT EXISTS notes TEXT AFTER images;

-- Update types if needed (already mostly correct)
ALTER TABLE farmer_submissions MODIFY COLUMN IF NOT EXISTS rejection_reason TEXT AFTER status_id;
ALTER TABLE farmer_submissions MODIFY COLUMN IF NOT EXISTS submission_date DATETIME DEFAULT CURRENT_TIMESTAMP AFTER rejection_reason;
