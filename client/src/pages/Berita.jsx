import { Newspaper } from "lucide-react";

const BeritaPage = () =>{
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Berita</h3>
          <p>Halaman berita akan segera hadir</p>
        </div>
      </div>
    </div>
  );
};

export default BeritaPage;