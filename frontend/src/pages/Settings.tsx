import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Eye,
  Lock,
  Download
} from "lucide-react";

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500">Update your name, email, and profile details</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
              </div>
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Login Activity</h3>
                <p className="text-sm text-gray-500">See where you're logged in and manage your sessions</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Data Privacy</h3>
                <p className="text-sm text-gray-500">Control how your data is used and shared</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive updates and alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications on your devices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Marketing Communications</h3>
                <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Theme</h3>
                <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-gray-400" />
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">Language</h3>
                <p className="text-sm text-gray-500">Select your preferred language</p>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Mobile App</h3>
                <p className="text-sm text-gray-500">Download our mobile app for better experience</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Save Changes */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
