import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 12;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;

export const generateContractPdf = async (
  element: HTMLElement,
  fileName: string = 'contract.pdf'
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  // Clone element to avoid visual disruption
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '794px'; // A4 at 96dpi
  clone.style.padding = '40px';
  clone.style.background = '#ffffff';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.direction = 'rtl';
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
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
      ctx.drawImage(canvas, 0, -Math.round(srcY));

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, destH);

      // Page footer
      pdf.setFontSize(7);
      pdf.setTextColor(150);
      const pageText = `صفحة ${page + 1} من ${totalPages}`;
      pdf.text(pageText, A4_WIDTH_MM / 2, A4_HEIGHT_MM - 5, { align: 'center' });
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
