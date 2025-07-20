import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, MapPin, Edit } from "lucide-react";

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white -mt-10">
                <AvatarFallback className="bg-gray-600 text-white text-xl font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-gray-900">John Doe</h2>
                <p className="text-gray-600">Software Developer</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Details */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">John Doe</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">john.doe@example.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-gray-900 font-medium">January 15, 2024</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900 font-medium">San Francisco, CA</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Subscription Plan</h4>
                <p className="text-sm text-gray-600">Pro Plan</p>
                <p className="text-xs text-gray-500 mt-1">Renews on March 15, 2025</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                Passionate software developer with 5+ years of experience building web applications. 
                I love creating user-friendly interfaces and solving complex problems. When I'm not coding, 
                you can find me hiking, reading tech blogs, or experimenting with new technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
