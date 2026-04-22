import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import rifansLogo from '@/assets/rifans-logo.png';

/* ══════════ Production-Ready PDF Settings ══════════
 * Format: A4
 * Margins: top 130px / bottom 110px / left 30px / right 30px
 * Colors: Purple #3b2355 / Gold #c7a76c / Gray #666
 * Font: Tajawal (RTL)
 * Header + Footer repeat on every page
 * ════════════════════════════════════════════════════ */

/* ── A4 dimensions in mm ── */
const A4_W = 210;
const A4_H = 297;

/* ── Margins (px → mm @ 96dpi: 1px ≈ 0.2646mm) ── */
const PX_TO_MM = 0.2646;
const M_TOP = 130 * PX_TO_MM;     // ~34.4mm
const M_BOTTOM = 110 * PX_TO_MM;  // ~29.1mm
const M_LEFT = 30 * PX_TO_MM;     // ~7.94mm
const M_RIGHT = 30 * PX_TO_MM;    // ~7.94mm

const CONTENT_W = A4_W - M_LEFT - M_RIGHT;
const CONTENT_H = A4_H - M_TOP - M_BOTTOM;

/* ── Brand Colors ── */
const PURPLE: [number, number, number] = [59, 35, 85];   // #3b2355
const GOLD: [number, number, number]   = [199, 167, 108]; // #c7a76c
const GRAY: [number, number, number]   = [102, 102, 102]; // #666
const GRAY_LIGHT: [number, number, number] = [200, 200, 200];

/* ── Clean DOM for PDF capture ── */
function cleanForPdf(el: HTMLElement) {
  ['.print-hidden', '.print\\:hidden', '[class*="print:hidden"]', '[class*="print\\:hidden"]'].forEach(sel => {
    try { el.querySelectorAll(sel).forEach(n => (n as HTMLElement).remove()); } catch {}
  });

  // Remove rotated watermarks
  el.querySelectorAll('[class*="rotate-"]').forEach(node => {
    const h = node as HTMLElement;
    if (h.style.transform?.includes('rotate') || h.className?.includes('rotate-')) {
      const t = h.textContent?.trim() || '';
      if (t.includes('RIFANS') || t.includes('ريفانس') || t.length > 20) h.remove();
    }
  });
  el.querySelectorAll('.pointer-events-none').forEach(n => {
    const h = n as HTMLElement;
    if (h.classList.contains('opacity-[0.015]') || h.style.opacity === '0.015') h.remove();
  });

  // Remove the in-document header (we redraw it per-page instead)
  el.querySelectorAll('.contract-header').forEach(n => (n as HTMLElement).remove());

  applyClean(el);
  el.querySelectorAll('*').forEach(c => applyClean(c as HTMLElement));
}

function applyClean(el: HTMLElement) {
  const cs = window.getComputedStyle(el);
  const bg = cs.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const br = (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3;
      if (br > 240) el.style.backgroundColor = '#ffffff';
      else if (br > 200) el.style.backgroundColor = '#fafafa';
      else if (el.offsetHeight > 5) el.style.backgroundColor = '#ffffff';
    }
  }
  if (cs.backgroundImage && cs.backgroundImage !== 'none') el.style.backgroundImage = 'none';
  el.style.boxShadow = 'none';
  el.style.textShadow = 'none';
  const radius = parseFloat(cs.borderRadius);
  if (radius > 6) el.style.borderRadius = '3px';
  const bc = cs.borderColor;
  if (bc) {
    const m = bc.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m && (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 > 240) el.style.borderColor = '#e5e5e5';
  }
}

/* ── Wait for assets ── */
async function waitForAssets(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map(img => new Promise<void>(r => {
    if (img.complete) { r(); return; }
    const done = () => r();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  })));
  try { await document.fonts.ready; } catch {}
}

/* ── Load logo as data URL (for repeated header) ── */
async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(rifansLogo);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

/* ── Smart page-break finder (white-row scan) ── */
function findBreakRow(canvas: HTMLCanvasElement, targetY: number, maxH: number, imgW: number, imgH: number): number {
  const scanRange = Math.floor(maxH * 0.15);
  const start = Math.max(0, targetY - scanRange);
  const end = Math.min(imgH, targetY + scanRange);
  const sc = document.createElement('canvas');
  sc.width = imgW;
  sc.height = end - start;
  const ctx = sc.getContext('2d')!;
  ctx.drawImage(canvas, 0, start, imgW, sc.height, 0, 0, imgW, sc.height);
  const data = ctx.getImageData(0, 0, imgW, sc.height).data;

  let bestRow = targetY, bestScore = -1;
  for (let row = 0; row < sc.height; row++) {
    let white = 0, samples = 0;
    for (let x = 0; x < imgW; x += 4) {
      const idx = (row * imgW + x) * 4;
      if (data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240) white++;
      samples++;
    }
    const score = white / samples;
    if (score > bestScore) { bestScore = score; bestRow = start + row; }
  }
  return bestRow;
}

/* ── Header drawn on every page (English-only to avoid jsPDF Arabic glyph issues) ── */
function drawHeader(pdf: jsPDF, logoDataUrl: string | null) {
  const top = 12;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, 'PNG', A4_W - M_RIGHT - 14, top, 14, 14);
    } catch {}
  }

  pdf.setTextColor(...PURPLE);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RIFANIS FINANCIAL COMPANY', M_LEFT, top + 6);

  pdf.setTextColor(...GRAY);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Limited Liability Company  |  Riyadh, KSA', M_LEFT, top + 11);

  pdf.setDrawColor(...GOLD);
  pdf.setLineWidth(0.5);
  pdf.line(M_LEFT, M_TOP - 4, A4_W - M_RIGHT, M_TOP - 4);
}

/* ── Footer drawn on every page ── */
function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  const footerY = A4_H - M_BOTTOM + 10;

  pdf.setDrawColor(...GRAY_LIGHT);
  pdf.setLineWidth(0.3);
  pdf.line(M_LEFT, footerY - 6, A4_W - M_RIGHT, footerY - 6);

  pdf.setFontSize(10);
  pdf.setTextColor(...PURPLE);
  pdf.setFont('helvetica', 'bold');
  pdf.text('rifanss.com', M_LEFT, footerY);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(...GRAY);
  pdf.text(`Page ${pageNum} of ${totalPages}`, A4_W / 2, footerY, { align: 'center' });

  pdf.setFontSize(10);
  pdf.setTextColor(...GRAY);
  pdf.text(`© ${new Date().getFullYear()} Rifanis Financial`, A4_W - M_RIGHT, footerY, { align: 'right' });
}

/* ══════════ Main Export ══════════ */
export const generateContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  const clone = element.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    width: '794px', maxWidth: '794px', minWidth: '794px',
    padding: '20px 30px', margin: '0',
    background: '#ffffff', backgroundColor: '#ffffff',
    position: 'absolute', left: '-9999px', top: '0',
    direction: 'rtl', boxShadow: 'none', border: 'none', borderRadius: '0',
    overflow: 'visible',
    fontFamily: 'Tajawal, sans-serif',
    fontSize: '16pt', lineHeight: '1.9', color: '#222222',
  });
  document.body.appendChild(clone);

  cleanForPdf(clone);
  await waitForAssets(clone);
  const logoDataUrl = await loadLogoDataUrl();

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      imageTimeout: 15000,
      onclone: (doc) => {
        const root = doc.body.lastElementChild as HTMLElement;
        if (root) { root.style.background = '#ffffff'; root.style.backgroundColor = '#ffffff'; }
      }
    });

    const imgW = canvas.width;
    const imgH = canvas.height;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const ratio = CONTENT_W / imgW;
    const maxSlicePx = Math.floor(CONTENT_H / ratio);

    // Compute page breaks
    const breaks: number[] = [0];
    let cy = 0;
    while (cy + maxSlicePx < imgH) {
      const best = findBreakRow(canvas, cy + maxSlicePx, maxSlicePx, imgW, imgH);
      breaks.push(best);
      cy = best;
    }
    breaks.push(imgH);

    const totalPages = breaks.length - 1;

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) pdf.addPage();

      // Header on every page
      drawHeader(pdf, logoDataUrl);

      const srcY = breaks[p];
      const srcH = breaks[p + 1] - srcY;
      const destH = srcH * ratio;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgW;
      pageCanvas.height = Math.round(srcH);
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, Math.round(srcY), imgW, Math.round(srcH), 0, 0, imgW, Math.round(srcH));

      const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImg, 'JPEG', M_LEFT, M_TOP, CONTENT_W, destH);

      // Footer on every page
      drawFooter(pdf, p + 1, totalPages);
    }

    const blob = pdf.output('blob');
    return { pdf, blob };
  } finally {
    document.body.removeChild(clone);
  }
};

export const downloadContractPdf = async (element: HTMLElement, fileName: string = 'contract.pdf') => {
  const { pdf } = await generateContractPdf(element, fileName);
  pdf.save(fileName);
};

export const printContractPdf = async (element: HTMLElement) => {
  const { blob } = await generateContractPdf(element);
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.print();
    setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 5000);
  };
};
