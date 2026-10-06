import { ProfileConfig } from '../types';

/**
 * CONFIGURAÇÃO CENTRALIZADA WHITE-LABEL DO PERSONAL TRAINER
 * Altere apenas os dados abaixo para personalizar completamente o Biosite para qualquer profissional!
 */
export const profileConfig: ProfileConfig = {
  // ID do Personal (Tenant) configurável via variável de ambiente ou ID padrão
  id: import.meta.env.VITE_TRAINER_ID || undefined,
  name: "Rodrigo 'Thor' Silveira",
  role: "Personal Trainer & Consultoria de Alta Performance",
  cref: "CREF 084920-G/SP",
  tagline: "Construindo o melhor físico da sua vida com metodologia científica, sem treinos chatos e sem dietas malucas.",
  
  // Foto/Logo do Personal (Avatar central com efeito anel pulsante)
  avatarUrl: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80",
  
  // Imagem de Fundo (Gym Dark Atmosphere com overlay)
  bgImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",

  socialLinks: {
    whatsapp: "5511998765432",
    whatsappDefaultMessage: "Olá, quero saber como funciona o acompanhamento!",
    instagram: "https://instagram.com/rodrigosilveira.fit",
    youtube: "https://youtube.com/@rodrigofitness",
    strava: "https://strava.com/athletes/rodrigofit"
  },

  // Grade de Ações Rápidas Estratégicas (Foco em Conversão Direta)
  ctaButtons: [
    {
      id: "whatsapp",
      label: "Falar no WhatsApp",
      sublabel: "Tire dúvidas direto com o Personal",
      icon: "MessageCircle",
      action: "whatsapp",
      badge: "Online agora",
      highlight: true
    },
    {
      id: "consultoria",
      label: "Planos & Consultoria",
      sublabel: "Presencial VIP ou Online",
      icon: "Dumbbell",
      action: "consultoria",
      badge: "Vagas Abertas"
    }
  ],

  // Serviços e Planos de Consultoria
  services: [
    {
      id: "consultoria-online",
      name: "Consultoria Online Black",
      tag: "Mais Vendido",
      popular: true,
      price: "R$ 197",
      period: "/mês",
      description: "Treinos 100% individualizados no app exclusivo com vídeos explicativos e suporte direto comigo pelo WhatsApp.",
      features: [
        "Planilha de treino personalizada no aplicativo",
        "Vídeos de execução com correção de postura",
        "Ajuste quinzenal de periodização e cargas",
        "Suporte direto de segunda a sábado via WhatsApp",
        "Guia de macronutrientes e suplementação inteligente"
      ],
      whatsappMessage: "Olá Rodrigo! Gostaria de assinar a Consultoria Online Black de R$ 197/mês."
    },
    {
      id: "personal-presencial",
      name: "Personal Presencial VIP",
      tag: "Exclusivo",
      price: "R$ 1.200",
      period: "/mês (3x/sem)",
      description: "Acompanhamento presencial minucioso na academia ou condomínio, biomecânica ajustada em tempo real.",
      features: [
        "Aulas 1 a 1 com acompanhamento de biomecânica",
        "Avaliação física completa com adipômetro e circunferências",
        "Periodização para hipertrofia acelerada ou emagrecimento",
        "Treinos aeróbicos complementares inclusos",
        "Acesso livre a consultoria online para dias solo"
      ],
      whatsappMessage: "Olá Rodrigo! Tenho interesse no Personal Presencial VIP (3x por semana)."
    },
    {
      id: "protocolo-transformacao",
      name: "Desafio 90 Dias Shape",
      tag: "Alta Intensidade",
      price: "R$ 497",
      period: "taxa única",
      description: "Protocolo intensivo com metas semanais de evolução, fotos de controle e aceleração metabólica.",
      features: [
        "3 fases evolutivas de periodização em 90 dias",
        "Planilha de controle de cargas e recordes pessoais",
        "Grupo VIP com desafios e monitoramento de constância",
        "Check-in fotográfico a cada 15 dias para recalibragem"
      ],
      whatsappMessage: "Olá Rodrigo! Quero me inscrever no Desafio 90 Dias Shape!"
    }
  ],

  // Prova Social: Antes/Depois e Depoimentos
  socialProof: {
    title: "Resultados Reais de Alunos",
    subtitle: "Mais de 350 vidas e físicos transformados com o Método Thor",
    stats: [
      { label: "Alunos Atendidos", value: "+380" },
      { label: "Taxa de Adesão", value: "97%" },
      { label: "Média de Gordura Perdida", value: "-8.4kg" },
      { label: "Nota dos Alunos", value: "4.9/5 ★" }
    ],
    transformations: [
      {
        id: "trans-1",
        name: "Carlos Eduardo (34 anos)",
        result: "-14kg em 16 semanas",
        tag: "-8kg em 90 dias",
        timeFrame: "4 Meses de Consultoria",
        description: "Rotina corporativa corrida. Focamos em treinos de 45 minutos 4x na semana com periodização ondulatória.",
        quote: "Consegui secar a barriga e definir o corpo sem passar fome e sem treinos monótonos. Método direto ao ponto!",
        beforeImg: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80",
        afterImg: "https://images.unsplash.com/photo-1583454155184-870a1f63aebc?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "trans-2",
        name: "Mariana Vasconcelos (29 anos)",
        result: "+5kg de massa magra & definição",
        tag: "Hipertrofia & Postura",
        timeFrame: "6 Meses de Acompanhamento",
        description: "Transição do sedentarismo para alta performance. Fortalecimento de glúteos e redução de dores lombares.",
        quote: "Fortaleci meus glúteos e acabei com as dores na lombar causadas por horas sentada trabalhando.",
        beforeImg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
        afterImg: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80"
      },
      {
        id: "trans-3",
        name: "Felipe Meneghel (42 anos)",
        result: "-18kg e melhora postural",
        tag: "Alívio de dores na coluna",
        timeFrame: "5 Meses de Consultoria",
        description: "Reversão de quadro pré-diabético e aumento brutal de disposição para brincar com os filhos.",
        quote: "Aos 42 anos recuperei minha energia. As dores crônicas na coluna sumiram nas primeiras 4 semanas.",
        beforeImg: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80",
        afterImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80"
      }
    ],
    testimonials: [
      {
        id: "dep-1",
        name: "Renata Prado",
        role: "Aluna há 1 ano e meio",
        quote: "O Rodrigo não te passa só uma folha de treino. Ele te ensina a amar o processo. Nunca tive resultados tão duradouros!",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        rating: 5
      },
      {
        id: "dep-2",
        name: "Gustavo Rossi",
        role: "Consultoria Online",
        quote: "O suporte pelo WhatsApp faz toda diferença do mundo. Eu gravo minha série, ele corrige a postura na hora. Vale cada centavo.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        rating: 5
      }
    ]
  },

  // vCard para botão "SALVAR NA AGENDA" (.vcf)
  vCardData: {
    firstName: "Rodrigo",
    lastName: "Silveira (Personal)",
    organization: "Rodrigo Silveira Personal & Consultoria",
    title: "Personal Trainer - CREF 084920-G/SP",
    phone: "+5511998765432",
    email: "contato@rodrigosilveirafit.com.br",
    url: "https://rodrigosilveirafit.com.br",
    note: "Personal Trainer de Alta Performance. Agendamentos de aulas e consultoria física."
  }
};
