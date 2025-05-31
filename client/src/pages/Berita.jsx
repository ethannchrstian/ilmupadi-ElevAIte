import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, User, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const BeritaPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState(null);

    // Fetch news articles
    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:5000/api/news?page=${page}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();

            if (data.articles) {
                setArticles(data.articles);
                setTotalResults(data.totalResults);

                // Debug: log the first few articles to check data quality
                console.log('Received articles:', data.articles.slice(0, 3));
                console.log('Sample URLs:', data.articles.slice(0, 3).map(a => a.url));
            }
        } catch (error) {
            console.error('Error fetching news:', error);
            setError('Gagal memuat berita. Pastikan server backend berjalan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [page]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 120) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Newspaper className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Berita Petani</h1>
                    <p className="text-gray-600">Dapatkan berita terkini seputar dunia pertanian</p>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                    <div className="text-center text-red-600">
                        <p className="font-medium">{error}</p>
                        <button
                            onClick={fetchNews}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12 mb-8">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                        <p className="text-gray-600">Memuat berita terbaru...</p>
                    </div>
                </div>
            )}

            {/* News Articles */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {articles.map((article, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Article Image */}
                                <div className="aspect-w-16 aspect-h-9">
                                    {article.urlToImage ? (
                                        <img
                                            src={article.urlToImage}
                                            alt={article.title}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center"
                                        style={{ display: article.urlToImage ? 'none' : 'flex' }}
                                    >
                                        <Newspaper className="w-12 h-12 text-green-300" />
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                        {truncateText(article.description)}
                                    </p>

                                    {/* Article Meta */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <span className="font-medium text-green-600">{article.source.name}</span>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="w-3 h-3 mr-1" />
                                            <span>{formatDate(article.publishedAt)}</span>
                                        </div>

                                        {article.author && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <User className="w-3 h-3 mr-1" />
                                                <span>{article.author}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Read More Button */}
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                            // Debug: log the URL being opened
                                            console.log('Opening URL:', article.url);

                                            // Check if URL is valid
                                            if (!article.url || article.url === 'null' || article.url === '') {
                                                e.preventDefault();
                                                alert('URL artikel tidak tersedia');
                                                return;
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors group"
                                    >
                                        Baca Selengkapnya
                                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {articles.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-12">
                            <div className="text-center text-gray-500">
                                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Berita</h3>
                                <p>Tidak ada berita yang ditemukan saat ini.</p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {articles.length > 0 && totalResults > 20 && (
                        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
                            <div className="flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Sebelumnya
                                </button>

                                <span className="text-gray-600 font-medium">
                                    Halaman {page} dari {Math.ceil(totalResults / 20)}
                                </span>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= Math.ceil(totalResults / 20)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                                >
                                    Selanjutnya
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BeritaPage;