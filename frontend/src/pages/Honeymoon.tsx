import { useState } from 'react';
import { Palmtree, Search, Star, MapPin, Calendar, IndianRupee } from 'lucide-react';

interface Package {
  id: string;
  destination: string;
  title: string;
  durationNights: number;
  couplePrice: number;
  rating: number;
  isFeatured: boolean;
  images: string[];
}

export default function Honeymoon() {
  const [packages] = useState<Package[]>([]);
  const [searchDest, setSearchDest] = useState('');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Honeymoon Packages</h1>
        <p className="text-gray-500 mt-1">Discover your dream honeymoon destinations</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              placeholder="Search destination..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">All Types</option>
            <option value="beach">Beach</option>
            <option value="mountain">Mountain</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="luxury">Luxury</option>
            <option value="cruise">Cruise</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="">Any Duration</option>
            <option value="3">3 Nights</option>
            <option value="5">5 Nights</option>
            <option value="7">7 Nights</option>
            <option value="10">10+ Nights</option>
          </select>
        </div>
      </div>

      {/* Popular Destinations (placeholder) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Maldives', 'Bali', 'Switzerland', 'Mauritius'].map((dest) => (
            <div
              key={dest}
              className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white cursor-pointer hover:opacity-90 transition-opacity"
            >
              <MapPin size={20} />
              <p className="mt-2 font-medium">{dest}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      {packages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Palmtree className="mx-auto text-primary-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Browse Packages</h3>
          <p className="mt-2 text-gray-500">Search for your perfect honeymoon destination above. Packages from our partner vendors will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                <Palmtree className="text-gray-400" size={32} />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{pkg.title}</h3>
                  {pkg.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><MapPin size={14} /> {pkg.destination}</div>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {pkg.durationNights} Nights</div>
                  <div className="flex items-center gap-2"><Star size={14} className="text-yellow-400" /> {pkg.rating}</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="flex items-center text-lg font-bold text-primary-600"><IndianRupee size={16} />{pkg.couplePrice.toLocaleString()}</span>
                  <button className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
