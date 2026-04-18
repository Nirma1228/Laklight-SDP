-- Migration: Add images column to farmer_submissions
ALTER TABLE farmer_submissions 
ADD COLUMN images TEXT COMMENT 'JSON array of image URLs' AFTER storage_instructions;
