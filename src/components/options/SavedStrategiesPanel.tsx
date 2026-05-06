import { X } from "lucide-react";

interface SavedStrategiesPanelProps {
  strategies: any[];
  onLoadStrategy: (strategy: any) => void;
  onClose: () => void;
}

export function SavedStrategiesPanel({ strategies, onLoadStrategy, onClose }: SavedStrategiesPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-tx-card border-l border-tx-border shadow-2xl flex flex-col">
      <div className="p-6 border-b border-tx-border flex items-center justify-between">
        <h3 className="text-xl font-bold font-syne text-white">Saved Strategies</h3>
        <button onClick={onClose} className="p-2 text-tx-text-muted hover:text-white transition-colors rounded-lg bg-tx-bg">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto space-y-4">
        {strategies.length === 0 ? (
          <div className="text-center text-tx-text-muted py-10">
            No saved strategies found.
          </div>
        ) : (
          strategies.map((strategy) => (
            <div key={strategy.id} className="bg-tx-bg border border-tx-border rounded-xl p-4 hover:border-tx-primary/50 transition-colors cursor-pointer" onClick={() => onLoadStrategy(strategy)}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white">{strategy.name}</h4>
                <span className="text-xs font-mono px-2 py-1 bg-tx-primary/10 text-tx-primary rounded border border-tx-primary/20">
                  {strategy.underlying_symbol}
                </span>
              </div>
              {strategy.description && (
                <p className="text-sm text-tx-text-secondary mb-3 line-clamp-2">{strategy.description}</p>
              )}
              <div className="flex gap-3 text-xs">
                <span className="text-tx-text-muted">Legs: <span className="text-white">{strategy.positions?.length || 0}</span></span>
                <span className="text-tx-text-muted">Max Profit: <span className="text-emerald-400">₹{strategy.max_profit || 'N/A'}</span></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
