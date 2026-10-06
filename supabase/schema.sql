-- ==============================================================
-- BIOSITE WHITE-LABEL PARA PERSONAL TRAINERS - SCHEMA SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase
-- ==============================================================

-- 1. Criação da tabela de leads e agendamentos com gestão de alunos & renovação
CREATE TABLE IF NOT EXISTS public.leads_agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    tipo_atendimento TEXT DEFAULT 'Presencial' CHECK (tipo_atendimento IN ('Presencial', 'Online', 'Avaliação'))
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.leads_agendamentos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
CREATE POLICY "Permitir inserção pública de novos leads" 
ON public.leads_agendamentos 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Permitir leitura de leads" 
ON public.leads_agendamentos 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Permitir atualização de leads" 
ON public.leads_agendamentos 
FOR UPDATE 
TO public 
USING (true);

CREATE POLICY "Permitir exclusão de leads" 
ON public.leads_agendamentos 
FOR DELETE 
TO public 
USING (true);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads_agendamentos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads_agendamentos (status);
CREATE INDEX IF NOT EXISTS idx_leads_vencimento ON public.leads_agendamentos (data_vencimento);
