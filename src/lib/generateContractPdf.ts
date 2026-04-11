import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 12;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2 - 8; // Reserve space for footer

/**
 * Aggressively clean all elements for PDF export:
 * - Force ALL backgrounds to white/transparent
 * - Remove ALL shadows, borders, rounded corners
 * - Ensure all text is dark and readable
 * - Remove print-hidden elements
 * - Remove watermarks
 */
function cleanForPdf(el: HTMLElement) {
  // Remove print-hidden elements
  const hiddenSelectors = [
    '.print-hidden', 
    '.print\\:hidden', 
    '[class*="print:hidden"]',
    '[class*="print\\:hidden"]',
  ];
  hiddenSelectors.forEach(sel => {
    try {
      el.querySelectorAll(sel).forEach(node => (node as HTMLElement).remove());
    } catch(e) { /* ignore invalid selectors */ }
  });

  // Remove watermark elements (the rotated background text)
  el.querySelectorAll('[class*="rotate-"]').forEach(node => {
    const el = node as HTMLElement;
    if (el.style.transform?.includes('rotate') || el.className?.includes('rotate-')) {
      const text = el.textContent?.trim() || '';
      if (text.includes('RIFANS') || text.includes('ريفانس') || text.length > 20) {
        el.remove();
      }
    }
  });

  // Also remove pointer-events-none overlays (watermarks)
  el.querySelectorAll('.pointer-events-none').forEach(node => {
    const htmlEl = node as HTMLElement;
    if (htmlEl.classList.contains('opacity-[0.015]') || htmlEl.style.opacity === '0.015') {
      htmlEl.remove();
    }
  });

  // Clean root
  applyCleanStyles(el);

  // Walk ALL descendants
  const allElements = el.querySelectorAll('*') as NodeListOf<HTMLElement>;
  allElements.forEach(child => {
    applyCleanStyles(child);
  });
}

function applyCleanStyles(el: HTMLElement) {
  const computed = window.getComputedStyle(el);
  
  // Force white/transparent background on everything
  const bgColor = computed.backgroundColor;
  if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      if (brightness > 240) {
        // Very light bg - make white
        el.style.backgroundColor = '#ffffff';
      } else if (brightness > 200) {
        // Light tinted bg (like gray-50) - make very light
        el.style.backgroundColor = '#fafafa';
      } else {
        // Dark bg - only keep if it's the brand header border or specific accent
        // Check if it's a thin element (like a border/line)
        const height = el.offsetHeight;
        if (height > 5) {
          el.style.backgroundColor = '#ffffff';
        }
      }
    }
  }

  // Remove background images/gradients
  if (computed.backgroundImage && computed.backgroundImage !== 'none') {
    el.style.backgroundImage = 'none';
  }

  // Remove ALL shadows
  el.style.boxShadow = 'none';
  el.style.textShadow = 'none';
  
  // Reduce border radius
  const radius = parseFloat(computed.borderRadius);
  if (radius > 6) {
    el.style.borderRadius = '3px';
  }

  // Make light/invisible borders slightly visible for structure
  const borderColor = computed.borderColor;
  if (borderColor) {
    const match = borderColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      // If border is too light, remove it; if moderate, keep for structure
      if (brightness > 240) {
        el.style.borderColor = '#e5e5e5';
      }
    }
  }

  // Ensure text is dark enough to read
  const color = computed.color;
  if (color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      const brightness = (r + g + b) / 3;
      if (brightness > 200) {
        // Very light text - darken it
        el.style.color = '#666666';
      }
    }
  }
}

async function waitForPdfAssets(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const finish = () => resolve();
          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        })
    )
  );

  try {
    await document.fonts.ready;
  } catch {
    // Ignore font readiness failures and continue the export.
  }
}

export const generateContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  // Clone element to avoid visual disruption
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Set up clone for A4 rendering
  clone.style.width = '794px'; // A4 at 96dpi
  clone.style.maxWidth = '794px';
  clone.style.minWidth = '794px';
  clone.style.padding = '40px 48px';
  clone.style.margin = '0';
  clone.style.background = '#ffffff';
  clone.style.backgroundColor = '#ffffff';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.direction = 'rtl';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.overflow = 'visible';
  clone.style.fontFamily = 'Tajawal, Arial, sans-serif';
  clone.style.fontSize = '11px';
  clone.style.lineHeight = '1.7';
  clone.style.color = '#1a1a1a';
  
  document.body.appendChild(clone);

  // Aggressively clean for professional PDF output
  cleanForPdf(clone);
  await waitForPdfAssets(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      imageTimeout: 15000,
      onclone: (doc) => {
        // Additional cleanup on the cloned document
        const root = doc.body.lastElementChild as HTMLElement;
        if (root) {
          root.style.background = '#ffffff';
          root.style.backgroundColor = '#ffffff';
        }
      }
    });

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const ratio = CONTENT_WIDTH_MM / imgWidthPx;
    const maxSliceHeightPx = Math.floor(CONTENT_HEIGHT_MM / ratio);

    // Find the best row to break at (scan for whitest row near target)
    const findBreakRow = (targetY: number): number => {
      const scanRange = Math.floor(maxSliceHeightPx * 0.15); // scan 15% around target
      const startScan = Math.max(0, targetY - scanRange);
      const endScan = Math.min(imgHeightPx, targetY + scanRange);
      
      const scanCanvas = document.createElement('canvas');
      scanCanvas.width = imgWidthPx;
      scanCanvas.height = endScan - startScan;
      const scanCtx = scanCanvas.getContext('2d')!;
      scanCtx.drawImage(canvas, 0, startScan, imgWidthPx, scanCanvas.height, 0, 0, imgWidthPx, scanCanvas.height);
      const imageData = scanCtx.getImageData(0, 0, imgWidthPx, scanCanvas.height);
      const data = imageData.data;
      
      let bestRow = targetY;
      let bestScore = -1;
      
      for (let row = 0; row < scanCanvas.height; row++) {
        let whitePixels = 0;
        const sampleStep = 4; // sample every 4th pixel for speed
        let samples = 0;
        for (let x = 0; x < imgWidthPx; x += sampleStep) {
          const idx = (row * imgWidthPx + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          if (r > 240 && g > 240 && b > 240) whitePixels++;
          samples++;
        }
        const score = whitePixels / samples;
        if (score > bestScore) {
          bestScore = score;
          bestRow = startScan + row;
        }
      }
      return bestRow;
    };

    // Calculate all break points
    const breakPoints: number[] = [0];
    let currentY = 0;
    while (currentY + maxSliceHeightPx < imgHeightPx) {
      const targetBreak = currentY + maxSliceHeightPx;
      const bestBreak = findBreakRow(targetBreak);
      breakPoints.push(bestBreak);
      currentY = bestBreak;
    }
    breakPoints.push(imgHeightPx);

    const totalPages = breakPoints.length - 1;

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const srcY = breakPoints[page];
      const srcH = breakPoints[page + 1] - srcY;
      const destH = srcH * ratio;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = Math.round(srcH);
      const ctx = pageCanvas.getContext('2d')!;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, Math.round(srcY), imgWidthPx, Math.round(srcH), 0, 0, imgWidthPx, Math.round(srcH));

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, destH);

      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.line(MARGIN_MM, A4_HEIGHT_MM - 12, A4_WIDTH_MM - MARGIN_MM, A4_HEIGHT_MM - 12);

      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${page + 1} / ${totalPages}`, A4_WIDTH_MM / 2, A4_HEIGHT_MM - 8, { align: 'center' });
    }

    const blob = pdf.output('blob');
    return { pdf, blob };
  } finally {
    document.body.removeChild(clone);
  }
};

export const downloadContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
) => {
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
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 5000);
  };
};
