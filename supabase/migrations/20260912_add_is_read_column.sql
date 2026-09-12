-- Migration: Add missing is_read and status columns to contact_submissions table

ALTER TABLE IF EXISTS contact_submissions 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

ALTER TABLE IF EXISTS contact_submissions 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'unread';
