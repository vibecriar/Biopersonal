-- ==============================================================
-- BIOSITE WHITE-LABEL PARA PERSONAL TRAINERS - SCHEMA SUPABASE
-- ARQUITETURA MULTI-TENANT COM TABELA TRAINERS E TRAINER_ID
-- ==============================================================

-- 1. Criação da tabela de Personais (Trainers / Tenants)
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'Personal Trainer & Consultoria de Alta Performance',
    cref TEXT,
    phone TEXT,
    avatar_url TEXT,
    bg_image_url TEXT,
    tagline TEXT,
    bio TEXT,
    instagram TEXT,
    plans JSONB DEFAULT '[]'::jsonb,
    social_proof JSONB DEFAULT '{}'::jsonb,
    available_hours JSONB DEFAULT '{"Manhã": ["06:00","07:00","08:00","09:00","10:00","11:00"], "Tarde": ["14:00","15:00","16:00","17:00"], "Noite": ["18:00","19:00","20:00","21:00"]}'::jsonb,
    active BOOLEAN DEFAULT true
);

-- 2. Criação/Atualização da tabela de leads e agendamentos com chave estrangeira trainer_id
CREATE TABLE IF NOT EXISTS public.leads_agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    data_preferencia DATE NOT NULL,
    turno_preferencia TEXT NOT NULL CHECK (turno_preferencia IN ('Manhã', 'Tarde', 'Noite')),
    observacoes TEXT DEFAULT '',
    plano_interesse TEXT DEFAULT 'Geral',
    status TEXT NOT NULL DEFAULT 'Novo Lead' CHECK (status IN ('Novo Lead', 'Contato Feito', 'Avaliação Agendada', 'Convertido')),
    
    -- Gestão de Alunos Ativos & Renovação
    plano_tipo TEXT DEFAULT 'Mensal' CHECK (plano_tipo IN ('Mensal', 'Trimestral', 'Semestral')),
    plano_valor NUMERIC DEFAULT 0,
    data_inicio DATE,
    data_vencimento DATE,

    -- Agenda de Atendimentos
    horario TEXT,
    tipo_atendimento TEXT DEFAULT 'Presencial' CHECK (tipo_atendimento IN ('Presencial', 'Online', 'Avaliação')),

    -- Conformidade com LGPD
    consentimento_lgpd BOOLEAN DEFAULT true
);

-- Migrações incrementais seguras para colunas em trainers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'role') THEN
        ALTER TABLE public.trainers ADD COLUMN role TEXT DEFAULT 'Personal Trainer & Consultoria de Alta Performance';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'bg_image_url') THEN
        ALTER TABLE public.trainers ADD COLUMN bg_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'tagline') THEN
        ALTER TABLE public.trainers ADD COLUMN tagline TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'instagram') THEN
        ALTER TABLE public.trainers ADD COLUMN instagram TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'plans') THEN
        ALTER TABLE public.trainers ADD COLUMN plans JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'social_proof') THEN
        ALTER TABLE public.trainers ADD COLUMN social_proof JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'available_hours') THEN
        ALTER TABLE public.trainers ADD COLUMN available_hours JSONB DEFAULT '{"Manhã": ["06:00","07:00","08:00","09:00","10:00","11:00"], "Tarde": ["14:00","15:00","16:00","17:00"], "Noite": ["18:00","19:00","20:00","21:00"]}'::jsonb;
    END IF;
END $$;

-- Migrações incrementais seguras para colunas em leads_agendamentos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads_agendamentos' AND column_name = 'trainer_id') THEN
        ALTER TABLE public.leads_agendamentos ADD COLUMN trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads_agendamentos' AND column_name = 'consentimento_lgpd') THEN
        ALTER TABLE public.leads_agendamentos ADD COLUMN consentimento_lgpd BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Habilitação de Row Level Security (RLS)
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_agendamentos ENABLE ROW LEVEL SECURITY;

-- 4. Concessão explícita de permissões do banco (DCL) para os papéis da API Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.trainers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.leads_agendamentos TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Políticas de Acesso RLS para anon e authenticated
DROP POLICY IF EXISTS "Permitir leitura pública de trainers" ON public.trainers;
CREATE POLICY "Permitir leitura pública de trainers" 
ON public.trainers 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção de trainers" ON public.trainers;
CREATE POLICY "Permitir inserção de trainers" 
ON public.trainers 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de trainers" ON public.trainers;
CREATE POLICY "Permitir atualização de trainers" 
ON public.trainers 
FOR UPDATE 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção pública de novos leads" ON public.leads_agendamentos;
CREATE POLICY "Permitir inserção pública de novos leads" 
ON public.leads_agendamentos 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de leads" ON public.leads_agendamentos;
CREATE POLICY "Permitir leitura de leads" 
ON public.leads_agendamentos 
FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir atualização de leads" ON public.leads_agendamentos;
CREATE POLICY "Permitir atualização de leads" 
ON public.leads_agendamentos 
FOR UPDATE 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir exclusão de leads" ON public.leads_agendamentos;
CREATE POLICY "Permitir exclusão de leads" 
ON public.leads_agendamentos 
FOR DELETE 
TO anon, authenticated 
USING (true);

-- 5. Índices para performance e consultas multi-tenant
CREATE INDEX IF NOT EXISTS idx_leads_trainer_id ON public.leads_agendamentos (trainer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads_agendamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads_agendamentos (status);
CREATE INDEX IF NOT EXISTS idx_leads_vencimento ON public.leads_agendamentos (data_vencimento);
