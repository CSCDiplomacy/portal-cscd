import { useAuthStore } from '../../stores/authStore';

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Card */}
        <div className="mb-8 border border-on-surface-2 border-opacity-10 rounded-lg p-6 md:p-8 bg-gradient-to-br from-on-surface-2 from-opacity-5 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-on-surface-2 uppercase tracking-wide mb-2">
                Delegate credential
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">
                Welcome
              </h1>
              <p className="text-on-surface-2">{user?.name || 'Delegate'}</p>
            </div>

            {/* Seal/Badge */}
            <div className="w-20 h-20 rounded-full border-2 border-on-surface flex items-center justify-center text-center text-xs font-bold leading-tight">
              <span>
                YPDS
                <br />
                JKT
                <br />
                2026
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <h2 className="font-display font-bold mb-2">Rundown</h2>
            <p className="text-on-surface-2 text-sm">Coming soon</p>
          </div>

          <div className="card text-center py-8">
            <div className="text-4xl mb-2">🏨</div>
            <h2 className="font-display font-bold mb-2">Hotel & Stay</h2>
            <p className="text-on-surface-2 text-sm">Coming soon</p>
          </div>

          <div className="card text-center py-8">
            <div className="text-4xl mb-2">📅</div>
            <h2 className="font-display font-bold mb-2">My Schedule</h2>
            <p className="text-on-surface-2 text-sm">Coming soon</p>
          </div>

          <div className="card text-center py-8">
            <div className="text-4xl mb-2">📞</div>
            <h2 className="font-display font-bold mb-2">Contact</h2>
            <p className="text-on-surface-2 text-sm">Coming soon</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-12 p-6 bg-on-surface-2 bg-opacity-5 rounded-lg">
          <h3 className="font-display font-bold mb-3">Migration Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Phase 1: Project Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Phase 2: Auth System</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Phase 3: Layout & Navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-2">→</span>
              <span>Phase 4: Event Screens</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-2">→</span>
              <span>Phase 5: State & Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-2">→</span>
              <span>Phase 6: Polish & Deploy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
