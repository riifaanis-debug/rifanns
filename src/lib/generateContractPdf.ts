import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/* ── Page dimensions (mm) ── */
const A4_W = 210;
const A4_H = 297;
const M_TOP = 25;   // 2.5 cm
const M_BOTTOM = 20; // 2 cm
const M_LEFT = 20;
const M_RIGHT = 20;
const CONTENT_W = A4_W - M_LEFT - M_RIGHT; // 170mm
const FOOTER_H = 14; // reserve for footer
const CONTENT_H = A4_H - M_TOP - M_BOTTOM - FOOTER_H; // usable per page

/* ── Clean DOM for PDF ── */
function cleanForPdf(el: HTMLElement) {
  // Remove print-hidden elements
  ['.print-hidden', '.print\\:hidden', '[class*="print:hidden"]', '[class*="print\\:hidden"]'].forEach(sel => {
    try { el.querySelectorAll(sel).forEach(n => (n as HTMLElement).remove()); } catch {}
  });

  // Remove watermarks
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

  applyClean(el);
  el.querySelectorAll('*').forEach(c => applyClean(c as HTMLElement));
}

function applyClean(el: HTMLElement) {
  const cs = window.getComputedStyle(el);

  // Force white/transparent bg
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

  const color = cs.color;
  if (color) {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m && (Number(m[1]) + Number(m[2]) + Number(m[3])) / 3 > 200) el.style.color = '#666666';
  }
}

/* ── Wait for images + fonts ── */
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

/* ── Capture header for repeating ── */
async function captureHeader(clone: HTMLElement): Promise<HTMLCanvasElement | null> {
  const header = clone.querySelector('.contract-header') as HTMLElement | null;
  if (!header) return null;
  try {
    return await html2canvas(header, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false, windowWidth: 794 });
  } catch { return null; }
}

/* ── Smart page-break finder ── */
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

/* ── Draw footer on a page ── */
function drawFooter(pdf: jsPDF, pageNum: number, totalPages: number) {
  const footerY = A4_H - M_BOTTOM;
  // Separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(M_LEFT, footerY - 6, A4_W - M_RIGHT, footerY - 6);
  // Page number
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Page ${pageNum} of ${totalPages}`, A4_W / 2, footerY - 1, { align: 'center' });
  // Copyright
  pdf.setFontSize(6.5);
  pdf.setTextColor(180, 180, 180);
  pdf.text(`جميع الحقوق محفوظة © ريفانس المالية ${new Date().getFullYear()}`, A4_W / 2, footerY + 3, { align: 'center' });
}

/* ══════════ Main Export ══════════ */
export const generateContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  const clone = element.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    width: '794px', maxWidth: '794px', minWidth: '794px',
    padding: '48px 56px', margin: '0',
    background: '#ffffff', backgroundColor: '#ffffff',
    position: 'absolute', left: '-9999px', top: '0',
    direction: 'rtl', boxShadow: 'none', border: 'none', borderRadius: '0',
    overflow: 'visible',
    fontFamily: 'Tajawal, Cairo, Arial, sans-serif',
    fontSize: '14px', lineHeight: '1.8', color: '#1a1a1a',
  });
  document.body.appendChild(clone);

  cleanForPdf(clone);
  await waitForAssets(clone);

  // Capture header for repeating
  const headerCanvas = await captureHeader(clone);

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

    // Header dimensions for repeat
    let headerHmm = 0;
    let headerImg: string | null = null;
    if (headerCanvas) {
      const r = CONTENT_W / headerCanvas.width;
      headerHmm = headerCanvas.height * r;
      headerImg = headerCanvas.toDataURL('image/jpeg', 0.95);
    }

    const ratio = CONTENT_W / imgW;
    const maxSlicePx = Math.floor(CONTENT_H / ratio);

    // Calculate break points
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

      let contentY = M_TOP;

      // Repeat header on pages 2+
      if (p > 0 && headerImg && headerHmm > 0) {
        pdf.addImage(headerImg, 'JPEG', M_LEFT, M_TOP, CONTENT_W, headerHmm);
        // Purple line under header
        pdf.setDrawColor(34, 4, 44);
        pdf.setLineWidth(0.6);
        pdf.line(M_LEFT, M_TOP + headerHmm + 1.5, A4_W - M_RIGHT, M_TOP + headerHmm + 1.5);
        contentY = M_TOP + headerHmm + 4;
      }

      const srcY = breaks[p];
      const srcH = breaks[p + 1] - srcY;
      const destH = srcH * ratio;

      // Slice canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgW;
      pageCanvas.height = Math.round(srcH);
      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, Math.round(srcY), imgW, Math.round(srcH), 0, 0, imgW, Math.round(srcH));

      const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImg, 'JPEG', M_LEFT, contentY, CONTENT_W, destH);

      // Footer
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
