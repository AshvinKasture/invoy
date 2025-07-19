import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-8">Welcome to Home Page</div>
        <div className="flex gap-4 justify-center">
          <Button>
            <Link to="/about">Go to About</Link>
          </Button>
          <Button variant="outline">
            <Link to="/contact">Go to Contact</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
