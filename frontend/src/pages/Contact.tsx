import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-8">Contact Page</div>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Get in touch with us! This is a sample contact page showcasing
          the nested layout structure with React Router.
        </p>
        <div className="flex gap-4 justify-center">
          <Button>
            <Link to="/">Go to Home</Link>
          </Button>
          <Button variant="outline">
            <Link to="/about">Go to About</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
