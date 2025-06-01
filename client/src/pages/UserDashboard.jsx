import React, { useState, useEffect, useCallback } from 'react';
import {
    User, Activity, MessageSquare, Leaf, Trash2, AlertCircle, CheckCircle, RefreshCw,
    Info, Shield, Droplets, Calendar, Bug, XCircle
} from 'lucide-react';


import { diseaseDatabase, findDiseaseKey, formatPredictionName, getSeverityColor } from '../utils/diseaseUtils.js'; // Adjust path if needed

const ANALYSES_PER_PAGE = 5;

const UserDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userAnalyses, setUserAnalyses] = useState([]);
    const [userPosts, setUserPosts] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');


    const [currentPageAnalyses, setCurrentPageAnalyses] = useState(1);
    const [hasMoreAnalyses, setHasMoreAnalyses] = useState(true);
    const [isLoadingMoreAnalyses, setIsLoadingMoreAnalyses] = useState(false);
    const [totalAnalysesCount, setTotalAnalysesCount] = useState(0);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailedAnalysis, setDetailedAnalysis] = useState(null);

    const fetchUserAnalyses = useCallback(async (pageToFetch = 1, isLoadMoreAction = false) => {
        if (!user?.id) return;

        if (isLoadMoreAction) {
            setIsLoadingMoreAnalyses(true);
        } else {

            setUserAnalyses([]);
        }


        try {
            const offset = (pageToFetch - 1) * ANALYSES_PER_PAGE;
            const response = await fetch(`/api/analysis/user/${user.id}?limit=${ANALYSES_PER_PAGE}&offset=${offset}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal mengambil riwayat analisis (server error)' }));
                throw new Error(errorData.message);
            }
            const data = await response.json();

            setUserAnalyses(prevAnalyses =>
                isLoadMoreAction ? [...prevAnalyses, ...(data.analyses || [])] : (data.analyses || [])
            );
            setHasMoreAnalyses(data.hasMore || false);
            setTotalAnalysesCount(data.totalCount || 0);
            setCurrentPageAnalyses(pageToFetch);

        } catch (err) {
            console.error('Error fetching user analyses:', err);
            setError(prevError => {
                const newErrorMessage = `Riwayat Analisis: ${err.message}`;
                return prevError && isLoadMoreAction ? `${prevError}\n${newErrorMessage}` : newErrorMessage;
            });
        } finally {
            if (isLoadMoreAction) {
                setIsLoadingMoreAnalyses(false);
            }

        }
    }, [user?.id]);

    const fetchUserPosts = useCallback(async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`/api/posts/user/${user.id}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal mengambil posts pengguna (server error)' }));
                throw new Error(errorData.message);
            }
            const data = await response.json();
            setUserPosts(data || []);
        } catch (err) {
            console.error('Error fetching user posts:', err);
            setError(prevError => `${prevError ? prevError + '\n' : ''}Postingan Forum: ${err.message}`);
        }
    }, [user?.id]);

    const handleDeleteAnalysis = async (analysisId) => {
        if (!confirm('Yakin ingin menghapus analisis ini?')) return;
        setError('');
        try {
            const response = await fetch(`/api/analysis/${analysisId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ userId: user.id }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Gagal menghapus analisis (server error)' }));
                throw new Error(errorData.message);
            }
            // Refetch analyses from page 1 to update the list 
            setCurrentPageAnalyses(1);
            setHasMoreAnalyses(true);
            await fetchUserAnalyses(1, false);
        } catch (err) {
            console.error('Error deleting analysis:', err);
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getFullAnalysisInfo = (analysisRecord) => {
        const rawPredictionTag = analysisRecord.prediction;
        const diseaseKey = findDiseaseKey(rawPredictionTag);
        const dbInfo = diseaseDatabase[diseaseKey];

        const isRawHealthy = (rawPredictionTag || "").toLowerCase().includes('healthy') ||
            (rawPredictionTag || "").toLowerCase().includes('sehat') ||
            (rawPredictionTag || "").toLowerCase().includes('normal');

        const effectiveDiseaseInfo = dbInfo || {
            name: formatPredictionName(rawPredictionTag),
            isHealthy: isRawHealthy,
            description: dbInfo?.description || (isRawHealthy ? (diseaseDatabase.healthy?.description || 'Tanaman tampak sehat.') : 'Informasi detail tidak tersedia untuk prediksi ini.'),
            symptoms: dbInfo?.symptoms || [],
            treatments: dbInfo?.treatments || [],
            prevention: dbInfo?.prevention || (isRawHealthy ? (diseaseDatabase.healthy?.prevention || []) : []),
            severity: dbInfo?.severity || (isRawHealthy ? 'N/A' : 'Tidak diketahui')
        };
        const isActuallyHealthy = effectiveDiseaseInfo.isHealthy;

        return {
            ...analysisRecord,
            diseaseInfo: effectiveDiseaseInfo,
            listItemDisplay: {
                isHealthy: isActuallyHealthy,
                icon: isActuallyHealthy ? CheckCircle : AlertCircle,
                color: isActuallyHealthy ? 'text-green-600' : 'text-red-600',
                bgColor: isActuallyHealthy ? 'bg-green-50' : 'bg-red-50',
                borderColor: isActuallyHealthy ? 'border-green-200' : 'border-red-200',
                displayName: effectiveDiseaseInfo.name,
                severity: effectiveDiseaseInfo.severity
            }
        };
    };

    const getStats = () => {
        const loadedAnalysesCount = userAnalyses.length;
        let healthyCount = 0;
        userAnalyses.forEach(rawAnalysis => {
            const fullInfo = getFullAnalysisInfo(rawAnalysis);
            if (fullInfo.diseaseInfo.isHealthy) {
                healthyCount++;
            }
        });
        const diseaseCount = loadedAnalysesCount - healthyCount;
        const totalPosts = userPosts.length;

        return {
            totalAnalyses: totalAnalysesCount,
            healthyCount,
            diseaseCount,
            totalPosts,
            healthyPercentage: loadedAnalysesCount > 0 ? Math.round((healthyCount / loadedAnalysesCount) * 100) : 0
        };
    };

    useEffect(() => {
        if (user?.id) {
            setIsLoading(true);
            setError('');
            setCurrentPageAnalyses(1);
            setHasMoreAnalyses(true);
            setTotalAnalysesCount(0);

            Promise.all([
                fetchUserAnalyses(1, false),
                fetchUserPosts()
            ]).catch((err) => {
                console.error("Error during initial data fetch in useEffect:", err);
                // setError handled within individual fetch functions
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            // Clear data and reset states if no user
            setUserAnalyses([]);
            setUserPosts([]);
            setTotalAnalysesCount(0);
            setCurrentPageAnalyses(1);
            setHasMoreAnalyses(false); // No data to load
            setIsLoading(false);
            setError('');
        }
    }, [user?.id, fetchUserAnalyses, fetchUserPosts]);

    const openDetailsModal = (analysisRecord) => {
        const fullInfo = getFullAnalysisInfo(analysisRecord);
        setDetailedAnalysis(fullInfo);
        setShowDetailsModal(true);
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Akses Ditolak</h2>
                <p className="text-gray-600">Silakan login untuk melihat dashboard Anda.</p>
            </div>
        );
    }

    // Loading spinner
    if (isLoading && userAnalyses.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center">
                <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto" />
                <p className="mt-4 text-lg text-gray-700">Memuat data dashboard...</p>
            </div>
        );
    }

    const stats = getStats();

    return (
        <>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && !isLoadingMoreAnalyses && ( // Avoid showing main error if only "load more" fails
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><AlertCircle className="h-6 w-6 text-red-500 mr-3" /></div>
                            <div>
                                <p className="font-bold">Terjadi Kesalahan</p>
                                <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                                <button
                                    onClick={() => {
                                        setError('');
                                        if (user?.id) {
                                            setIsLoading(true);
                                            Promise.all([fetchUserAnalyses(1, false), fetchUserPosts()]).finally(() => setIsLoading(false));
                                        }
                                    }}
                                    className="mt-2 text-sm text-red-700 hover:text-red-900 font-semibold"
                                >
                                    Coba Lagi Memuat Data Awal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-8 p-6 bg-white shadow-xl rounded-xl border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 ring-4 ring-green-200">
                                <User className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                            </span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Selamat Datang, {user.name}!</h1>
                            <p className="text-md text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        {['overview', 'analyses', 'posts'].map((tab) => (
                            <button
                                key={tab} onClick={() => setActiveTab(tab)}
                                className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base capitalize transition-colors focus:outline-none ${activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                {tab === 'overview' ? 'Ringkasan' : tab === 'analyses' ? 'Riwayat Analisis' : 'Postingan Saya'}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
                            <StatCard icon={<Activity size={28} />} title="Total Analisis Tersimpan" value={stats.totalAnalyses} color="blue" />
                            <StatCard icon={<MessageSquare size={28} />} title="Total Postingan Forum" value={stats.totalPosts} color="purple" />
                            <StatCard icon={<CheckCircle size={28} />} title="Padi Sehat (dari termuat)" value={stats.healthyCount} subValue={`${stats.healthyPercentage}% dari analisis termuat`} color="green" />
                            <StatCard icon={<AlertCircle size={28} />} title="Padi Sakit (dari termuat)" value={stats.diseaseCount} subValue={`${100 - stats.healthyPercentage}% dari analisis termuat`} color="red" />
                        </div>
                    )}

                    {activeTab === 'analyses' && (
                        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-5 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <Leaf className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-green-600" /> Riwayat Analisis Saya
                                    <span className="text-base font-normal text-gray-500 ml-2">({userAnalyses.length} dari {totalAnalysesCount} ditampilkan)</span>
                                </h2>
                                {userAnalyses.length === 0 && !isLoading && !isLoadingMoreAnalyses ? (
                                    <div className="text-center py-10">
                                        <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Anda belum melakukan analisis apapun.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {userAnalyses.map((analysis) => {
                                            const { listItemDisplay } = getFullAnalysisInfo(analysis);
                                            return (
                                                <li key={analysis.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 transition-all hover:shadow-md ${listItemDisplay.bgColor} ${listItemDisplay.borderColor}`}>
                                                    <div className="flex-1 min-w-0"> {/* Added min-w-0 for better flex handling */}
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center min-w-0"> {/* Added min-w-0 */}
                                                                <listItemDisplay.icon className={`w-5 h-5 mr-2 flex-shrink-0 ${listItemDisplay.color}`} />
                                                                <span className={`font-semibold text-md truncate ${listItemDisplay.color}`}>{listItemDisplay.displayName}</span>
                                                            </div>
                                                            {listItemDisplay.severity && listItemDisplay.severity !== 'N/A' && (
                                                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border font-medium flex-shrink-0 ${getSeverityColor(listItemDisplay.severity)}`}>
                                                                    {listItemDisplay.severity}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-700 truncate">
                                                            Gambar: <span className="font-medium">{analysis.imageName || 'N/A'}</span>
                                                            {analysis.confidence !== null && typeof analysis.confidence === 'number' &&
                                                                <span className="text-gray-600 text-xs"> (Akurasi Model: {(analysis.confidence * 100).toFixed(1)}%)</span>
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Tanggal: {formatDate(analysis.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0 mt-3 sm:mt-0 self-start sm:self-center flex items-center gap-2">
                                                        <button
                                                            onClick={() => openDetailsModal(analysis)}
                                                            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                                                        >
                                                            Lihat Detail
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAnalysis(analysis.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                                                            title="Hapus Analisis"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                <div className="mt-8 text-center">
                                    {isLoadingMoreAnalyses && (
                                        <div className="inline-flex items-center text-gray-500 py-2">
                                            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                            Memuat lebih banyak...
                                        </div>
                                    )}
                                    {!isLoading && !isLoadingMoreAnalyses && hasMoreAnalyses && (
                                        <button
                                            onClick={() => fetchUserAnalyses(currentPageAnalyses + 1, true)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                                        >
                                            Muat Lebih Banyak Analisis ({userAnalyses.length}/{totalAnalysesCount})
                                        </button>
                                    )}
                                    {!isLoading && !isLoadingMoreAnalyses && !hasMoreAnalyses && userAnalyses.length > 0 && (
                                        <p className="text-gray-500 text-sm py-2">Semua ({totalAnalysesCount}) riwayat analisis telah dimuat.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'posts' && (
                        <div className="bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-5 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                    <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-indigo-600" /> Postingan Forum Saya
                                </h2>
                                {userPosts.length === 0 && !isLoading ? (
                                    <div className="text-center py-10">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Anda belum membuat postingan apapun di forum.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {userPosts.map((post) => (
                                            <li key={post.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow">
                                                <h3 className="font-semibold text-md text-indigo-700 hover:text-indigo-800">{post.title || 'Tanpa Judul'}</h3>
                                                {post.content && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>}
                                                <p className="text-xs text-gray-500 mt-2">Dibuat pada: {formatDate(post.createdAt)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDetailsModal && detailedAnalysis && (
                <AnalysisDetailsModal
                    analysisItem={detailedAnalysis}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </>
    );
};

const StatCard = ({ icon, title, value, subValue, color = 'gray' }) => {
    const colorVariants = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', iconBg: 'bg-blue-100' },
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', iconBg: 'bg-green-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', iconBg: 'bg-red-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', iconBg: 'bg-purple-100' },
        gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', iconBg: 'bg-gray-100' },
    };
    const C = colorVariants[color] || colorVariants.gray;

    return (
        <div className={`p-5 rounded-xl shadow-lg border ${C.border} ${C.bg}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${C.text}`}>{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                    {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-full ${C.iconBg} flex-shrink-0`}>
                    {React.cloneElement(icon, { className: `w-7 h-7 ${C.text}` })}
                </div>
            </div>
        </div>
    );
};

const AnalysisDetailsModal = ({ analysisItem, onClose }) => {
    if (!analysisItem || !analysisItem.diseaseInfo) return null;

    const { diseaseInfo, imageName, confidence, createdAt } = analysisItem;
    const status = {
        isHealthy: diseaseInfo.isHealthy,
        icon: diseaseInfo.isHealthy ? CheckCircle : AlertCircle,
        color: diseaseInfo.isHealthy ? 'text-green-600' : 'text-red-600',
        bgColor: diseaseInfo.isHealthy ? 'bg-green-50' : 'bg-red-50',
        borderColor: diseaseInfo.isHealthy ? 'border-green-200' : 'border-red-200'
    };

    const formatDateForModal = (dateString) => {
        if (!dateString) return 'Tanggal tidak valid';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border-t-4 ${status.borderColor}`}>
                <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <status.icon className={`w-7 h-7 ${status.color}`} />
                        <h3 className={`text-xl font-semibold ${status.color}`}>{diseaseInfo.name}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <XCircle size={28} />
                    </button>
                </div>

                <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
                    <div className="pb-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600"><strong>Gambar:</strong> {imageName || 'N/A'}</p>
                        {confidence !== null && typeof confidence === 'number' &&
                            <p className="text-sm text-gray-600"><strong>Akurasi Model:</strong> {(confidence * 100).toFixed(1)}%</p>}
                        <p className="text-sm text-gray-600"><strong>Tanggal Analisis:</strong> {formatDateForModal(createdAt)}</p>
                        {diseaseInfo.severity && diseaseInfo.severity !== 'N/A' && (
                            <p className="text-sm text-gray-600 mt-1">
                                <strong>Tingkat Keparahan: </strong>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(diseaseInfo.severity)}`}>
                                    {diseaseInfo.severity}
                                </span>
                            </p>
                        )}
                    </div>

                    {diseaseInfo.description && <p className="text-sm text-gray-700">{diseaseInfo.description}</p>}

                    {diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                <Info className="w-5 h-5" /> Gejala Umum:
                            </h5>
                            <ul className="text-sm text-yellow-700 space-y-1.5 pl-1">
                                {diseaseInfo.symptoms.map((symptom, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-[7px] flex-shrink-0"></span>{symptom}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {diseaseInfo.treatments && diseaseInfo.treatments.length > 0 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Droplets className="w-5 h-5" /> Rekomendasi Pengobatan:
                            </h5>
                            <div className="space-y-4">
                                {diseaseInfo.treatments.map((treatment, index) => (
                                    <div key={index}>
                                        <h6 className="font-medium text-gray-800 mb-1.5 flex items-center gap-2 text-sm">
                                            {treatment.type.toLowerCase().includes('bakterisida') && <Bug className="w-4 h-4 text-red-500" />}
                                            {treatment.type.toLowerCase().includes('biologis') && <Leaf className="w-4 h-4 text-emerald-500" />}
                                            {treatment.type.toLowerCase().includes('fungisida') && <Shield className="w-4 h-4 text-sky-500" />}
                                            {treatment.type.toLowerCase().includes('insektisida') && <Bug className="w-4 h-4 text-orange-500" />}
                                            {treatment.type.toLowerCase().includes('kultur teknis') && <Calendar className="w-4 h-4 text-purple-500" />}
                                            {treatment.type.toLowerCase().includes('mekanis') && <Info className="w-4 h-4 text-gray-500" />}
                                            {treatment.type.toLowerCase().includes('organik') && <Leaf className="w-4 h-4 text-lime-600" />}
                                            {!['bakterisida', 'biologis', 'fungisida', 'insektisida', 'kultur teknis', 'mekanis', 'organik'].some(t => treatment.type.toLowerCase().includes(t)) && <Droplets className="w-4 h-4 text-gray-500" />}
                                            {treatment.type}
                                        </h6>
                                        <ul className="space-y-1 pl-1">
                                            {treatment.methods.map((method, methodIndex) => (
                                                <li key={methodIndex} className="text-xs text-gray-700 flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-[6px] flex-shrink-0"></span>{method}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {diseaseInfo.prevention && diseaseInfo.prevention.length > 0 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> Pencegahan:
                            </h5>
                            <ul className="text-sm text-green-700 space-y-1.5 pl-1">
                                {diseaseInfo.prevention.map((item, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 sm:p-5">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 mb-1.5 text-sm">Penting untuk Diperhatikan:</h4>
                                <div className="text-xs text-amber-700 space-y-1">
                                    <p>• Hasil deteksi AI ini adalah panduan awal. Pertimbangkan faktor lingkungan dan konsultasikan dengan ahli jika ragu.</p>
                                    <p>• Selalu gunakan pestisida dan fungisida sesuai anjuran pada label dan dosis yang tepat.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 text-right sticky bottom-0 bg-white z-10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;