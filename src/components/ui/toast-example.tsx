'use client';

/**
 * Toast Notification System - Usage Examples
 * 
 * This file demonstrates how to use the professional toast notification system
 * that appears above all other UI elements including navigation.
 */

import { useToast } from './toast';

export function ToastExamples() {
  const { addToast } = useToast();

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Toast Notification Examples</h2>
      
      <button
        onClick={() => addToast({
          title: 'Success!',
          description: 'Your changes have been saved successfully.',
          variant: 'success',
          duration: 5000
        })}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Show Success Toast
      </button>

      <button
        onClick={() => addToast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'error',
          duration: 5000
        })}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Show Error Toast
      </button>

      <button
        onClick={() => addToast({
          title: 'Warning',
          description: 'This action cannot be undone.',
          variant: 'warning',
          duration: 5000
        })}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
      >
        Show Warning Toast
      </button>

      <button
        onClick={() => addToast({
          title: 'Information',
          description: 'New updates are available.',
          variant: 'info',
          duration: 5000
        })}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Show Info Toast
      </button>
    </div>
  );
}

/**
 * Usage in your components:
 * 
 * 1. Wrap your app with ToastProvider in your root layout:
 * 
 *    import { ToastProvider } from '@/components/ui/toast';
 * 
 *    export default function RootLayout({ children }) {
 *      return (
 *        <html>
 *          <body>
 *            <ToastProvider>
 *              {children}
 *            </ToastProvider>
 *          </body>
 *        </html>
 *      );
 *    }
 * 
 * 2. Use the toast in any component:
 * 
 *    import { useToast } from '@/components/ui/toast';
 * 
 *    function MyComponent() {
 *      const { addToast } = useToast();
 * 
 *      const handleSubmit = async () => {
 *        try {
 *          await saveData();
 *          addToast({
 *            title: 'Success',
 *            description: 'Data saved successfully',
 *            variant: 'success'
 *          });
 *        } catch (error) {
 *          addToast({
 *            title: 'Error',
 *            description: error.message,
 *            variant: 'error'
 *          });
 *        }
 *      };
 * 
 *      return <button onClick={handleSubmit}>Save</button>;
 *    }
 */
