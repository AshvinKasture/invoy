/**
 * NotificationContainer Component
 * Displays notifications from the global store
 */

import { useUI } from '@/store';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export function NotificationContainer() {
  const { notifications, removeNotification } = useUI();

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white border-l-4 ${getBorderColor(
            notification.type
          )} rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out animate-in slide-in-from-right`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
