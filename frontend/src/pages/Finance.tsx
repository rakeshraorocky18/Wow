import { useState } from 'react';
import { Wallet, PieChart, CreditCard, Gift, Plus, TrendingDown, TrendingUp } from 'lucide-react';

type Tab = 'budget' | 'expenses' | 'loans' | 'gifts';

export default function Finance() {
  const [activeTab, setActiveTab] = useState<Tab>('budget');

  const tabs: { key: Tab; label: string; icon: typeof Wallet }[] = [
    { key: 'budget', label: 'Budget', icon: PieChart },
    { key: 'expenses', label: 'Expenses', icon: CreditCard },
    { key: 'loans', label: 'Loans', icon: TrendingDown },
    { key: 'gifts', label: 'Gift Registry', icon: Gift },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Services</h1>
        <p className="text-gray-500 mt-1">Budget planning, expenses, loans & gift registry</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">Not Set</p>
              <button className="mt-3 text-sm text-primary-600 hover:text-primary-700">Set Budget</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Spent</p>
              <p className="text-2xl font-bold text-red-600 mt-1 flex items-center gap-1"><TrendingUp size={20} /> ₹0</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-1"><TrendingDown size={20} /> ₹0</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Budget Items</h3>
              <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                <Plus size={16} /> Add Item
              </button>
            </div>
            <div className="text-center py-8 text-gray-400">
              <PieChart className="mx-auto" size={40} />
              <p className="mt-2">Add budget items like Venue, Catering, Photography, etc.</p>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Expense Tracker</h3>
            <button className="flex items-center gap-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">
              <Plus size={16} /> Record Expense
            </button>
          </div>
          <div className="text-center py-8 text-gray-400">
            <CreditCard className="mx-auto" size={40} />
            <p className="mt-2">No expenses recorded yet. Track every wedding payment here.</p>
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Wedding Loan Calculator</h3>
            <p className="text-sm text-gray-500 mb-4">Estimate your EMI for a wedding loan</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="12" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months)</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="36" />
              </div>
            </div>
            <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Calculate EMI</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">My Applications</h3>
            <div className="text-center py-6 text-gray-400">
              <p>No loan applications yet</p>
            </div>
          </div>
        </div>
      )}

      {/* Gift Registry Tab */}
      {activeTab === 'gifts' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Gift Registry</h3>
              <p className="text-sm text-gray-500 mt-1">Let your guests know what you'd love to receive</p>
            </div>
            <button className="flex items-center gap-1 text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700">
              <Plus size={16} /> Add Gift
            </button>
          </div>
          <div className="text-center py-8 text-gray-400">
            <Gift className="mx-auto" size={40} />
            <p className="mt-2">Create your wish list and share with guests. They can reserve items to avoid duplicates.</p>
          </div>
        </div>
      )}
    </div>
  );
}
