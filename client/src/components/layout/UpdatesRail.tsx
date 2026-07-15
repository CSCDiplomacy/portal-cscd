// Updates rail: announcements feed, pinned first (the API pre-sorts).
import { useDelegateStore } from '../../stores/delegateStore';
import { Icon } from '../Icon';

export const UpdatesRail = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { announcements } = useDelegateStore();

  return (
    <aside className={`rail${open ? ' open' : ''}`}>
      <div className="rail-head">
        <h3>Updates</h3>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="rail-body">
        {announcements.length === 0 ? (
          <p className="rail-empty">No updates yet — announcements will land here.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="update-card">
              {a.pinned && <span className="update-pin">Pinned</span>}
              <div className="update-title">{a.title}</div>
              <p className="update-body">{a.body}</p>
              <div className="update-date">
                {new Date(a.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
