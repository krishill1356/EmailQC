
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autosave: true,
    spamCheck: true,
    dnsCheck: true,
    disposableCheck: true,
    apiKey: '',
    savePrevious: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleToggle = (setting: string) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting as keyof typeof settings],
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate saving
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem('emailQCSettings', JSON.stringify(settings));
      
      setIsSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been saved successfully.',
      });
    }, 1000);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your application preferences and configurations
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure general application settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for validation results
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={() => handleToggle('notifications')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autosave">Auto-save Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save validation results to history
                  </p>
                </div>
                <Switch
                  id="autosave"
                  checked={settings.autosave}
                  onCheckedChange={() => handleToggle('autosave')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="savePrevious">Save Previous Validations</Label>
                  <p className="text-sm text-muted-foreground">
                    Save validation history between sessions
                  </p>
                </div>
                <Switch
                  id="savePrevious"
                  checked={settings.savePrevious}
                  onCheckedChange={() => handleToggle('savePrevious')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Validation Settings</CardTitle>
            <CardDescription>
              Configure which validations to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="spamCheck" 
                  checked={settings.spamCheck}
                  onCheckedChange={() => handleToggle('spamCheck')}
                />
                <div className="space-y-1">
                  <Label htmlFor="spamCheck" className="font-medium">Spam Pattern Check</Label>
                  <p className="text-sm text-muted-foreground">
                    Check for common spam patterns in email addresses
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="dnsCheck" 
                  checked={settings.dnsCheck}
                  onCheckedChange={() => handleToggle('dnsCheck')}
                />
                <div className="space-y-1">
                  <Label htmlFor="dnsCheck" className="font-medium">DNS Check</Label>
                  <p className="text-sm text-muted-foreground">
                    Verify domain existence and DNS records
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="disposableCheck" 
                  checked={settings.disposableCheck}
                  onCheckedChange={() => handleToggle('disposableCheck')}
                />
                <div className="space-y-1">
                  <Label htmlFor="disposableCheck" className="font-medium">Disposable Email Check</Label>
                  <p className="text-sm text-muted-foreground">
                    Detect if email is from a disposable provider
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>
              Configure API access for enhanced validations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleInputChange}
                placeholder="Enter your API key for enhanced validations"
                type="password"
              />
              <p className="text-sm text-muted-foreground">
                For enhanced validation capabilities, enter your API key. 
                Leave blank to use built-in validation methods.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
