export interface InvoiceTemplateItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface NicheTemplate {
  slug: string;
  title: string;
  category: "Freelance & Jasa" | "Bisnis & UKM" | "Kreatif & IT" | "Operasional & Properti";
  shortDesc: string;
  keywords: string[];
  pdfTemplate: "classic" | "modern" | "minimal";
  currency: "IDR" | "USD" | "SGD" | "EUR";
  taxRate?: number;
  sampleData: {
    businessName: string;
    customerName: string;
    invoiceNumber: string;
    items: InvoiceTemplateItem[];
    notes: string;
  };
  overview: string;
  whyNeedGuide: string;
  checklist: string[];
  faq: { q: string; a: string }[];
}

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    slug: "invoice-freelance",
    title: "Template Invoice Freelance & Pekerja Lepas",
    category: "Freelance & Jasa",
    shortDesc:
      "Contoh format tagihan profesional untuk freelancer, content writer, translator, dan konsultan independen.",
    keywords: [
      "template invoice freelance",
      "contoh invoice pekerja lepas",
      "format tagihan freelancer",
      "invoice jasa lepas online",
      "sample invoice freelance word pdf",
    ],
    pdfTemplate: "modern",
    currency: "IDR",
    sampleData: {
      businessName: "Rian Pratama (Freelance Writer)",
      customerName: "PT Media Kreasi Digital",
      invoiceNumber: "INV/FL/2026/08/01",
      items: [
        {
          description: "Jasa Penulisan 8 Artikel SEO Blog (1.500 kata/artikel)",
          quantity: 8,
          price: 350000,
          amount: 2800000,
        },
        {
          description: "Riset Kata Kunci & Optimasi Meta Description",
          quantity: 1,
          price: 500000,
          amount: 500000,
        },
      ],
      notes: "Pembayaran jatuh tempo 7 hari setelah invoice diterima. Transfer ke BCA 8720192831 a/n Rian Pratama.",
    },
    overview:
      "Sebagai pekerja lepas (freelancer), invoice adalah dokumen resmi yang membuktikan profesionalisme Anda di mata klien korporat maupun perorangan. Template ini dirancang ringkas namun memuat rincian jasa dan termin pembayaran yang jelas.",
    whyNeedGuide:
      "Invoice yang jelas mengurangi risiko keterlambatan pembayaran hingga 70% dan memudahkan rekonsiliasi transfer bank.",
    checklist: [
      "Cantumkan nama lengkap & kontak profesional Anda",
      "Rincikan ruang lingkup pekerjaan (deliverables) secara detail",
      "Sertakan nomor rekening bank yang valid & batas waktu jatuh tempo",
      "Gunakan penomoran invoice yang urut dan sistematis",
    ],
    faq: [
      {
        q: "Apakah freelancer wajib membuat invoice?",
        a: "Ya, sebagian besar perusahaan klien membutuhkan invoice resmi sebagai bukti pengeluaran sah pembukuan akuntansi mereka.",
      },
      {
        q: "Bagaimana cara kirim invoice freelance?",
        a: "Anda bisa mendownload format PDF di NotaKu lalu mengirimkannya via WhatsApp atau Email langsung ke klien.",
      },
    ],
  },
  {
    slug: "invoice-jasa-desain-grafis",
    title: "Template Invoice Desain Grafis & UI/UX Designer",
    category: "Kreatif & IT",
    shortDesc:
      "Format invoice tagihan desain logo, branding kit, media sosial, dan perancangan website/aplikasi UI/UX.",
    keywords: [
      "template invoice desain grafis",
      "contoh invoice designer",
      "invoice ui ux design",
      "format tagihan jasa logo",
      "invoice desain grafis gratis",
    ],
    pdfTemplate: "minimal",
    currency: "IDR",
    sampleData: {
      businessName: "Studio Visual Kreasindo",
      customerName: "Kopi Kenangan Senja",
      invoiceNumber: "INV/DSGN/2026/042",
      items: [
        {
          description: "Perancangan Identitas Visual Brand (Logo Utama & Secondary)",
          quantity: 1,
          price: 3500000,
          amount: 3500000,
        },
        {
          description: "Paket 15 Desain Feed & Story Instagram Siap Tayang",
          quantity: 15,
          price: 150000,
          amount: 2250000,
        },
        {
          description: "Penyerahan Master File Vector (.AI, .EPS, .SVG, .PNG)",
          quantity: 1,
          price: 0,
          amount: 0,
        },
      ],
      notes: "Hak cipta dan master file desain diserahkan penuh setelah seluruh tagihan dilunasi.",
    },
    overview:
      "Desainer membutuhkan invoice yang estetis sekaligus tegas melindungi hak cipta karya sebelum pembayaran lunas. Template invoice desain grafis ini memuat klausul lisensi dan rincian paket revisi.",
    whyNeedGuide:
      "Menyertakan status penyerahan master file dan hak cipta di catatan invoice melindungi desainer dari sengketa karya di kemudian hari.",
    checklist: [
      "Cantumkan jumlah revisi yang telah disepakati",
      "Tuliskan format file deliverables yang akan dikirim",
      "Tegaskan bahwa hak cipta baru berpindah setelah status tagihan lunas",
    ],
    faq: [
      {
        q: "Kapan desainer sebaiknya mengirim invoice?",
        a: "Sebaiknya kirim invoice uang muka (DP 50%) di awal, dan invoice pelunasan (50%) sebelum master file final diserahkan.",
      },
    ],
  },
  {
    slug: "invoice-web-developer",
    title: "Template Invoice Web & Software Development",
    category: "Kreatif & IT",
    shortDesc:
      "Contoh tagihan pembuatan website, aplikasi mobile, API integration, dan maintenance server/cloud bulanan.",
    keywords: [
      "template invoice software development",
      "contoh invoice jasa website",
      "invoice programmer web",
      "format tagihan maintenance aplikasi",
      "invoice web developer idr usd",
    ],
    pdfTemplate: "classic",
    currency: "IDR",
    sampleData: {
      businessName: "Karya Solusi Teknologi",
      customerName: "PT Sinar Logistik Nusantara",
      invoiceNumber: "INV/DEV/2026/110",
      items: [
        {
          description: "Pengembangan Website Company Profile Responsif (Next.js + Tailwind)",
          quantity: 1,
          price: 6500000,
          amount: 6500000,
        },
        {
          description: "Integrasi Payment Gateway QRIS & Notifikasi WhatsApp",
          quantity: 1,
          price: 2000000,
          amount: 2000000,
        },
        {
          description: "Layanan Maintenance & SLA Uptime Server (Bulan Pertama)",
          quantity: 1,
          price: 750000,
          amount: 750000,
        },
      ],
      notes: "Garansi bug-free selama 30 hari kalender terhitung sejak tanggal pelunasan invoice.",
    },
    overview:
      "Proyek IT dan software sering kali melibatkan tahapan milestone (Termin). Format tagihan ini memfasilitasi penagihan termin bertahap dan paket pemeliharaan berkala.",
    whyNeedGuide:
      "Menjelaskan masa garansi dan scope modul aplikasi di invoice mencegah feature-creep yang merugikan developer.",
    checklist: [
      "Jelaskan milestone atau fase pengembangan yang ditagihkan",
      "Sebutkan masa berlaku garansi dan pemeliharaan teknis",
      "Dukung multi-currency (IDR / USD) jika melayani klien luar negeri",
    ],
    faq: [
      {
        q: "Bisa buat tagihan dalam USD untuk klien luar negeri?",
        a: "Bisa. NotaKu mendukung pembuatan invoice multi-mata uang termasuk USD, SGD, dan EUR.",
      },
    ],
  },
  {
    slug: "invoice-jasa-konsultan",
    title: "Template Invoice Jasa Konsultan & Penasihat Bisnis",
    category: "Freelance & Jasa",
    shortDesc:
      "Format tagihan sesi konsultasi bisnis, hukum, keuangan, HR, dan manajemen operasional profesional.",
    keywords: [
      "template invoice konsultan",
      "contoh invoice advisory",
      "format tagihan konsultasi hukum bisnis",
      "invoice jasa konsultan pajak",
    ],
    pdfTemplate: "classic",
    currency: "IDR",
    taxRate: 11,
    sampleData: {
      businessName: "Mitra Konsultan Manajemen",
      customerName: "PT Sentosa Abadi Food",
      invoiceNumber: "INV/ADV/2026/089",
      items: [
        {
          description: "Sesi Konsultasi Strategi Transformasi Bisnis (5 Sesi @ 2 Jam)",
          quantity: 5,
          price: 1500000,
          amount: 7500000,
        },
        {
          description: "Penyusunan Dokumen SOP & KPI Departemen Operasional",
          quantity: 1,
          price: 4500000,
          amount: 4500000,
        },
      ],
      notes: "Tagihan dikenakan PPN 11%. Mohon lampirkan bukti potong PPh Pasal 23 jika berlaku.",
    },
    overview:
      "Konsultan manajemen, pajak, dan hukum membutuhkan faktur yang berstandar kepatuhan pajak tinggi lengkap dengan pemisahan tarif PPN/PPh.",
    whyNeedGuide:
      "Perhitungan pajak yang akurat di invoice mempermudah bagian finance klien menerbitkan Bukti Potong PPh 23.",
    checklist: [
      "Sertakan NPWP / NIK badan usaha",
      "Cantumkan pemisahan DPP dan tarif PPN jika PKP",
      "Tuliskan rincian jumlah jam/sesi konsultasi yang terlaksana",
    ],
    faq: [
      {
        q: "Apakah invoice konsultan otomatis menghitung PPN?",
        a: "Ya, Anda bisa mengaktifkan opsi kalkulasi PPN otomatis pada generator invoice NotaKu.",
      },
    ],
  },
  {
    slug: "invoice-bengkel-service-kendaraan",
    title: "Template Nota & Invoice Bengkel Service Kendaraan",
    category: "Bisnis & UKM",
    shortDesc:
      "Contoh nota tagihan servis mobil/motor, penggantian suku cadang (spare part), dan jasa mekanik.",
    keywords: [
      "template nota bengkel mobil",
      "contoh invoice service motor",
      "format nota suku cadang sparepart",
      "nota bengkel resmi pdf excel",
    ],
    pdfTemplate: "modern",
    currency: "IDR",
    sampleData: {
      businessName: "Bengkel Auto Prima Motor",
      customerName: "Bpk. Hendra Gunawan (B 1982 KZZ)",
      invoiceNumber: "NOTA/BKL/2026/512",
      items: [
        {
          description: "Oli Mesin Full Synthetic 5W-30 (4 Liter)",
          quantity: 4,
          price: 125000,
          amount: 500000,
        },
        {
          description: "Penggantian Filter Oli & Filter Udara Original",
          quantity: 1,
          price: 185000,
          amount: 185000,
        },
        {
          description: "Jasa Tune-up & Pembersihan Ruang Bakar (Carbon Clean)",
          quantity: 1,
          price: 350000,
          amount: 350000,
        },
      ],
      notes: "Garansi servis 1 minggu atau 1.000 KM. Terima kasih atas kepercayaan Anda.",
    },
    overview:
      "Pelanggan bengkel menginginkan transparansi rincian harga onderdil vs jasa mekanik. Nota yang terperinci membangun kepercayaan dan kepuasan pelanggan.",
    whyNeedGuide:
      "Pemisahan barang dan ongkos pasang mencegah komplain selisih harga dari pemilik kendaraan.",
    checklist: [
      "Tuliskan nomor plat polisi (nopol) dan jenis kendaraan",
      "Bedakan baris suku cadang dengan baris ongkos jasa",
      "Berikan keterangan kilometer (KM) dan masa garansi servis",
    ],
    faq: [
      {
        q: "Bisa langsung kirim nota bengkel ke WhatsApp pelanggan?",
        a: "Bisa, NotaKu memiliki fitur kirim link tagihan dan notifikasi resmi langsung ke nomor WhatsApp pelanggan dalam 1 klik.",
      },
    ],
  },
  {
    slug: "invoice-sewa-properti-kost",
    title: "Template Kuitansi & Invoice Sewa Properti / Kost",
    category: "Operasional & Properti",
    shortDesc:
      "Format penagihan uang sewa bulanan/tahunan rumah, apartemen, kamar kost, dan ruko usaha.",
    keywords: [
      "template kuitansi sewa rumah",
      "contoh invoice pembayaran kost",
      "tagihan sewa ruko tahunan",
      "bukti bayar sewa apartemen pdf",
    ],
    pdfTemplate: "classic",
    currency: "IDR",
    sampleData: {
      businessName: "Kost Eksklusif Griya Asri",
      customerName: "Sdr. Dimas Wahyu (Kamar No. 204)",
      invoiceNumber: "INV/KOST/2026/09/204",
      items: [
        {
          description: "Sewa Kamar Kost Tipe A (Periode 1 Sept - 30 Sept 2026)",
          quantity: 1,
          price: 1800000,
          amount: 1800000,
        },
        {
          description: "Iuran Kebersihan, Keamanan, & High-Speed WiFi",
          quantity: 1,
          price: 150000,
          amount: 150000,
        },
        {
          description: "Biaya Deposit Kunci & Kartu Akses (Hanya Bulan Pertama)",
          quantity: 1,
          price: 200000,
          amount: 200000,
        },
      ],
      notes: "Pembayaran paling lambat tanggal 5 setiap bulannya untuk menghindari denda keterlambatan.",
    },
    overview:
      "Pemilik kost dan pengelola properti memerlukan pencatatan tagihan periodik yang rapi untuk memantau penghuni yang sudah lunas maupun yang menunggak.",
    whyNeedGuide:
      "Penagihan yang terjadwal rapi mempermudah pencatatan cash flow dan kuitansi pelunasan otomatis saat status lunas.",
    checklist: [
      "Sebutkan nomor unit/kamar yang disewa",
      "Jelaskan periode sewa (tanggal mulai s/d tanggal selesai)",
      "Sertakan rincian biaya tambahan (listrik, air, maintenance)",
    ],
    faq: [
      {
        q: "Bisa buat tagihan sewa kost otomatis setiap bulan?",
        a: "Bisa, pengguna NotaKu PRO dapat menggunakan fitur Recurring Invoices untuk auto-generate tagihan sewa setiap bulan.",
      },
    ],
  },
];
