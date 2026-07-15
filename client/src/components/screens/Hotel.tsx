import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { mapsLink } from '../../lib/utils';

interface HotelData {
  delegate: {
    name?: string;
    applicant_id?: string;
    room?: string;
    booking_ref?: string;
    check_in?: string;
    check_out?: string;
    meals?: string;
  } | null;
  hotel: {
    id: string;
    name: string;
    location: string;
    address?: string;
    phone?: string;
    email?: string;
    checkin?: string;
    checkout?: string;
    wifi?: string;
    meals?: string;
    image?: string;
  } | null;
}

export const Hotel = () => {
  const { session } = useAuthStore();
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadHotel();
    }
  }, [session]);

  const loadHotel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cscd_token');
      const res = await fetch('/api/me/hotel', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load hotel information');

      const data: HotelData = await res.json();
      setHotelData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hotel info');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-on-surface-2">Please log in to view hotel information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <svg
            className="w-8 h-8 animate-spin text-on-surface mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" opacity="0.25" />
            <path d="M12 3a9 9 0 0 1 9 9" />
          </svg>
          <p className="text-on-surface-2">Loading hotel information…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
          Hotel & Check-in
        </h1>

        {/* Hotel Details */}
        {hotelData?.hotel ? (
          <div className="card mb-6">
            {hotelData.hotel.image && (
              <img
                src={hotelData.hotel.image}
                alt={hotelData.hotel.name}
                className="w-full h-48 object-cover rounded mb-4 -m-4 mb-4"
              />
            )}

            <h2 className="text-2xl font-display font-bold mb-2">
              {hotelData.hotel.name}
            </h2>

            <p className="text-on-surface-2 mb-4">{hotelData.hotel.location}</p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {hotelData.hotel.address && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Address
                  </div>
                  <div className="flex gap-2">
                    <span>{hotelData.hotel.address}</span>
                    {hotelData.hotel.address && (
                      <a
                        href={mapsLink(hotelData.hotel.address) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-signal hover:underline"
                      >
                        📍
                      </a>
                    )}
                  </div>
                </div>
              )}

              {hotelData.hotel.phone && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Phone
                  </div>
                  <a
                    href={`tel:${hotelData.hotel.phone}`}
                    className="text-signal hover:underline"
                  >
                    {hotelData.hotel.phone}
                  </a>
                </div>
              )}

              {hotelData.hotel.email && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Email
                  </div>
                  <a
                    href={`mailto:${hotelData.hotel.email}`}
                    className="text-signal hover:underline"
                  >
                    {hotelData.hotel.email}
                  </a>
                </div>
              )}

              {hotelData.hotel.checkin && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Check-in
                  </div>
                  <span>{hotelData.hotel.checkin}</span>
                </div>
              )}

              {hotelData.hotel.checkout && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Check-out
                  </div>
                  <span>{hotelData.hotel.checkout}</span>
                </div>
              )}
            </div>

            {hotelData.hotel.wifi && (
              <div className="p-3 bg-on-surface-2 bg-opacity-5 rounded mb-4">
                <div className="text-sm font-medium mb-1">WiFi</div>
                <div className="text-sm text-on-surface-2">{hotelData.hotel.wifi}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="card mb-6 text-center py-8">
            <p className="text-on-surface-2">
              Hotel information will be provided soon.
            </p>
          </div>
        )}

        {/* Your Booking */}
        {hotelData?.delegate && (
          <div className="card">
            <h3 className="text-xl font-display font-bold mb-4">Your Booking</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {hotelData.delegate.room && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Room
                  </div>
                  <div className="text-lg font-bold">{hotelData.delegate.room}</div>
                </div>
              )}

              {hotelData.delegate.booking_ref && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Booking Reference
                  </div>
                  <div className="font-mono text-sm">{hotelData.delegate.booking_ref}</div>
                </div>
              )}

              {hotelData.delegate.check_in && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Your Check-in
                  </div>
                  <div>{new Date(hotelData.delegate.check_in).toLocaleDateString()}</div>
                </div>
              )}

              {hotelData.delegate.check_out && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Your Check-out
                  </div>
                  <div>
                    {new Date(hotelData.delegate.check_out).toLocaleDateString()}
                  </div>
                </div>
              )}

              {hotelData.delegate.meals && (
                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Meals Included
                  </div>
                  <div>{hotelData.delegate.meals}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
