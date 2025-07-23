import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-600" />
      <p className="mt-2 text-sm text-gray-600">Loading...</p>
    </div>
  );
}
