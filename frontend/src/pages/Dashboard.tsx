import { Heart, MessageCircle, Store, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const quickActions = [
  { icon: Heart, label: 'Find Matches', path: '/app/matches', color: 'text-pink-500 bg-pink-50' },
  { icon: MessageCircle, label: 'Messages', path: '/app/chat', color: 'text-blue-500 bg-blue-50' },
  { icon: Store, label: 'Browse Vendors', path: '/app/vendors', color: 'text-purple-500 bg-purple-50' },
  { icon: Calendar, label: 'Plan Wedding', path: '/app/planner', color: 'text-green-500 bg-green-50' },
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <h1 className="text-2xl font-display font-bold">
          Welcome back! ✨
        </h1>
        <p className="mt-2 text-primary-100">
          Your wedding journey is waiting. Let's make it magical.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.path} to={action.path} className="card hover:shadow-md transition-shadow text-center">
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto`}>
                <Icon size={24} />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">{action.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-pink-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">New Matches</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MessageCircle size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Unread Messages</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-sm text-gray-500">Planning Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-sm text-gray-700">Create your account</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-700">Complete your profile</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-700">Start exploring matches</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            <span className="text-sm text-gray-700">Browse wedding vendors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
