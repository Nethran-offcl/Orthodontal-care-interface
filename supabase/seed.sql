-- Seed data ported from src/mocks/{doctors,staff,patients}.ts, reusing existing
-- mock string IDs so relationships (primary_doctor_id, etc.) stay intact across phases.

insert into public.doctors (id, name, title, registration_no, specialty, phone, email, color) values
  ('doc-rao', 'Dr. Arjun Rao', 'BDS, MDS (Periodontics)', 'KDC-19042', 'Periodontics & Implants', '+91 98450 11234', 'arjun.rao@sunrisedental.clinic', 'role-doctor'),
  ('doc-menon', 'Dr. Kavya Menon', 'BDS', 'KDC-22187', 'General & Cosmetic Dentistry', '+91 98450 55678', 'kavya.menon@sunrisedental.clinic', 'role-system')
on conflict (id) do nothing;

insert into public.staff_members (id, name, title, phone, email, role, status) values
  ('staff-priya', 'Priya Kulkarni', 'Front Desk Receptionist', '+91 98451 90045', 'priya.k@sunrisedental.clinic', 'receptionist', 'active'),
  ('staff-anil', 'Anil Deshmukh', 'Receptionist', '+91 98451 22310', 'anil.d@sunrisedental.clinic', 'receptionist', 'active'),
  ('staff-meera', 'Meera Iyer', 'Clinic Administrator', '+91 98452 77190', 'meera.iyer@sunrisedental.clinic', 'admin', 'active')
on conflict (id) do nothing;

insert into public.patients (
  id, name, phone, age, gender, address, lead_source, registered_on, allergies,
  marketing_consent, profile_completeness, balance_due, total_billed, primary_doctor_id,
  medical_conditions, current_medications, dental_history_notes
) values
  ('PT-1001', 'Meera Nair', '+91 98801 23456', 34, 'Female', '14 Lakeview Apartments, Indiranagar, Bengaluru', 'Referral', '2025-05-30', array['Penicillin'], false, 100, 3200, 28400, 'doc-rao', array['Hypothyroidism'], array['Levothyroxine 50mcg — once daily'], 'History of bruxism, wears a night guard. No prior implant work.'),
  ('PT-1002', 'Anita Sharma', '+91 99020 44718', 29, 'Female', '7B Palm Meadows, Whitefield, Bengaluru', 'Google', '2025-10-27', array[]::text[], true, 100, 0, 6200, 'doc-menon', null, null, null),
  ('PT-1003', 'Rohan Verma', '+91 98867 90211', 41, 'Male', '22 MG Road, Bengaluru', 'Walk-in', '2026-01-05', array[]::text[], false, 90, 18500, 92000, 'doc-rao', array['Type 2 Diabetes (controlled)'], array['Metformin 500mg — twice daily'], 'Previous root canal on tooth 46. Mild gum recession noted at last cleaning.'),
  ('PT-1004', 'Kavya Iyer', '+91 90360 12987', 8, 'Female', '3 Sunshine Colony, Jayanagar, Bengaluru', 'Referral', '2026-04-10', array[]::text[], true, 85, 0, 2400, 'doc-menon', null, null, null),
  ('PT-1005', 'Suresh Pillai', '+91 97400 65523', 58, 'Male', '56 Richmond Town, Bengaluru', 'Walk-in', '2025-02-09', array['Latex'], false, 100, 0, 54000, 'doc-rao', array['Hypertension'], array['Amlodipine 5mg — once daily'], 'Long-standing patient, excellent recall compliance over 4 years.'),
  ('PT-1006', 'Divya Krishnan', '+91 99804 33210', 26, 'Female', '19 HSR Layout, Bengaluru', 'Instagram', '2026-02-24', array[]::text[], true, 100, 4500, 68000, 'doc-menon', null, null, null),
  ('PT-1007', 'Arjun Mehta', '+91 98452 87102', 45, 'Male', '41 Koramangala 5th Block, Bengaluru', 'Google', '2026-06-14', array[]::text[], false, 75, 6800, 6800, 'doc-rao', null, null, null),
  ('PT-1008', 'Fatima Sheikh', '+91 96633 11890', 31, 'Female', '9 Frazer Town, Bengaluru', 'Instagram', '2026-05-05', array[]::text[], true, 100, 0, 9200, 'doc-menon', null, null, null),
  ('PT-1009', 'Vikram Singh', '+91 90084 55621', 52, 'Male', '2 Sadashivanagar, Bengaluru', 'Referral', '2025-09-07', array[]::text[], false, 100, 12000, 41000, 'doc-rao', null, null, null),
  ('PT-1010', 'Ananya Das', '+91 91082 34456', 19, 'Female', '31 BTM Layout, Bengaluru', 'Facebook', '2026-07-11', array[]::text[], false, 40, 0, 0, 'doc-menon', null, null, null),
  ('PT-1011', 'Ramesh Gupta', '+91 98440 21987', 63, 'Male', '18 Malleshwaram, Bengaluru', 'Walk-in', '2024-09-02', array['Sulfa drugs'], false, 95, 2100, 71500, 'doc-rao', array['Osteoporosis'], array['Alendronate 70mg — weekly'], 'On bisphosphonate therapy — flagged for extraction/surgical risk review before invasive procedures.'),
  ('PT-1012', 'Sneha Reddy', '+91 99459 78120', 37, 'Female', '27 Domlur, Bengaluru', 'Google', '2025-12-06', array[]::text[], true, 100, 0, 15600, 'doc-menon', null, null, null)
on conflict (id) do nothing;

-- Ported from src/mocks/appointments.ts. Dates were relative to "today" at mock
-- eval time; here they're pinned to absolute dates computed as of when this seed
-- was written (2026-07-14), so "today's appointments" will only line up with the
-- calendar's actual today on that date — re-run with adjusted dates if you seed later.
insert into public.appointments (id, patient_id, doctor_id, date, start_time, duration_min, status, reason, is_follow_up, treatment_plan_id) values
  ('APT-3001', 'PT-1001', 'doc-rao', '2026-07-14', '09:00', 45, 'completed', 'Root canal — stage 2 (molar)', true, 'TP-4001'),
  ('APT-3002', 'PT-1005', 'doc-rao', '2026-07-14', '09:45', 30, 'completed', 'Denture fitting check', true, null),
  ('APT-3003', 'PT-1002', 'doc-menon', '2026-07-14', '10:30', 30, 'checked-in', '6-month cleaning', true, null),
  ('APT-3004', 'PT-1010', 'doc-menon', '2026-07-14', '11:15', 45, 'confirmed', 'New patient consultation', false, null),
  ('APT-3005', 'PT-1003', 'doc-rao', '2026-07-14', '14:00', 60, 'confirmed', 'Implant placement — stage 1', true, 'TP-4002'),
  ('APT-3006', 'PT-1006', 'doc-menon', '2026-07-14', '15:30', 20, 'confirmed', 'Ortho adjustment', true, 'TP-4003'),
  ('APT-3007', 'PT-1007', 'doc-rao', '2026-07-14', '16:30', 30, 'pending', 'Wisdom tooth follow-up', true, null),
  ('APT-3008', 'PT-1009', 'doc-rao', '2026-07-15', '10:00', 45, 'confirmed', 'Crown fitting', true, 'TP-4004'),
  ('APT-3009', 'PT-1004', 'doc-menon', '2026-07-15', '11:00', 20, 'confirmed', 'Fluoride application', true, null),
  ('APT-3010', 'PT-1012', 'doc-menon', '2026-07-15', '16:00', 30, 'pending', 'Cleaning recall', true, null),
  ('APT-3011', 'PT-1011', 'doc-rao', '2026-07-16', '09:30', 45, 'confirmed', 'Periodontal maintenance', true, null),
  ('APT-3012', 'PT-1008', 'doc-menon', '2026-07-16', '12:00', 30, 'confirmed', 'Whitening touch-up', false, null),
  ('APT-3013', 'PT-1001', 'doc-rao', '2026-07-17', '10:00', 30, 'pending', 'Root canal — stage 3 (final)', true, 'TP-4001'),
  ('APT-3014', 'PT-1003', 'doc-rao', '2026-07-19', '15:00', 60, 'confirmed', 'Implant placement — stage 2', true, 'TP-4002'),
  ('APT-3015', 'PT-1006', 'doc-menon', '2026-07-20', '15:30', 20, 'confirmed', 'Ortho adjustment', true, 'TP-4003'),
  ('APT-3016', 'PT-1006', 'doc-menon', '2026-07-13', '10:00', 20, 'completed', 'Ortho adjustment', true, 'TP-4003'),
  ('APT-3017', 'PT-1007', 'doc-rao', '2026-07-13', '11:30', 45, 'completed', 'Wisdom tooth extraction', false, null),
  ('APT-3018', 'PT-1009', 'doc-rao', '2026-07-12', '09:00', 45, 'completed', 'Crown preparation', false, 'TP-4004'),
  ('APT-3019', 'PT-1011', 'doc-rao', '2026-07-11', '14:00', 30, 'no-show', 'Periodontal check', true, null),
  ('APT-3020', 'PT-1005', 'doc-rao', '2026-07-07', '10:00', 45, 'completed', 'Denture impression', false, null)
on conflict (id) do nothing;

-- Ported from src/mocks/{treatmentPlans,chartEntries,prescriptions}.ts. Dates
-- pinned to absolute values as of 2026-07-14, same caveat as the appointments
-- seed above. Run 0005_appointments_treatment_plan_fk.sql AFTER this block.
insert into public.treatment_plans (id, patient_id, title, created_on, created_by_doctor_id, status, stages) values
  ('TP-4001', 'PT-1001', 'Root Canal Treatment — Lower Left Molar (36)', '2026-06-23', 'doc-rao', 'active', '[
    {"id":"TP-4001-S1","label":"Access opening & pulp extirpation","targetDate":"2026-06-23","status":"completed","cost":2200},
    {"id":"TP-4001-S2","label":"Canal cleaning & shaping","targetDate":"2026-07-14","status":"completed","cost":3400,"notes":"Canals cleaned and shaped, calcium hydroxide dressing placed."},
    {"id":"TP-4001-S3","label":"Obturation & crown prep","targetDate":"2026-07-17","status":"planned","cost":4800}
  ]'::jsonb),
  ('TP-4002', 'PT-1003', 'Single Tooth Implant — Upper Right First Molar (16)', '2026-05-30', 'doc-rao', 'active', '[
    {"id":"TP-4002-S1","label":"Consultation & CBCT scan","targetDate":"2026-05-30","status":"completed","cost":1500},
    {"id":"TP-4002-S2","label":"Implant placement (stage 1)","targetDate":"2026-07-14","status":"in-progress","cost":38000,"notes":"Osseointegration period of 3 months expected before stage 2."},
    {"id":"TP-4002-S3","label":"Implant placement (stage 2) — abutment","targetDate":"2026-07-19","status":"planned","cost":12000},
    {"id":"TP-4002-S4","label":"Final crown placement","targetDate":"2026-10-17","status":"planned","cost":22000}
  ]'::jsonb),
  ('TP-4003', 'PT-1006', 'Orthodontic Treatment — Metal Braces', '2026-02-24', 'doc-menon', 'active', '[
    {"id":"TP-4003-S1","label":"Bracket placement","targetDate":"2026-02-24","status":"completed","cost":45000},
    {"id":"TP-4003-S2","label":"Monthly adjustment — month 4","targetDate":"2026-07-13","status":"completed","cost":1500},
    {"id":"TP-4003-S3","label":"Monthly adjustment — month 5","targetDate":"2026-07-14","status":"in-progress","cost":1500},
    {"id":"TP-4003-S4","label":"Monthly adjustment — month 6","targetDate":"2026-07-20","status":"planned","cost":1500}
  ]'::jsonb),
  ('TP-4004', 'PT-1009', 'Crown Replacement — Upper Left Premolar (24)', '2026-06-30', 'doc-rao', 'active', '[
    {"id":"TP-4004-S1","label":"Crown preparation & impression","targetDate":"2026-07-12","status":"completed","cost":3000},
    {"id":"TP-4004-S2","label":"Crown fitting & cementation","targetDate":"2026-07-15","status":"planned","cost":9000}
  ]'::jsonb),
  ('TP-4005', 'PT-1005', 'Complete Denture — Upper & Lower', '2026-05-15', 'doc-rao', 'completed', '[
    {"id":"TP-4005-S1","label":"Primary & final impressions","targetDate":"2026-05-15","status":"completed","cost":2000},
    {"id":"TP-4005-S2","label":"Trial denture fitting","targetDate":"2026-06-14","status":"completed","cost":2000},
    {"id":"TP-4005-S3","label":"Final denture delivery & check","targetDate":"2026-07-14","status":"completed","cost":50000}
  ]'::jsonb),
  ('TP-4006', 'PT-1011', 'Periodontal Maintenance Programme', '2025-12-26', 'doc-rao', 'active', '[
    {"id":"TP-4006-S1","label":"Scaling & root planing","targetDate":"2025-12-26","status":"completed","cost":3500},
    {"id":"TP-4006-S2","label":"Quarterly maintenance visit","targetDate":"2026-07-11","status":"completed","cost":1800,"notes":"Patient did not show up — rescheduled by phone, no WhatsApp confirmation received."},
    {"id":"TP-4006-S3","label":"Quarterly maintenance visit","targetDate":"2026-07-16","status":"planned","cost":1800}
  ]'::jsonb)
on conflict (id) do nothing;

insert into public.chart_entries (id, patient_id, date, doctor_id, tooth_area, diagnosis, procedure, notes, source, transcript) values
  ('CE-5001', 'PT-1001', '2026-06-23', 'doc-rao', '36 (Lower Left Molar)', 'Irreversible pulpitis', 'Access opening, pulp extirpation', 'Patient reported spontaneous nocturnal pain for 5 days. Local anesthesia administered, access cavity prepared, pulp chamber cleaned.', 'manual', null),
  ('CE-5002', 'PT-1001', '2026-07-14', 'doc-rao', '36 (Lower Left Molar)', 'Post-pulpectomy, canals negotiated', 'Canal cleaning & shaping, calcium hydroxide dressing', 'All three canals cleaned and shaped to working length. Copious irrigation with sodium hypochlorite. Calcium hydroxide intracanal dressing placed, temporary restoration. No tenderness on percussion.', 'voice', 'Okay, this is Meera Nair, tooth 36. Continuing the root canal from last visit. Cleaned and shaped all three canals, irrigated well with sodium hypochlorite. Put in a calcium hydroxide dressing and a temporary filling on top. No tenderness when I tapped on it. Patient tolerated the procedure well. Plan is obturation and crown prep at the next visit, about three days from now.'),
  ('CE-5003', 'PT-1003', '2026-05-30', 'doc-rao', '16 (Upper Right First Molar)', 'Missing tooth, adequate bone volume on CBCT', 'Consultation, CBCT scan review', 'CBCT shows 9mm bone height, 6mm width — sufficient for a standard implant. Treatment plan discussed and accepted.', 'manual', null),
  ('CE-5004', 'PT-1003', '2026-07-14', 'doc-rao', '16 (Upper Right First Molar)', 'Post-extraction healed ridge, ready for implant', 'Implant placement — stage 1 (fixture placement)', 'Flap raised, osteotomy sequence completed, 4.3x10mm implant placed with good primary stability (torque 35 Ncm). Cover screw placed, flap sutured. Osseointegration period of roughly 12 weeks before stage 2.', 'voice', 'Rohan Verma, tooth 16, implant placement today. Raised the flap, did the osteotomy sequence step by step, placed a 4.3 by 10 millimeter implant. Got good primary stability, torque was around 35 Newton centimeters. Put the cover screw on, sutured the flap closed. He''ll need about twelve weeks for osseointegration before we go to stage two. Gave him the usual post-op instructions and an antibiotic course.'),
  ('CE-5005', 'PT-1006', '2026-07-13', 'doc-menon', 'Full arch (Braces)', 'Ongoing orthodontic correction, month 4', 'Archwire adjustment, elastic replacement', 'Good progress on overjet correction. Replaced elastics, adjusted archwire tension. Next adjustment in 4 weeks.', 'manual', null),
  ('CE-5006', 'PT-1009', '2026-07-12', 'doc-rao', '24 (Upper Left Premolar)', 'Fractured old crown, tooth structure intact', 'Crown preparation, impression', 'Old crown removed, tooth prepared for new PFM crown. Digital impression taken, shade matched A2. Temporary crown cemented.', 'manual', null),
  ('CE-5007', 'PT-1007', '2026-07-13', 'doc-rao', '38 (Lower Left Third Molar)', 'Impacted wisdom tooth, recurrent pericoronitis', 'Surgical extraction', 'Surgical extraction performed under local anesthesia, mesioangular impaction. Sutures placed, hemostasis achieved. Post-op instructions and analgesics prescribed.', 'voice', 'Arjun Mehta, extracted the lower left wisdom tooth today, number 38. It was mesioangular impaction, needed a surgical approach — raised a flap, did some bone removal, sectioned the tooth and took it out in two pieces. Placed three sutures, bleeding was controlled fine. Told him ice packs for today, soft diet for a few days, and I''m putting him on an antibiotic and painkiller course. Review in a week to remove sutures if needed.'),
  ('CE-5008', 'PT-1011', '2025-12-26', 'doc-rao', 'Full mouth', 'Generalized moderate periodontitis', 'Scaling & root planing', 'Full mouth scaling and root planing completed over two sittings. Oral hygiene instructions given. Quarterly maintenance recommended.', 'manual', null),
  ('CE-5009', 'PT-1005', '2026-07-14', 'doc-rao', 'Full arch (Denture)', 'Edentulous, denture delivered', 'Final denture delivery & bite check', 'Both dentures delivered and adjusted for comfort. Occlusion checked and balanced. Patient advised on care and adaptation period.', 'manual', null)
on conflict (id) do nothing;

insert into public.prescriptions (id, patient_id, chart_entry_id, date, doctor_id, medicines, notes) values
  ('RX-6001', 'PT-1001', 'CE-5002', '2026-07-14', 'doc-rao', '[
    {"name":"Amoxicillin 500mg","dosage":"1 capsule","frequency":"Thrice daily","duration":"5 days"},
    {"name":"Ibuprofen 400mg","dosage":"1 tablet","frequency":"As needed for pain","duration":"3 days"}
  ]'::jsonb, 'Continue calcium hydroxide dressing until next visit. Avoid chewing on the left side.'),
  ('RX-6002', 'PT-1003', 'CE-5004', '2026-07-14', 'doc-rao', '[
    {"name":"Amoxicillin 500mg","dosage":"1 capsule","frequency":"Twice daily","duration":"6 days"},
    {"name":"Aceclofenac 100mg","dosage":"1 tablet","frequency":"Twice daily","duration":"4 days"},
    {"name":"Chlorhexidine mouthwash 0.2%","dosage":"10ml rinse","frequency":"Twice daily","duration":"10 days"}
  ]'::jsonb, 'Soft diet for 48 hours. Return if swelling or pain increases beyond day 3.'),
  ('RX-6003', 'PT-1007', 'CE-5007', '2026-07-13', 'doc-rao', '[
    {"name":"Amoxicillin 500mg","dosage":"1 capsule","frequency":"Thrice daily","duration":"5 days"},
    {"name":"Aceclofenac + Paracetamol","dosage":"1 tablet","frequency":"Twice daily","duration":"3 days"}
  ]'::jsonb, 'Ice pack for first 24 hours, then warm saline rinses from day 2.')
on conflict (id) do nothing;

-- Ported from src/mocks/invoices.ts. Same date-pinning caveat as earlier seeds.
insert into public.invoices (id, patient_id, date, items, total, paid, status) values
  ('INV-8001', 'PT-1001', '2026-06-23', '[{"label":"Root canal — stage 1 (access & extirpation)","amount":2200}]'::jsonb, 2200, 2200, 'paid'),
  ('INV-8002', 'PT-1001', '2026-07-14', '[{"label":"Root canal — stage 2 (cleaning & shaping)","amount":3400}]'::jsonb, 3400, 200, 'partial'),
  ('INV-8003', 'PT-1002', '2026-07-12', '[{"label":"6-month cleaning & polishing","amount":1800}]'::jsonb, 1800, 1800, 'paid'),
  ('INV-8004', 'PT-1003', '2026-05-30', '[{"label":"Consultation & CBCT scan","amount":1500}]'::jsonb, 1500, 1500, 'paid'),
  ('INV-8005', 'PT-1003', '2026-07-14', '[{"label":"Implant placement — stage 1","amount":38000}]'::jsonb, 38000, 19500, 'partial'),
  ('INV-8006', 'PT-1006', '2026-02-24', '[{"label":"Braces — bracket placement","amount":45000}]'::jsonb, 45000, 45000, 'paid'),
  ('INV-8007', 'PT-1006', '2026-07-13', '[{"label":"Monthly adjustment — month 4","amount":1500}]'::jsonb, 1500, 0, 'pending'),
  ('INV-8008', 'PT-1006', '2026-07-14', '[{"label":"Monthly adjustment — month 5","amount":1500}]'::jsonb, 1500, 0, 'pending'),
  ('INV-8009', 'PT-1007', '2026-07-13', '[{"label":"Surgical extraction — 38","amount":6000},{"label":"Post-op medication kit","amount":800}]'::jsonb, 6800, 0, 'pending'),
  ('INV-8010', 'PT-1009', '2026-07-12', '[{"label":"Crown preparation & impression","amount":3000}]'::jsonb, 3000, 3000, 'paid'),
  ('INV-8011', 'PT-1009', '2026-07-12', '[{"label":"Crown — lab & fitting (advance)","amount":9000}]'::jsonb, 9000, 0, 'pending'),
  ('INV-8012', 'PT-1011', '2026-07-11', '[{"label":"Quarterly periodontal maintenance","amount":1800}]'::jsonb, 1800, 0, 'pending'),
  ('INV-8013', 'PT-1005', '2026-07-14', '[{"label":"Complete denture — final delivery","amount":50000}]'::jsonb, 50000, 50000, 'paid'),
  ('INV-8014', 'PT-1008', '2026-05-05', '[{"label":"Professional whitening","amount":8000}]'::jsonb, 8000, 8000, 'paid'),
  ('INV-8015', 'PT-1004', '2026-04-10', '[{"label":"Fluoride application & consultation","amount":1200}]'::jsonb, 1200, 1200, 'paid')
on conflict (id) do nothing;

-- Ported from src/mocks/{reminders,broadcasts,templates,escalations,notifications,auditLog}.ts.
-- Same date-pinning caveat as earlier seeds (pinned as of 2026-07-14).
insert into public.reminders (id, patient_id, appointment_id, treatment_plan_id, due_date, status, sent_at) values
  ('REM-1', 'PT-1009', 'APT-3008', 'TP-4004', '2026-07-15', 'rescheduled', '2026-07-13T09:00:00+00:00'),
  ('REM-2', 'PT-1004', 'APT-3009', null, '2026-07-15', 'sent', '2026-07-14T09:00:00+00:00'),
  ('REM-3', 'PT-1012', 'APT-3010', null, '2026-07-15', 'confirmed', '2026-07-13T09:00:00+00:00'),
  ('REM-4', 'PT-1011', 'APT-3011', 'TP-4006', '2026-07-16', 'scheduled', null),
  ('REM-5', 'PT-1011', 'APT-3019', 'TP-4006', '2026-07-11', 'no-response', '2026-07-10T09:00:00+00:00'),
  ('REM-6', 'PT-1003', 'APT-3005', 'TP-4002', '2026-07-14', 'confirmed', '2026-07-13T09:00:00+00:00'),
  ('REM-7', 'PT-1006', 'APT-3006', 'TP-4003', '2026-07-14', 'confirmed', '2026-07-13T09:00:00+00:00'),
  ('REM-8', 'PT-1001', 'APT-3013', 'TP-4001', '2026-07-17', 'scheduled', null),
  ('REM-9', 'PT-1007', 'APT-3007', null, '2026-07-14', 'no-response', '2026-07-13T18:00:00+00:00'),
  ('REM-10', 'PT-1003', 'APT-3014', 'TP-4002', '2026-07-19', 'scheduled', null)
on conflict (id) do nothing;

insert into public.broadcasts (id, title, message, audience, audience_count, status, created_by, created_at, sent_at, delivered_count, read_count, review_note) values
  ('BC-1', 'Independence Day Holiday Notice', 'Dear {{patient_name}}, Sunrise Dental will be closed on 15th August for Independence Day. We will resume regular hours on 16th August. Wishing you good health!', 'All active patients', 312, 'sent', 'Priya Kulkarni', '2025-08-18T11:00:00+00:00', '2025-08-19T09:00:00+00:00', 308, 261, null),
  ('BC-2', 'Monsoon Oral Care Tips', 'Dear {{patient_name}}, the monsoon season can increase sensitivity and gum issues. A quick tip from Dr. Rao: rinse with warm salt water daily and avoid very cold food. Book a check-up if you notice any discomfort — link in our WhatsApp profile.', 'All active patients', 318, 'sent', 'Priya Kulkarni', '2026-06-04T10:00:00+00:00', '2026-06-05T09:00:00+00:00', 315, 290, null),
  ('BC-3', 'Ganesh Chaturthi Closure Notice', 'Dear {{patient_name}}, Sunrise Dental will be closed for Ganesh Chaturthi this Thursday and Friday. For emergencies, please call the clinic number. We will resume regular hours on Saturday.', 'All active patients', 320, 'pending-approval', 'Priya Kulkarni', '2026-07-14T08:45:00+00:00', null, null, null, null),
  ('BC-4', 'New Saturday Evening Slots', 'Dear {{patient_name}}, we now have Saturday evening slots (5–8 PM) available with Dr. Menon. Reply to this message to book one.', 'Patients with pending follow-ups', 46, 'draft', 'Priya Kulkarni', '2026-07-14T09:30:00+00:00', null, null, null, null),
  ('BC-5', '20% Off Teeth Whitening — Festive Offer', 'Dear {{patient_name}}, get 20% off professional teeth whitening this festive season! Limited slots, book now.', 'All active patients', 320, 'rejected', 'Priya Kulkarni', '2026-07-02T14:00:00+00:00', null, null, null, 'Let''s not run discount promotions over WhatsApp broadcast — it changes the tone of this channel. Happy to feature it on Instagram instead, with a proper offer page. — Dr. Rao')
on conflict (id) do nothing;

insert into public.message_templates (id, name, category, body, approval_status, language, used_count) values
  ('TPL-1', 'Follow-up Reminder — Patient', 'Reminder', 'Hi {{patient_name}}, this is a reminder from Sunrise Dental that your follow-up visit with {{doctor_name}} is scheduled for {{date}} at {{time}}. Please reply YES to confirm or call us to reschedule.', 'approved', 'English', 486),
  ('TPL-2', 'Follow-up Reminder — Doctor Copy', 'Reminder', 'Reminder: {{patient_name}} (Patient ID: {{patient_id}}) has a follow-up scheduled {{date}} at {{time}}.', 'approved', 'English', 486),
  ('TPL-3', 'Appointment Confirmation Reply', 'Confirmation', 'Thank you, {{patient_name}}! Your appointment on {{date}} at {{time}} is confirmed. We look forward to seeing you.', 'approved', 'English', 402),
  ('TPL-4', 'Reschedule Acknowledgment', 'Reschedule', 'No problem, {{patient_name}}. Your appointment has been moved to {{new_date}} at {{new_time}}. See you then!', 'approved', 'English', 118),
  ('TPL-5', 'Broadcast — Holiday Closure', 'Broadcast', 'Dear {{patient_name}}, {{clinic_name}} will be closed on {{date}} for {{reason}}. We will resume regular hours on {{resume_date}}. Wishing you good health!', 'approved', 'English', 6),
  ('TPL-6', 'Broadcast — General Announcement', 'Broadcast', 'Dear {{patient_name}}, {{message_body}}', 'approved', 'English', 9),
  ('TPL-7', 'Follow-up Reminder — Kannada', 'Reminder', '{{patient_name}} ಅವರೇ, {{doctor_name}} ಅವರೊಂದಿಗಿನ ನಿಮ್ಮ ಫಾಲೋ-ಅಪ್ ಭೇಟಿ {{date}} ರಂದು {{time}} ಗೆ ನಿಗದಿಯಾಗಿದೆ.', 'pending', 'Kannada', 0)
on conflict (id) do nothing;

insert into public.escalations (id, conversation_id, patient_id, reason, priority, assigned_role, assigned_to_id, status, created_at, created_by, comments, history) values
  ('ESC-1', 'CV-9004', 'PT-1011', 'No response to reminder or follow-up calls for periodontal maintenance visit — third missed contact attempt.', 'high', 'receptionist', 'staff-priya', 'in-progress', '2026-07-12T11:05:00+00:00', 'Priya Kulkarni',
    '[{"id":"ECM-1","author":"Priya Kulkarni","text":"Tried calling twice, both unanswered. Will try again tomorrow morning before marking as lost.","time":"2026-07-12T11:10:00+00:00"}]'::jsonb,
    '[{"id":"EH-1","action":"Escalation created","actor":"Priya Kulkarni","time":"2026-07-12T11:05:00+00:00"},{"id":"EH-2","action":"Assigned to Priya Kulkarni","actor":"Priya Kulkarni","time":"2026-07-12T11:05:00+00:00"},{"id":"EH-3","action":"Marked in progress","actor":"Priya Kulkarni","time":"2026-07-12T11:10:00+00:00"}]'::jsonb),
  ('ESC-2', 'CV-9001', 'PT-1001', 'Patient reporting post-procedure cold sensitivity after root canal sitting — needs clinical judgement before replying.', 'medium', 'doctor', 'doc-rao', 'resolved', '2026-07-14T08:12:00+00:00', 'Priya Kulkarni',
    '[{"id":"ECM-2","author":"Dr. Arjun Rao","text":"Mild sensitivity is expected post-obturation. Replied with reassurance and advised to monitor for 48 hours.","time":"2026-07-14T08:20:00+00:00"}]'::jsonb,
    '[{"id":"EH-4","action":"Escalation created","actor":"Priya Kulkarni","time":"2026-07-14T08:12:00+00:00"},{"id":"EH-5","action":"Assigned to Dr. Arjun Rao","actor":"Priya Kulkarni","time":"2026-07-14T08:12:00+00:00"},{"id":"EH-6","action":"Marked resolved","actor":"Dr. Arjun Rao","time":"2026-07-14T08:21:00+00:00"}]'::jsonb),
  ('ESC-3', null, 'PT-1003', 'Patient disputing implant invoice charges — requesting an itemized breakdown and asking about a possible discount.', 'high', 'admin', 'staff-meera', 'open', '2026-07-13T14:40:00+00:00', 'Priya Kulkarni',
    '[]'::jsonb,
    '[{"id":"EH-7","action":"Escalation created","actor":"Priya Kulkarni","time":"2026-07-13T14:40:00+00:00"},{"id":"EH-8","action":"Assigned to Meera Iyer","actor":"Priya Kulkarni","time":"2026-07-13T14:40:00+00:00"}]'::jsonb),
  ('ESC-4', null, 'PT-1006', 'Patient wanted the reschedule/cancellation policy explained before confirming a new date.', 'low', 'receptionist', 'staff-anil', 'resolved', '2026-07-09T10:00:00+00:00', 'Priya Kulkarni',
    '[{"id":"ECM-3","author":"Anil Deshmukh","text":"Explained the 24-hour reschedule window over the phone, patient confirmed the new slot.","time":"2026-07-09T10:30:00+00:00"}]'::jsonb,
    '[{"id":"EH-9","action":"Escalation created","actor":"Priya Kulkarni","time":"2026-07-09T10:00:00+00:00"},{"id":"EH-10","action":"Assigned to Anil Deshmukh","actor":"Priya Kulkarni","time":"2026-07-09T10:00:00+00:00"},{"id":"EH-11","action":"Marked resolved","actor":"Anil Deshmukh","time":"2026-07-09T10:30:00+00:00"}]'::jsonb)
on conflict (id) do nothing;

insert into public.notifications (id, title, description, time, read, type, href) values
  ('N-1', 'Broadcast awaiting your approval', '"Ganesh Chaturthi Closure Notice" needs review before it can send to 320 patients.', '2026-07-14T08:45:00+00:00', false, 'broadcast', '/messaging/broadcasts'),
  ('N-2', 'No response to follow-up reminder', 'Ramesh Gupta missed his periodontal maintenance visit and hasn''t replied to the reminder.', '2026-07-11T15:30:00+00:00', false, 'reminder', '/messaging/reminders'),
  ('N-3', 'Reschedule requested', 'Vikram Singh asked to move tomorrow''s crown fitting from 10:00 AM to 11:00 AM.', '2026-07-14T07:05:00+00:00', false, 'message', '/messaging'),
  ('N-4', 'Payment recorded', '₹200 received from Meera Nair against INV-8002.', '2026-07-14T09:45:00+00:00', true, 'payment', '/billing'),
  ('N-5', 'New patient registered', 'Ananya Das was added by Priya Kulkarni via quick onboarding.', '2026-07-11T12:05:00+00:00', true, 'system', '/patients/PT-1010'),
  ('N-6', 'Nightly reminders sent', '6 follow-up reminders were dispatched via WhatsApp for tomorrow''s appointments.', '2026-07-13T09:00:00+00:00', true, 'system', '/messaging/reminders')
on conflict (id) do nothing;

insert into public.audit_log (id, actor, action, target, time) values
  ('AL-1', 'Priya Kulkarni', 'Rescheduled appointment', 'Vikram Singh — Crown fitting', '2026-07-14T08:12:00+00:00'),
  ('AL-2', 'Dr. Arjun Rao', 'Confirmed chart entry from voice transcript', 'Meera Nair — Root canal, stage 2', '2026-07-14T09:40:00+00:00'),
  ('AL-3', 'Priya Kulkarni', 'Recorded payment', 'INV-8002 — ₹200 received', '2026-07-14T09:45:00+00:00'),
  ('AL-4', 'Dr. Kavya Menon', 'Rejected broadcast', '20% Off Teeth Whitening — Festive Offer', '2026-07-02T16:30:00+00:00'),
  ('AL-5', 'Priya Kulkarni', 'Added new patient', 'Ananya Das — PT-1010', '2026-07-11T12:05:00+00:00'),
  ('AL-6', 'Dr. Arjun Rao', 'Updated treatment plan', 'Rohan Verma — Implant placement stage 2 added', '2026-05-30T15:00:00+00:00'),
  ('AL-7', 'System', 'Sent nightly follow-up reminders', '6 reminders dispatched via WhatsApp', '2026-07-13T09:00:00+00:00'),
  ('AL-8', 'Priya Kulkarni', 'Updated WhatsApp message template', 'Follow-up Reminder — Kannada (submitted for approval)', '2026-07-12T11:20:00+00:00')
on conflict (id) do nothing;
