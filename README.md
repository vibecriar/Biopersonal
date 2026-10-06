# 🏋️‍♂️ Biosite White-Label de Alta Conversão para Personal Trainers

Um biosite de altíssima conversão com estética **Glassmorphism Dark Fitness**, formulário interativo de agendamento de avaliações, integração com **Supabase** e **Mini-CRM Pro** embutido com automação inteligente de WhatsApp, gestão de alunos ativos, controle de renovação e mini metro de faturamento.

Pronto para deploy em produção no **Cloudflare Pages**.

---

## ✨ Funcionalidades Principais & Mini-CRM Pro

### 1. 🤖 Automação Inteligente de WhatsApp (Templates Dinâmicos)
O botão **"Chamar no WhatsApp"** em cada cartão do CRM monta automaticamente uma mensagem personalizada e estratégica de acordo com o estágio do funil:
- **Coluna 'Novos Leads':**
  > *"Olá, {nome}! Aqui é o {trainer_name}. Recebi seu contato pelo meu site com objetivo de {objetivo}. Vi que tem preferência pelo período da {turno}. Bora alinhar os detalhes da sua primeira sessão?"*
- **Coluna 'Contato Feito':**
  > *"Olá, {nome}! Aqui é o {trainer_name}. Passando para saber se conseguiu dar uma olhada na proposta que conversamos e se ficou alguma dúvida sobre os treinos!"*
- **Coluna 'Avaliação Agendada':**
  > *"Fala, {nome}! Tudo certo para nossa avaliação no dia {data_agendamento} ({turno})? Me confirme aqui para eu reservar seu horário na agenda!"*
- **Coluna 'Alunos / Convertidos' (Alerta de Renovação):**
  > *"Olá, {nome}! Seu plano de {nome_plano} vence em {dias_restantes} dias. Vamos renovar para mantermos o foco nos seus resultados?"* (com versão inteligente caso o plano já tenha vencido).

### 2. ⏳ Sistema de Alertas & Gestão de Renovação
- **Badge de Lead Esquecido (>48h):**
  - Identifica automaticamente leads que não foram contatados há mais de 48 horas nas colunas de *Novos Leads* e *Contato Feito* com badge pulsante: `⏳ Sem contato há X dias`.
- **Gestão de Alunos Ativos & Vencimentos:**
  - Configuração do plano contratado (`Mensal`, `Trimestral`, `Semestral`), valor em R$, data de início e data de término com recálculo automático.
  - Alerta automático quando faltarem 5 dias ou menos para o vencimento (`⚠️ Vence em X dias` ou `🚨 Vencido há X dias`), com botão rápido para **Cobrar Renovação** em 1 clique.

### 3. 🎯 Segmentação & Listas de Transmissão sem Banimento
- **Filtros Rápidos:** Segmentação instantânea por objetivo (*Emagrecimento*, *Hipertrofia*, *Saúde*, *Condicionamento*) ou filtro exclusivo para *Apenas Urgentes / Alertas*.
- **Exportação em Lote para Celular (vCard .vcf):**
  - Baixa os contatos filtrados com tags padronizadas (ex: `[Lead - 2026] Carlos` ou `[Aluno - 2026] Juliana`), permitindo criar **Listas de Transmissão nativas no WhatsApp** sem risco de banimento e sem precisar de ferramentas caras de disparo em massa.
- **Exportação CSV:** Planilha completa para Excel e controle financeiro.
- **Scripts de Reativação:** Modal com cópias prontas para início de mês, check-in semanal e convites para avaliação.

### 4. 📈 Mini Metro de Faturamento Mensal
- Substitui dashboards complexos por um medidor visual direto ao ponto:
  - Faturamento real calculado com base nos alunos ativos convertidos.
  - Barra de progresso linear com indicador neon e porcentagem da meta atingida (ex: `R$ 1.894 / R$ 6.000 (32%)`).
  - Meta mensal editável em 1 clique diretamente na tela.

### 5. 📱 Otimização Mobile-First (Para uso na Sala de Musculação)
- Abas superiores dinâmicas no celular (`Novos (2)`, `Contato (1)`, `Agendados (1)`, `Alunos (3)`).
- Carrossel com rolagem horizontal suave e snap nativo (`snap-x snap-mandatory`), permitindo deslizar o dedo entre as colunas com fluidez.
- Botões e ações com área de toque mínima de **44px**, garantindo usabilidade rápida entre séries de treino.

### 6. 📅 Agenda de Atendimentos Integrada (Hoje, Semana, Mês, Ano)
- Alternador de visualização no topo: `[Kanban] | [Tabela] | [Agenda]`.
- **Visão HOJE (Timeline Vertical Mobile):** Linha cronológica das 06:00 às 22:00 com cartões dos alunos marcados e botão rápido de WhatsApp: *"Estou te esperando na recepção/sala!"*.
- **Visão SEMANA (Grade Horária):** Tabela de Segunda a Sábado com blocos ocupados e horários vagos clicáveis.
- **Visão MÊS (Calendário Clássico):** Calendário com pontos visuais:
  - 🟠 **Laranja:** Avaliação / Aula agendada.
  - 🔴 **Vermelho:** Vencimento de mensalidade do aluno.
- **Visão ANO (Panorama Anual):** 12 meses com contagem de atendimentos, alunos ativos e renovações previstas.
- **Sincronização Total:** Clicar em qualquer horário livre abre o modal para agendar na hora. Leads movidos para *Avaliação Agendada* no Kanban aparecem instantaneamente na Agenda.

---

## 🚀 Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acesse as rotas:**
   - **Biosite Público:** `http://localhost:5173`
   - **Painel Administrativo (Mini-CRM):** `http://localhost:5173/#admin` (PIN padrão: `1234`)

---

## 🛠️ Personalização White-Label (`src/config/profile.ts`)

Abra o arquivo [`src/config/profile.ts`](file:///d:/Desktop/Biopersonal/src/config/profile.ts) para editar qualquer dado do personal trainer:
- Nome, CREF, Título e Frase de impacto entre aspas.
- Foto do perfil (com o anel neon pulsante) e imagem de fundo da academia.
- Número de WhatsApp com DDD e link do Instagram.
- Planos de consultoria, valores e benefícios.
- Casos de Antes/Depois e depoimentos de alunos.
- Dados do vCard para download no botão "SALVAR NA AGENDA".

---

## 🗄️ Banco de Dados (Supabase)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Acesse o **SQL Editor** do Supabase.
3. Execute o script contido em [`supabase/schema.sql`](file:///d:/Desktop/Biopersonal/supabase/schema.sql).
4. No arquivo `.env` (baseado em `.env.example`), preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   VITE_ADMIN_PIN=1234
   ```
> *Nota: Caso o Supabase não esteja configurado, o sistema opera de forma 100% funcional em modo Standalone / LocalStorage com leads e alunos de teste pré-carregados.*

---

## 🌐 Deploy no Cloudflare Pages

1. Suba o projeto para o **GitHub** ou **GitLab**.
2. No painel Cloudflare: **Workers & Pages > Create Application > Pages > Connect to Git**.
3. Parâmetros de build:
   - **Framework Preset:** `Vite` (ou `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Em **Environment Variables**, adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_ADMIN_PIN`.
5. Clique em **Save and Deploy**. O arquivo `public/_redirects` já está incluso para garantir roteamento SPA perfeito.
