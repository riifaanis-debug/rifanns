import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;

/**
 * Recursively clean an element tree for PDF export:
 * - Force white backgrounds
 * - Remove shadows, rounded corners
 * - Remove print-hidden elements
 * - Ensure text is dark and readable
 */
function cleanForPdf(el: HTMLElement) {
  // Remove print-hidden / print:hidden elements
  const printHidden = el.querySelectorAll('.print-hidden, .print\\:hidden, [class*="print:hidden"]');
  printHidden.forEach(node => (node as HTMLElement).remove());

  // Clean the root container
  el.style.background = '#ffffff';
  el.style.boxShadow = 'none';
  el.style.border = 'none';
  el.style.borderRadius = '0';
  el.style.maxWidth = 'none';
  el.style.minHeight = 'auto';

  // Walk all descendants and clean them
  const allElements = el.querySelectorAll('*') as NodeListOf<HTMLElement>;
  allElements.forEach(child => {
    const computed = window.getComputedStyle(child);
    
    // Force white/transparent backgrounds (except brand-colored elements and specific styled blocks)
    const bgColor = computed.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      // Keep very light backgrounds (like bg-gray-50/30, bg-brand/5) but make them lighter
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        const brightness = (r + g + b) / 3;
        // If it's a dark background (header area, nav), force white
        if (brightness < 200) {
          // Only keep genuinely light tinted backgrounds
          child.style.backgroundColor = 'transparent';
        }
      }
    }

    // Remove shadows
    child.style.boxShadow = 'none';
    
    // Remove excessive border radius for print
    const radius = parseFloat(computed.borderRadius);
    if (radius > 8) {
      child.style.borderRadius = '4px';
    }
  });
}

export const generateContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  // Clone element to avoid visual disruption
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '794px'; // A4 at 96dpi
  clone.style.padding = '32px 40px';
  clone.style.background = '#ffffff';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.direction = 'rtl';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.overflow = 'visible';
  clone.style.fontFamily = 'Tajawal, Arial, sans-serif';
  document.body.appendChild(clone);

  // Clean for professional PDF output
  cleanForPdf(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const ratio = CONTENT_WIDTH_MM / imgWidthPx;
    const scaledHeight = imgHeightPx * ratio;
    const totalPages = Math.ceil(scaledHeight / CONTENT_HEIGHT_MM);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const srcY = (page * CONTENT_HEIGHT_MM) / ratio;
      const srcH = Math.min(CONTENT_HEIGHT_MM / ratio, imgHeightPx - srcY);
      const destH = srcH * ratio;

      // Create a temp canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = Math.round(srcH);
      const ctx = pageCanvas.getContext('2d')!;
      
      // Fill white background first
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      
      ctx.drawImage(canvas, 0, -Math.round(srcY));

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(pageImgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, destH);

      // Thin line separator at bottom
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(MARGIN_MM, A4_HEIGHT_MM - 10, A4_WIDTH_MM - MARGIN_MM, A4_HEIGHT_MM - 10);

      // Page footer
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      const pageText = `${page + 1} / ${totalPages}`;
      pdf.text(pageText, A4_WIDTH_MM / 2, A4_HEIGHT_MM - 6, { align: 'center' });
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
