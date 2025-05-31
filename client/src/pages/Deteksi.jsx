import { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, Leaf, Activity } from 'lucide-react';

const DeteksiPage = () => {
    const [prediction, setPrediction] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        setPrediction(null);

        const formData = new FormData();
        formData.append('image', file);

        try {

            const response = await fetch('http://localhost:5000/api/predict', {
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

                setPrediction({
                    tagName: topPrediction.tagName,
                    probability: topPrediction.probability,
                    allPredictions: data.predictions
                });
            } else {
                setError('No predictions returned from the model.');
            }

        } catch (err) {
            console.error('Prediction error:', err);
            setError('Error getting prediction. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
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
        if (!prediction) return null;
        const isHealthy = prediction.tagName.toLowerCase().includes('healthy') ||
            prediction.tagName.toLowerCase().includes('sehat');
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
                        <div className={`bg-white rounded-2xl shadow-lg border overflow-hidden ${status.borderColor}`}>
                            <div className={`p-1 ${status.bgColor}`}></div>
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${status.bgColor} flex-shrink-0`}>
                                        <status.icon className={`w-8 h-8 ${status.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Complete</h3>
                                        <p className={`text-lg font-medium mb-1 ${status.color}`}>
                                            {formatPredictionName(prediction.tagName)}
                                        </p>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Confidence: {(prediction.probability * 100).toFixed(1)}%
                                        </p>

                                        {status.isHealthy ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <h4 className="font-medium text-green-800 mb-2">Great news! 🎉</h4>
                                                <p className="text-green-700 text-sm">
                                                    Your rice plant appears to be healthy. Continue with regular care and monitoring.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <h4 className="font-medium text-red-800 mb-2">Disease Detected ⚠️</h4>
                                                <p className="text-red-700 text-sm mb-3">
                                                    We've identified signs of disease in your rice plant. Consider consulting with an agricultural expert for treatment options.
                                                </p>
                                                <div className="text-xs text-red-600">
                                                    <p className="font-medium">Recommended actions:</p>
                                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                                        <li>Isolate affected plants if possible</li>
                                                        <li>Consult with local agricultural extension services</li>
                                                        <li>Consider appropriate fungicide or treatment</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* All Predictions (Optional) */}
                                        {prediction.allPredictions && prediction.allPredictions.length > 1 && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <h5 className="text-sm font-medium text-gray-700 mb-2">All Predictions:</h5>
                                                <div className="space-y-1">
                                                    {prediction.allPredictions
                                                        .sort((a, b) => b.probability - a.probability)
                                                        .slice(0, 3)
                                                        .map((pred, index) => (
                                                            <div key={index} className="flex justify-between text-xs text-gray-600">
                                                                <span>{formatPredictionName(pred.tagName)}</span>
                                                                <span>{(pred.probability * 100).toFixed(1)}%</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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

            {/* Footer */}
            <div className="mt-12 text-center text-gray-500 text-sm">
                <p>Didukung oleh Microsoft Azure</p>
            </div>
        </div>
    );
};

export default DeteksiPage;