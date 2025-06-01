// src/utils/diseaseUtils.js

// Make sure to 'export' each function and constant you want to use in other files.
export const diseaseDatabase = {
    'healthy': {
        name: 'Padi Sehat',
        isHealthy: true,
        severity: 'N/A', // Good practice to have severity for all, even if N/A
        description: 'Tanaman padi dalam kondisi sehat tanpa tanda-tanda penyakit.',
        treatments: [],
        prevention: [
            'Lanjutkan perawatan rutin dan pemupukan berimbang.',
            'Pantau kondisi tanaman secara berkala untuk deteksi dini.',
            'Jaga kebersihan area pertanian dari gulma dan sisa tanaman.',
            'Pastikan sistem drainase dan irigasi berfungsi dengan baik.'
        ]
    },
    'bacterial_leaf_blight': {
        name: 'Hawar Daun Bakteri (HDB)',
        isHealthy: false,
        severity: 'Tinggi',
        description: 'Disebabkan oleh bakteri Xanthomonas oryzae pv. oryzae. Sangat menular, terutama saat musim hujan.',
        symptoms: ['Lesi kebasahan pada tepi daun yang meluas menjadi kuning hingga putih keabu-abuan.', 'Daun mengering seperti terbakar (kresek).', 'Pada serangan berat, bulir padi menjadi hampa.'],
        treatments: [
            { type: 'Bakterisida', methods: ['Copper sulfate (0.2%)', 'Streptomycin sulfate (100-200 ppm)', 'Copper oxychloride (50% WP)'] },
            { type: 'Biologis', methods: ['Pseudomonas fluorescens', 'Bacillus subtilis'] },
            { type: 'Kultur Teknis', methods: ['Perbaiki drainase', 'Kurangi dosis nitrogen berlebih', 'Sanitasi gulma dan sisa tanaman'] }
        ],
        prevention: ['Gunakan benih sehat dan varietas tahan (misal: Inpari 33, Ciherang).', 'Rotasi tanaman.', 'Atur jarak tanam agar tidak terlalu rapat.', 'Hindari pemupukan Nitrogen (N) berlebihan.']
    },
    'brown_spot': {
        name: 'Bercak Coklat',
        isHealthy: false,
        severity: 'Sedang',
        description: 'Disebabkan oleh jamur Bipolaris oryzae (Helminthosporium oryzae). Umumnya pada kondisi tanah kurang subur.',
        symptoms: ['Bercak oval kecil berwarna coklat tua dengan pusat keabu-abuan pada daun.', 'Bercak juga dapat muncul pada pelepah, tangkai malai, dan gabah.', 'Pada serangan berat, daun menguning dan mati.'],
        treatments: [
            { type: 'Fungisida', methods: ['Mancozeb (80% WP)', 'Carbendazim (50% WP)', 'Propiconazole (25% EC)'] },
            { type: 'Organik', methods: ['Ekstrak daun nimba', 'Pupuk hayati Trichoderma'] }
        ],
        prevention: ['Pemupukan berimbang (N, P, K, dan unsur mikro).', 'Hindari kekurangan Kalium (K) dan Silika (Si).', 'Gunakan benih sehat dan perlakukan benih dengan fungisida.', 'Sanitasi sisa tanaman setelah panen.']
    },
    'narrow_brown_spot': {
        name: 'Bercak Coklat Sempit',
        isHealthy: false,
        severity: 'Sedang',
        description: 'Disebabkan oleh jamur Cercospora janseana (Sphaerulina oryzina). Sering muncul pada daun tua.',
        symptoms: ['Bercak sempit, pendek, linier berwarna coklat kemerahan sejajar tulang daun.', 'Umumnya pada daun bendera menjelang panen.', 'Dapat menurunkan kualitas gabah.'],
        treatments: [
            { type: 'Fungisida', methods: ['Mancozeb (80% WP)', 'Carbendazim (50% WP)', 'Propiconazole (25% EC)'] },
            { type: 'Kultur Teknis', methods: ['Tingkatkan sirkulasi udara (jarak tanam).', 'Aplikasi pupuk Kalium (K) dan Silika (Si).'] }
        ],
        prevention: ['Pemupukan Kalium (K) yang cukup.', 'Hindari kelembaban berlebih di sekitar tanaman.', 'Sanitasi sisa tanaman dan gulma.']
    },
    'leaf_scald': {
        name: 'Hawar Daun (Leaf Scald)',
        isHealthy: false,
        severity: 'Sedang',
        description: 'Disebabkan oleh jamur Monographella albescens (Microdochium oryzae). Terjadi pada ujung atau tepi daun.',
        symptoms: ['Lesi dimulai dari ujung daun atau tepi, berbentuk oval memanjang atau tidak teratur dengan pola zonasi.', 'Pusat lesi berwarna abu-abu keputihan, tepi coklat kemerahan.', 'Daun tampak seperti tersiram air panas.'],
        treatments: [
            { type: 'Fungisida', methods: ['Propiconazole (25% EC)', 'Tebuconazole (25% SC)', 'Azoxystrobin (25% SC)'] },
            { type: 'Biologis', methods: ['Trichoderma viride', 'Bacillus subtilis'] }
        ],
        prevention: ['Hindari pemupukan Nitrogen (N) berlebih.', 'Jaga kelembaban tidak terlalu tinggi.', 'Gunakan varietas yang relatif tahan.', 'Sanitasi lahan.']
    },
    'leaf_blast': {
        name: 'Blas Daun',
        isHealthy: false,
        severity: 'Tinggi',
        description: 'Disebabkan oleh jamur Magnaporthe oryzae (Pyricularia oryzae). Sangat merusak pada semua fase pertumbuhan.',
        symptoms: ['Bercak berbentuk belah ketupat (mata ikan) pada daun, dengan pusat abu-abu dan tepi coklat.', 'Pada serangan berat, seluruh daun mengering.', 'Dapat menyerang leher malai (blas leher) menyebabkan patah dan gabah hampa.'],
        treatments: [
            { type: 'Fungisida Sistemik', methods: ['Tricyclazole (75% WP)', 'Isoprothiolane (40% EC)', 'Propiconazole (25% EC)'] },
            { type: 'Preventif', methods: ['Kasugamycin + Copper oxychloride', 'Aplikasi saat kondisi mendukung perkembangan penyakit.'] }
        ],
        prevention: ['Tanam varietas tahan (misal: Inpari 32, Inpari 42).', 'Hindari pemupukan Nitrogen (N) berlebihan, berikan Kalium (K) yang cukup.', 'Perlakuan benih.', 'Sanitasi dan pengelolaan sisa tanaman.']
    },
    'sheath_blight': {
        name: 'Hawar Pelepah',
        isHealthy: false,
        severity: 'Sedang-Tinggi',
        description: 'Disebabkan oleh jamur Rhizoctonia solani. Berkembang baik pada kondisi lembab dan suhu hangat.',
        symptoms: ['Bercak oval atau tidak teratur pada pelepah daun dekat permukaan air.', 'Pusat bercak keabu-abuan atau keputihan, tepi coklat tua.', 'Sering ditemukan sklerotia (struktur jamur) kecil berwarna coklat.', 'Dapat menyebabkan tanaman rebah.'],
        treatments: [
            { type: 'Fungisida', methods: ['Validamycin (3% L)', 'Hexaconazole (5% EC)', 'Propiconazole (25% EC)', 'Pencycuron (25% WP)'] },
            { type: 'Biologis', methods: ['Trichoderma spp.', 'Pseudomonas fluorescens'] }
        ],
        prevention: ['Jarak tanam tidak terlalu rapat untuk sirkulasi udara.', 'Drainase yang baik.', 'Pemupukan berimbang, terutama Kalium (K).', 'Sanitasi gulma dan sisa tanaman.']
    },
    'rice_hispa': {
        name: 'Penggerek Hispa',
        isHealthy: false,
        severity: 'Sedang',
        description: 'Serangan hama kumbang Dicladispa armigera. Imago memakan permukaan daun, larva menggerek di dalam jaringan daun.',
        symptoms: ['Bekas gerekan larva berupa garis-garis putih sejajar tulang daun.', 'Imago membuat goresan memanjang pada permukaan atas daun.', 'Ujung daun mengering dan berwarna keputihan.', 'Pada serangan berat, seluruh daun tampak putih dan kering.'],
        treatments: [
            { type: 'Insektisida', methods: ['Imidacloprid (17.8% SL)', 'Thiamethoxam (25% WG)', 'Fipronil (5% SC)'] },
            { type: 'Biologis', methods: ['Beauveria bassiana', 'Metarhizium anisopliae'] },
            { type: 'Mekanis', methods: ['Pengumpulan imago dengan jaring serangga.', 'Pemotongan ujung daun yang terserang berat.'] }
        ],
        prevention: ['Tanam serempak.', 'Penggunaan perangkap.', 'Sanitasi gulma yang menjadi inang alternatif.', 'Konservasi musuh alami.']
    }
    // Add any other diseases your model might predict and their details
};

export const findDiseaseKey = (tagName) => {
    if (!tagName) return 'unknown';
    const normalizedTag = tagName.toLowerCase().replace(/[_\s-]/g, '_');

    if (diseaseDatabase[normalizedTag]) {
        return normalizedTag;
    }
    const commonSuffixes = ['_disease', '_spot', '_blight', '_rot', '_wilt'];
    for (const suffix of commonSuffixes) {
        if (normalizedTag.endsWith(suffix)) {
            const baseTag = normalizedTag.substring(0, normalizedTag.length - suffix.length);
            if (diseaseDatabase[baseTag]) return baseTag;
        }
    }
    if (normalizedTag.includes('healthy') || normalizedTag.includes('sehat') || normalizedTag.includes('normal')) {
        return 'healthy';
    }
    const keys = Object.keys(diseaseDatabase);
    for (const key of keys) {
        if (normalizedTag.includes(key) || key.includes(normalizedTag)) {
            return key;
        }
    }
    return normalizedTag;
};

export const formatPredictionName = (tagName) => {
    if (!tagName) return "Tidak Diketahui";
    return tagName.split(/[_\s-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const getSeverityColor = (severity) => {
    if (!severity) return 'text-gray-600 bg-gray-100 border-gray-300'; // Default color
    switch (severity.toLowerCase()) {
        case 'tinggi': return 'text-red-700 bg-red-100 border-red-300';
        case 'sangat tinggi': return 'text-red-800 bg-red-200 border-red-400';
        case 'sedang': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        case 'rendah': return 'text-blue-700 bg-blue-100 border-blue-300';
        default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
};