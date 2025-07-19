import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-8">About Page</div>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Learn more about our application and what we do. This is a sample about page
          demonstrating the React Router setup with nested layouts.
        </p>
        <Button>
          <Link to="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
