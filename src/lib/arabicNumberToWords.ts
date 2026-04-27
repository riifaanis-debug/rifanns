// Arabic number-to-words for SAR amounts (handles up to billions, with halalas)
const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

const convertHundreds = (num: number): string => {
  if (num === 0) return '';
  const parts: string[] = [];
  const h = Math.floor(num / 100);
  const rem = num % 100;
  if (h > 0) parts.push(hundreds[h]);
  if (rem > 0) {
    if (rem < 20) parts.push(ones[rem]);
    else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      if (o > 0) parts.push(`${ones[o]} و${tens[t]}`);
      else parts.push(tens[t]);
    }
  }
  return parts.join(' و');
};

const groupName = (count: number, singular: string, dual: string, plural: string): string => {
  if (count === 1) return singular;
  if (count === 2) return dual;
  if (count >= 3 && count <= 10) return plural;
  return singular;
};

export const numberToArabicWords = (n: number): string => {
  if (!isFinite(n) || n < 0) return '';
  const integer = Math.floor(n);
  const halalas = Math.round((n - integer) * 100);

  if (integer === 0 && halalas === 0) return 'صفر ريال';

  const billion = Math.floor(integer / 1_000_000_000);
  const million = Math.floor((integer % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((integer % 1_000_000) / 1_000);
  const rest = integer % 1_000;

  const parts: string[] = [];
  if (billion > 0) parts.push(`${convertHundreds(billion)} ${groupName(billion, 'مليار', 'ملياران', 'مليارات')}`);
  if (million > 0) parts.push(`${convertHundreds(million)} ${groupName(million, 'مليون', 'مليونان', 'ملايين')}`);
  if (thousand > 0) {
    if (thousand === 1) parts.push('ألف');
    else if (thousand === 2) parts.push('ألفان');
    else if (thousand >= 3 && thousand <= 10) parts.push(`${convertHundreds(thousand)} آلاف`);
    else parts.push(`${convertHundreds(thousand)} ألف`);
  }
  if (rest > 0) parts.push(convertHundreds(rest));

  let result = parts.join(' و') + ' ريال';
  if (halalas > 0) {
    result += ` و${convertHundreds(halalas)} هللة`;
  }
  return result + ' لا غير';
};
