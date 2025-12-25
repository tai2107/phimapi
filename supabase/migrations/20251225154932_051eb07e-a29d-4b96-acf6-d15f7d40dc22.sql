-- Add Facebook App ID setting
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
  ('facebook_app_id', '', 'text')
ON CONFLICT (setting_key) DO NOTHING;