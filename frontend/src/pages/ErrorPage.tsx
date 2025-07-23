import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useNavigate, useRouteError } from "react-router-dom";

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return "The page you're looking for doesn't exist.";
    }
    if (error?.message) {
      return error.message;
    }
    if (error?.statusText) {
      return error.statusText;
    }
    return "Something went wrong. Please try again.";
  };

  const getErrorTitle = () => {
    if (error?.status === 404) {
      return "Page Not Found";
    }
    if (error?.status) {
      return `Error ${error.status}`;
    }
    return "Oops! Something went wrong";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <AlertTriangle className="mx-auto h-16 w-16 text-orange-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getErrorTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{getErrorMessage()}</p>
          {error?.status && (
            <p className="mt-1 text-xs text-gray-500">Status: {error.status}</p>
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button onClick={handleGoHome} className="w-full" variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs text-gray-800 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
