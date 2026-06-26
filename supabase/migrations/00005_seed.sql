-- ============================================================
-- PRE-OWNED CAR INSPECTION PLATFORM
-- Migration 00005: Seed Data
-- ============================================================

-- Default Pricing Plans
INSERT INTO public.pricing_plans (name, slug, description, price, inspection_type, features, sort_order) VALUES
(
  'Basic Inspection',
  'basic',
  'Essential check covering key components for a quick overview',
  2499.00,
  'basic',
  '["Exterior & Interior check", "Engine visual inspection", "Tyre condition check", "Basic electronics test", "Test drive assessment", "Digital report with photos"]'::JSONB,
  1
),
(
  'Standard Inspection',
  'standard',
  'Comprehensive inspection covering all major vehicle systems',
  4999.00,
  'standard',
  '["Everything in Basic", "OBD-II diagnostic scan", "Underbody inspection", "Brake system check", "Suspension assessment", "AC & electrical systems", "Paint thickness measurement", "Detailed photo report with scores"]'::JSONB,
  2
),
(
  'Premium Inspection',
  'premium',
  'The most thorough pre-purchase inspection available',
  7999.00,
  'premium',
  '["Everything in Standard", "Road test with data logging", "Transmission fluid analysis", "Coolant & brake fluid check", "Complete electrical audit", "Accident history verification", "Market value assessment", "Video walkthrough", "Priority 24-hour turnaround"]'::JSONB,
  3
);

-- Default Inspection Template (Standard)
INSERT INTO public.inspection_templates (name, description, version, inspection_type, categories) VALUES
(
  'Standard Vehicle Inspection v1',
  'Comprehensive checklist for standard pre-owned vehicle inspection',
  1,
  'standard',
  '[
    {
      "name": "Exterior",
      "sort_order": 1,
      "items": [
        {"label": "Body Panels", "type": "condition", "required": true, "description": "Check for dents, scratches, rust"},
        {"label": "Paint Condition", "type": "condition", "required": true, "description": "Uniformity, peeling, fading"},
        {"label": "Windshield & Glass", "type": "condition", "required": true, "description": "Chips, cracks, seal integrity"},
        {"label": "Headlights & Tail Lights", "type": "condition", "required": true, "description": "Functionality, clarity, alignment"},
        {"label": "Bumpers", "type": "condition", "required": true, "description": "Damage, alignment, paint match"},
        {"label": "Side Mirrors", "type": "condition", "required": true, "description": "Adjustment, clarity, heating"},
        {"label": "Door Handles & Locks", "type": "condition", "required": true, "description": "Operation, alignment"},
        {"label": "Wiper Blades", "type": "condition", "required": false, "description": "Condition, streaking"}
      ]
    },
    {
      "name": "Interior",
      "sort_order": 2,
      "items": [
        {"label": "Seats & Upholstery", "type": "condition", "required": true, "description": "Wear, stains, tears"},
        {"label": "Dashboard & Controls", "type": "condition", "required": true, "description": "Cracks, warning lights, functionality"},
        {"label": "Steering Wheel", "type": "condition", "required": true, "description": "Wear, play, controls"},
        {"label": "Air Conditioning", "type": "condition", "required": true, "description": "Cooling, heating, fan speeds"},
        {"label": "Audio System", "type": "condition", "required": false, "description": "Speakers, Bluetooth, display"},
        {"label": "Interior Lights", "type": "condition", "required": false, "description": "All cabin, reading, trunk lights"},
        {"label": "Odometer Verification", "type": "condition", "required": true, "description": "Consistency with service records"},
        {"label": "Pedals & Floor", "type": "condition", "required": false, "description": "Wear patterns, mats, carpet"}
      ]
    },
    {
      "name": "Engine & Mechanical",
      "sort_order": 3,
      "items": [
        {"label": "Engine Bay Visual", "type": "condition", "required": true, "description": "Leaks, corrosion, hose condition"},
        {"label": "Engine Oil", "type": "condition", "required": true, "description": "Level, color, contamination"},
        {"label": "Coolant System", "type": "condition", "required": true, "description": "Level, color, leaks"},
        {"label": "Battery", "type": "condition", "required": true, "description": "Age, terminals, voltage"},
        {"label": "Belts & Hoses", "type": "condition", "required": true, "description": "Cracks, wear, tension"},
        {"label": "Engine Start & Idle", "type": "condition", "required": true, "description": "Start quality, idle smoothness, unusual sounds"},
        {"label": "Exhaust System", "type": "condition", "required": true, "description": "Smoke, leaks, sound"},
        {"label": "OBD-II Scan", "type": "condition", "required": true, "description": "Error codes, pending codes"}
      ]
    },
    {
      "name": "Transmission & Drivetrain",
      "sort_order": 4,
      "items": [
        {"label": "Transmission Fluid", "type": "condition", "required": true, "description": "Level, color, smell"},
        {"label": "Gear Shifting", "type": "condition", "required": true, "description": "Smoothness, delay, slipping"},
        {"label": "Clutch (Manual)", "type": "condition", "required": false, "description": "Engagement point, slipping, chatter"},
        {"label": "CV Joints / Boots", "type": "condition", "required": true, "description": "Clicking, torn boots, grease"},
        {"label": "Differential", "type": "condition", "required": false, "description": "Noise, fluid leaks"},
        {"label": "Driveshaft", "type": "condition", "required": false, "description": "Vibration, U-joints"}
      ]
    },
    {
      "name": "Brakes & Suspension",
      "sort_order": 5,
      "items": [
        {"label": "Brake Pads", "type": "condition", "required": true, "description": "Remaining life, even wear"},
        {"label": "Brake Discs / Rotors", "type": "condition", "required": true, "description": "Scoring, warping, thickness"},
        {"label": "Brake Fluid", "type": "condition", "required": true, "description": "Level, moisture content"},
        {"label": "Handbrake / Parking Brake", "type": "condition", "required": true, "description": "Holding ability, adjustment"},
        {"label": "Shock Absorbers", "type": "condition", "required": true, "description": "Bounce test, leaks"},
        {"label": "Springs", "type": "condition", "required": true, "description": "Sagging, broken coils"},
        {"label": "Steering Response", "type": "condition", "required": true, "description": "Play, alignment, power steering"}
      ]
    },
    {
      "name": "Electrical & Electronics",
      "sort_order": 6,
      "items": [
        {"label": "Power Windows", "type": "condition", "required": true, "description": "All windows, speed, auto function"},
        {"label": "Central Locking", "type": "condition", "required": true, "description": "Remote, key, all doors"},
        {"label": "Horn", "type": "condition", "required": true, "description": "Sound quality, loudness"},
        {"label": "Instrument Cluster", "type": "condition", "required": true, "description": "All gauges, warning lights"},
        {"label": "Infotainment System", "type": "condition", "required": false, "description": "Touchscreen, navigation, cameras"},
        {"label": "Charging Ports", "type": "condition", "required": false, "description": "USB, 12V, wireless charging"}
      ]
    },
    {
      "name": "Tyres & Wheels",
      "sort_order": 7,
      "items": [
        {"label": "Front Left Tyre", "type": "condition", "required": true, "description": "Tread depth, wear pattern, damage"},
        {"label": "Front Right Tyre", "type": "condition", "required": true, "description": "Tread depth, wear pattern, damage"},
        {"label": "Rear Left Tyre", "type": "condition", "required": true, "description": "Tread depth, wear pattern, damage"},
        {"label": "Rear Right Tyre", "type": "condition", "required": true, "description": "Tread depth, wear pattern, damage"},
        {"label": "Spare Tyre", "type": "condition", "required": false, "description": "Presence, condition, tools"},
        {"label": "Wheel Rims", "type": "condition", "required": true, "description": "Curb damage, cracks, alignment"}
      ]
    },
    {
      "name": "Documents & Compliance",
      "sort_order": 8,
      "items": [
        {"label": "Registration Certificate", "type": "condition", "required": true, "description": "Validity, owner name match"},
        {"label": "Insurance", "type": "condition", "required": true, "description": "Active, coverage type"},
        {"label": "Pollution Certificate", "type": "condition", "required": true, "description": "Validity"},
        {"label": "Service History", "type": "condition", "required": false, "description": "Regular servicing, authorized centers"},
        {"label": "Loan / Hypothecation", "type": "condition", "required": true, "description": "NOC status, clearance"}
      ]
    }
  ]'::JSONB
);

-- Default System Settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('company_info', '{"name": "PreCar Inspect", "email": "contact@precarinspect.com", "phone": "+91-XXXXXXXXXX", "address": "123 Business Park, City, India", "gst": "XXXXXXXXXXXXXXX", "website": "https://precarinspect.com"}'::JSONB, 'Company information for branding'),
  ('tax_config', '{"gst_rate": 18, "include_tax": true}'::JSONB, 'Tax configuration'),
  ('booking_config', '{"advance_booking_days": 30, "min_booking_hours": 4, "auto_assign": false, "cancellation_hours": 12}'::JSONB, 'Booking rules'),
  ('referral_config', '{"reward_amount": 200, "referee_discount": 10, "max_referrals_per_user": 50}'::JSONB, 'Referral program settings'),
  ('notification_config', '{"email_enabled": false, "sms_enabled": false, "push_enabled": false}'::JSONB, 'Notification channels');
