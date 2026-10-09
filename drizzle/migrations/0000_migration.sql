CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  duration_minutes int NOT NULL DEFAULT 30,
  sort_order int NOT NULL DEFAULT 0
);
CREATE TABLE public.dentists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  specialization text NOT NULL,
  languages text[] NOT NULL DEFAULT '{}',
  bio text NOT NULL,
  service_slugs text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference text UNIQUE NOT NULL,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  service_id uuid NOT NULL REFERENCES public.services(id),
  dentist_id uuid NOT NULL REFERENCES public.dentists(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('requested','confirmed','cancelled')),
  source text NOT NULL CHECK (source IN ('chat','web_form')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_double_booking EXCLUDE USING gist (
    dentist_id WITH =, tstzrange(start_at, end_at) WITH &&
  ) WHERE (status <> 'cancelled')
);

GRANT SELECT ON public.services, public.dentists TO anon, authenticated;
GRANT ALL ON public.services, public.dentists, public.appointments TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view services" ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view dentists" ON public.dentists FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.services (slug,name,summary,duration_minutes,sort_order) VALUES
('general-dentistry','General Dentistry','Check-ups, fillings and everyday care to keep your mouth healthy.',30,1),
('cleaning','Dental Cleaning','Professional cleaning and preventive care to protect teeth and gums.',45,2),
('whitening','Teeth Whitening','In-clinic whitening for a brighter, natural-looking smile.',60,3),
('implants','Dental Implants','Consultation and planning for replacing missing teeth.',60,4),
('orthodontics','Orthodontics & Clear Aligners','Straighten teeth with braces or discreet clear aligners.',45,5),
('root-canal','Root Canal Treatment','Relieve pain and save an infected tooth.',90,6),
('cosmetic','Cosmetic Dentistry','Veneers, bonding and smile design.',60,7),
('pediatric','Pediatric Dentistry','Gentle, patient care for children.',30,8),
('emergency','Emergency Dental Care','Same-day help for pain, swelling or broken teeth.',30,9);

INSERT INTO public.dentists (slug,name,title,specialization,languages,bio,service_slugs,sort_order) VALUES
('ananya-rao','Dr. Ananya Rao','BDS, MDS (demo credentials)','Prosthodontics & Implants',ARRAY['English','Hindi','Kannada'],'Focuses on restoring function and confidence with carefully planned implant and cosmetic treatment.',ARRAY['general-dentistry','implants','cosmetic','whitening','emergency'],1),
('vikram-mehta','Dr. Vikram Mehta','BDS, MDS (demo credentials)','Orthodontics',ARRAY['English','Hindi','Gujarati'],'Helps patients of all ages achieve straighter smiles with braces and clear aligners.',ARRAY['orthodontics','general-dentistry','cleaning'],2),
('meera-iyer','Dr. Meera Iyer','BDS (demo credentials)','General & Pediatric Dentistry',ARRAY['English','Tamil','Hindi'],'Known for a calm, unhurried approach, especially with children and anxious patients.',ARRAY['general-dentistry','cleaning','pediatric','root-canal','emergency','whitening'],3);