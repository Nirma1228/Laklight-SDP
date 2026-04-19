-- Migration to add extra proposed dates and variety to farmer_submissions
ALTER TABLE farmer_submissions 
ADD COLUMN IF NOT EXISTS variety VARCHAR(100) AFTER product_name,
ADD COLUMN IF NOT EXISTS proposed_date_2 DATE AFTER delivery_date,
ADD COLUMN IF NOT EXISTS proposed_date_3 DATE AFTER proposed_date_2;
