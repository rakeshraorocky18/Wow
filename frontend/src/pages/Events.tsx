import { useState } from 'react';
import { PartyPopper, Plus, Users, MapPin, Clock } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  guestCount: number;
  confirmedCount: number;
}

export default function Events() {
  const [events] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marriage Events</h1>
          <p className="text-gray-500 mt-1">Manage ceremonies, receptions & guest lists</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          New Event
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="e.g., Wedding Reception" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>Engagement</option>
                <option>Mehndi</option>
                <option>Sangeet</option>
                <option>Haldi</option>
                <option>Wedding Ceremony</option>
                <option>Reception</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Venue name" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Save Event</button>
            <button onClick={() => setShowForm(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100">Cancel</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <PartyPopper className="mx-auto text-primary-400" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events yet</h3>
          <p className="mt-2 text-gray-500">Create your first wedding event to start managing guests and details.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900">{event.name}</h3>
              <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{event.type}</span>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Clock size={14} /> {event.date}</div>
                <div className="flex items-center gap-2"><MapPin size={14} /> {event.venue}</div>
                <div className="flex items-center gap-2"><Users size={14} /> {event.confirmedCount}/{event.guestCount} confirmed</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
