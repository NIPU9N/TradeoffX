import { useState } from "react";
import { X } from "lucide-react";

interface SaveStrategyModalProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

export function SaveStrategyModal({ onSave, onClose }: SaveStrategyModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-tx-card border border-tx-border w-full max-w-md rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-tx-text-muted hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold font-syne text-white mb-6">Save Strategy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-tx-text-secondary uppercase tracking-wider mb-2">Strategy Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary transition-colors"
              placeholder="e.g. Bullish Nifty Expiry Play"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-tx-text-secondary uppercase tracking-wider mb-2">Description / Thesis</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-tx-bg border border-tx-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-tx-primary transition-colors min-h-[100px]"
              placeholder="Why are you taking this trade?"
            />
          </div>
          <button 
            onClick={() => onSave({ name, description })}
            disabled={!name}
            className="w-full bg-tx-primary text-tx-bg font-bold rounded-xl py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-tx-primary/90 transition-colors"
          >
            Save to Practice Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}
