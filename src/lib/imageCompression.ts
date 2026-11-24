import { supabase } from './supabase';

export interface CompressionOptions {
  maxWidth: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  formattedOriginalSize: string;
  formattedCompressedSize: string;
  reductionPercentage: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Comprime imagens no navegador (client-side) usando HTML5 Canvas
 * Reduz fotos de câmeras de smartphones (5MB-10MB) para menos de 150KB em formato WebP/JPEG
 */
export async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { maxWidth, maxHeight = maxWidth, quality = 0.8, format = 'image/webp' } = options;

  return new Promise((resolve, reject) => {
    // Valida se o arquivo é imagem
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Mantém a proporção exata ao redimensionar
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto gráfico 2D do Canvas indisponível no navegador.'));
          return;
        }

        // Ativa interpolação de alta qualidade para não perder nitidez
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Testa suporte a WebP no canvas, usando JPEG como fallback seguro
        let exportFormat = format;
        const testDataUrl = canvas.toDataURL(exportFormat, quality);
        if (!testDataUrl.startsWith(`data:${exportFormat}`)) {
          exportFormat = 'image/jpeg';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar arquivo comprimido a partir do Canvas.'));
              return;
            }

            const dataUrl = canvas.toDataURL(exportFormat, quality);
            const reduction = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));

            resolve({
              blob,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height,
              formattedOriginalSize: formatBytes(file.size),
              formattedCompressedSize: formatBytes(blob.size),
              reductionPercentage: reduction
            });
          },
          exportFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Não foi possível decodificar os dados da imagem.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo no dispositivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Envia imagem comprimida para o Supabase Storage no bucket avatars
 * Utiliza upsert: true para sobrescrever o arquivo do personal e não acumular lixo
 */
export async function uploadTrainerImage(
  trainerId: string,
  fileBlob: Blob,
  pathType: 'perfil' | 'fundo' | 'antes_depois',
  customFileName?: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  if (!supabase) {
    return { 
      success: false, 
      error: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' 
    };
  }

  try {
    const finalName = customFileName || (pathType === 'perfil' ? 'perfil.webp' : pathType === 'fundo' ? 'fundo.webp' : `${Date.now()}.webp`);
    const cleanTrainerId = trainerId.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `${cleanTrainerId}/${finalName}`;

    // Upload para o bucket público avatars com upsert: true
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBlob, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Erro ao enviar imagem para o Supabase Storage:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Obtém a URL pública do bucket avatars
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Timestamp cache-busting para forçar atualização visual instantânea no browser
    const publicUrlWithCacheBust = `${urlData.publicUrl}?v=${Date.now()}`;

    return { 
      success: true, 
      publicUrl: publicUrlWithCacheBust 
    };
  } catch (err: any) {
    console.error('Exceção ao fazer upload de imagem:', err);
    return { success: false, error: err?.message || 'Erro inesperado no envio da foto.' };
  }
}
