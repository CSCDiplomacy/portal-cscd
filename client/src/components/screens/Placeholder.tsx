interface PlaceholderProps {
  title: string;
  icon: string;
}

export const Placeholder = ({ title, icon }: PlaceholderProps) => {
  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-3xl font-display font-bold mb-2">{title}</h1>
          <p className="text-on-surface-2 mb-6">Coming soon</p>
          <p className="text-sm text-on-surface-2 max-w-md">
            This section will be populated with event data as it becomes available.
          </p>
        </div>
      </div>
    </div>
  );
};
