-- =========================================================================
-- BIOPERSONAL PRO - SCHEMA SUPABASE PARA SAAS MULTI-TENANT DE PERSONAL TRAINERS
-- Contempla: Auth (E-mail/Senha), Banco Multi-Tenant, Storage e RLS Estrito
-- =========================================================================

-- 1. Criação da tabela de Personais (Trainers / Tenants)
CREATE TABLE IF NOT EXISTS public.trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'Personal Trainer & Consultoria de Alta Performance',
    cref TEXT,
    whatsapp TEXT,
    phone TEXT,
    avatar_url TEXT,
    bg_image_url TEXT,
    tagline TEXT,
    bio TEXT,
    instagram TEXT,
    plans JSONB DEFAULT '[]'::jsonb,
    social_proof JSONB DEFAULT '{}'::jsonb,
    available_hours JSONB DEFAULT '{"Manhã": ["06:00","07:00","08:00","09:00","10:00","11:00"], "Tarde": ["14:00","15:00","16:00","17:00"], "Noite": ["18:00","19:00","20:00","21:00"]}'::jsonb,
    data_expiracao DATE DEFAULT (CURRENT_DATE + INTERVAL '180 days'),
    active BOOLEAN DEFAULT true,
    cor_primaria TEXT DEFAULT '#F97316',
    cor_fundo TEXT DEFAULT '#08090C',
    cor_texto TEXT DEFAULT '#F8FAFC'
);

-- 2. Criação da tabela de leads e agendamentos vinculada ao personal (trainer_id)
CREATE TABLE IF NOT EXISTS public.leads_agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
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
    payment_method TEXT DEFAULT 'Pix',

    -- Agenda de Atendimentos
    horario TEXT,
    tipo_atendimento TEXT DEFAULT 'Presencial' CHECK (tipo_atendimento IN ('Presencial', 'Online', 'Avaliação')),

    -- Conformidade com LGPD
    consentimento_lgpd BOOLEAN DEFAULT true
);

-- 3. Migrações incrementais seguras para colunas em trainers (Idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'user_id') THEN
        ALTER TABLE public.trainers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'nome') THEN
        ALTER TABLE public.trainers ADD COLUMN nome TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'whatsapp') THEN
        ALTER TABLE public.trainers ADD COLUMN whatsapp TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'slug') THEN
        ALTER TABLE public.trainers ADD COLUMN slug TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_trainers_slug_unique ON public.trainers (slug) WHERE slug IS NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'data_expiracao') THEN
        ALTER TABLE public.trainers ADD COLUMN data_expiracao DATE DEFAULT (CURRENT_DATE + INTERVAL '180 days');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'active') THEN
        ALTER TABLE public.trainers ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'cor_primaria') THEN
        ALTER TABLE public.trainers ADD COLUMN cor_primaria TEXT DEFAULT '#F97316';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'cor_fundo') THEN
        ALTER TABLE public.trainers ADD COLUMN cor_fundo TEXT DEFAULT '#08090C';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'trainers' AND column_name = 'cor_texto') THEN
        ALTER TABLE public.trainers ADD COLUMN cor_texto TEXT DEFAULT '#F8FAFC';
    END IF;
END $$;

-- 4. Migrações incrementais seguras para colunas em leads_agendamentos (Idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads_agendamentos' AND column_name = 'trainer_id') THEN
        ALTER TABLE public.leads_agendamentos ADD COLUMN trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads_agendamentos' AND column_name = 'consentimento_lgpd') THEN
        ALTER TABLE public.leads_agendamentos ADD COLUMN consentimento_lgpd BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads_agendamentos' AND column_name = 'payment_method') THEN
        ALTER TABLE public.leads_agendamentos ADD COLUMN payment_method TEXT DEFAULT 'Pix';
    END IF;
END $$;

-- 5. Criação do Bucket de Imagens no Supabase Storage ('avatars')
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB limite por arquivo
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 5242880, 
    allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/jpg'];

-- 6. Habilitação de Row Level Security (RLS)
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads_agendamentos ENABLE ROW LEVEL SECURITY;

-- 7. Concessão de permissões de schema para anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.trainers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.leads_agendamentos TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 8. POLÍTICAS RLS PARA A TABELA TRAINERS
-- A. Leitura pública de personais ativos (para visitantes do biosite) ou do próprio personal autenticado
DROP POLICY IF EXISTS "Permitir leitura pública de trainers" ON public.trainers;
DROP POLICY IF EXISTS "Permitir leitura pública de trainers ativos" ON public.trainers;
CREATE POLICY "Permitir leitura pública de trainers ativos" 
ON public.trainers 
FOR SELECT 
TO anon, authenticated 
USING (active = true OR auth.uid() = user_id);

-- B. Personal autenticado pode atualizar apenas o seu próprio registro
DROP POLICY IF EXISTS "Permitir atualização de trainers" ON public.trainers;
DROP POLICY IF EXISTS "Personal edita apenas seu perfil" ON public.trainers;
CREATE POLICY "Personal edita apenas seu perfil" 
ON public.trainers 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- C. Personal autenticado pode cadastrar seu próprio registro caso ainda não exista
DROP POLICY IF EXISTS "Permitir inserção de trainers" ON public.trainers;
DROP POLICY IF EXISTS "Personal cria seu proprio perfil" ON public.trainers;
CREATE POLICY "Personal cria seu proprio perfil" 
ON public.trainers 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 9. POLÍTICAS RLS PARA A TABELA LEADS_AGENDAMENTOS
-- A. Visitantes anônimos podem inserir novos leads vinculados ao personal
DROP POLICY IF EXISTS "Permitir inserção pública de novos leads" ON public.leads_agendamentos;
CREATE POLICY "Permitir inserção pública de novos leads" 
ON public.leads_agendamentos 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (trainer_id IS NOT NULL);

-- B. Personal autenticado pode visualizar apenas seus próprios leads
DROP POLICY IF EXISTS "Permitir leitura de leads" ON public.leads_agendamentos;
DROP POLICY IF EXISTS "Personal visualiza apenas seus leads" ON public.leads_agendamentos;
CREATE POLICY "Personal visualiza apenas seus leads" 
ON public.leads_agendamentos 
FOR SELECT 
TO authenticated 
USING (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
);

-- C. Personal autenticado pode atualizar apenas seus próprios leads
DROP POLICY IF EXISTS "Permitir atualização de leads" ON public.leads_agendamentos;
DROP POLICY IF EXISTS "Personal atualiza apenas seus leads" ON public.leads_agendamentos;
CREATE POLICY "Personal atualiza apenas seus leads" 
ON public.leads_agendamentos 
FOR UPDATE 
TO authenticated 
USING (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
)
WITH CHECK (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
);

-- D. Personal autenticado pode excluir apenas seus próprios leads
DROP POLICY IF EXISTS "Permitir exclusão de leads" ON public.leads_agendamentos;
DROP POLICY IF EXISTS "Personal exclui apenas seus leads" ON public.leads_agendamentos;
CREATE POLICY "Personal exclui apenas seus leads" 
ON public.leads_agendamentos 
FOR DELETE 
TO authenticated 
USING (
    trainer_id IN (SELECT id FROM public.trainers WHERE user_id = auth.uid())
);

-- 10. POLÍTICAS RLS PARA O STORAGE (BUCKET avatars / biosite-images)
-- A. Leitura pública de qualquer imagem do bucket
DROP POLICY IF EXISTS "Leitura pública storage avatars" ON storage.objects;
DROP POLICY IF EXISTS "Leitura pública biosite-images" ON storage.objects;
CREATE POLICY "Leitura pública storage avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('avatars', 'biosite-images'));

-- B. Upload permitido para usuários autenticados
DROP POLICY IF EXISTS "Upload autenticado storage avatars" ON storage.objects;
DROP POLICY IF EXISTS "Upload autenticado biosite-images" ON storage.objects;
CREATE POLICY "Upload autenticado storage avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('avatars', 'biosite-images'));

-- C. Atualização permitida para usuários autenticados
DROP POLICY IF EXISTS "Atualização autenticada storage avatars" ON storage.objects;
DROP POLICY IF EXISTS "Atualização autenticada biosite-images" ON storage.objects;
CREATE POLICY "Atualização autenticada storage avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('avatars', 'biosite-images'));

-- D. Exclusão de imagens permitida para usuários autenticados
DROP POLICY IF EXISTS "Exclusão autenticada storage avatars" ON storage.objects;
DROP POLICY IF EXISTS "Exclusão autenticada biosite-images" ON storage.objects;
CREATE POLICY "Exclusão autenticada storage avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('avatars', 'biosite-images'));

-- 11. Índices para performance e consultas multi-tenant de alta escala
CREATE INDEX IF NOT EXISTS idx_trainers_user_id ON public.trainers (user_id);
CREATE INDEX IF NOT EXISTS idx_trainers_slug ON public.trainers (slug);
CREATE INDEX IF NOT EXISTS idx_trainers_active ON public.trainers (active);
CREATE INDEX IF NOT EXISTS idx_leads_trainer_id ON public.leads_agendamentos (trainer_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads_agendamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads_agendamentos (status);
CREATE INDEX IF NOT EXISTS idx_leads_vencimento ON public.leads_agendamentos (data_vencimento);
