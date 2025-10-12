'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettings } from '@/contexts/SettingsContext';
import { PortalLayout } from '@/components/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function StudentSettingsPage() {
    const { user } = useAuth();
    const { theme, fontSize, language, setTheme, setFontSize, setLanguage } = useTheme();
    const { notificationSettings, privacySettings, updateNotificationSettings, updatePrivacySettings } = useSettings();
    
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Account Settings
    const [accountSettings, setAccountSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async () => {
        if (accountSettings.newPassword !== accountSettings.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/student/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: accountSettings.currentPassword,
                    newPassword: accountSettings.newPassword
                }),
                credentials: 'include'
            });
            if (response.ok) {
                setSuccess('Password changed successfully!');
                setAccountSettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError('Failed to change password');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // Save to backend (optional)
            const response = await fetch('/api/student/notification-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationSettings),
                credentials: 'include'
            });
            
            setSuccess('Notification settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            // Even if backend fails, settings are saved locally
            setSuccess('Notification settings saved locally!');
            setTimeout(() => setSuccess(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacySave = () => {
        setSuccess('Privacy settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleAppearanceSave = () => {
        setSuccess('Appearance settings applied successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const tabs = [
        { id: 'account', label: 'Account Security', icon: '🔐' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'privacy', label: 'Privacy', icon: '🔒' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' }
    ];

    return (
        <PortalLayout title="Settings">
            <div className="space-y-6">
                {/* Success/Error Messages */}
                {success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {success}
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center animate-in fade-in slide-in-from-top-2 duration-300">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-xl border-slate-200 sticky top-6">
                            <CardContent className="p-4">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                                                activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="text-2xl mr-3">{tab.icon}</span>
                                            <span className="font-semibold">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Account Security Tab */}
                        {activeTab === 'account' && (
                            <>
                                <Card className="shadow-xl border-slate-200">
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                                        <CardTitle className="flex items-center text-slate-900">
                                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Change Password
                                        </CardTitle>
                                        <CardDescription>Update your password to keep your account secure</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword" className="text-slate-700 font-semibold">Current Password</Label>
                                            <Input
                                                id="currentPassword"
                                                type="password"
                                                value={accountSettings.currentPassword}
                                                onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-slate-700 font-semibold">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                value={accountSettings.newPassword}
                                                onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={accountSettings.confirmPassword}
                                                onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                                                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <Button
                                            onClick={handlePasswordChange}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                        >
                                            {loading ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-xl border-slate-200">
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50">
                                        <CardTitle className="flex items-center text-slate-900">
                                            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Two-Factor Authentication
                                        </CardTitle>
                                        <CardDescription>Add an extra layer of security to your account</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                                                <p className="text-sm text-slate-600">Currently disabled</p>
                                            </div>
                                            <Button variant="outline" className="border-slate-300">
                                                Enable 2FA
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <Card className="shadow-xl border-slate-200">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
                                    <CardTitle className="flex items-center text-slate-900">
                                        <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Manage how you receive notifications</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-slate-900">General Notifications</h3>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive browser push notifications' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                                            onChange={(e) => updateNotificationSettings({ [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-slate-900">Academic Alerts</h3>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'announcementAlerts', label: 'Announcement Alerts', desc: 'Get notified about new announcements' },
                                                { key: 'gradeAlerts', label: 'Grade Alerts', desc: 'Receive alerts when grades are posted' },
                                                { key: 'assignmentReminders', label: 'Assignment Reminders', desc: 'Reminders for upcoming assignments' },
                                                { key: 'eventReminders', label: 'Event Reminders', desc: 'Notifications about campus events' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                                            onChange={(e) => updateNotificationSettings({ [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleNotificationSave}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
                                    >
                                        {loading ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <Card className="shadow-xl border-slate-200">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50">
                                    <CardTitle className="flex items-center text-slate-900">
                                        <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Privacy Settings
                                    </CardTitle>
                                    <CardDescription>Control who can see your information</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Profile Visibility</Label>
                                            <select
                                                value={privacySettings.profileVisibility}
                                                onChange={(e) => updatePrivacySettings({ profileVisibility: e.target.value as any })}
                                                className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="public">Public - Everyone can see</option>
                                                <option value="students">Students Only</option>
                                                <option value="private">Private - Only me</option>
                                            </select>
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Contact Information</h3>
                                            {[
                                                { key: 'showEmail', label: 'Show Email Address', desc: 'Allow others to see your email' },
                                                { key: 'showPhone', label: 'Show Phone Number', desc: 'Allow others to see your phone' },
                                                { key: 'allowMessages', label: 'Allow Messages', desc: 'Let other students message you' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings[item.key as keyof typeof privacySettings] as boolean}
                                                            onChange={(e) => updatePrivacySettings({ [item.key]: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handlePrivacySave}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                                    >
                                        Save Privacy Settings
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <Card className="shadow-xl border-slate-200">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-pink-50">
                                    <CardTitle className="flex items-center text-slate-900">
                                        <svg className="w-6 h-6 mr-2 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                        </svg>
                                        Appearance & Display
                                    </CardTitle>
                                    <CardDescription>Customize how the portal looks</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Theme</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { value: 'light', label: 'Light', icon: '☀️' },
                                                    { value: 'dark', label: 'Dark', icon: '🌙' },
                                                    { value: 'auto', label: 'Auto', icon: '🔄' }
                                                ].map((themeOption) => (
                                                    <button
                                                        key={themeOption.value}
                                                        onClick={() => {
                                                            setTheme(themeOption.value as any);
                                                            handleAppearanceSave();
                                                        }}
                                                        className={`p-4 rounded-xl border-2 transition-all ${
                                                            theme === themeOption.value
                                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    >
                                                        <div className="text-3xl mb-2">{themeOption.icon}</div>
                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{themeOption.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Language</Label>
                                            <select
                                                value={language}
                                                onChange={(e) => {
                                                    setLanguage(e.target.value);
                                                    handleAppearanceSave();
                                                }}
                                                className="w-full p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">Font Size</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { value: 'small', label: 'Small', size: 'text-sm' },
                                                    { value: 'medium', label: 'Medium', size: 'text-base' },
                                                    { value: 'large', label: 'Large', size: 'text-lg' }
                                                ].map((sizeOption) => (
                                                    <button
                                                        key={sizeOption.value}
                                                        onClick={() => {
                                                            setFontSize(sizeOption.value as any);
                                                            handleAppearanceSave();
                                                        }}
                                                        className={`p-4 rounded-xl border-2 transition-all ${
                                                            fontSize === sizeOption.value
                                                                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    >
                                                        <div className={`font-semibold text-slate-900 dark:text-slate-100 ${sizeOption.size}`}>Aa</div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{sizeOption.label}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            💡 <strong>Tip:</strong> Changes are applied instantly! Your preferences are saved automatically.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
