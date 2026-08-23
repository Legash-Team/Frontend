import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { 
  DialogContext, 
  type DialogType, 
  type ConfirmOptions, 
  type AlertOptions, 
  type PromptOptions, 
  type ToastItem 
} from './dialog-context';

interface ActiveDialogState {
  mode: 'confirm' | 'alert' | 'prompt';
  title?: string;
  message: React.ReactNode;
  type: DialogType;
  confirmText: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  buttonText?: string;
  defaultValue?: string;
  placeholder?: string;
  inputType?: string;
  validate?: (val: string) => string | null;
  resolve: (value?: unknown) => void;
}

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDialog, setActiveDialog] = useState<ActiveDialogState | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [promptError, setPromptError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const promptInputRef = useRef<HTMLInputElement>(null);

  // --- CONFIRM ---
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setActiveDialog({
        mode: 'confirm',
        title: options.title || 'Please Confirm',
        message: options.message,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmVariant: options.confirmVariant || (options.type === 'danger' ? 'danger' : 'primary'),
        resolve: (val?: unknown) => {
          setActiveDialog(null);
          resolve(Boolean(val));
        },
      });
    });
  }, []);

  // --- ALERT ---
  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    const opts: AlertOptions = typeof options === 'string' 
      ? { message: options, title: 'Notification', type: 'info', buttonText: 'OK' } 
      : options;

    return new Promise<void>((resolve) => {
      setActiveDialog({
        mode: 'alert',
        title: opts.title || (opts.type === 'error' ? 'Error' : opts.type === 'success' ? 'Success' : 'Notice'),
        message: opts.message,
        type: opts.type || 'info',
        confirmText: opts.buttonText || 'OK',
        resolve: () => {
          setActiveDialog(null);
          resolve();
        },
      });
    });
  }, []);

  // --- PROMPT ---
  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      setPromptInput(options.defaultValue || '');
      setPromptError(null);
      setActiveDialog({
        mode: 'prompt',
        title: options.title || 'Input Required',
        message: options.message,
        type: 'info',
        confirmText: options.confirmText || 'Submit',
        cancelText: options.cancelText || 'Cancel',
        defaultValue: options.defaultValue || '',
        placeholder: options.placeholder || '',
        inputType: options.inputType || 'text',
        validate: options.validate,
        resolve: (val?: unknown) => {
          setActiveDialog(null);
          setPromptInput('');
          setPromptError(null);
          resolve(typeof val === 'string' ? val : null);
        },
      });
    });
  }, []);

  // --- TOAST NOTIFICATIONS ---
  const addToast = useCallback((type: ToastItem['type'], message: React.ReactNode, title?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, message, title, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: useCallback((msg: React.ReactNode, title?: string) => addToast('success', msg, title), [addToast]),
    error: useCallback((msg: React.ReactNode, title?: string) => addToast('error', msg, title), [addToast]),
    warning: useCallback((msg: React.ReactNode, title?: string) => addToast('warning', msg, title), [addToast]),
    info: useCallback((msg: React.ReactNode, title?: string) => addToast('info', msg, title), [addToast]),
    dismiss: dismissToast,
  };

  // Focus prompt input when active
  useEffect(() => {
    if (activeDialog?.mode === 'prompt') {
      setTimeout(() => {
        promptInputRef.current?.focus();
        promptInputRef.current?.select();
      }, 50);
    }
  }, [activeDialog]);

  // Handle ESC key to dismiss dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeDialog) {
        if (activeDialog.mode === 'confirm') activeDialog.resolve(false);
        else if (activeDialog.mode === 'prompt') activeDialog.resolve(null);
        else if (activeDialog.mode === 'alert') activeDialog.resolve();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDialog]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeDialog?.validate) {
      const err = activeDialog.validate(promptInput);
      if (err) {
        setPromptError(err);
        return;
      }
    }
    activeDialog?.resolve(promptInput);
  };

  const getIcon = (type: DialogType) => {
    switch (type) {
      case 'danger':
      case 'error':
        return <AlertCircle className="w-6 h-6 text-crimson" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBadgeStyle = (type: DialogType) => {
    switch (type) {
      case 'danger':
      case 'error':
        return 'bg-crimson/10 text-crimson border-crimson/20';
      case 'warning':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt, toast }}>
      {children}

      {/* --- TOAST NOTIFICATIONS STACK --- */}
      <div className="fixed top-5 right-5 z-[10000] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full sm:w-auto">
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';
          const isSuccess = t.type === 'success';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-line-soft text-ink transition-all transform animate-in slide-in-from-top-3 fade-in duration-200 ${
                isError ? 'border-l-4 border-l-crimson' :
                isWarning ? 'border-l-4 border-l-amber-500' :
                isSuccess ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-blue-500'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError && <AlertCircle className="w-5 h-5 text-crimson" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {t.title && <h4 className="text-xs font-bold font-sans text-ink uppercase tracking-wider mb-0.5">{t.title}</h4>}
                <div className="text-xs sm:text-sm font-sans text-ink-soft leading-relaxed break-words">
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="shrink-0 p-1 text-ink-soft/40 hover:text-ink hover:bg-paper rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* --- MODAL DIALOG OVERLAY --- */}
      {activeDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            onClick={() => {
              if (activeDialog.mode === 'confirm') activeDialog.resolve(false);
              else if (activeDialog.mode === 'prompt') activeDialog.resolve(null);
              else activeDialog.resolve();
            }}
            className="absolute inset-0 bg-ink/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-line-soft w-full max-w-md overflow-hidden transition-all transform animate-in zoom-in-95 fade-in duration-150 p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${getBadgeStyle(activeDialog.type)}`}>
                {getIcon(activeDialog.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-ink leading-tight">
                  {activeDialog.title}
                </h3>
                <div className="text-xs sm:text-sm font-sans text-ink-soft mt-1.5 leading-relaxed">
                  {activeDialog.message}
                </div>
              </div>
            </div>

            {/* Prompt Input Form */}
            {activeDialog.mode === 'prompt' && (
              <form onSubmit={handlePromptSubmit} className="space-y-3">
                <input
                  ref={promptInputRef}
                  type={activeDialog.inputType || 'text'}
                  value={promptInput}
                  onChange={(e) => {
                    setPromptInput(e.target.value);
                    if (promptError) setPromptError(null);
                  }}
                  placeholder={activeDialog.placeholder}
                  className="w-full px-4 py-3 bg-paper border border-line-soft rounded-2xl text-sm text-ink focus:outline-none focus:border-crimson focus:ring-2 focus:ring-crimson/10 transition-all font-sans"
                />
                {promptError && (
                  <p className="text-xs text-crimson font-sans flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {promptError}
                  </p>
                )}
              </form>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {activeDialog.mode === 'confirm' && (
                <>
                  <button
                    type="button"
                    onClick={() => activeDialog.resolve(false)}
                    className="px-5 py-2.5 rounded-full border border-line-soft text-xs sm:text-sm font-semibold text-ink-soft hover:text-ink hover:bg-paper transition-all cursor-pointer"
                  >
                    {activeDialog.cancelText || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => activeDialog.resolve(true)}
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-xs transition-all cursor-pointer ${
                      activeDialog.confirmVariant === 'danger'
                        ? 'bg-crimson hover:bg-crimson-dark'
                        : activeDialog.type === 'success'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-crimson hover:bg-crimson-dark'
                    }`}
                  >
                    {activeDialog.confirmText}
                  </button>
                </>
              )}

              {activeDialog.mode === 'prompt' && (
                <>
                  <button
                    type="button"
                    onClick={() => activeDialog.resolve(null)}
                    className="px-5 py-2.5 rounded-full border border-line-soft text-xs sm:text-sm font-semibold text-ink-soft hover:text-ink hover:bg-paper transition-all cursor-pointer"
                  >
                    {activeDialog.cancelText || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePromptSubmit}
                    className="px-5 py-2.5 rounded-full bg-crimson hover:bg-crimson-dark text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    {activeDialog.confirmText}
                  </button>
                </>
              )}

              {activeDialog.mode === 'alert' && (
                <button
                  type="button"
                  onClick={() => activeDialog.resolve()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-ink hover:bg-ink/90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {activeDialog.confirmText}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
