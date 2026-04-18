'use client';

import {Toaster, toast} from 'react-hot-toast';

export interface AlertOptions {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

class AlertService {
    success(message: string, options?: AlertOptions) {
        toast.success(message, {
            duration: options?.duration || 4000,
            position: options?.position || 'top-right',
            style: {
                background: '#10b981',
                color: '#ffffff',
                border: '1px solid #059669',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#10b981',
            },
        });
    }

    error(message: string, options?: AlertOptions) {
        toast.error(message, {
            duration: options?.duration || 5000,
            position: options?.position || 'top-right',
            style: {
                background: '#ef4444',
                color: '#ffffff',
                border: '1px solid #dc2626',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#ef4444',
            },
        });
    }

    warning(message: string, options?: AlertOptions) {
        toast(message, {
            duration: options?.duration || 4000,
            position: options?.position || 'top-right',
            icon: 'warning',
            style: {
                background: '#f59e0b',
                color: '#ffffff',
                border: '1px solid #d97706',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#f59e0b',
            },
        });
    }

    info(message: string, options?: AlertOptions) {
        toast(message, {
            duration: options?.duration || 4000,
            position: options?.position || 'top-right',
            icon: 'info',
            style: {
                background: '#3b82f6',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
                primary: '#ffffff',
                secondary: '#3b82f6',
            },
        });
    }

    loading(message: string, options?: AlertOptions) {
        return toast.loading(message, {
            position: options?.position || 'top-right',
            style: {
                background: '#6b7280',
                color: '#ffffff',
                border: '1px solid #4b5563',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
        });
    }

    dismiss(toastId: string) {
        toast.dismiss(toastId);
    }

    promise<T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        },
        options?: AlertOptions
    ): Promise<T> {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                position: options?.position || 'top-right',
                style: {
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                },
            }
        );
    }
}

export const alert = new AlertService();

export default function AlertProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#ffffff',
                    color: '#374151',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                },
                success: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#10b981',
                    },
                },
                error: {
                    duration: 5000,
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#ef4444',
                    },
                },
            }}
        />
    );
}
