import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

@Injectable()
export class ReportsExportService {
  toCsv(data: any): string {
    const rows: string[][] = [];
    const f = data.finance;
    const amt = (a: { currency: string; total: number }[]) =>
      a.map((x) => `${x.currency} ${x.total}`).join(' + ') || '—';
    rows.push(['FINANZAS DEL PERIODO']);
    for (const t of f.totals) {
      rows.push([t.label, amt(t.amounts)]);
    }
    rows.push([]);
    rows.push(['POR CLIENTE', 'Moneda', 'Facturado', 'Cobrado', 'Pendiente']);
    for (const c of f.byClient) {
      rows.push([c.name, c.currency, String(c.invoiced), String(c.collected), String(c.pending)]);
    }
    rows.push([]);
    rows.push(['PROXIMOS VENCIMIENTOS', 'Monto', 'Moneda', 'Estado', 'Vence']);
    for (const u of f.upcoming) {
      rows.push([u.number ?? u.id, String(u.total), u.currency ?? '', u.status, u.dueDate ?? '']);
    }
    rows.push([]);
    const t = data.tasks;
    rows.push(['TAREAS']);
    rows.push(['Total', String(t.total)]);
    rows.push(['Hechas', String(t.done)]);
    rows.push(['En progreso', String(t.inProgress)]);
    rows.push(['Vencidas', String(t.overdue)]);
    rows.push([]);
    rows.push(['PROYECTOS', 'Presupuesto', 'Facturado', 'Cobrado', 'Avance %']);
    for (const p of data.projects) {
      rows.push([p.name, String(p.budget), String(p.invoiced), String(p.collected), String(p.progress)]);
    }
    rows.push([]);
    const h = data.time;
    rows.push(['HORAS']);
    rows.push(['Minutos totales', String(h.totalMinutes)]);
    rows.push(['Minutos facturables', String(h.billableMinutes)]);
    rows.push(['Monto facturable', String(Math.round(h.billableAmount * 100) / 100)]);
    return rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
  }

  async toPdf(data: any): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const f = data.finance;
      const t = data.tasks;
      const h = data.time;
      doc.fontSize(18).text('Reporte Orkpad');
      doc.fontSize(10).fillColor('#666')
        .text(`Periodo: ${data.range.from.slice(0, 10)} al ${data.range.to.slice(0, 10)}`);
      doc.moveDown().fillColor('#000');
      doc.fontSize(14).text('Finanzas');
      doc.fontSize(11);
      for (const t of f.totals) {
        doc.text(`${t.label}: ${(t.amounts as { currency: string; total: number }[]).map((a) => `${a.currency} ${a.total}`).join(' + ') || '—'}`);
      }
      doc.moveDown();
      doc.fontSize(14).text('Tareas');
      doc.fontSize(11).text(
        `Total: ${t.total} | Hechas: ${t.done} | En progreso: ${t.inProgress} | Vencidas: ${t.overdue}`,
      );
      doc.moveDown();
      doc.fontSize(14).text('Proyectos');
      doc.fontSize(11);
      for (const p of data.projects.slice(0, 30)) {
        doc.text(`${p.name} [${p.currency ?? ''}] — avance ${p.progress}% — cobrado ${p.collected}/${p.invoiced}`);
      }
      doc.moveDown();
      doc.fontSize(14).text('Horas');
      doc.fontSize(11).text(
        `Totales: ${Math.round(h.totalMinutes)} min | Facturables: ${Math.round(h.billableMinutes)} min | Monto: ${Math.round(h.billableAmount * 100) / 100}`,
      );
      doc.end();
    });
  }
}
