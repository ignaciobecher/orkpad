import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import {
  PreviewMarketingPostRowDto,
  PreviewMarketingPostResponseDto,
} from './dto/preview-marketing-post.dto';

type Network = 'linkedin' | 'instagram' | 'tiktok';
type Format =
  | 'carousel'
  | 'reel'
  | 'article'
  | 'image'
  | 'video'
  | 'text'
  | 'story'
  | 'poll'
  | 'event';

const NETWORK_ALIASES: Record<string, Network> = {
  // linkedin
  linkedin: 'linkedin',
  'linked-in': 'linkedin',
  'linked in': 'linkedin',
  linked: 'linkedin',
  linkdin: 'linkedin',
  linkendin: 'linkedin',
  lin: 'linkedin',
  in: 'linkedin',
  // instagram
  instagram: 'instagram',
  insta: 'instagram',
  inst: 'instagram',
  ig: 'instagram',
  instagran: 'instagram',
  instagra: 'instagram',
  instgram: 'instagram',
  intagram: 'instagram',
  instragram: 'instagram',
  instargam: 'instagram',
  instagam: 'instagram',
  instagrm: 'instagram',
  // tiktok
  tiktok: 'tiktok',
  'tik tok': 'tiktok',
  'tik-tok': 'tiktok',
  tik: 'tiktok',
  tok: 'tiktok',
  tiktoc: 'tiktok',
  'tic toc': 'tiktok',
  tictok: 'tiktok',
};

const NETWORK_KEYWORDS: { keyword: string; network: Network }[] = [
  { keyword: 'linked', network: 'linkedin' },
  { keyword: 'insta', network: 'instagram' },
  { keyword: 'gram', network: 'instagram' },
  { keyword: 'tik', network: 'tiktok' },
  { keyword: 'tok', network: 'tiktok' },
];

const NETWORK_VALUES: Network[] = ['linkedin', 'instagram', 'tiktok'];

const FORMAT_MAP: Record<string, Format> = {
  carrusel: 'carousel',
  carousel: 'carousel',
  reel: 'reel',
  articulo: 'article',
  artículo: 'article',
  article: 'article',
  imagen: 'image',
  image: 'image',
  video: 'video',
  vídeo: 'video',
  texto: 'text',
  text: 'text',
  historia: 'story',
  story: 'story',
  encuesta: 'poll',
  poll: 'poll',
  evento: 'event',
  event: 'event',
};

@Injectable()
export class ExcelImportService {
  parseExcel(buffer: Buffer): PreviewMarketingPostResponseDto {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('El archivo Excel no tiene hojas');
    }
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
    });

    if (jsonData.length < 2) {
      throw new BadRequestException(
        'El archivo Excel debe tener al menos una fila de datos además del encabezado',
      );
    }

    const headers = jsonData[0] as string[];
    const requiredHeaders = [
      'dia',
      'red',
      'formato',
      'contenido/titulo',
      'descripcion',
    ];
    const missingHeaders = requiredHeaders.filter(
      (h) => !headers.some((h2) => h2?.toString().toLowerCase().trim() === h),
    );
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Faltan columnas requeridas: ${missingHeaders.join(', ')}. Encabezados esperados: dia, red, formato, contenido/titulo, descripcion`,
      );
    }

    const diaIdx = headers.findIndex(
      (h) => h?.toString().toLowerCase().trim() === 'dia',
    );
    const redIdx = headers.findIndex(
      (h) => h?.toString().toLowerCase().trim() === 'red',
    );
    const formatoIdx = headers.findIndex(
      (h) => h?.toString().toLowerCase().trim() === 'formato',
    );
    const contenidoIdx = headers.findIndex(
      (h) => h?.toString().toLowerCase().trim() === 'contenido/titulo',
    );
    const descripcionIdx = headers.findIndex(
      (h) => h?.toString().toLowerCase().trim() === 'descripcion',
    );

    const rows: PreviewMarketingPostRowDto[] = [];
    let validCount = 0;

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as string[];
      if (row.every((cell) => !cell || cell.toString().trim() === '')) continue;

      const errors: string[] = [];

      const diaCell = row[diaIdx];
      const diaRaw = this.normalizeDate(diaCell);
      const redRaw = row[redIdx]?.toString().trim().toLowerCase() ?? '';
      const formatoRaw = row[formatoIdx]?.toString().trim().toLowerCase() ?? '';
      const contenidoRaw = row[contenidoIdx]?.toString().trim() ?? '';
      const descripcionRaw = row[descripcionIdx]?.toString().trim() ?? '';

      if (!diaRaw) errors.push('Columna "dia" es obligatoria');
      else if (!this.isValidDate(diaRaw))
        errors.push(
          `Formato de fecha inválido en "dia": "${diaCell?.toString() ?? ''}". Use YYYY-MM-DD`,
        );

      if (!redRaw) errors.push('Columna "red" es obligatoria');
      else {
        const resolved = this.resolveNetwork(redRaw);
        if (!resolved)
          errors.push(
            `No se reconoció la red social: "${redRaw}". Use: linkedin, instagram, tiktok`,
          );
      }

      if (!formatoRaw) errors.push('Columna "formato" es obligatorio');
      else if (!FORMAT_MAP[formatoRaw])
        errors.push(
          `Formato inválido: "${formatoRaw}". Use: carrusel, reel, articulo, imagen, video, texto, historia, encuesta, evento`,
        );

      if (!contenidoRaw)
        errors.push('Columna "contenido/titulo" es obligatoria');
      else if (contenidoRaw.length > 200)
        errors.push('El título no puede exceder 200 caracteres');

      const rowDto: PreviewMarketingPostRowDto = {
        rowIndex: i,
        dia: diaRaw,
        red: (this.resolveNetwork(redRaw) ?? redRaw) as Network,
        formato: FORMAT_MAP[formatoRaw] ?? formatoRaw,
        contenidoTitulo: contenidoRaw,
        descripcion: descripcionRaw || undefined,
        status: 'idea',
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };

      if (errors.length === 0) validCount++;
      rows.push(rowDto);
    }

    return {
      rows,
      totalRows: rows.length,
      validRows: validCount,
      invalidRows: rows.length - validCount,
    };
  }

  generateTemplate(): Buffer {
    const headers = [
      'dia',
      'red',
      'formato',
      'contenido/titulo',
      'descripcion',
    ];
    const sampleRows = [
      [
        '2026-06-21',
        'instagram',
        'carrusel',
        '5 errores al cotizar proyectos',
        'Thread explicando los errores más comunes al cotizar como freelance...',
      ],
      [
        '2026-06-22',
        'linkedin',
        'article',
        'Cómo subir tus precios sin perder clientes',
        'Artículo sobre estrategias de pricing y comunicación de valor...',
      ],
      [
        '2026-06-23',
        'tiktok',
        'video',
        'Mi rutina matutina productiva',
        'Video corto mostrando hábitos de productividad para freelancers...',
      ],
      [
        '2026-06-24',
        'instagram',
        'reel',
        'Herramientas que uso cada día',
        'Reel rápido con 5 herramientas indispensables para tu workflow...',
      ],
      [
        '2026-06-25',
        'linkedin',
        'imagen',
        'Consejo: automatiza lo repetitivo',
        'Post con imagen sobre automatización de tareas administrativas...',
      ],
    ];

    const data = [headers, ...sampleRows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    worksheet['!cols'] = [
      { wch: 12 }, // dia
      { wch: 12 }, // red
      { wch: 14 }, // formato
      { wch: 40 }, // contenido/titulo
      { wch: 60 }, // descripcion
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Importación');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  private normalizeDate(cell: unknown): string {
    if (cell == null) return '';

    // Objeto Date
    if (cell instanceof Date) {
      if (isNaN(cell.getTime())) return '';
      return this.formatISO(cell);
    }

    // Número de serie de Excel (ej. 45678 = días desde 1899-12-30)
    if (typeof cell === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const ms = excelEpoch.getTime() + cell * 24 * 60 * 60 * 1000;
      const date = new Date(ms);
      if (isNaN(date.getTime())) return '';
      return this.formatISO(date);
    }

    const str = cell.toString().trim();
    if (!str) return '';

    // Ya está en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }

    // Formato DD/MM/YYYY o MM/DD/YYYY (asumimos DD/MM/YYYY para es-AR)
    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Formato DD-MM-YYYY
    const dmyDashMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (dmyDashMatch) {
      const day = dmyDashMatch[1].padStart(2, '0');
      const month = dmyDashMatch[2].padStart(2, '0');
      const year = dmyDashMatch[3];
      return `${year}-${month}-${day}`;
    }

    // Intentar con Date.parse como último recurso
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return this.formatISO(parsed);
    }

    return str;
  }

  private formatISO(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidDate(dateStr: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr + 'T00:00:00.000Z');
    return !isNaN(date.getTime());
  }

  private resolveNetwork(raw: string): Network | null {
    const input = raw.toLowerCase().trim();
    if (!input) return null;

    // 1. Coincidencia exacta en alias
    if (NETWORK_ALIASES[input]) return NETWORK_ALIASES[input];

    // 2. Coincidencia parcial por palabra clave
    for (const { keyword, network } of NETWORK_KEYWORDS) {
      if (input.includes(keyword)) return network;
    }

    // 3. Coincidencia fuzzy (distancia de Levenshtein <= 2)
    let best: { network: Network; distance: number } | null = null;
    for (const value of NETWORK_VALUES) {
      const distance = this.levenshtein(input, value);
      if (!best || distance < best.distance)
        best = { network: value, distance };
    }
    if (best && best.distance <= 2) return best.network;

    return null;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
