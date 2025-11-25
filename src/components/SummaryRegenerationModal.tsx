import { Loader2, Sparkles } from 'lucide-react';
import { SummaryMode } from '../services/transcription';

interface SummaryRegenerationModalProps {
  isOpen: boolean;
  meetingTitle: string;
  isProcessing: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  targetMode: SummaryMode;
}

export const SummaryRegenerationModal = ({
  isOpen,
  meetingTitle,
  isProcessing,
  errorMessage,
  onConfirm,
  onCancel,
  targetMode,
}: SummaryRegenerationModalProps) => {
  if (!isOpen) return null;

  const targetLabel = targetMode === 'detailed' ? 'détaillée' : 'courte';

  return (
    <div className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={onCancel}>
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        {/* Header compact */}
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Générer la version {targetLabel}</h2>
              <p className="text-sm text-white/80 truncate max-w-[280px]">{meetingTitle}</p>
            </div>
          </div>
        </div>

        {/* Contenu simplifié */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Une nouvelle version {targetLabel} sera générée. Vous pourrez basculer entre les deux versions à tout moment.
          </p>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-coral-500 hover:bg-coral-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </span>
              ) : (
                'Générer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
