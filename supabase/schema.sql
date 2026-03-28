-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  document_type TEXT NOT NULL, -- PF, ESI, Joint Declaration, Other
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'overdue')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Disable for Demo Simplicity or Enable if user expects it)
-- For now, let's keep it open for the demo to work immediately
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all access" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all access" ON activity_logs FOR ALL USING (true);
