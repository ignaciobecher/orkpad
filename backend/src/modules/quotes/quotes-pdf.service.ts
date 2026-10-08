import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');
import { QuoteDocument } from './quotes.schema';
import { StorageService } from '../storage/storage.service';

const MARGIN = 40;
const PAGE_W = 595;
const CONTENT_W = PAGE_W - MARGIN * 2; // 515
const RIGHT = PAGE_W - MARGIN; // 555
const FOOTER_Y = 808;

@Injectable()
export class QuotesPdfService {
  constructor(private readonly storageService: StorageService) {}

  async generate(quote: QuoteDocument): Promise<Buffer> {
    const brand = await this.loadBrand(quote);
    return new Promise<Buffer>((resolve, reject) => {
      // autoFirstPage:false so we control pagination completely
      const doc = new PDFDocument({
        size: 'A4',
        margin: MARGIN,
        bufferPages: true,
        autoFirstPage: false,
      });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.addPage();
      this.buildPdf(doc, quote, brand);
      doc.end();
    });
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private fmt(n: number, currency: string) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(n || 0);
  }

  private fmtDate(d?: Date | string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private statusLabel(s: string): string {
    return (
      (
        {
          draft: 'Borrador',
          sent: 'Enviado',
          accepted: 'Aceptado',
          rejected: 'Rechazado',
          expired: 'Vencido',
        } as Record<string, string>
      )[s] ?? s
    );
  }

  /** Render text at absolute (x, y) without ever moving doc.y or wrapping pages. */
  private txt(
    doc: any,
    text: string,
    x: number,
    y: number,
    opts: Record<string, any> = {},
  ) {
    doc.text(text, x, y, { lineBreak: false, ...opts });
    // Hard-reset doc cursor back so pdfkit doesn't think we're at the bottom
    doc.x = x;
    doc.y = y;
  }

  /** Same as txt but allows text wrapping (multi-line). Returns resulting doc.y after render. */
  private txtWrap(
    doc: any,
    text: string,
    x: number,
    y: number,
    width: number,
  ): number {
    doc.text(text, x, y, { width, lineBreak: true });
    return doc.y;
  }

  // ─── main builder ───────────────────────────────────────────────────────────

  private async loadBrand(quote: QuoteDocument): Promise<{ name: string; website?: string; logo?: Buffer }> {
    const name = (quote as any).freelancerName || 'Orkpad';
    const website = (quote as any).freelancerWebsite as string | undefined;
    const logoId = (quote as any).agencyLogoFileId as string | undefined;
    if (!logoId) return { name, website };
    try {
      const { stream } = await this.storageService.read((quote as any).workspaceId, logoId);
      const chunks: Buffer[] = [];
      for await (const c of stream as any) chunks.push(c as Buffer);
      return { name, website, logo: Buffer.concat(chunks) };
    } catch {
      return { name, website };
    }
  }

  private buildPdf(doc: any, quote: QuoteDocument, brand?: { name: string; website?: string; logo?: Buffer }) {
    const C = quote.currency || 'USD';
    const fmt = (n: number) => this.fmt(n, C);
    const BLACK = '#111111';
    const GREY = '#888888';
    const LGREY = '#f5f5f5';
    const BDGREY = '#cccccc';

    let curY = MARGIN;

    // ── BLOCK 1: Wordmark + freelancer ────────────────────────────────────────
    const leftColW = CONTENT_W * 0.55;
    const rightColX = MARGIN + leftColW + 16;
    const rightColW = CONTENT_W - leftColW - 16;

    // Left side
    doc.fontSize(22).font('Helvetica-Bold').fillColor(BLACK);
    this.txt(doc, 'PRESUPUESTO', MARGIN, curY, {
      characterSpacing: 2,
      width: leftColW,
    });
    let leftBottom = curY + 30;
    if (quote.number) {
      doc.fontSize(10).font('Helvetica').fillColor(GREY);
      this.txt(doc, `N° ${quote.number}`, MARGIN, leftBottom, {
        width: leftColW,
      });
      leftBottom += 14;
    }

    // Right side (freelancer / agency)
    if (brand?.logo) {
      try {
        doc.image(brand.logo, rightColX + rightColW - 56, curY, { width: 56 });
      } catch {
        // logo inválido: se sigue sin imagen
      }
    }
    const freelancerLines: string[] = [
      quote.freelancerName,
      quote.freelancerEmail,
      quote.freelancerPhone,
      quote.freelancerAddress,
      quote.freelancerWebsite,
      (quote as any).freelancerTaxId
        ? `CUIT/CUIL: ${(quote as any).freelancerTaxId}`
        : '',
    ].filter((l): l is string => Boolean(l));

    let rightBottom = curY;
    freelancerLines.forEach((line, i) => {
      doc
        .fontSize(i === 0 ? 10 : 8.5)
        .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(i === 0 ? BLACK : GREY);
      this.txt(doc, line, rightColX, rightBottom, {
        width: rightColW,
        align: 'right',
      });
      rightBottom += i === 0 ? 14 : 12;
    });

    curY = Math.max(leftBottom, rightBottom) + 14;

    // ── Separator ─────────────────────────────────────────────────────────────
    doc
      .moveTo(MARGIN, curY)
      .lineTo(RIGHT, curY)
      .lineWidth(1.5)
      .strokeColor(BLACK)
      .stroke();
    curY += 16;

    // ── BLOCK 2: Title (left) + meta dates (right) — fully independent ─────────
    const titleColW = CONTENT_W * 0.58;
    const metaColX = MARGIN + titleColW + 16;
    const metaColW = CONTENT_W - titleColW - 16;

    // --- Left: title + scope ---
    doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK);
    const titleEndY = this.txtWrap(doc, quote.title, MARGIN, curY, titleColW);

    let leftSectionBottom = titleEndY + 2;
    if (quote.scope) {
      doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY);
      const scopeEndY = this.txtWrap(
        doc,
        quote.scope,
        MARGIN,
        leftSectionBottom + 2,
        titleColW,
      );
      leftSectionBottom = scopeEndY + 2;
    }

    // --- Right: meta rows (label on one line, value on next line) ---
    const metaRows: [string, string][] = [
      ['Fecha de emisión', this.fmtDate(quote.issueDate)],
      ...(quote.expiresAt
        ? [['Válido hasta', this.fmtDate(quote.expiresAt)] as [string, string]]
        : []),
      ['Estado', this.statusLabel(quote.status)],
    ];

    let mY = curY;
    metaRows.forEach(([label, value]) => {
      doc.fontSize(7).font('Helvetica').fillColor(GREY);
      this.txt(doc, label.toUpperCase(), metaColX, mY, {
        width: metaColW,
        align: 'right',
        characterSpacing: 0.3,
      });
      mY += 10;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(BLACK);
      this.txt(doc, value, metaColX, mY, { width: metaColW, align: 'right' });
      mY += 14;
    });

    curY = Math.max(leftSectionBottom, mY) + 16;

    // ── BLOCK 3: Client ───────────────────────────────────────────────────────
    const clientLines = [
      quote.clientName,
      quote.clientEmail,
      quote.clientAddress,
    ].filter(Boolean);
    if (clientLines.length) {
      const blockH =
        10 +
        13 +
        clientLines.reduce((h, _, i) => h + (i === 0 ? 14 : 12), 0) +
        10;
      doc.rect(MARGIN, curY, CONTENT_W, blockH).fill(LGREY);
      let cy = curY + 10;
      doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY);
      this.txt(doc, 'DIRIGIDO A', MARGIN + 12, cy, {
        characterSpacing: 1.5,
        width: CONTENT_W,
      });
      cy += 13;
      clientLines.forEach((line, i) => {
        doc
          .fontSize(i === 0 ? 10 : 8.5)
          .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(BLACK);
        this.txt(doc, line, MARGIN + 12, cy, { width: CONTENT_W - 24 });
        cy += i === 0 ? 14 : 12;
      });
      curY = curY + blockH + 16;
    }

    // ── BLOCK 4: Deliverables ─────────────────────────────────────────────────
    if (quote.deliverables) {
      doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY);
      this.txt(doc, 'ENTREGABLES', MARGIN, curY, {
        characterSpacing: 1.5,
        width: CONTENT_W,
      });
      curY += 13;
      doc.fontSize(8.5).font('Helvetica').fillColor('#444444');
      curY =
        this.txtWrap(doc, quote.deliverables, MARGIN, curY, CONTENT_W) + 12;
    }

    // ── BLOCK 5: Items / Sections ─────────────────────────────────────────────
    if (quote.sections?.length) {
      quote.sections.forEach((section) => {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#333333');
        this.txt(doc, section.title.toUpperCase(), MARGIN, curY, {
          characterSpacing: 0.8,
          width: CONTENT_W,
        });
        curY += 13;
        if (section.description) {
          doc.fontSize(8.5).font('Helvetica-Oblique').fillColor(GREY);
          curY =
            this.txtWrap(doc, section.description, MARGIN, curY, CONTENT_W) + 4;
        }
        curY =
          this.drawItemsTable(
            doc,
            section.items || [],
            fmt,
            curY,
            BLACK,
            LGREY,
          ) + 12;
      });
    } else if (quote.items?.length) {
      curY =
        this.drawItemsTable(doc, quote.items, fmt, curY, BLACK, LGREY) + 12;
    }

    // ── BLOCK 6: Totals ───────────────────────────────────────────────────────
    doc
      .moveTo(MARGIN, curY)
      .lineTo(RIGHT, curY)
      .lineWidth(0.5)
      .strokeColor(BDGREY)
      .stroke();
    curY += 10;

    const totLabelX = 345;
    const totValueX = 460;
    const totValueW = RIGHT - totValueX;

    if (quote.subtotal > 0 && quote.subtotal !== quote.total) {
      curY = this.totRow(
        doc,
        'Subtotal',
        fmt(quote.subtotal),
        totLabelX,
        totValueX,
        totValueW,
        curY,
        GREY,
      );
    }
    if (quote.discountPercent > 0) {
      curY = this.totRow(
        doc,
        `Descuento (${quote.discountPercent}%)`,
        `- ${fmt(quote.discountAmount)}`,
        totLabelX,
        totValueX,
        totValueW,
        curY,
        GREY,
      );
    }
    if (quote.taxRate > 0) {
      curY = this.totRow(
        doc,
        `Impuesto (${quote.taxRate}%)`,
        fmt(quote.taxAmount),
        totLabelX,
        totValueX,
        totValueW,
        curY,
        GREY,
      );
    }

    curY += 4;
    doc
      .moveTo(totLabelX, curY)
      .lineTo(RIGHT, curY)
      .lineWidth(0.5)
      .strokeColor(BDGREY)
      .stroke();
    curY += 8;

    doc.fontSize(10).font('Helvetica-Bold').fillColor(BLACK);
    this.txt(doc, 'TOTAL', totLabelX, curY, {
      width: totValueX - totLabelX - 8,
      align: 'right',
    });
    doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK);
    this.txt(doc, fmt(quote.total), totValueX, curY - 2, {
      width: totValueW,
      align: 'right',
    });
    curY += 22;

    // ── BLOCK 7: Notes + Terms ────────────────────────────────────────────────
    if (quote.notes || quote.paymentTerms) {
      curY += 6;
      doc
        .moveTo(MARGIN, curY)
        .lineTo(RIGHT, curY)
        .lineWidth(0.5)
        .strokeColor('#eeeeee')
        .stroke();
      curY += 12;

      if (quote.notes && quote.paymentTerms) {
        const colW = (CONTENT_W - 20) / 2;
        const col2X = MARGIN + colW + 20;

        doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY);
        this.txt(doc, 'NOTAS', MARGIN, curY, {
          characterSpacing: 1.5,
          width: colW,
        });
        this.txt(doc, 'CONDICIONES DE PAGO', col2X, curY, {
          characterSpacing: 1.5,
          width: colW,
        });
        curY += 12;

        doc.fontSize(8.5).font('Helvetica').fillColor('#444444');
        const notesEndY = this.txtWrap(doc, quote.notes, MARGIN, curY, colW);
        const termsEndY = this.txtWrap(
          doc,
          quote.paymentTerms,
          col2X,
          curY,
          colW,
        );
        curY = Math.max(notesEndY, termsEndY) + 10;
      } else if (quote.notes) {
        doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY);
        this.txt(doc, 'NOTAS', MARGIN, curY, {
          characterSpacing: 1.5,
          width: CONTENT_W,
        });
        curY += 12;
        doc.fontSize(8.5).font('Helvetica').fillColor('#444444');
        curY = this.txtWrap(doc, quote.notes, MARGIN, curY, CONTENT_W) + 10;
      } else if (quote.paymentTerms) {
        doc.fontSize(7).font('Helvetica-Bold').fillColor(GREY);
        this.txt(doc, 'CONDICIONES DE PAGO', MARGIN, curY, {
          characterSpacing: 1.5,
          width: CONTENT_W,
        });
        curY += 12;
        doc.fontSize(8.5).font('Helvetica').fillColor('#444444');
        curY =
          this.txtWrap(doc, quote.paymentTerms, MARGIN, curY, CONTENT_W) + 10;
      }
    }

    // ── BLOCK 8: Validity note ────────────────────────────────────────────────
    if (quote.validityNote) {
      curY += 6;
      doc.fontSize(8).font('Helvetica-Oblique').fillColor(GREY);
      this.txtWrap(doc, quote.validityNote, MARGIN, curY, CONTENT_W);
    }

    // ── Footer on every page ──────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      this.drawFooter(doc, i + 1, range.count, brand);
    }
  }

  // ─── footer ─────────────────────────────────────────────────────────────────

  private drawFooter(doc: any, page: number, total: number, brand?: { name: string; website?: string }) {
    const GREY = '#aaaaaa';
    const ACCENT = '#2563EB';

    doc
      .moveTo(MARGIN, FOOTER_Y - 6)
      .lineTo(RIGHT, FOOTER_Y - 6)
      .lineWidth(0.5)
      .strokeColor('#dddddd')
      .stroke();

    // Circle logo mark
    const r = 5;
    const lx = MARGIN + r;
    const ly = FOOTER_Y + r;
    doc.circle(lx, ly, r).lineWidth(1.8).strokeColor(ACCENT).stroke();
    doc.circle(lx, ly, 1.8).fill(ACCENT);

    doc.fontSize(8).font('Helvetica-Bold').fillColor(ACCENT);
    this.txt(doc, (brand?.name ?? 'ORKPAD').toUpperCase().slice(0, 28), MARGIN + r * 2 + 5, FOOTER_Y + 3, { width: 120 });

    doc.fontSize(7).font('Helvetica').fillColor(GREY);
    this.txt(
      doc,
      `· ${(brand?.website ?? 'orkpad.com').replace(/^https?:\/\//, '')}`,
      MARGIN + r * 2 + 128,
      FOOTER_Y + 4,
      { width: 220 },
    );

    doc.fontSize(7.5).font('Helvetica').fillColor(GREY);
    this.txt(doc, `${page} / ${total}`, MARGIN, FOOTER_Y + 3, {
      align: 'right',
      width: CONTENT_W,
    });
  }

  // ─── items table ────────────────────────────────────────────────────────────

  private drawItemsTable(
    doc: any,
    items: any[],
    fmt: (n: number) => string,
    startY: number,
    BLACK: string,
    LGREY: string,
  ): number {
    if (!items.length) return startY;

    const cDesc = MARGIN;
    const wDesc = CONTENT_W - 270;
    const cUnit = cDesc + wDesc;
    const wUnit = 44;
    const cQty = cUnit + wUnit;
    const wQty = 44;
    const cPrice = cQty + wQty;
    const wPrice = 88;
    const cAmt = cPrice + wPrice;
    const wAmt = RIGHT - cAmt;
    const ROW_H = 20;
    const HDR_H = 18;

    let ty = startY;

    // header
    doc.rect(MARGIN, ty, CONTENT_W, HDR_H).fill(LGREY);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#333333');
    this.txt(doc, 'DESCRIPCIÓN', cDesc + 4, ty + 5, { width: wDesc - 8 });
    this.txt(doc, 'UNIDAD', cUnit + 2, ty + 5, {
      width: wUnit - 4,
      align: 'center',
    });
    this.txt(doc, 'CANT.', cQty + 2, ty + 5, {
      width: wQty - 4,
      align: 'right',
    });
    this.txt(doc, 'P. UNIT.', cPrice + 2, ty + 5, {
      width: wPrice - 4,
      align: 'right',
    });
    this.txt(doc, 'IMPORTE', cAmt + 2, ty + 5, {
      width: wAmt - 4,
      align: 'right',
    });
    ty += HDR_H;

    items.forEach((item, idx) => {
      if (idx % 2 === 1) doc.rect(MARGIN, ty, CONTENT_W, ROW_H).fill('#fafafa');
      doc
        .moveTo(MARGIN, ty + ROW_H)
        .lineTo(RIGHT, ty + ROW_H)
        .lineWidth(0.4)
        .strokeColor('#e8e8e8')
        .stroke();

      doc.fontSize(8.5).font('Helvetica').fillColor(BLACK);
      this.txt(doc, item.description || '', cDesc + 4, ty + 6, {
        width: wDesc - 8,
        ellipsis: true,
      });
      this.txt(doc, item.unit || '', cUnit + 2, ty + 6, {
        width: wUnit - 4,
        align: 'center',
      });
      this.txt(doc, String(item.quantity ?? 1), cQty + 2, ty + 6, {
        width: wQty - 4,
        align: 'right',
      });
      this.txt(doc, fmt(item.unitPrice ?? 0), cPrice + 2, ty + 6, {
        width: wPrice - 4,
        align: 'right',
      });
      doc.font('Helvetica-Bold');
      this.txt(doc, fmt(item.amount ?? 0), cAmt + 2, ty + 6, {
        width: wAmt - 4,
        align: 'right',
      });
      ty += ROW_H;
    });

    return ty;
  }

  // ─── totals row ─────────────────────────────────────────────────────────────

  private totRow(
    doc: any,
    label: string,
    value: string,
    labelX: number,
    valueX: number,
    valueW: number,
    y: number,
    grey: string,
  ): number {
    doc.fontSize(8.5).font('Helvetica').fillColor(grey);
    this.txt(doc, label, labelX, y, {
      width: valueX - labelX - 8,
      align: 'right',
    });
    doc.fontSize(8.5).font('Helvetica').fillColor('#333333');
    this.txt(doc, value, valueX, y, { width: valueW, align: 'right' });
    return y + 14;
  }
}
