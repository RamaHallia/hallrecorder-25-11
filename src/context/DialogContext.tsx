import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

type DialogVariant = 'info' | 'success' | 'warning' | 'danger';

interface BaseDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: DialogVariant;
}

interface AlertOptions extends BaseDialogOptions {}

interface ConfirmOptions extends BaseDialogOptions {
  cancelLabel?: string;
}

type DialogState =
  | ({ type: 'alert' } & Required<Pick<BaseDialogOptions, 'message'>> & Partial<BaseDialogOptions>)
  | ({ type: 'confirm' } & Required<Pick<BaseDialogOptions, 'message'>> & Partial<ConfirmOptions>);

interface DialogContextValue {
  showAlert: (options: AlertOptions | string) => Promise<void>;
  showConfirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

const variantConfig: Record<
  DialogVariant,
  {
    icon: JSX.Element;
    accent: string;
    badge: string;
  }
> = {
  info: {
    icon: <Info className="w-6 h-6 text-sky-500" />,
    accent: 'from-sky-500 to-sky-600',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  success: {
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    accent: 'from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    accent: 'from-amber-500 to-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  danger: {
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />,
    accent: 'from-red-500 to-rose-600',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
};

const defaultTitles: Record<DialogVariant, string> = {
  info: 'Information',
  success: 'Succès',
  warning: 'Attention',
  danger: 'Erreur',
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolverRef = useRef<(value: any) => void>();

  const closeDialog = useCallback(() => {
    setDialog(null);
    resolverRef.current = undefined;
  }, []);

  const showAlert = useCallback(
    (options: AlertOptions | string) => {
      const payload = typeof options === 'string' ? { message: options } : options;
      return new Promise<void>((resolve) => {
        setDialog({
          type: 'alert',
          variant: 'info',
          confirmLabel: 'Fermer',
          ...payload,
        });
        resolverRef.current = () => resolve();
      });
    },
    []
  );

  const showConfirm = useCallback(
    (options: ConfirmOptions | string) => {
      const payload = typeof options === 'string' ? { message: options } : options;
      return new Promise<boolean>((resolve) => {
        setDialog({
          type: 'confirm',
          variant: 'warning',
          confirmLabel: 'Confirmer',
          cancelLabel: 'Annuler',
          ...payload,
        });
        resolverRef.current = (value: boolean) => resolve(value);
      });
    },
    []
  );

  const handlePrimaryAction = useCallback(() => {
    const resolver = resolverRef.current;
    if (!resolver) return;
    if (dialog?.type === 'confirm') {
      resolver(true);
    } else {
      resolver(undefined);
    }
    closeDialog();
  }, [dialog, closeDialog]);

  const handleSecondaryAction = useCallback(() => {
    const resolver = resolverRef.current;
    if (!resolver) return;
    resolver(false);
    closeDialog();
  }, [closeDialog]);

  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (dialog.type === 'confirm') {
          handleSecondaryAction();
        } else {
          handlePrimaryAction();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, handlePrimaryAction, handleSecondaryAction]);

  const renderMessage = (message: string) => {
    return message.split('\n').map((line, index) => (
      <p key={index} className="text-cocoa-700 leading-relaxed">
        {line}
      </p>
    ));
  };

  const variant = dialog?.variant ?? 'info';
  const variantStyles = variantConfig[variant];

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => (dialog.type === 'confirm' ? handleSecondaryAction() : handlePrimaryAction())}>
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 space-y-5 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${variantStyles.badge}`}>
                {variantStyles.icon}
              </div>
              <div>
                <p
                  id="dialog-title"
                  className="text-lg font-semibold text-cocoa-900"
                >
                  {dialog.title || defaultTitles[variant]}
                </p>
                <p className="text-sm text-cocoa-500 mt-0.5">
                  {dialog.type === 'confirm' ? 'Merci de confirmer votre action.' : 'Veuillez lire les informations ci-dessous.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              {renderMessage(dialog.message)}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              {dialog.type === 'confirm' && (
                <button
                  onClick={handleSecondaryAction}
                  className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-cocoa-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  {dialog.cancelLabel || 'Annuler'}
                </button>
              )}

              <button
                onClick={handlePrimaryAction}
                className={`px-5 py-3 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all bg-gradient-to-r ${variantStyles.accent}`}
              >
                {dialog.confirmLabel || (dialog.type === 'confirm' ? 'Confirmer' : 'Fermer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};


