import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, Info, X, Zap } from 'lucide-react';

interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Success notifications
export const notifications = {
  success: (message: string, options?: NotificationOptions) => {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  },

  error: (message: string, options?: NotificationOptions) => {
    return toast.error(message, {
      duration: options?.duration || 6000, // Errors stay longer
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  },

  warning: (message: string, options?: NotificationOptions) => {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  },

  info: (message: string, options?: NotificationOptions) => {
    return toast.info(message, {
      duration: options?.duration || 4000,
      position: options?.position,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  },

  loading: (message: string, options?: NotificationOptions) => {
    return toast.loading(message, {
      duration: options?.duration || Infinity, // Loading toasts don't auto-dismiss
      position: options?.position,
      dismissible: options?.dismissible !== false,
    });
  },

  // Specialized notifications for Blue Carbon Registry
  auth: {
    loginSuccess: (userName: string) => {
      return notifications.success(`Welcome back, ${userName}!`, {
        duration: 3000,
      });
    },

    loginError: (error: string) => {
      return notifications.error(`Login failed: ${error}`, {
        duration: 6000,
        action: {
          label: 'Try Again',
          onClick: () => window.location.reload(),
        },
      });
    },

    logout: () => {
      return notifications.info('You have been logged out', {
        duration: 3000,
      });
    },

    sessionExpired: () => {
      return notifications.warning('Your session has expired. Please log in again.', {
        duration: 8000,
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/login',
        },
      });
    },
  },

  project: {
    submitted: (projectName: string) => {
      return notifications.success(`Project "${projectName}" submitted successfully!`, {
        duration: 5000,
      });
    },

    verified: (projectName: string) => {
      return notifications.success(`Project "${projectName}" has been verified!`, {
        duration: 6000,
      });
    },

    rejected: (projectName: string, reason?: string) => {
      return notifications.error(`Project "${projectName}" was rejected${reason ? `: ${reason}` : ''}`, {
        duration: 8000,
      });
    },

    uploaded: (fileCount: number) => {
      return notifications.success(`${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully`, {
        duration: 4000,
      });
    },

    uploadError: (error: string) => {
      return notifications.error(`Upload failed: ${error}`, {
        duration: 6000,
      });
    },
  },

  blockchain: {
    walletConnected: (address: string) => {
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      return notifications.success(`Wallet connected: ${shortAddress}`, {
        duration: 4000,
      });
    },

    walletDisconnected: () => {
      return notifications.info('Wallet disconnected', {
        duration: 3000,
      });
    },

    transactionPending: (txHash: string) => {
      const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
      return notifications.loading(`Transaction pending: ${shortHash}`, {
        duration: Infinity,
      });
    },

    transactionSuccess: (txHash: string) => {
      const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
      return notifications.success(`Transaction confirmed: ${shortHash}`, {
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank'),
        },
      });
    },

    transactionError: (error: string) => {
      return notifications.error(`Transaction failed: ${error}`, {
        duration: 8000,
      });
    },

    creditsMinted: (amount: number, projectName: string) => {
      return notifications.success(`${amount.toLocaleString()} carbon credits minted for ${projectName}!`, {
        duration: 6000,
      });
    },
  },

  marketplace: {
    purchased: (credits: number, amount: number) => {
      return notifications.success(`Successfully purchased ${credits.toLocaleString()} credits for $${amount.toLocaleString()}!`, {
        duration: 6000,
      });
    },

    listed: (credits: number, price: number) => {
      return notifications.success(`${credits.toLocaleString()} credits listed for $${price.toFixed(2)} each`, {
        duration: 5000,
      });
    },

    retired: (credits: number) => {
      return notifications.success(`${credits.toLocaleString()} carbon credits retired for climate impact!`, {
        duration: 6000,
      });
    },
  },

  system: {
    offline: () => {
      return notifications.warning('You are currently offline. Some features may not be available.', {
        duration: Infinity,
      });
    },

    online: () => {
      return notifications.info('Connection restored', {
        duration: 3000,
      });
    },

    maintenance: (endTime?: string) => {
      return notifications.info(`System maintenance in progress${endTime ? `. Expected completion: ${endTime}` : ''}`, {
        duration: 10000,
      });
    },

    updated: () => {
      return notifications.info('Application updated! Please refresh the page.', {
        duration: Infinity,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });
    },
  },

  // Utility methods
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  dismissAll: () => {
    toast.dismiss();
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

// Export default notifications object and individual methods for convenience
export default notifications;

// Named exports for specific use cases
export const {
  success,
  error,
  warning,
  info,
  loading,
  auth,
  project,
  blockchain,
  marketplace,
  system,
  dismiss,
  dismissAll,
} = notifications;