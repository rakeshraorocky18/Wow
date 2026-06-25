import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, IndianRupee, Search } from 'lucide-react';
import api from '../lib/api';

const categories = [
  'All', 'venue', 'catering', 'photography', 'videography',
  'decor', 'makeup', 'entertainment', 'invitation',
];

export default function Vendors() {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', category, searchTerm, city],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (searchTerm) params.set('search', searchTerm);
      if (city) params.set('city', city);
      const { data } = await api.get(`/vendors/search?${params.toString()}`);
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900">Vendor Marketplace</h1>

      {/* Search & Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
              placeholder="Search vendors..."
            />
          </div>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field md:w-48"
            placeholder="City"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading vendors...</div>
      ) : data?.vendors?.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.vendors.map((vendor: any) => (
            <div key={vendor._id} className="card hover:shadow-md transition-shadow">
              <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-3xl">🏪</span>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vendor.businessName}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {vendor.category}
                  </span>
                </div>
                {vendor.rating?.average > 0 && (
                  <div className="flex items-center gap-1 text-gold-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm font-medium">{vendor.rating.average}</span>
                  </div>
                )}
              </div>
              {vendor.location?.city && (
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> {vendor.location.city}
                </p>
              )}
              {vendor.pricing?.startingPrice && (
                <p className="mt-1 text-sm text-gray-700 flex items-center gap-1">
                  <IndianRupee size={14} /> Starting ₹{vendor.pricing.startingPrice.toLocaleString()}
                </p>
              )}
              <button className="mt-4 btn-primary w-full text-sm py-2">View Details</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Store size={48} className="text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">No vendors found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}

function Store(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </svg>
  );
}
