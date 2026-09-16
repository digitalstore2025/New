import type { CategoryKey, Locale } from './types';

type Copy = {
  tagline: string;
  search: string;
  matches: string;
  ready: string;
  title: string;
  intro: string;
  themes: string;
  aiBrief: string;
  gathering: string;
  balance: string;
  failed: string;
  failureBody: string;
  retry: string;
  regenerate: string;
  verifiedData: string;
  capital: string;
  region: string;
  population: string;
  coordinates: string;
  unavailable: string;
  latest: string;
  sourceWorldBank: string;
  heritageTitle: string;
  sourceUnesco: string;
  heritageProperties: string;
  noHeritage: string;
  heritageUnavailable: string;
  degradedFallback: string;
  evidenceTitle: string;
  evidenceBody: string;
  methodologyLink: string;
  aiSourceLabel: string;
  groundedSourceLabel: string;
  groundedTitle: string;
  groundedBadge: string;
  groundedBody: string;
  groundedLoading: string;
  groundedUnavailable: string;
  groundedSupported: string;
  groundedAbstained: string;
  groundedCached: string;
  groundedFresh: string;
  statusLabels: Record<string, string>;
  retrieved: string;
  inDanger: string;
  aiDisclosure: string;
  mapDisclosure: string;
  sourcesTitle: string;
  sourceBody: string;
  share: string;
  copied: string;
  controls: string;
  rotateLeft: string;
  rotateRight: string;
  rotateUp: string;
  rotateDown: string;
  zoomIn: string;
  zoomOut: string;
  resetGlobe: string;
  globeLabel: string;
  globeHint: string;
  mapUnavailable: string;
  categories: Record<CategoryKey, string>;
  heritageCategories: Record<string, string>;
};

export const copy: Record<Locale, Copy> = {
  en: {
    tagline: 'Explore the world with source-backed data and AI curiosity.',
    search: 'Search any country…',
    matches: 'Country matches',
    ready: 'READY TO EXPLORE',
    title: 'Pick a place on Earth.',
    intro: 'Select a country on the globe or use search. Country metadata comes from the World Bank, World Heritage records come from UNESCO DataHub, and the five-theme brief is AI-generated and clearly separated.',
    themes: 'Culture · Food · History · Language · Nature',
    aiBrief: 'AI COUNTRY BRIEF',
    gathering: 'Building the country brief…',
    balance: 'Using structured output and avoiding stereotypes and disputed claims stated as certainty.',
    failed: 'Couldn’t generate the AI brief.',
    failureBody: 'The AI service did not return a usable response. You can retry without losing the selected country.',
    retry: 'Retry',
    regenerate: 'Regenerate',
    verifiedData: 'SOURCE-BACKED COUNTRY DATA',
    capital: 'Capital',
    region: 'Region',
    population: 'Population',
    coordinates: 'Coordinates',
    unavailable: 'Unavailable',
    latest: 'latest available',
    sourceWorldBank: 'World Bank API',
    heritageTitle: 'UNESCO WORLD HERITAGE',
    sourceUnesco: 'UNESCO DataHub',
    heritageProperties: 'properties in the current dataset',
    noHeritage: 'No matching World Heritage records were returned for this country in the current dataset.',
    heritageUnavailable: 'UNESCO heritage data is temporarily unavailable. Other country data remains usable.',
    degradedFallback: 'A live provider did not respond, so GlobeSpark is showing the last successful local copy for one or more sections. Source dates remain visible.',
    evidenceTitle: 'EVIDENCE STATUS',
    evidenceBody: 'Source-backed data and generated explanation are tracked separately. No synthetic trust score is used.',
    methodologyLink: 'Methodology',
    aiSourceLabel: 'AI explanation',
    groundedSourceLabel: 'Grounded RAG',
    groundedTitle: 'SOURCE-GROUNDED INSIGHTS',
    groundedBadge: 'Citations + abstention',
    groundedBody: 'This layer is generated only from the authoritative evidence pack shown by the server. Unsupported themes explicitly abstain instead of using model memory.',
    groundedLoading: 'Building a source-grounded brief…',
    groundedUnavailable: 'The grounded synthesis is temporarily unavailable. Verified source sections remain usable.',
    groundedSupported: 'Supported',
    groundedAbstained: 'Insufficient evidence',
    groundedCached: 'Grounded result served from the seven-day cache; original source retrieval dates remain attached.',
    groundedFresh: 'Fresh grounded synthesis generated from the current evidence pack.',
    statusLabels: { live: 'Live', cache: 'Cached generation', fallback: 'Last-good fallback', unavailable: 'Unavailable', loading: 'Checking…', pending: 'Pending' },
    retrieved: 'Retrieved',
    inDanger: 'In Danger',
    aiDisclosure: 'AI-generated educational content is not source-cited. Verify consequential claims with authoritative sources.',
    mapDisclosure: 'Boundary note: the map uses a Natural Earth-derived 1:110m dataset. Default Natural Earth country boundaries can reflect de facto control and may not represent every legal or political viewpoint.',
    sourcesTitle: 'Sources & methodology',
    sourceBody: 'Country metadata is fetched from the World Bank V2 API. World Heritage records are queried from UNESCO DataHub dataset whc001. Map geometry is derived from Natural Earth data. AI text is generated separately and is never presented as verified source data. Private research or prospecting datasets are isolated from public country content and are not used as verification sources.',
    share: 'Copy share link',
    copied: 'Link copied',
    controls: 'Globe controls',
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    rotateUp: 'Rotate up',
    rotateDown: 'Rotate down',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetGlobe: 'Reset globe',
    globeLabel: 'Interactive world globe. Drag to rotate, use wheel or buttons to zoom, or use the country search as a keyboard-accessible alternative.',
    globeHint: 'Drag · Wheel to zoom · Click a country',
    mapUnavailable: 'Map outlines are temporarily unavailable. Country search still works.',
    categories: { culture: 'Culture', food: 'Food', history: 'History', language: 'Language', nature: 'Nature' },
    heritageCategories: { Cultural: 'Cultural', Natural: 'Natural', Mixed: 'Mixed' },
  },
  ar: {
    tagline: 'استكشف العالم ببيانات مسندة إلى مصادر وفضول مدعوم بالذكاء الاصطناعي.',
    search: 'ابحث عن أي دولة…',
    matches: 'الدول المطابقة',
    ready: 'جاهز للاستكشاف',
    title: 'اختر مكانًا على الأرض.',
    intro: 'اختر دولة من الكرة أو استخدم البحث. بيانات الدولة الأساسية تأتي من البنك الدولي، وسجلات التراث العالمي من UNESCO DataHub، بينما الملخص ذو المحاور الخمسة مولّد بالذكاء الاصطناعي ومعروض في طبقة منفصلة.',
    themes: 'الثقافة · الطعام · التاريخ · اللغة · الطبيعة',
    aiBrief: 'ملخص الدولة بالذكاء الاصطناعي',
    gathering: 'يتم إعداد ملخص الدولة…',
    balance: 'إخراج منظم مع تجنب القوالب النمطية وعدم عرض القضايا المتنازع عليها كحقائق يقينية.',
    failed: 'تعذر إنشاء الملخص بالذكاء الاصطناعي.',
    failureBody: 'لم تُرجع خدمة الذكاء الاصطناعي استجابة صالحة. يمكنك إعادة المحاولة دون فقد الدولة المحددة.',
    retry: 'إعادة المحاولة',
    regenerate: 'توليد جديد',
    verifiedData: 'بيانات دولة مسندة إلى مصادر',
    capital: 'العاصمة',
    region: 'المنطقة',
    population: 'السكان',
    coordinates: 'الإحداثيات',
    unavailable: 'غير متاح',
    latest: 'أحدث قيمة متاحة',
    sourceWorldBank: 'واجهة البنك الدولي',
    heritageTitle: 'التراث العالمي لليونسكو',
    sourceUnesco: 'UNESCO DataHub',
    heritageProperties: 'موقعًا في مجموعة البيانات الحالية',
    noHeritage: 'لم تُرجع مجموعة البيانات الحالية سجلات تراث عالمي مطابقة لهذه الدولة.',
    heritageUnavailable: 'بيانات اليونسكو غير متاحة مؤقتًا، بينما تظل بقية بيانات الدولة قابلة للاستخدام.',
    degradedFallback: 'لم يستجب أحد مزودي البيانات المباشرين، لذلك يعرض GlobeSpark آخر نسخة محلية ناجحة لقسم أو أكثر مع الإبقاء على تواريخ المصادر ظاهرة.',
    evidenceTitle: 'حالة الأدلة والمصادر',
    evidenceBody: 'تُتابع البيانات المسندة إلى المصادر والتفسير المولّد كلٌ على حدة، دون استخدام درجة ثقة اصطناعية.',
    methodologyLink: 'المنهجية',
    aiSourceLabel: 'التفسير بالذكاء الاصطناعي',
    groundedSourceLabel: 'RAG موثق',
    groundedTitle: 'رؤى مولدة من أدلة موثقة',
    groundedBadge: 'استشهادات + امتناع',
    groundedBody: 'تُولّد هذه الطبقة فقط من حزمة الأدلة الرسمية التي يجمعها الخادم. إذا لم يدعم المصدر محورًا ما، يمتنع النظام صراحةً بدل الاعتماد على ذاكرة النموذج.',
    groundedLoading: 'جارٍ بناء ملخص موثق بالمصادر…',
    groundedUnavailable: 'التوليد الموثق غير متاح مؤقتًا، بينما تبقى أقسام المصادر الرسمية قابلة للاستخدام.',
    groundedSupported: 'مدعوم بالمصدر',
    groundedAbstained: 'الأدلة غير كافية',
    groundedCached: 'تم عرض نتيجة موثقة مخزنة لمدة لا تتجاوز سبعة أيام مع الاحتفاظ بتواريخ استرجاع المصادر الأصلية.',
    groundedFresh: 'توليد موثق جديد مبني على حزمة الأدلة الحالية.',
    statusLabels: { live: 'مباشر', cache: 'توليد مخزن', fallback: 'آخر نسخة ناجحة', unavailable: 'غير متاح', loading: 'جارٍ التحقق…', pending: 'قيد الانتظار' },
    retrieved: 'تاريخ الاسترجاع',
    inDanger: 'على قائمة الخطر',
    aiDisclosure: 'المحتوى التعليمي المولّد بالذكاء الاصطناعي غير موثق بمراجع داخلية. تحقّق من الادعاءات المهمة عبر مصادر رسمية.',
    mapDisclosure: 'ملاحظة الحدود: تستخدم الخريطة بيانات 1:110m مشتقة من Natural Earth. الحدود الافتراضية قد تعكس السيطرة الفعلية ولا تمثل جميع المواقف القانونية أو السياسية.',
    sourcesTitle: 'المصادر والمنهجية',
    sourceBody: 'تُجلب بيانات الدولة الأساسية من World Bank V2 API، وتُستعلم سجلات التراث العالمي من مجموعة UNESCO DataHub whc001، وهندسة الخريطة مشتقة من Natural Earth. نص الذكاء الاصطناعي منفصل ولا يُعرض كمصدر بيانات موثق. قواعد بيانات البحث أو الاستهداف المؤسسي الخاصة معزولة عن محتوى الدول العام ولا تستخدم كمصدر تحقق.',
    share: 'نسخ رابط المشاركة',
    copied: 'تم نسخ الرابط',
    controls: 'أدوات التحكم بالكرة',
    rotateLeft: 'تدوير لليسار',
    rotateRight: 'تدوير لليمين',
    rotateUp: 'تدوير للأعلى',
    rotateDown: 'تدوير للأسفل',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    resetGlobe: 'إعادة ضبط الكرة',
    globeLabel: 'كرة أرضية تفاعلية. اسحب للتدوير، واستخدم العجلة أو الأزرار للتكبير والتصغير، أو استخدم بحث الدول كبديل متاح بلوحة المفاتيح.',
    globeHint: 'اسحب · العجلة للتكبير · انقر دولة',
    mapUnavailable: 'حدود الخريطة غير متاحة مؤقتًا. البحث عن الدول ما زال يعمل.',
    categories: { culture: 'الثقافة', food: 'الطعام', history: 'التاريخ', language: 'اللغة', nature: 'الطبيعة' },
    heritageCategories: { Cultural: 'ثقافي', Natural: 'طبيعي', Mixed: 'مختلط' },
  },
  tr: {
    tagline: 'Dünyayı kaynak destekli veriler ve yapay zekâ merakıyla keşfedin.',
    search: 'Herhangi bir ülke ara…',
    matches: 'Ülke eşleşmeleri',
    ready: 'KEŞFE HAZIR',
    title: 'Dünyadan bir yer seçin.',
    intro: 'Küreden bir ülke seçin veya aramayı kullanın. Temel ülke verileri Dünya Bankası’ndan, Dünya Mirası kayıtları UNESCO DataHub’dan gelir; beş temalı yapay zekâ özeti ayrı bir katmanda açıkça etiketlenir.',
    themes: 'Kültür · Yemek · Tarih · Dil · Doğa',
    aiBrief: 'YAPAY ZEKÂ ÜLKE ÖZETİ',
    gathering: 'Ülke özeti hazırlanıyor…',
    balance: 'Yapılandırılmış çıktı kullanılıyor; stereotiplerden ve tartışmalı iddiaları kesin gerçek gibi sunmaktan kaçınılıyor.',
    failed: 'Yapay zekâ özeti oluşturulamadı.',
    failureBody: 'Yapay zekâ servisi kullanılabilir bir yanıt döndürmedi. Seçili ülkeyi kaybetmeden tekrar deneyebilirsiniz.',
    retry: 'Tekrar dene',
    regenerate: 'Yeniden üret',
    verifiedData: 'KAYNAK DESTEKLİ ÜLKE VERİSİ',
    capital: 'Başkent',
    region: 'Bölge',
    population: 'Nüfus',
    coordinates: 'Koordinatlar',
    unavailable: 'Mevcut değil',
    latest: 'mevcut en güncel',
    sourceWorldBank: 'Dünya Bankası API',
    heritageTitle: 'UNESCO DÜNYA MİRASI',
    sourceUnesco: 'UNESCO DataHub',
    heritageProperties: 'güncel veri kümesindeki varlık',
    noHeritage: 'Mevcut veri kümesinde bu ülke için eşleşen Dünya Mirası kaydı dönmedi.',
    heritageUnavailable: 'UNESCO miras verileri geçici olarak kullanılamıyor. Diğer ülke verileri kullanılmaya devam edebilir.',
    degradedFallback: 'Canlı veri sağlayıcılarından biri yanıt vermedi; GlobeSpark bir veya daha fazla bölüm için son başarılı yerel kopyayı gösteriyor ve kaynak tarihlerini görünür tutuyor.',
    evidenceTitle: 'KANIT VE KAYNAK DURUMU',
    evidenceBody: 'Kaynak destekli veriler ile üretilmiş açıklamalar ayrı izlenir; yapay bir güven puanı kullanılmaz.',
    methodologyLink: 'Yöntem',
    aiSourceLabel: 'Yapay zekâ açıklaması',
    groundedSourceLabel: 'Kaynaklı RAG',
    groundedTitle: 'KAYNAKLA TEMELLENDİRİLMİŞ İÇGÖRÜLER',
    groundedBadge: 'Atıf + çekimserlik',
    groundedBody: 'Bu katman yalnızca sunucunun topladığı yetkili kanıt paketinden üretilir. Kanıtın desteklemediği temalarda model hafızasına başvurmak yerine açıkça çekimser kalır.',
    groundedLoading: 'Kaynakla temellendirilmiş özet hazırlanıyor…',
    groundedUnavailable: 'Kaynaklı sentez geçici olarak kullanılamıyor. Doğrulanmış kaynak bölümleri kullanılmaya devam eder.',
    groundedSupported: 'Kaynakla destekli',
    groundedAbstained: 'Yetersiz kanıt',
    groundedCached: 'Yedi günlük önbellekten kaynaklı sonuç gösteriliyor; özgün kaynak alma tarihleri korunur.',
    groundedFresh: 'Güncel kanıt paketinden yeni kaynaklı sentez üretildi.',
    statusLabels: { live: 'Canlı', cache: 'Önbellek üretimi', fallback: 'Son başarılı kopya', unavailable: 'Kullanılamıyor', loading: 'Kontrol ediliyor…', pending: 'Bekliyor' },
    retrieved: 'Alınma tarihi',
    inDanger: 'Tehlike Listesinde',
    aiDisclosure: 'Yapay zekâ tarafından üretilen eğitim içeriği kaynak gösterimli değildir. Önemli iddiaları yetkili kaynaklardan doğrulayın.',
    mapDisclosure: 'Sınır notu: Harita Natural Earth kaynaklı 1:110m veri setini kullanır. Varsayılan sınırlar fiilî kontrolü yansıtabilir ve tüm hukuki veya siyasi görüşleri temsil etmeyebilir.',
    sourcesTitle: 'Kaynaklar ve yöntem',
    sourceBody: 'Temel ülke metaverisi World Bank V2 API üzerinden alınır. Dünya Mirası kayıtları UNESCO DataHub whc001 veri kümesinden sorgulanır. Harita geometrisi Natural Earth verisinden türetilir. Yapay zekâ metni ayrıdır ve doğrulanmış veri kaynağı olarak sunulmaz. Özel araştırma veya kurumsal prospecting veri kümeleri kamuya açık ülke içeriğinden izole edilir ve doğrulama kaynağı olarak kullanılmaz.',
    share: 'Paylaşım bağlantısını kopyala',
    copied: 'Bağlantı kopyalandı',
    controls: 'Küre kontrolleri',
    rotateLeft: 'Sola döndür',
    rotateRight: 'Sağa döndür',
    rotateUp: 'Yukarı döndür',
    rotateDown: 'Aşağı döndür',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    resetGlobe: 'Küreyi sıfırla',
    globeLabel: 'Etkileşimli dünya küresi. Döndürmek için sürükleyin, yakınlaştırmak için tekerlek veya düğmeleri kullanın; klavye erişimi için ülke aramasını kullanabilirsiniz.',
    globeHint: 'Sürükle · Yakınlaştır · Ülkeye tıkla',
    mapUnavailable: 'Harita sınırları geçici olarak kullanılamıyor. Ülke araması çalışmaya devam ediyor.',
    categories: { culture: 'Kültür', food: 'Yemek', history: 'Tarih', language: 'Dil', nature: 'Doğa' },
    heritageCategories: { Cultural: 'Kültürel', Natural: 'Doğal', Mixed: 'Karma' },
  },
};
