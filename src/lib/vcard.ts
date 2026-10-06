import { VCardData, LeadAgendamento } from '../types';

/**
 * Gera e dispara o download do arquivo .vcf (vCard 3.0) para salvar diretamente
 * na agenda do smartphone do cliente com 1 clique.
 */
export function generateAndDownloadVCard(data: VCardData): void {
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
    `ORG:${data.organization}`,
    `TITLE:${data.title}`,
    `TEL;TYPE=CELL,VOICE:${data.phone}`,
    `EMAIL;TYPE=PREF,INTERNET:${data.email}`,
    `URL:${data.url}`,
    `NOTE:${data.note.replace(/\n/g, '\\n')}`,
    'REV:' + new Date().toISOString(),
    'END:VCARD'
  ].join('\r\n');

  downloadBlob(vCardContent, `${data.firstName.toLowerCase()}_${data.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}.vcf`, 'text/vcard;charset=utf-8;');
}

/**
 * Exporta múltiplos leads em lote para um único arquivo .vcf,
 * adicionando a tag de identificação no nome para facilitar
 * a criação de Listas de Transmissão nativas no WhatsApp sem banimento.
 */
export function exportLeadsToVCard(leads: LeadAgendamento[], year: number = new Date().getFullYear()): void {
  if (!leads.length) return;

  const cards = leads.map(lead => {
    const isStudent = lead.status === 'Convertido';
    const tag = isStudent ? `[Aluno - ${year}]` : `[Lead - ${year}]`;
    const fullName = `${tag} ${lead.nome}`;
    const cleanPhone = lead.whatsapp.replace(/\D/g, '');
    const phoneFormatted = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `N:;${fullName};;;`,
      `TEL;TYPE=CELL,VOICE:${phoneFormatted}`,
      `NOTE:Objetivo: ${lead.objetivo} | Status: ${lead.status} | CRM Biopersonal`,
      'END:VCARD'
    ].join('\r\n');
  }).join('\r\n');

  downloadBlob(cards, `contatos_whatsapp_${leads.length}_leads.vcf`, 'text/vcard;charset=utf-8;');
}

/**
 * Exporta a lista de contatos em formato CSV para planilhas e relatórios
 */
export function exportLeadsToCSV(leads: LeadAgendamento[]): void {
  if (!leads.length) return;

  const headers = [
    'Nome',
    'WhatsApp',
    'Objetivo',
    'Status',
    'Plano',
    'Valor (R$)',
    'Data Vencimento',
    'Turno Preferido',
    'Data Cadastro'
  ];

  const rows = leads.map(l => [
    `"${l.nome.replace(/"/g, '""')}"`,
    `"${l.whatsapp}"`,
    `"${l.objetivo}"`,
    `"${l.status}"`,
    `"${l.plano_interesse || l.plano_tipo || '-'}"`,
    `"${l.plano_valor || 0}"`,
    `"${l.data_vencimento || '-'}"`,
    `"${l.turno_preferencia}"`,
    `"${new Date(l.created_at).toLocaleDateString('pt-BR')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  downloadBlob(csvContent, `leads_crm_personal_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
