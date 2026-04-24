
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageLayout } from './StaticPages';
import { Button, Card } from './Shared';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Send, Sparkles,
  Scale, Building2, Home, Receipt, BarChart3, MessageSquare,
  Zap, BadgeCheck, AlertCircle,
  Share2, LogIn
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { submitRequest } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic field definitions
// ─────────────────────────────────────────────────────────────────────────────

type ExtraFieldType = 'text' | 'number' | 'amount' | 'date';

interface ExtraFieldDef {
  label: string;
  type: ExtraFieldType;
  placeholder?: string;
}

const EXTRA_FIELD_DEFS: Record<string, ExtraFieldDef> = {
  // Banking
  bankName: { label: 'اسم البنك / الجهة التمويلية', type: 'text', placeholder: 'مثال: البنك الأهلي السعودي' },
  accountNumber: { label: 'رقم الحساب / الآيبان', type: 'text', placeholder: 'SAxx xxxx xxxx xxxx' },
  cardLast4: { label: 'آخر 4 أرقام من البطاقة', type: 'text', placeholder: '1234' },
  totalDebt: { label: 'إجمالي المديونية (ر.س)', type: 'amount', placeholder: '0.00' },
  monthlyInstallment: { label: 'القسط الشهري الحالي (ر.س)', type: 'amount', placeholder: '0.00' },
  remainingTerm: { label: 'المدة المتبقية (شهور)', type: 'number', placeholder: '0' },

  // Judicial / Legal
  caseNumber: { label: 'رقم الدعوى / القضية', type: 'text', placeholder: 'يُترك فارغاً إن لم يوجد' },
  executionNumber: { label: 'رقم طلب التنفيذ', type: 'text', placeholder: 'يُترك فارغاً إن لم يوجد' },
  court: { label: 'المحكمة المختصة', type: 'text', placeholder: 'مثال: محكمة التنفيذ بالرياض' },
  oppositeParty: { label: 'الطرف المقابل', type: 'text', placeholder: 'الاسم أو اسم الجهة' },
  claimAmount: { label: 'مبلغ المطالبة (ر.س)', type: 'amount', placeholder: '0.00' },

  // Real estate
  deedNumber: { label: 'رقم الصك العقاري', type: 'text', placeholder: 'مثال: 3/1/xxxxxx' },
  propertyType: { label: 'نوع العقار', type: 'text', placeholder: 'فلة / شقة / أرض / تجاري' },
  propertyCity: { label: 'مدينة العقار', type: 'text', placeholder: 'مثال: الرياض' },
  propertyArea: { label: 'مساحة العقار (م²)', type: 'number', placeholder: '0' },
  estimatedValue: { label: 'القيمة التقديرية (ر.س)', type: 'amount', placeholder: '0.00' },

  // Tax / Zakat
  companyName: { label: 'اسم المنشأة', type: 'text', placeholder: 'الاسم النظامي للمنشأة' },
  crNumber: { label: 'رقم السجل التجاري', type: 'text', placeholder: '10xxxxxxxx' },
  taxNumber: { label: 'الرقم الضريبي (VAT)', type: 'text', placeholder: '3xxxxxxxxxxxxxx' },
  fineAmount: { label: 'قيمة الغرامة المعترض عليها (ر.س)', type: 'amount', placeholder: '0.00' },

  // Credit
  simahScore: { label: 'درجة سمة الحالية (إن وُجدت)', type: 'number', placeholder: '300 - 900' },
  obligationsCount: { label: 'عدد الالتزامات الحالية', type: 'number', placeholder: '0' },

  // Advisory / Common
  monthlyIncome: { label: 'الدخل الشهري (ر.س)', type: 'amount', placeholder: '0.00' },
  preferredDate: { label: 'تاريخ مفضل للتواصل', type: 'date' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Service catalog — 6 sections / 40 products
// ─────────────────────────────────────────────────────────────────────────────

interface SubService {
  id: string;
  name: string;
  description: string;
  features: string[];
  extraFields?: string[];
}

interface ServiceData {
  title: string;
  icon: React.ReactNode;
  intro: string;
  subServices: SubService[];
}

const SERVICES_CONTENT: Record<string, ServiceData> = {
  // 1) القضائية والعدلية — 8 منتجات
  legal: {
    title: 'الخدمات القضائية والعدلية',
    icon: <Scale className="text-gold" size={32} />,
    intro:
      'منظومة قانونية متخصصة لحماية حقوقك أمام الجهات القضائية والعدلية، بإشراف كوادر مهنية تتقن أنظمة التنفيذ ولوائح المعاملات المالية، لإدارة ملفاتك بكفاءة ومسؤولية.',
    subServices: [
      {
        id: 'file-financial-claim',
        name: 'رفع الدعاوى المالية',
        description:
          'إعداد لوائح ادعاء مُحكمة وتمثيلك أمام المحاكم المختصة للمطالبة بالحقوق والتعويضات المالية، مع متابعة كاملة حتى صدور الحكم.',
        features: ['صياغة قانونية احترافية', 'ترافع وتمثيل أمام القضاء', 'متابعة دقيقة للملف'],
        extraFields: ['oppositeParty', 'claimAmount', 'court'],
      },
      {
        id: 'execution-files',
        name: 'معالجة ملفات التنفيذ',
        description:
          'حلول نظامية لطلبات التنفيذ القضائي، تشمل تسوية الديون والتفاوض مع الدائنين بما يحفظ مصلحتك ويُجنّبك إجراءات الحجز والإيقاف.',
        features: ['تسوية الديون', 'تفاوض مع الدائنين', 'متابعة منصة ناجز'],
        extraFields: ['executionNumber', 'court', 'claimAmount'],
      },
      {
        id: 'lift-services-suspension',
        name: 'رفع إيقاف الخدمات',
        description:
          'إجراءات نظامية متخصصة لرفع إيقاف الخدمات الحكومية (أبشر، السفر، الرخص) المترتبة على المطالبات المالية، عبر معالجة المسبّبات الجذرية.',
        features: ['تحليل أسباب الإيقاف', 'مخاطبة الجهات المعنية', 'سرعة في الإنجاز'],
        extraFields: ['executionNumber'],
      },
      {
        id: 'legal-objections',
        name: 'الاعتراضات القانونية',
        description:
          'إعداد مذكرات اعتراض قانونية محكمة على القرارات والأحكام المالية ضمن المدد النظامية، مع تحليل دقيق للأسانيد القانونية والوقائع.',
        features: ['تحليل الأسانيد', 'صياغة قانونية محكمة', 'الالتزام بالمدد النظامية'],
        extraFields: ['caseNumber', 'court'],
      },
      {
        id: 'precautionary-seizure',
        name: 'طلبات الحجز التحفظي',
        description:
          'تقديم طلبات الحجز التحفظي على أموال المدين لضمان حقك المالي قبل صدور الحكم النهائي، وفق إجراءات نظامية دقيقة.',
        features: ['حماية الحق المالي', 'إجراءات سريعة', 'متابعة قضائية'],
        extraFields: ['oppositeParty', 'claimAmount'],
      },
      {
        id: 'judicial-settlement',
        name: 'الصلح والتسوية القضائية',
        description:
          'حلول ودية برعاية قضائية لإنهاء النزاعات المالية بصكوك صلح موثقة، توفر الوقت وتُحقق مصلحة الأطراف خارج إطار التقاضي الطويل.',
        features: ['وساطة محايدة', 'صكوك صلح موثقة', 'حلول مرضية للأطراف'],
        extraFields: ['oppositeParty', 'claimAmount'],
      },
      {
        id: 'commercial-papers',
        name: 'متابعة الأوراق التجارية',
        description:
          'إجراءات تحصيل الشيكات المرتجعة والكمبيالات والسندات لأمر عبر المحاكم التجارية ومحاكم التنفيذ بأسرع الإجراءات النظامية.',
        features: ['تحصيل الشيكات', 'متابعة محاكم التنفيذ', 'استرداد كامل المبلغ'],
        extraFields: ['oppositeParty', 'claimAmount'],
      },
      {
        id: 'inheritance-disputes',
        name: 'قضايا الإرث والتركات',
        description:
          'متابعة استخراج صكوك حصر الورثة، وفرز الممتلكات، وتقسيم التركات وفق الفريضة الشرعية، مع حل النزاعات المتعلقة بالإرث قضائياً.',
        features: ['حصر الورثة', 'فرز التركة', 'حل النزاعات الإرثية'],
      },
    ],
  },

  // 2) المصرفية — 13 منتج
  banking: {
    title: 'الخدمات المصرفية',
    icon: <Building2 className="text-gold" size={32} />,
    intro:
      'حلول مصرفية متكاملة تُسهّل تعاملك مع البنوك والجهات التمويلية، من تنظيم الحسابات وإدارة المنتجات حتى التسوية والجدولة، وفق ضوابط البنك المركزي السعودي (ساما).',
    subServices: [
      {
        id: 'debt-rescheduling',
        name: 'إعادة جدولة المنتجات التمويلية',
        description:
          'إعادة هيكلة قروضك القائمة بشروط أيسر، تشمل تخفيض القسط أو تمديد المدة بما يتوافق مع دخلك الحالي ويعيد توازنك المالي.',
        features: ['تخفيض القسط الشهري', 'تمديد فترة السداد', 'تفاوض مهني مع البنك'],
        extraFields: ['bankName', 'totalDebt', 'monthlyInstallment', 'remainingTerm'],
      },
      {
        id: 'debt-settlement',
        name: 'تسوية المديونيات',
        description:
          'التفاوض مع البنوك والجهات التمويلية للوصول إلى تسوية نهائية بمبلغ مخفّض، مع إنهاء الالتزام رسمياً وتحديث السجل الائتماني.',
        features: ['تخفيض المبلغ الإجمالي', 'إنهاء الالتزام رسمياً', 'تحديث سمة'],
        extraFields: ['bankName', 'totalDebt'],
      },
      {
        id: 'financial-exemption',
        name: 'طلب إعفاء من الالتزامات المالية',
        description:
          'دراسة حالتك واستيفاء متطلبات الإعفاء النظامي من الالتزامات التمويلية في الحالات المؤهلة (وفاة، عجز كلي، ظروف استثنائية).',
        features: ['دراسة شاملة للحالة', 'متابعة كاملة مع البنك', 'الإعفاء وفق الأنظمة'],
        extraFields: ['bankName', 'totalDebt'],
      },
      {
        id: 'installment-deferral',
        name: 'تأجيل الأقساط',
        description:
          'تقديم طلبات تأجيل القسط الشهري لفترة مؤقتة لمواجهة الظروف الطارئة، دون التأثير على سجلك الائتماني.',
        features: ['تأجيل مرن', 'لا يؤثر على سمة', 'سرعة في الموافقة'],
        extraFields: ['bankName', 'monthlyInstallment'],
      },
      {
        id: 'pos-solutions',
        name: 'نقاط البيع والمحافظ الإلكترونية',
        description:
          'توفير حلول دفع رقمية حديثة (POS، Apple Pay، Mada Pay) ترفع كفاءة منشأتك وتزيد من قنوات التحصيل.',
        features: ['تركيب فوري', 'عمولات منافسة', 'دعم فني متواصل'],
        extraFields: ['companyName', 'crNumber'],
      },
      {
        id: 'account-organization',
        name: 'تنظيم الحسابات البنكية',
        description:
          'تحديث بيانات الحسابات (KYC) ومعالجة الحسابات المجمدة وفك القيود، لضمان استمرارية معاملاتك المالية بأمان.',
        features: ['تحديث KYC', 'فك تجميد الحسابات', 'فتح حسابات متخصصة'],
        extraFields: ['bankName', 'accountNumber'],
      },
      {
        id: 'credit-cards-mgmt',
        name: 'إدارة البطاقات الائتمانية',
        description:
          'حلول لتسوية مديونيات البطاقات الائتمانية أو استبدالها بمنتجات أقل تكلفة، مع وضع خطة سداد عملية.',
        features: ['تخفيض الفوائد', 'جدولة المستحقات', 'إغلاق نظامي للبطاقات'],
        extraFields: ['bankName', 'cardLast4', 'totalDebt'],
      },
      {
        id: 'kyc-update',
        name: 'تحديث البيانات لدى البنوك',
        description:
          'إجراءات تحديث الهوية والوظيفة والعنوان لدى جميع البنوك التي تتعامل معها، لتجنّب تجميد الحسابات أو إيقاف الخدمات.',
        features: ['شامل لكل البنوك', 'إنجاز سريع', 'تجنب تجميد الحسابات'],
        extraFields: ['bankName'],
      },
      {
        id: 'lift-account-freeze',
        name: 'فك تجميد الحسابات',
        description:
          'معالجة قرارات تجميد الحسابات الصادرة من البنوك أو الجهات الرقابية، وفق إجراءات نظامية لاستعادة وصولك الكامل لحسابك.',
        features: ['تحليل سبب التجميد', 'مخاطبة الجهة المعنية', 'استعادة الحساب'],
        extraFields: ['bankName', 'accountNumber'],
      },
      {
        id: 'open-business-account',
        name: 'فتح حسابات المنشآت',
        description:
          'متابعة إجراءات فتح الحسابات البنكية للشركات والمؤسسات الفردية، مع استيفاء الوثائق النظامية والتمثيل أمام البنك.',
        features: ['مرافقة كاملة', 'استيفاء الوثائق', 'تسريع الموافقة'],
        extraFields: ['companyName', 'crNumber'],
      },
      {
        id: 'financing-application',
        name: 'متابعة طلبات التمويل',
        description:
          'إعداد ملف تمويلي احترافي ومتابعة طلبك لدى البنك أو شركة التمويل لزيادة فرص القبول والحصول على أفضل الشروط.',
        features: ['ملف تمويلي محكم', 'متابعة لحظية', 'تفاوض على الشروط'],
        extraFields: ['bankName', 'monthlyIncome'],
      },
      {
        id: 'open-banking',
        name: 'البنوك الرقمية والمفتوحة',
        description:
          'استشارات حول تفعيل خدمات البنوك المفتوحة (Open Banking) وربط الحسابات للحصول على أفضل عروض التمويل والتأمين.',
        features: ['تفعيل آمن', 'ربط حسابات متعددة', 'عروض شخصية'],
      },
      {
        id: 'banking-dispute',
        name: 'الشكاوى البنكية',
        description:
          'إعداد ومتابعة الشكاوى البنكية أمام ساما (البنك المركزي) لحل النزاعات المتعلقة بالحسابات والقروض والرسوم غير المستحقة.',
        features: ['صياغة احترافية', 'رفع لساما مباشرة', 'متابعة حتى الحل'],
        extraFields: ['bankName', 'accountNumber'],
      },
    ],
  },

  // 3) العقارية — 6 منتجات
  realestate: {
    title: 'الخدمات العقارية',
    icon: <Home className="text-gold" size={32} />,
    intro:
      'حلول عقارية متكاملة تُغطي التقييم والتوثيق والإفراغ والوساطة، لضمان توثيق ملكيتك نظامياً وحماية استثمارك العقاري وفق أنظمة الهيئة العامة للعقار.',
    subServices: [
      {
        id: 'real-estate-valuation',
        name: 'التقييم العقاري المعتمد',
        description:
          'تقارير تقييم عقاري دقيقة من مقيّمين معتمدين لدى الهيئة السعودية للمقيّمين المعتمدين (تقييم)، مقبولة لدى البنوك والجهات الرسمية.',
        features: ['مقيّمون معتمدون', 'تقارير تفصيلية', 'سرعة الإنجاز'],
        extraFields: ['propertyType', 'propertyCity', 'propertyArea', 'estimatedValue'],
      },
      {
        id: 'deed-issuance',
        name: 'استخراج وتحديث الصكوك',
        description:
          'إجراءات استخراج الصكوك العقارية الجديدة وتحديث الصكوك القديمة عبر منصة ناجز، مع فرز ودمج الوحدات وفق المتطلبات النظامية.',
        features: ['فرز الوحدات', 'دمج الصكوك', 'تحديث الصكوك القديمة'],
        extraFields: ['deedNumber', 'propertyType'],
      },
      {
        id: 'property-transfer',
        name: 'الإفراغ العقاري',
        description:
          'متابعة كاملة لإجراءات نقل ملكية العقار بين الأطراف عبر منصة ناجز، مع التحقق من الالتزامات والقيود قبل الإفراغ.',
        features: ['تحقق من القيود', 'إفراغ موثق إلكترونياً', 'حفظ حقوق الأطراف'],
        extraFields: ['deedNumber', 'propertyType'],
      },
      {
        id: 'lease-contracts',
        name: 'عقود الإيجار الموحّدة',
        description:
          'توثيق عقود الإيجار السكنية والتجارية على منصة "إيجار" لإصدار سندات تنفيذية تحفظ حقوق المؤجر والمستأجر نظامياً.',
        features: ['منصة إيجار الرسمية', 'سند تنفيذي', 'حماية الطرفين'],
        extraFields: ['propertyCity'],
      },
      {
        id: 'mortgage-services',
        name: 'الرهن العقاري وفك الرهن',
        description:
          'إجراءات الرهن العقاري لصالح الجهات التمويلية، أو فك الرهن بعد سداد الالتزام، عبر السجل العيني للعقار.',
        features: ['تسجيل الرهن', 'فك الرهن بعد السداد', 'متابعة كاتب العدل'],
        extraFields: ['deedNumber', 'bankName'],
      },
      {
        id: 'real-estate-brokerage',
        name: 'الوساطة والتسويق العقاري',
        description:
          'خدمات وساطة عقارية مرخّصة من الهيئة العامة للعقار، تشمل التسويق الاحترافي للعقارات والتفاوض لإتمام الصفقات.',
        features: ['وساطة مرخصة', 'تسويق احترافي', 'تفاوض مهني'],
        extraFields: ['propertyType', 'propertyCity', 'estimatedValue'],
      },
    ],
  },

  // 4) الزكوية والضريبية — 6 منتجات
  zakat: {
    title: 'الخدمات الزكوية والضريبية',
    icon: <Receipt className="text-gold" size={32} />,
    intro:
      'دعم متخصص لأصحاب المنشآت في الالتزام الزكوي والضريبي وفق أنظمة هيئة الزكاة والضريبة والجمارك (زاتكا)، مع إعداد الإقرارات وتقديم الاعتراضات لتجنب الغرامات.',
    subServices: [
      {
        id: 'vat-registration',
        name: 'التسجيل في ضريبة القيمة المضافة',
        description:
          'تسجيل المنشآت الجديدة والمؤهلة في نظام ضريبة القيمة المضافة لدى زاتكا، مع تأسيس الملف الضريبي بالشكل النظامي الصحيح.',
        features: ['تأسيس الملف الضريبي', 'الحصول على الشهادة', 'استشارات أولية'],
        extraFields: ['companyName', 'crNumber'],
      },
      {
        id: 'vat-returns',
        name: 'إعداد الإقرارات الضريبية',
        description:
          'إعداد ومراجعة إقرارات ضريبة القيمة المضافة الشهرية والربع سنوية بدقة، وتقديمها إلكترونياً ضمن المواعيد النظامية.',
        features: ['مراجعة الفواتير', 'الالتزام بالمواعيد', 'تجنب الغرامات'],
        extraFields: ['companyName', 'taxNumber'],
      },
      {
        id: 'zakat-returns',
        name: 'الإقرارات الزكوية',
        description:
          'إعداد الإقرارات الزكوية السنوية وفق وعاء الزكاة المعتمد، واستخراج شهادة الزكاة المطلوبة لتجديد التراخيص الحكومية.',
        features: ['حساب وعاء دقيق', 'شهادة زكاة سنوية', 'مطابقة لمتطلبات زاتكا'],
        extraFields: ['companyName', 'crNumber'],
      },
      {
        id: 'fines-objection',
        name: 'الاعتراض على الغرامات',
        description:
          'دراسة قانونية لمبررات الغرامات الزكوية والضريبية، وإعداد مذكرات اعتراض فنية لتقديمها للجنة الفصل في المخالفات.',
        features: ['تحليل قانوني', 'مذكرة اعتراض احترافية', 'تمثيل أمام اللجان'],
        extraFields: ['companyName', 'taxNumber', 'fineAmount'],
      },
      {
        id: 'einvoice-fatoora',
        name: 'الفوترة الإلكترونية (فاتورة)',
        description:
          'تأهيل المنشأة للفوترة الإلكترونية بمرحلتيها (الإصدار والربط)، وربط الأنظمة المحاسبية مع منصة "فاتورة" التابعة لزاتكا.',
        features: ['تأهيل النظام', 'ربط مع فاتورة', 'تدريب الموظفين'],
        extraFields: ['companyName', 'crNumber'],
      },
      {
        id: 'tax-consulting',
        name: 'الاستشارات الضريبية',
        description:
          'استشارات ضريبية متخصصة لتخطيط ضريبي سليم، وتجنّب المخاطر، والاستفادة من الإعفاءات والمعالجات النظامية المتاحة.',
        features: ['تخطيط ضريبي محكم', 'تجنب المخاطر', 'تطبيق الإعفاءات'],
        extraFields: ['companyName'],
      },
    ],
  },

  // 5) الائتمانية — 4 منتجات
  credit: {
    title: 'الخدمات الائتمانية',
    icon: <BarChart3 className="text-gold" size={32} />,
    intro:
      'خدمات تحليلية وتصحيحية لتحسين سجلك الائتماني ورفع تقييمك في "سمة"، عبر دراسة دقيقة للملاءة المالية وخطط عمل واقعية لاستعادة جدارتك التمويلية.',
    subServices: [
      {
        id: 'simah-correction',
        name: 'تصحيح وتحديث سجل سمة',
        description:
          'مراجعة شاملة للسجل الائتماني، ومعالجة الأخطاء والتعثرات القديمة، ومخاطبة الجهات الدائنة لتحديث الحالة لدى "سمة".',
        features: ['تحديث البيانات', 'معالجة التعثرات القديمة', 'تقرير دوري'],
        extraFields: ['simahScore', 'obligationsCount'],
      },
      {
        id: 'credit-score-boost',
        name: 'تحسين التقييم الائتماني',
        description:
          'استشارات وخطط عملية لرفع درجة "السكور" الائتماني خلال 90-180 يوماً، لزيادة فرص قبولك التمويلي بشروط أفضل.',
        features: ['خطة 90 يوماً', 'توزيع الالتزامات', 'سلوك مالي محسّن'],
        extraFields: ['simahScore', 'monthlyIncome'],
      },
      {
        id: 'solvency-study',
        name: 'دراسة الملاءة المالية',
        description:
          'تحليل دقيق لدخلك والتزاماتك ونسبة الاستقطاع، لمعرفة قدرتك التمويلية وتقديم توصيات عملية قبل التقدم لأي تمويل جديد.',
        features: ['تحليل شامل', 'حساب نسبة الاستقطاع', 'توصيات تمويلية'],
        extraFields: ['monthlyIncome', 'obligationsCount'],
      },
      {
        id: 'credit-recommendations',
        name: 'التوصيات الائتمانية',
        description:
          'توصيات مهنية مبنية على تحليل تقريرك الائتماني وسجلك البنكي، تشمل توقيت طلب التمويل وسلوكيات السداد المثلى.',
        features: ['توصيات مخصصة', 'متابعة دورية', 'تحسين فرص القبول'],
        extraFields: ['simahScore'],
      },
    ],
  },

  // 6) الاستشارية — 3 منتجات
  consulting: {
    title: 'الخدمات الاستشارية',
    icon: <MessageSquare className="text-gold" size={32} />,
    intro:
      'استشارات مالية وقانونية مهنية تُمكّنك من اتخاذ قرارات مدروسة، عبر تحليل دقيق لوضعك المالي وأهدافك، بإشراف خبراء يجمعون بين الكفاءة المصرفية والدراية القانونية.',
    subServices: [
      {
        id: 'personal-financial-planning',
        name: 'التخطيط المالي الشخصي',
        description:
          'بناء خطة مالية متكاملة تُغطي إدارة الدخل والمصروفات، وهيكلة الديون، وتكوين المدخرات، لتحقيق أهدافك المالية على المدى البعيد.',
        features: ['هيكلة الديون', 'ميزانية شهرية', 'أهداف مالية واضحة'],
        extraFields: ['monthlyIncome'],
      },
      {
        id: 'investment-consulting',
        name: 'الاستشارات الاستثمارية',
        description:
          'توجيهك نحو الفرص الاستثمارية الملائمة لملاءتك ومستوى مخاطرتك، مع تحليل مهني للمحفظة وتنويعها لتحقيق عوائد مستدامة.',
        features: ['تحليل المخاطر', 'تنويع المحفظة', 'متابعة الأداء'],
        extraFields: ['monthlyIncome', 'preferredDate'],
      },
      {
        id: 'business-restructuring',
        name: 'إعادة الهيكلة المالية للمنشآت',
        description:
          'دراسة مالية معمّقة لمنشأتك، تشمل إعادة هيكلة الديون، وتحسين التدفقات النقدية، ووضع خطة تعافٍ مالي شاملة وقابلة للتنفيذ.',
        features: ['تحليل مالي معمّق', 'خطة تعافٍ تنفيذية', 'متابعة دورية'],
        extraFields: ['companyName', 'crNumber', 'totalDebt'],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Number / amount input helpers
// ─────────────────────────────────────────────────────────────────────────────

const formatAmount = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned) return '';
  const [intPart, decPart] = cleaned.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${formattedInt}.${decPart.slice(0, 2)}` : formattedInt;
};

// ─────────────────────────────────────────────────────────────────────────────
// Request form — with dynamic extra fields
// ─────────────────────────────────────────────────────────────────────────────

const ServiceRequestForm: React.FC<{
  serviceType: string;
  subServiceName: string;
  extraFields?: string[];
}> = ({ serviceType, subServiceName, extraFields }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const { token, user } = useAuth();

  // Reset extra values when sub-service changes
  useEffect(() => {
    setExtraValues({});
  }, [subServiceName]);

  const handleExtraChange = (key: string, value: string, type: ExtraFieldType) => {
    let next = value;
    if (type === 'amount') next = formatAmount(value);
    else if (type === 'number') next = value.replace(/[^\d]/g, '');
    setExtraValues((prev) => ({ ...prev, [key]: next }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const nationalId = formData.get('nationalId') as string;
    const message = formData.get('message') as string;

    // Build labeled extras for both DB and admin email
    const extra: Record<string, { label: string; value: string }> = {};
    (extraFields || []).forEach((key) => {
      const def = EXTRA_FIELD_DEFS[key];
      const val = extraValues[key];
      if (def && val && val.trim()) {
        extra[key] = { label: def.label, value: val.trim() };
      }
    });

    try {
      const requestDataObj = {
        type: 'service_request',
        details: message || `طلب خدمة: ${subServiceName}`,
        data: {
          firstName: name?.split(' ')[0] || '',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          mobile: phone,
          nationalId,
          summary: message,
          serviceCategory: serviceType,
          subService: subServiceName,
          extra,
        },
      };

      const result = await submitRequest(requestDataObj);

      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id: result?.id || Date.now().toString(),
              type: 'service_request',
              details: message,
              data: requestDataObj.data,
            },
            userData: { fullName: name, phone, national_id: nationalId },
          },
        });
      } catch (emailErr) {
        console.error('Email notification error:', emailErr);
      }

      setSubmitted(true);
      window.dispatchEvent(new CustomEvent('request-submitted'));
    } catch (err: any) {
      setError(err.message || 'عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-[24px] p-8 text-center animate-in zoom-in duration-300 w-full">
        <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
        <h3 className="text-[18px] font-extrabold text-brand mb-2">تم استلام طلبك لـ {subServiceName}</h3>
        <p className="text-[13px] text-brand font-bold leading-relaxed">
          سيقوم مستشارنا في قطاع ({serviceType}) بالتواصل معك قريباً.
        </p>
        <Button className="mt-6 w-full" onClick={() => setSubmitted(false)}>
          طلب خدمة أخرى
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] border border-gold/30 p-5 shadow-sm w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          <Send size={24} />
        </div>
        <div>
          <h3 className="text-[16px] font-extrabold text-brand">طلب {subServiceName}</h3>
          <p className="text-[11px] text-muted">بياناتك محمية ومشفرة SSL</p>
        </div>
      </div>

      {!token && (
        <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-[16px] mb-4">
          <div className="flex items-center gap-2 text-amber-700 text-[13px] font-bold">
            <AlertCircle size={16} />
            <span>غير مسجل الدخول</span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/auth';
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-[13px] font-bold hover:bg-brand/90 transition-colors"
          >
            <LogIn size={16} />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="Service_Category" value={serviceType} />
        <input type="hidden" name="Sub_Service" value={subServiceName} />

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">الاسم الكامل</label>
            <input
              name="name"
              required
              type="text"
              defaultValue={user?.fullName || user?.name || ''}
              readOnly={!!(user?.fullName || user?.name)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[16px] md:text-[13px] outline-none focus:border-gold focus:bg-white transition-all ${(user?.fullName || user?.name) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="أدخل اسمك كما في الهوية"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">رقم الهوية</label>
            <input
              name="nationalId"
              required
              type="text"
              defaultValue={user?.national_id || user?.nationalId || ''}
              readOnly={!!(user?.national_id || user?.nationalId)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[16px] md:text-[13px] outline-none focus:border-gold focus:bg-white transition-all ${(user?.national_id || user?.nationalId) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="أدخل رقم الهوية الوطنية"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-brand block pr-1">رقم الجوال</label>
            <input
              name="phone"
              required
              type="tel"
              defaultValue={user?.phone || user?.mobile || ''}
              readOnly={!!(user?.phone || user?.mobile)}
              className={`w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[16px] md:text-[13px] font-bold tracking-wider outline-none focus:border-gold focus:bg-white transition-all ${(user?.phone || user?.mobile) ? 'bg-gray-100 text-muted cursor-not-allowed' : ''}`}
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>

        {/* Dynamic extra fields */}
        {extraFields && extraFields.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-gold/10 mt-4">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gold" />
              <span className="text-[12px] font-extrabold text-brand">بيانات إضافية متعلقة بالخدمة</span>
            </div>
            {extraFields.map((key) => {
              const def = EXTRA_FIELD_DEFS[key];
              if (!def) return null;
              const val = extraValues[key] || '';
              const inputType =
                def.type === 'date' ? 'date' : def.type === 'number' || def.type === 'amount' ? 'text' : 'text';
              return (
                <div key={key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-brand block pr-1">{def.label}</label>
                  <input
                    type={inputType}
                    inputMode={def.type === 'amount' || def.type === 'number' ? 'decimal' : undefined}
                    value={val}
                    onChange={(e) => handleExtraChange(key, e.target.value, def.type)}
                    placeholder={def.placeholder}
                    className="w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[16px] md:text-[13px] outline-none focus:border-gold focus:bg-white transition-all"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-brand block pr-1">تفاصيل إضافية</label>
          <textarea
            name="message"
            className="w-full p-3 rounded-[14px] border border-gray-100 bg-gray-50 text-[16px] md:text-[13px] outline-none focus:border-gold focus:bg-white transition-all h-24 resize-none"
            placeholder="يرجى كتابة لمحة سريعة عن طلبك..."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <Button disabled={loading || !token} type="submit" className="w-full h-12 gap-2 text-[14px] shadow-lg group">
          {loading ? 'جاري الإرسال...' : 'إرسال طلب الخدمة'}
          {!loading && <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />}
        </Button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export const ServiceDetailPage: React.FC<{ type: string; subType?: string }> = ({ type, subType }) => {
  const content = SERVICES_CONTENT[type];
  const [selectedSubService, setSelectedSubService] = useState<SubService | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (content) {
      if (subType) {
        const found = content.subServices.find((s) => s.id === subType);
        setSelectedSubService(found || content.subServices[0]);
      } else {
        setSelectedSubService(content.subServices[0]);
      }
    }
  }, [type, subType, content]);

  const handleSelectSub = (sub: SubService) => {
    setSelectedSubService(sub);
    // Smooth scroll to form after a short delay so DOM updates
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const handleBackToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '#/services';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!content)
    return (
      <PageLayout title="خطأ">
        <div className="text-center py-10 w-full">
          <h2 className="text-brand font-bold">الخدمة المطلوبة غير موجودة</h2>
          <a href="#/services" className="text-gold underline mt-4 block">
            العودة لدليل الخدمات
          </a>
        </div>
      </PageLayout>
    );

  return (
    <PageLayout title={content.title} backLink="#/services" backText="العودة لدليل الخدمات">
      <div className="space-y-8 w-full max-w-full">
        {/* Share */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: content.title, url });
              else {
                navigator.clipboard.writeText(url);
                alert('تم نسخ رابط الخدمة');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/20 text-brand text-[12px] font-bold hover:bg-gold/20 transition-colors"
          >
            <Share2 size={16} className="text-gold" />
            <span>مشاركة الخدمة</span>
          </button>
        </div>

        {/* Intro */}
        <div className="flex flex-col gap-4 bg-gradient-to-br from-brand/5 to-gold/5 p-5 rounded-[24px] border border-gold/10 w-full overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
            {content.icon}
          </div>
          <p className="text-[13px] leading-7 text-brand font-bold text-justify">{content.intro}</p>
        </div>

        {/* Sub-services list as cards with CTA */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-6 bg-gold rounded-full" />
            <h3 className="text-[15px] font-extrabold text-brand">
              المنتجات المتاحة ({content.subServices.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            {content.subServices.map((sub) => {
              const active = selectedSubService?.id === sub.id;
              return (
                <Card
                  key={sub.id}
                  className={`!p-4 transition-all duration-300 w-full ${
                    active ? 'border-gold shadow-md ring-2 ring-gold/10 bg-[#FFFBF2]' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-[14px] font-extrabold text-brand leading-snug flex-1">{sub.name}</h4>
                    {active && <BadgeCheck size={18} className="text-gold shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-[12px] text-brand/80 font-bold leading-6 mb-3">{sub.description}</p>
                  <div className="space-y-1.5 mb-3">
                    {sub.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11.5px] text-brand font-bold">
                        <Zap size={12} className="text-gold shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSelectSub(sub)}
                    className="w-full h-10 rounded-xl bg-gold text-brand font-extrabold text-[13px] hover:bg-gold/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send size={14} />
                    <span>تقدم بطلب الخدمة</span>
                  </button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Form */}
        {selectedSubService && (
          <div
            ref={formRef}
            id="request-form"
            className="animate-in fade-in slide-in-from-bottom-6 duration-500 w-full max-w-full overflow-hidden scroll-mt-24"
          >
            <ServiceRequestForm
              serviceType={content.title}
              subServiceName={selectedSubService.name}
              extraFields={selectedSubService.extraFields}
            />

            <div className="flex flex-col gap-4 mt-8">
              <div className="h-px bg-gold/10 w-full" />
              <Button
                onClick={handleBackToServices}
                variant="ghost"
                className="w-full h-12 gap-3 border-gold/30 hover:border-gold"
              >
                <ArrowRight size={18} />
                <span>العودة لدليل الخدمات</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
