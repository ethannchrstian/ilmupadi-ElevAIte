import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, Leaf, Activity, Info, Shield, Droplets, Calendar, Bug, Thermometer } from 'lucide-react';

const DeteksiPage = () => {
    const [prediction, setPrediction] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const diseaseDatabase = {
        'healthy': {
            name: 'Padi Sehat',
            isHealthy: true,
            description: 'Tanaman padi dalam kondisi sehat tanpa tanda-tanda penyakit',
            treatments: [],
            prevention: [
                'Lanjutkan perawatan rutin',
                'Pantau kondisi tanaman secara berkala',
                'Jaga kebersihan area pertanian',
                'Pastikan drainase yang baik'
            ]
        },
        'bacterial_leaf_blight': {
            name: 'Hawar Daun Bakteri',
            isHealthy: false,
            severity: 'Tinggi',
            description: 'Penyakit yang disebabkan oleh bakteri Xanthomonas oryzae pv. oryzae',
            symptoms: ['Garis kuning di tepi daun', 'Daun mengering dari ujung', 'Kresek pada malai', 'Garis air pada daun'],
            treatments: [
                {
                    type: 'Bakterisida',
                    methods: [
                        'Copper sulfate 0.2% (2 g/L air)',
                        'Streptomycin sulfate 100-200 ppm',
                        'Copper oxychloride 50% WP (3 g/L)',
                        'Validamycin 3% L (2.5 ml/L)'
                    ]
                },
                {
                    type: 'Biologis',
                    methods: [
                        'Pseudomonas fluorescens (5 g/L)',
                        'Bacillus subtilis (2 g/L)',
                        'Trichoderma harzianum (5 g/L)'
                    ]
                },
                {
                    type: 'Kultur Teknis',
                    methods: [
                        'Perbaiki drainase lapangan',
                        'Kurangi dosis nitrogen berlebih',
                        'Sanitasi gulma dan sisa tanaman',
                        'Tanam varietas tahan seperti IR64, IR74'
                    ]
                }
            ],
            prevention: [
                'Gunakan benih sehat bersertifikat',
                'Rotasi tanaman non-padi',
                'Atur jarak tanam 25x25 cm',
                'Kelola air secara intermiten'
            ]
        },
        'brown_spot': {
            name: 'Bercak Coklat',
            isHealthy: false,
            severity: 'Sedang',
            description: 'Penyakit jamur yang disebabkan oleh Bipolaris oryzae (Helminthosporium oryzae)',
            symptoms: ['Bercak coklat oval pada daun', 'Bercak dengan halo kuning', 'Gabah hitam dan kosong', 'Bercak pada batang'],
            treatments: [
                {
                    type: 'Fungisida',
                    methods: [
                        'Mancozeb 80% WP (2-3 g/L)',
                        'Carbendazim 50% WP (1 g/L)',
                        'Propiconazole 25% EC (1 ml/L)',
                        'Tricyclazole 75% WP (0.6 g/L)',
                        'Chlorothalonil 75% WP (2 g/L)'
                    ]
                },
                {
                    type: 'Organik',
                    methods: [
                        'Ekstrak daun nimba 3%',
                        'Larutan baking soda 1%',
                        'Kompos untuk meningkatkan resistensi',
                        'Pupuk hayati Trichoderma'
                    ]
                }
            ],
            prevention: [
                'Pemupukan berimbang (N:P:K = 1:1:1)',
                'Hindari kekurangan kalium dan silika',
                'Kelola kelembaban dengan drainase baik',
                'Bersihkan sisa tanaman setelah panen'
            ]
        },
        'narrow_brown_spot': {
            name: 'Bercak Coklat Sempit',
            isHealthy: false,
            severity: 'Sedang',
            description: 'Penyakit jamur yang disebabkan oleh Cercospora janseana',
            symptoms: ['Bercak coklat memanjang sempit', 'Garis coklat paralel dengan tulang daun', 'Daun menguning prematur'],
            treatments: [
                {
                    type: 'Fungisida',
                    methods: [
                        'Mancozeb 80% WP (2 g/L)',
                        'Carbendazim 50% WP (1 g/L)',
                        'Copper oxychloride 50% WP (3 g/L)',
                        'Chlorothalonil 75% WP (2 g/L)'
                    ]
                },
                {
                    type: 'Kultur Teknis',
                    methods: [
                        'Tingkatkan sirkulasi udara',
                        'Kurangi kepadatan tanaman',
                        'Aplikasi pupuk kalium dan silika',
                        'Drainase dan irigasi yang baik'
                    ]
                }
            ],
            prevention: [
                'Pemupukan seimbang dengan cukup kalium',
                'Hindari kelembaban berlebih',
                'Rotasi varietas',
                'Sanitasi gulma dan sisa tanaman'
            ]
        },
        'leaf_scald': {
            name: 'Hawar Daun',
            isHealthy: false,
            severity: 'Sedang',
            description: 'Penyakit jamur yang disebabkan oleh Monographella albescens',
            symptoms: ['Bercak putih memanjang pada daun', 'Tepi bercak coklat kemerahan', 'Daun mengering seperti terbakar'],
            treatments: [
                {
                    type: 'Fungisida',
                    methods: [
                        'Propiconazole 25% EC (1 ml/L)',
                        'Tebuconazole 25% SC (1 ml/L)',
                        'Azoxystrobin 25% SC (1 ml/L)',
                        'Mancozeb 80% WP (2 g/L) + Carbendazim 50% WP (1 g/L)'
                    ]
                },
                {
                    type: 'Biologis',
                    methods: [
                        'Trichoderma viride (5 g/L)',
                        'Bacillus subtilis (2 g/L)',
                        'Pseudomonas fluorescens (5 g/L)'
                    ]
                }
            ],
            prevention: [
                'Hindari pemupukan nitrogen berlebih',
                'Kelola kelembaban dengan baik',
                'Gunakan varietas toleran',
                'Sanitasi area pertanaman'
            ]
        },
        'leaf_blast': {
            name: 'Blas Daun',
            isHealthy: false,
            severity: 'Tinggi',
            description: 'Penyakit jamur yang disebabkan oleh Magnaporthe oryzae (Pyricularia oryzae)',
            symptoms: ['Bercak berbentuk mata ikan', 'Tepi bercak coklat tua dengan pusat abu-abu', 'Daun patah pada bercak besar'],
            treatments: [
                {
                    type: 'Fungisida Sistemik',
                    methods: [
                        'Tricyclazole 75% WP (0.6 g/L)',
                        'Isoprothiolane 40% EC (1.25 ml/L)',
                        'Carbendazim 50% WP (1 g/L)',
                        'Tebuconazole 25% EC (1 ml/L)',
                        'Azoxystrobin 25% SC (1 ml/L)'
                    ]
                },
                {
                    type: 'Preventif',
                    methods: [
                        'Kasugamycin 5% + Copper oxychloride 45% (3 g/L)',
                        'Aplikasi setiap 10-15 hari',
                        'Mulai aplikasi dari fase anakan aktif',
                        'Tingkatkan frekuensi saat cuaca lembab'
                    ]
                }
            ],
            prevention: [
                'Tanam varietas tahan seperti IR64, Ciherang, Mekongga',
                'Hindari pemupukan nitrogen berlebihan',
                'Atur populasi tanaman optimal',
                'Kelola air dengan sistem drainase intermiten'
            ]
        },
        'sheath_blight': {
            name: 'Hawar Pelepah',
            isHealthy: false,
            severity: 'Sedang-Tinggi',
            description: 'Penyakit jamur yang disebabkan oleh Rhizoctonia solani',
            symptoms: ['Bercak oval pada pelepah daun', 'Tepi bercak coklat tua tidak teratur', 'Sclerotia bulat putih-coklat', 'Dapat menyebar ke malai'],
            treatments: [
                {
                    type: 'Fungisida',
                    methods: [
                        'Validamycin 3% L (2.5 ml/L)',
                        'Hexaconazole 5% EC (2 ml/L)',
                        'Propiconazole 25% EC (1 ml/L)',
                        'Flutolanil 20% EC (1.5 ml/L)',
                        'Tebuconazole 25% EC (1 ml/L)'
                    ]
                },
                {
                    type: 'Biologis',
                    methods: [
                        'Trichoderma viride (5 g/L)',
                        'Pseudomonas fluorescens (5 g/L)',
                        'Bacillus subtilis (2 g/L)',
                        'Gliocladium virens (5 g/L)'
                    ]
                },
                {
                    type: 'Kultur Teknis',
                    methods: [
                        'Kurangi kepadatan tanaman',
                        'Aplikasi pupuk kalium dan silika',
                        'Perbaiki drainase lapangan',
                        'Bersihkan gulma di sekitar tanaman'
                    ]
                }
            ],
            prevention: [
                'Jarak tanam optimal 25x25 cm atau 30x15 cm',
                'Drainase yang baik untuk mengurangi kelembaban',
                'Pemupukan kalium dan silika yang cukup',
                'Sanitasi sisa tanaman dan gulma'
            ]
        },
        'rice_hispa': {
            name: 'Penggerek Hispa',
            isHealthy: false,
            severity: 'Sedang',
            description: 'Serangan hama kumbang Dicladispa armigera yang larvanya menggerek dalam daun',
            symptoms: ['Garis putih memanjang pada daun', 'Terowongan dalam helai daun', 'Daun terlihat seperti daunnya dimakan dari dalam', 'Pertumbuhan terhambat'],
            treatments: [
                {
                    type: 'Insektisida',
                    methods: [
                        'Imidacloprid 17.8% SL (0.25 ml/L)',
                        'Thiamethoxam 25% WG (0.2 g/L)',
                        'Chlorantraniliprole 18.5% SC (0.4 ml/L)',
                        'Fipronil 5% SC (2 ml/L)',
                        'Cartap hydrochloride 50% SP (2 g/L)'
                    ]
                },
                {
                    type: 'Biologis',
                    methods: [
                        'Beauveria bassiana (5 g/L)',
                        'Metarhizium anisopliae (5 g/L)',
                        'Bacillus thuringiensis (2 g/L)',
                        'Pelepasan parasitoid Trichogramma'
                    ]
                },
                {
                    type: 'Mekanis',
                    methods: [
                        'Petik dan musnahkan daun terserang',
                        'Gunakan perangkap cahaya',
                        'Genangan air dangkal untuk mengurangi populasi',
                        'Sanitasi gulma inang'
                    ]
                }
            ],
            prevention: [
                'Tanam serempak dalam satu hamparan',
                'Hindari penanaman terlalu rapat',
                'Kelola air dengan baik',
                'Bersihkan gulma rumput-rumputan',
                'Gunakan varietas tahan jika tersedia'
            ]
        }
    };

    const handleSubmit = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setPrediction(null);

        const formData = new FormData();
        formData.append('image', file);

        try {

            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Process Azure Custom Vision response
            if (data.predictions && data.predictions.length > 0) {
                // Get the prediction with highest probability
                const topPrediction = data.predictions.reduce((prev, current) =>
                    (prev.probability > current.probability) ? prev : current
                );

                const diseaseKey = findDiseaseKey(topPrediction.tagName);
                const diseaseInfo = diseaseDatabase[diseaseKey] || {
                    name: formatPredictionName(topPrediction.tagName),
                    isHealthy: false,
                    description: 'Informasi penyakit tidak tersedia dalam database',
                    treatments: [],
                    prevention: []
                };

                setPrediction({
                    tagName: topPrediction.tagName,
                    probability: topPrediction.probability,
                    allPredictions: data.predictions,
                    diseaseInfo: diseaseInfo
                });
            } else {
                setError('No predictions returned from the model.');
            }

        } catch (err) {
            console.error('Prediction error:', err);
            setError('Error mendapatkan prediksi. Silakan periksa koneksi dan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const findDiseaseKey = (tagName) => {
        const normalizedTag = tagName.toLowerCase().replace(/[_\s-]/g, '_');
        
        // Direct match
        if (diseaseDatabase[normalizedTag]) {
            return normalizedTag;
        }
        
        // Partial matches
        const keys = Object.keys(diseaseDatabase);
        for (const key of keys) {
            if (normalizedTag.includes(key) || key.includes(normalizedTag)) {
                return key;
            }
        }
        
        // Check for healthy indicators
        if (normalizedTag.includes('healthy') || normalizedTag.includes('sehat')) {
            return 'healthy';
        }
        
        // Default fallback
        return normalizedTag;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        // Validate file size (max 4MB)
        if (file.size > 4 * 1024 * 1024) {
            setError('File size too large. Please select an image under 4MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        handleSubmit(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const openFileSelector = () => {
        fileInputRef.current?.click();
    };

    const resetAnalysis = () => {
        setPrediction(null);
        setImagePreview(null);
        setIsLoading(false);
        setError('');
    };

    const getPredictionStatus = () => {
        if (!prediction || !prediction.diseaseInfo) return null;
        const isHealthy = prediction.diseaseInfo.isHealthy;
        return {
            isHealthy,
            icon: isHealthy ? CheckCircle : AlertCircle,
            color: isHealthy ? 'text-green-500' : 'text-red-500',
            bgColor: isHealthy ? 'bg-green-50' : 'bg-red-50',
            borderColor: isHealthy ? 'border-green-200' : 'border-red-200'
        };
    };

    const formatPredictionName = (tagName) => {
        // You can customize this function to format disease names nicely
        return tagName.charAt(0).toUpperCase() + tagName.slice(1).replace(/([A-Z])/g, ' $1');
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Tinggi': return 'text-red-600 bg-red-100';
            case 'Sangat Tinggi': return 'text-red-800 bg-red-200';
            case 'Sedang': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const status = getPredictionStatus();

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
                        <div className="p-4 sm:p-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                Unggah Gambar Padi
                            </h2>

                            {/* Error Display */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Drag and Drop Area */}
                            <div
                                className={`relative border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-8 text-center transition-all duration-300 cursor-pointer ${dragActive
                                    ? 'border-green-400 bg-green-50 scale-105'
                                    : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={openFileSelector}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm sm:text-lg font-medium text-gray-700">
                                            Letakkan gambar Anda disini atau klik untuk memilih
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Mendukung format JPG, PNG, dan format gambar lainnya (Max 4MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mt-4 sm:mt-6">
                                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Uploaded rice plant"
                                            className="w-full h-48 sm:h-64 object-cover"
                                        />
                                        <button
                                            onClick={resetAnalysis}
                                            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 transition-colors touch-manipulation"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cara Kerja</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 font-semibold text-xs">1</span>
                                </div>
                                <p>Unggah gambar yang jelas dari padi Anda</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 font-semibold text-xs">2</span>
                                </div>
                                <p>AI kami akan menganalisis gambar untuk mendeteksi tanda penyakit pada padi Anda</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-green-600 font-semibold text-xs">3</span>
                                </div>
                                <p>Dapatkan hasil dan rekomendasi secara instan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                    <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sedang menganalisis padi</h3>
                                <p className="text-gray-600">AI kami sedang bekerja...</p>
                                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {prediction && !isLoading && status && (
                        <div className="space-y-6">
                            {/* Main Result */}
                            <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${status.borderColor}`}>
                                <div className={`p-1 ${status.bgColor}`}></div>
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${status.bgColor} flex-shrink-0`}>
                                            <status.icon className={`w-8 h-8 ${status.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Hasil Analisis</h3>
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className={`text-lg font-medium ${status.color}`}>
                                                    {prediction.diseaseInfo.name}
                                                </p>
                                                {prediction.diseaseInfo.severity && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prediction.diseaseInfo.severity)}`}>
                                                        {prediction.diseaseInfo.severity}
                                                    </span>
                                                )}
                                            </div>
                                            {/* <p className="text-sm text-gray-600 mb-3">
                                                Tingkat Kepercayaan: {(prediction.probability * 100).toFixed(1)}%
                                            </p> */}
                                            <p className="text-sm text-gray-700 mb-4">
                                                {prediction.diseaseInfo.description}
                                            </p>

                                            {/* Symptoms */}
                                            {prediction.diseaseInfo.symptoms && prediction.diseaseInfo.symptoms.length > 0 && (
                                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                                                        <Info className="w-4 h-4" />
                                                        Gejala Penyakit:
                                                    </h5>
                                                    <ul className="text-sm text-yellow-700 space-y-1">
                                                        {prediction.diseaseInfo.symptoms.map((symptom, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                                                                {symptom}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {status.isHealthy ? (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Kabar Baik! 🎉
                                                    </h4>
                                                    <p className="text-green-700 text-sm mb-3">
                                                        Tanaman padi Anda dalam kondisi sehat. Lanjutkan perawatan rutin dan monitoring.
                                                    </p>
                                                    {prediction.diseaseInfo.prevention && prediction.diseaseInfo.prevention.length > 0 && (
                                                        <div>
                                                            <h6 className="font-medium text-green-800 mb-2">Pencegahan:</h6>
                                                            <ul className="text-sm text-green-700 space-y-1">
                                                                {prediction.diseaseInfo.prevention.map((item, index) => (
                                                                    <li key={index} className="flex items-start gap-2">
                                                                        <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                        {item}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                    <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Penyakit Terdeteksi ⚠️
                                                    </h4>
                                                    <p className="text-red-700 text-sm mb-3">
                                                        Kami telah mengidentifikasi tanda-tanda penyakit pada tanaman padi Anda. 
                                                        Segera lakukan tindakan pengobatan yang sesuai.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Treatment Recommendations */}
                            {prediction.diseaseInfo.treatments && prediction.diseaseInfo.treatments.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Droplets className="w-5 h-5 text-blue-600" />
                                        Rekomendasi Pengobatan
                                    </h4>
                                    <div className="space-y-4">
                                        {prediction.diseaseInfo.treatments.map((treatment, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                                                    {treatment.type === 'Kimia' && <Bug className="w-4 h-4 text-red-500" />}
                                                    {treatment.type === 'Biologis' && <Leaf className="w-4 h-4 text-green-500" />}
                                                    {treatment.type === 'Fungisida' && <Shield className="w-4 h-4 text-blue-500" />}
                                                    {treatment.type === 'Organik' && <Leaf className="w-4 h-4 text-green-600" />}
                                                    {treatment.type === 'Kontrol Vektor' && <Bug className="w-4 h-4 text-purple-500" />}
                                                    {treatment.type === 'Kultur Teknis' && <Calendar className="w-4 h-4 text-orange-500" />}
                                                    {treatment.type}
                                                </h5>
                                                <ul className="space-y-2">
                                                    {treatment.methods.map((method, methodIndex) => (
                                                        <li key={methodIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                            {method}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Prevention */}
                            {prediction.diseaseInfo.prevention && prediction.diseaseInfo.prevention.length > 0 && !status.isHealthy && (
                                <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-green-600" />
                                        Pencegahan untuk Masa Depan
                                    </h4>
                                    <ul className="space-y-2">
                                        {prediction.diseaseInfo.prevention.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* All Predictions */}
                            {prediction.allPredictions && prediction.allPredictions.length > 1 && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Prediksi Alternatif</h4>
                                    <div className="space-y-3">
                                        {prediction.allPredictions
                                            .sort((a, b) => b.probability - a.probability)
                                            .slice(0, 5)
                                            .map((pred, index) => {
                                                const altDiseaseKey = findDiseaseKey(pred.tagName);
                                                const altDiseaseInfo = diseaseDatabase[altDiseaseKey];
                                                return (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-800">
                                                                {altDiseaseInfo ? altDiseaseInfo.name : formatPredictionName(pred.tagName)}
                                                            </span>
                                                            {altDiseaseInfo && altDiseaseInfo.severity && (
                                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getSeverityColor(altDiseaseInfo.severity)}`}>
                                                                    {altDiseaseInfo.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {(pred.probability * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Default State */}
                    {!prediction && !isLoading && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="text-center text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Siap untuk analisis</h3>
                                <p>Unggah gambar untuk memulai deteksi kesehatan padi berbasis AI</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-2">Penting untuk Diperhatikan</h4>
                        <div className="text-sm text-amber-700 space-y-1">
                            <p>• Hasil deteksi AI ini adalah bantuan awal untuk identifikasi penyakit padi</p>
                            <p>• Gunakan fungisida dan pestisida sesuai anjuran dan dosis yang tepat</p>
                            <p>• Lakukan uji coba pada area kecil sebelum aplikasi menyeluruh</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-gray-500 text-sm">
                <p>Didukung oleh Microsoft Azure Custom Vision</p>
            </div>
        </div>
    );
};

export default DeteksiPage;