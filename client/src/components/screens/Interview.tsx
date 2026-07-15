import { useEffect, useState } from 'react';

interface InterviewState {
  state: 'open' | 'submitted' | 'not_applicable' | 'unavailable' | 'loading';
  url?: string;
  submitted_at?: string;
}

export const Interview = () => {
  const [interviewData, setInterviewData] = useState<InterviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterview();
  }, []);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cscd_token');
      const res = await fetch('/api/me/interview', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load interview');

      const data: InterviewState = await res.json();
      setInterviewData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-on-surface-2">Loading interview…</p>
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

  if (!interviewData) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-on-surface-2">Interview data not available</p>
        </div>
      </div>
    );
  }

  if (interviewData.state === 'not_applicable') {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="font-display font-bold text-xl mb-2">
              Interview Complete
            </h2>
            <p className="text-on-surface-2">
              Thank you for completing your interview. We look forward to seeing you at the event!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (interviewData.state === 'unavailable') {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="font-display font-bold text-xl mb-2">
              Interview Not Available
            </h2>
            <p className="text-on-surface-2">
              The interview form is not currently available. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (interviewData.state === 'submitted') {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="font-display font-bold text-xl mb-2">
              Interview Submitted
            </h2>
            <p className="text-on-surface-2 mb-4">
              Your interview was submitted on{' '}
              {interviewData.submitted_at
                ? new Date(interviewData.submitted_at).toLocaleDateString()
                : 'an earlier date'}
            </p>
            <p className="text-sm text-on-surface-2">
              Thank you for taking the time to complete the interview. We will review your responses and be in touch shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Interview is open
  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Delegate Interview
          </h1>
          <p className="text-on-surface-2">
            Complete the interview form below to submit your application.
          </p>
        </div>

        {interviewData.url && (
          <div className="bg-on-surface-2 bg-opacity-5 rounded-lg p-6 md:p-8">
            {/* AidaForm Embed - as provided by user */}
            <div
              data-aidaform-app="form202405"
              data-url={interviewData.url}
              data-width="100%"
              data-height="500px"
              data-do-resize
            ></div>
            <script>
              {`(function(){
                var r,d=document,gt=d.getElementById,cr=d.createElement,tg=d.getElementsByTagName,id="aidaform-app";
                if(!gt.call(d,id)){
                  r=cr.call(d,"script");
                  r.id=id;
                  r.src="https://widget.aidaform.com/embed.js";
                  (d.head || tg.call(d,"head")[0]).appendChild(r);
                }
              })()`}
            </script>
          </div>
        )}

        <div className="mt-6 p-4 bg-on-surface-2 bg-opacity-5 rounded-lg border-l-4 border-signal">
          <p className="text-sm">
            <strong>Note:</strong> Once you submit your interview, you will not be able to edit your responses. Please review your answers carefully before submitting.
          </p>
        </div>
      </div>
    </div>
  );
};
