import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, Leaf, Activity, Info, Shield, Droplets, Calendar, Bug } from 'lucide-react';

import {
    diseaseDatabase,
    findDiseaseKey,
    formatPredictionName,
    getSeverityColor
} from '../utils/diseaseUtils.js';

const DeteksiPage = ({ user, isAuthenticated }) => {
    const [prediction, setPrediction] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);


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
                const errData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Server says: ${errData}`);
            }
            const data = await response.json();

            if (data.predictions && data.predictions.length > 0) {
                const topPrediction = data.predictions.reduce((prev, current) =>
                    (prev.probability > current.probability) ? prev : current
                );

                const diseaseKey = findDiseaseKey(topPrediction.tagName); // Uses imported function
                const diseaseInfoFromDb = diseaseDatabase[diseaseKey];    // Uses imported database

                let finalDiseaseInfo;
                if (diseaseInfoFromDb) {
                    finalDiseaseInfo = diseaseInfoFromDb;
                } else {
                    const isLikelyHealthy = topPrediction.tagName.toLowerCase().includes('healthy') || topPrediction.tagName.toLowerCase().includes('sehat');
                    finalDiseaseInfo = {
                        name: formatPredictionName(topPrediction.tagName), // Uses imported function
                        isHealthy: isLikelyHealthy,
                        description: 'Informasi detail untuk prediksi ini tidak tersedia dalam database kami. Berikut adalah prediksi mentah dari model AI.',
                        symptoms: [],
                        treatments: [],
                        prevention: [],
                        severity: 'Tidak diketahui'
                    };
                }

                const newPredictionData = {
                    tagName: topPrediction.tagName,
                    probability: topPrediction.probability,
                    allPredictions: data.predictions,
                    diseaseInfo: finalDiseaseInfo
                };
                setPrediction(newPredictionData);

                if (isAuthenticated && user) {
                    await saveAnalysisResult(file.name, {
                        tagName: topPrediction.tagName,
                        probability: topPrediction.probability
                    });
                }
            } else {
                setError('Tidak ada prediksi yang dikembalikan oleh model.');
            }
        } catch (err) {
            console.error('Prediction error:', err);
            setError(`Error mendapatkan prediksi: ${err.message}. Silakan periksa koneksi dan coba lagi.`);
        } finally {
            setIsLoading(false);
        }
    };

    const saveAnalysisResult = async (imageName, simplePredictionData) => {
        if (!user?.id) {
            console.log("User not available or no ID, skipping save.");
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageName: imageName,
                    imagePath: '',
                    prediction: simplePredictionData.tagName,
                    confidence: simplePredictionData.probability,
                    userId: user.id
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal menyimpan hasil analisis, respons server tidak valid.' }));
                console.error('Failed to save analysis result:', errorData.message);
            } else {
                console.log("Analysis result saved successfully.");
            }
        } catch (error) {
            console.error('Error saving analysis:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            setError('Silakan pilih file gambar yang valid.');
            return;
        }
        if (file.size > 4 * 1024 * 1024) { // Max 4MB
            setError('Ukuran file terlalu besar. Maksimal 4MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        handleSubmit(file);
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const openFileSelector = () => fileInputRef.current?.click();

    const resetAnalysis = () => {
        setPrediction(null); setImagePreview(null);
        setIsLoading(false); setError(''); setIsSaving(false);
    };

    const getPredictionStatus = () => {
        if (!prediction?.diseaseInfo) return null;
        const isHealthy = prediction.diseaseInfo.isHealthy;
        return {
            isHealthy,
            icon: isHealthy ? CheckCircle : AlertCircle,
            color: isHealthy ? 'text-green-600' : 'text-red-600',
            bgColor: isHealthy ? 'bg-green-50' : 'bg-red-50',
            borderColor: isHealthy ? 'border-green-200' : 'border-red-200'
        };
    };

    const status = getPredictionStatus();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm">
                        💡 <strong>Tips:</strong> Login untuk menyimpan riwayat analisis Anda secara otomatis!
                    </p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                        <div className="p-5 sm:p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-green-600" />
                                Unggah Gambar Padi
                            </h2>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}
                            {isSaving && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-700 text-sm flex items-center gap-2">
                                        <Activity className="w-4 h-4 animate-spin" /> Menyimpan hasil analisis...
                                    </p>
                                </div>
                            )}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all duration-300 cursor-pointer ${dragActive ? 'border-green-500 bg-green-50 scale-105' : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'}`}
                                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={openFileSelector}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <div className="space-y-3">
                                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-gray-700">Letakkan gambar atau klik untuk memilih</p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Mendukung JPG, PNG, dll. (Maks 4MB)</p>
                                    </div>
                                </div>
                            </div>
                            {imagePreview && (
                                <div className="mt-6">
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                        <img src={imagePreview} alt="Pratinjau Padi" className="w-full h-auto max-h-72 object-contain" />
                                        <button onClick={resetAnalysis} className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 text-xl leading-none transition-colors touch-manipulation">&times;</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cara Kerja Deteksi</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex gap-3 items-start"><div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-green-600 font-semibold text-xs">1</span></div><p>Unggah gambar daun padi yang ingin dideteksi.</p></div>
                            <div className="flex gap-3 items-start"><div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-green-600 font-semibold text-xs">2</span></div><p>AI kami akan menganalisis gambar untuk mengidentifikasi potensi penyakit.</p></div>
                            <div className="flex gap-3 items-start"><div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-green-600 font-semibold text-xs">3</span></div><p>Dapatkan hasil deteksi beserta informasi detail dan rekomendasi penanganan.</p></div>
                            {isAuthenticated && (
                                <div className="flex gap-3 items-start"><div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-green-600 font-semibold text-xs">4</span></div><p>Hasil analisis otomatis tersimpan di riwayat Anda jika Anda login.</p></div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {isLoading && (
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 text-center">
                            <Activity className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sedang Menganalisis...</h3>
                            <p className="text-gray-600">Mohon tunggu, AI sedang bekerja.</p>
                            <div className="mt-4 bg-gray-200 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-500 h-2.5 rounded-full animate-pulse" style={{ width: '70%' }}></div></div>
                        </div>
                    )}

                    {prediction && !isLoading && status && (
                        <div className="space-y-6">
                            <div className={`bg-white rounded-2xl shadow-xl border overflow-hidden ${status.borderColor}`}>
                                <div className={`p-1.5 ${status.bgColor}`}></div>
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${status.bgColor} flex-shrink-0`}>
                                            <status.icon className={`w-7 h-7 sm:w-8 sm:h-8 ${status.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">Hasil Analisis</h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                                <p className={`text-lg font-semibold ${status.color}`}>
                                                    {prediction.diseaseInfo.name}
                                                </p>
                                                {prediction.diseaseInfo.severity && prediction.diseaseInfo.severity !== 'N/A' && ( // Added N/A check
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(prediction.diseaseInfo.severity)}`}>
                                                        Tingkat: {prediction.diseaseInfo.severity}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Model AI Prediction: {formatPredictionName(prediction.tagName)} (Kepercayaan: {(prediction.probability * 100).toFixed(1)}%)
                                            </p>
                                            <p className="text-sm text-gray-700 mb-4">
                                                {prediction.diseaseInfo.description}
                                            </p>
                                            {prediction.diseaseInfo.symptoms && prediction.diseaseInfo.symptoms.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                        <Info className="w-4 h-4 text-yellow-600" /> Gejala Umum:
                                                    </h5>
                                                    <ul className="text-sm text-gray-700 space-y-1 pl-1">
                                                        {prediction.diseaseInfo.symptoms.map((symptom, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-[7px] flex-shrink-0"></span>
                                                                {symptom}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {isAuthenticated && !isSaving && (
                                                <div className="mt-3 mb-1 p-2 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Hasil analisis ini telah tersimpan ke akun Anda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {status.isHealthy && prediction.diseaseInfo.prevention && prediction.diseaseInfo.prevention.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-5 sm:p-6">
                                    <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Tips Perawatan & Pencegahan Lanjutan
                                    </h4>
                                    <ul className="space-y-2">
                                        {prediction.diseaseInfo.prevention.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!status.isHealthy && prediction.diseaseInfo.treatments && prediction.diseaseInfo.treatments.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-5 sm:p-6">
                                    <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                                        <Droplets className="w-5 h-5" /> Rekomendasi Pengobatan
                                    </h4>
                                    <div className="space-y-5">
                                        {prediction.diseaseInfo.treatments.map((treatment, index) => (
                                            <div key={index}>
                                                <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-md">
                                                    {treatment.type.toLowerCase().includes('bakterisida') && <Bug className="w-4 h-4 text-red-500" />}
                                                    {treatment.type.toLowerCase().includes('biologis') && <Leaf className="w-4 h-4 text-emerald-500" />}
                                                    {treatment.type.toLowerCase().includes('fungisida') && <Shield className="w-4 h-4 text-sky-500" />}
                                                    {treatment.type.toLowerCase().includes('organik') && <Leaf className="w-4 h-4 text-lime-600" />}
                                                    {treatment.type.toLowerCase().includes('insektisida') && <Bug className="w-4 h-4 text-orange-500" />}
                                                    {treatment.type.toLowerCase().includes('kultur teknis') && <Calendar className="w-4 h-4 text-purple-500" />}
                                                    {treatment.type.toLowerCase().includes('mekanis') && <Info className="w-4 h-4 text-gray-500" />}
                                                    {!['bakterisida', 'biologis', 'fungisida', 'organik', 'insektisida', 'kultur teknis', 'mekanis', 'fungisida sistemik', 'preventif'].some(t => treatment.type.toLowerCase().includes(t)) && <Droplets className="w-4 h-4 text-gray-500" />}
                                                    {treatment.type}
                                                </h5>
                                                <ul className="space-y-1.5 pl-1">
                                                    {treatment.methods.map((method, methodIndex) => (
                                                        <li key={methodIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-[7px] flex-shrink-0"></span>
                                                            {method}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!status.isHealthy && prediction.diseaseInfo.prevention && prediction.diseaseInfo.prevention.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-green-200 p-5 sm:p-6">
                                    <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Pencegahan untuk Masa Depan
                                    </h4>
                                    <ul className="space-y-2">
                                        {prediction.diseaseInfo.prevention.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2.5">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {prediction.allPredictions && prediction.allPredictions.filter(p => p.tagName !== prediction.tagName).length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 sm:p-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Prediksi Alternatif Teratas</h4>
                                    <div className="space-y-3">
                                        {prediction.allPredictions
                                            .filter(p => p.tagName !== prediction.tagName)
                                            .sort((a, b) => b.probability - a.probability)
                                            .slice(0, 3)
                                            .map((pred, index) => {
                                                const altDiseaseKey = findDiseaseKey(pred.tagName);
                                                const altDiseaseInfo = diseaseDatabase[altDiseaseKey] || { name: formatPredictionName(pred.tagName), severity: null };
                                                return (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-800">
                                                                {altDiseaseInfo.name}
                                                            </span>
                                                            {altDiseaseInfo.severity && altDiseaseInfo.severity !== 'N/A' && ( // Added N/A check
                                                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${getSeverityColor(altDiseaseInfo.severity)}`}>
                                                                    {altDiseaseInfo.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-700">
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

                    {!prediction && !isLoading && (
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                            <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Siap untuk Analisis</h3>
                            <p className="text-gray-600">Unggah gambar untuk memulai deteksi penyakit padi berbasis AI.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-10 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-1.5 text-md">Penting untuk Diperhatikan:</h4>
                        <div className="text-sm text-amber-700 space-y-1.5">
                            <p>• Hasil deteksi AI ini adalah panduan awal dan bukan diagnosis definitif. Pertimbangkan faktor lingkungan dan konsultasikan dengan ahli jika ragu.</p>
                            <p>• Selalu gunakan pestisida dan fungisida sesuai anjuran pada label, dosis yang tepat, dan perhatikan interval keamanan.</p>
                            <p>• Lakukan uji coba pada area kecil terlebih dahulu sebelum aplikasi bahan kimia secara menyeluruh pada tanaman Anda.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-gray-500 text-sm">
                <p>Didukung oleh Microsoft Azure Custom Vision &copy; {new Date().getFullYear()} Sahabat Tani</p>
            </div>
        </div>
    );
};

export default DeteksiPage;