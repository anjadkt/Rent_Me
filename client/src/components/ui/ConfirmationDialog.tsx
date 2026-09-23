import { AlertTriangle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Content */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-xl inline-flex shrink-0 ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-black text-slate-900">{title}</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition shadow-sm ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  );
}
