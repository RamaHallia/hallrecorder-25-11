import { ElementType } from 'react';
import { Sparkles, Zap, FileText, Clock, AlignLeft, Shield, X } from 'lucide-react';
import { SummaryMode } from '../services/transcription';

interface SummaryPreferenceModalProps {
  isOpen: boolean;
  recommendedMode: SummaryMode;
  estimatedWordCount: number;
  recordingDuration: number;
  showDefaultReminder: boolean;
  onSelect: (mode: SummaryMode) => void;
  onCancel: () => void;
  onOpenSettings?: () => void;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const SummaryPreferenceModal = ({
  isOpen,
  recommendedMode,
  estimatedWordCount,
  recordingDuration,
  showDefaultReminder,
  onSelect,
  onCancel,
  onOpenSettings,
}: SummaryPreferenceModalProps) => {
  if (!isOpen) return null;

  const options: Array<{
    id: SummaryMode;
    title: string;
    highlight: string;
    description: string;
    details: string;
    icon: ElementType;
  }> = [
    {
      id: 'short',
      title: 'Résumé court',
      highlight: 'Idéal pour les réunions express',
      description: 'Synthèse flash en 3-4 points clés.',
      details: 'Met en avant les décisions et prochaines actions.',
      icon: Zap,
    },
    {
      id: 'detailed',
      title: 'Résumé détaillé',
      highlight: 'Pour les réunions riches en contenu',
      description: 'Compte-rendu structuré avec contexte complet.',
      details: 'Inclut objectifs, décisions, risques et suivis.',
      icon: FileText,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1200] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scaleIn">
        <div className="bg-gradient-to-r from-coral-500 via-sunset-500 to-orange-500 p-6 relative text-white">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            title="Annuler le traitement"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="uppercase text-sm tracking-[0.25em] text-white/80 font-semibold">Avant de générer</p>
              <h2 className="text-3xl font-bold mt-1">Choisissez le type de résumé</h2>
              <p className="text-white/90 mt-2 max-w-2xl">
                Ajustez le niveau de détail selon la durée de la réunion et la quantité d&apos;informations capturées.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              Durée&nbsp;: {formatDuration(recordingDuration)}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full">
              <AlignLeft className="w-4 h-4" />
              ≈ {estimatedWordCount} mots
            </span>
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              {recommendedMode === 'short' ? 'Résumé court recommandé' : 'Résumé détaillé recommandé'}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-orange-50 via-white to-coral-50">
          {showDefaultReminder && (
            <div className="p-4 border-2 border-orange-200 rounded-2xl bg-white/80 flex flex-col gap-2 text-sm text-cocoa-700">
              <div className="font-semibold text-cocoa-900">Astuce</div>
              <p>
                Pour éviter ce choix à chaque fin d&apos;enregistrement, définissez un mode de résumé par défaut dans les Paramètres.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onOpenSettings?.()}
                  disabled={!onOpenSettings}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-coral-500 to-sunset-500 hover:from-coral-600 hover:to-sunset-600 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Ouvrir les Paramètres
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => {
              const Icon = option.icon;
              const isRecommended = option.id === recommendedMode;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={`group relative text-left rounded-2xl border-2 p-5 transition-all duration-300 ${
                    isRecommended
                      ? 'border-coral-400 bg-white shadow-xl shadow-coral-100'
                      : 'border-cocoa-100 bg-white/80 hover:border-coral-200 hover:shadow-lg'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-3 left-4 text-xs font-semibold bg-coral-500 text-white px-3 py-1 rounded-full shadow-md">
                      Recommandé
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRecommended ? 'bg-coral-50 text-coral-500' : 'bg-orange-50 text-orange-500'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-cocoa-400">{option.id === 'short' ? 'Rapide' : 'Complet'}</p>
                      <h3 className="text-xl font-bold text-cocoa-900">{option.title}</h3>
                    </div>
                  </div>
                  <p className="text-cocoa-700 font-semibold">{option.highlight}</p>
                  <p className="text-cocoa-600 text-sm mt-1">{option.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-coral-600 font-semibold group-hover:gap-3 transition-all">
                    <span>{option.details}</span>
                    <span>→</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl border-2 border-cocoa-200 text-cocoa-700 font-semibold hover:border-cocoa-300 hover:bg-white transition-all"
          >
            Annuler et recommencer l&apos;enregistrement
          </button>
        </div>
      </div>
    </div>
  );
};

