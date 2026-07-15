import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
}

export const Contact = () => {
  const { session } = useAuthStore();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const data = await api<ContactInfo>('/data/contact');
      setContactInfo(data);
    } catch (err) {
      console.error('Failed to load contact info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setMessage({ type: 'error', text: 'Please enter your feedback.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      await api('/feedback', {
        method: 'POST',
        body: JSON.stringify({ comment: feedback }),
      });

      setMessage({ type: 'success', text: 'Thank you for your feedback!' });
      setFeedback('');

      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      const errorText =
        err instanceof Error ? err.message : 'Failed to submit feedback';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('cscd_token')}` },
      });
      localStorage.removeItem('cscd_token');
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!session) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-on-surface-2">Please log in to view contact information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">
          Contact Us
        </h1>

        {/* Contact Information */}
        {!loading && contactInfo && (
          <div className="card mb-8">
            <h2 className="text-xl font-display font-bold mb-4">CSCD Contact</h2>

            <div className="space-y-4">
              {contactInfo.email && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Email
                  </div>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-signal hover:underline break-all"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              )}

              {contactInfo.phone && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Phone
                  </div>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-signal hover:underline"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              )}

              {contactInfo.address && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Address
                  </div>
                  <p>{contactInfo.address}</p>
                </div>
              )}

              {contactInfo.hours && (
                <div>
                  <div className="text-sm font-medium text-on-surface-2 mb-1">
                    Hours
                  </div>
                  <p>{contactInfo.hours}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-display font-bold mb-4">Feedback</h2>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="field">
              <label htmlFor="feedback">Tell the team how it's going…</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Your feedback helps us improve"
                disabled={submitting}
              />
            </div>

            {message && (
              <div
                className={`form-msg ${message.type === 'success' ? 'ok' : 'error'}`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="btn brass small"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn ghost w-full"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
