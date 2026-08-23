import React, { createContext, useContext } from 'react';

export type DialogType = 'info' | 'success' | 'warning' | 'danger' | 'error';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  confirmVariant?: 'primary' | 'danger' | 'secondary';
}

export interface AlertOptions {
  title?: string;
  message: React.ReactNode;
  buttonText?: string;
  type?: DialogType;
}

export interface PromptOptions {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: string;
  validate?: (val: string) => string | null;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: React.ReactNode;
  duration?: number;
}

export interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  toast: {
    success: (message: React.ReactNode, title?: string) => void;
    error: (message: React.ReactNode, title?: string) => void;
    warning: (message: React.ReactNode, title?: string) => void;
    info: (message: React.ReactNode, title?: string) => void;
    dismiss: (id: string) => void;
  };
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (): DialogContextValue => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const useToast = () => {
  const { toast } = useDialog();
  return toast;
};
