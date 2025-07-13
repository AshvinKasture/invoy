/**
 * Store Usage Example
 * Demonstrates how to use the global store in components
 */

import { useAuth, useNotifications, useTheme, useModal } from '@/store';
import { Button } from '@/components/ui/button';

export function StoreExample() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { open: openModal } = useModal();

  const handleTestNotifications = () => {
    showSuccess('Success!', 'This is a success notification');
    setTimeout(() => showInfo('Info', 'This is an info notification'), 1000);
    setTimeout(() => showWarning('Warning', 'This is a warning notification'), 2000);
    setTimeout(() => showError('Error', 'This is an error notification'), 3000);
  };

  const handleTestModal = () => {
    openModal('test-modal', { message: 'This is test modal data' });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Store Usage Example</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Authentication State</h3>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.email : 'None'}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme</h3>
        <p>Current theme: {theme}</p>
        <Button onClick={toggleTheme}>Toggle Theme</Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button onClick={handleTestNotifications}>Test Notifications</Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Modal</h3>
        <Button onClick={handleTestModal}>Open Test Modal</Button>
      </div>
    </div>
  );
}
