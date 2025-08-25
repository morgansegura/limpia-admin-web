"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  Key, 
  Mail, 
  Smartphone, 
  Clock,
  Save,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const { user, tenant } = useAuth();
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    jobUpdates: true,
    customerUpdates: true,
    
    // Appearance Settings
    darkMode: false,
    compactView: false,
    
    // Regional Settings
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    currency: "USD",
    language: "en",
    
    // Privacy Settings
    profileVisibility: "team",
    activityStatus: true,
    dataSharing: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement settings save API call
    console.log("Saving settings:", settings);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you want to be notified about updates and activities
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Job Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about job status changes
                  </p>
                </div>
                <Switch
                  checked={settings.jobUpdates}
                  onCheckedChange={(checked) => handleSettingChange('jobUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Customer Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about customer interactions
                  </p>
                </div>
                <Switch
                  checked={settings.customerUpdates}
                  onCheckedChange={(checked) => handleSettingChange('customerUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional content and updates
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize how the application looks and feels
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Show more content in less space
                </p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Regional Settings</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure regional preferences for dates, time, and currency
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => handleSettingChange('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value) => handleSettingChange('timeFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your privacy settings and security preferences
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're active to team members
                </p>
              </div>
              <Switch
                checked={settings.activityStatus}
                onCheckedChange={(checked) => handleSettingChange('activityStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymous usage data collection
                </p>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) => handleSettingChange('dataSharing', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value) => handleSettingChange('profileVisibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Security Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        {tenant && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your account details and organization information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                  <p className="text-sm">{tenant.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono">{user?.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p className="text-sm">{user?.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}