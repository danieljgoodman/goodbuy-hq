'use client'

import { useState } from 'react'
import { Settings, Bell, Moon, Sun, Globe, Shield, User } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface SettingsSheetProps {
  trigger?: React.ReactNode
}

export function SettingsSheet({ trigger }: SettingsSheetProps) {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
  })

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    // Here you would typically save to API
    console.log('Saving settings:', settings)
    // Show success toast
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" aria-label="Open settings">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Manage your account preferences and application settings.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-secondary-900 flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Appearance
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="theme-select" className="text-sm">
                  Theme
                </Label>
                <Select
                  value={settings.theme}
                  onValueChange={value => updateSetting('theme', value)}
                >
                  <SelectTrigger id="theme-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language-select" className="text-sm">
                  Language
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={value => updateSetting('language', value)}
                >
                  <SelectTrigger id="language-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        English
                      </div>
                    </SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-secondary-900 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-sm">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-secondary-500">
                    Receive email updates about your account activity
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={checked =>
                    updateSetting('emailNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="text-sm">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-secondary-500">
                    Get notified about important updates
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={checked =>
                    updateSetting('pushNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails" className="text-sm">
                    Marketing Emails
                  </Label>
                  <p className="text-xs text-secondary-500">
                    Receive newsletters and promotional content
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={settings.marketingEmails}
                  onCheckedChange={checked =>
                    updateSetting('marketingEmails', checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Security Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-secondary-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor-auth" className="text-sm">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-xs text-secondary-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="two-factor-auth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={checked =>
                    updateSetting('twoFactorAuth', checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-secondary-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-col space-y-2">
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
