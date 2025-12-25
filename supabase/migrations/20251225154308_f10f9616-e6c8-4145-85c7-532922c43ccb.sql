-- Add Google Analytics and Google Tag Manager settings
INSERT INTO site_settings (setting_key, setting_value, setting_type) VALUES
  ('google_analytics_id', '', 'text'),
  ('google_tag_manager_id', '', 'text')
ON CONFLICT (setting_key) DO NOTHING;