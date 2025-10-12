'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    announcementAlerts: boolean;
    gradeAlerts: boolean;
    assignmentReminders: boolean;
    eventReminders: boolean;
}

interface PrivacySettings {
    profileVisibility: 'public' | 'students' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
}

interface SettingsContextType {
    notificationSettings: NotificationSettings;
    privacySettings: PrivacySettings;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultNotificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    announcementAlerts: true,
    gradeAlerts: true,
    assignmentReminders: true,
    eventReminders: true
};

const defaultPrivacySettings: PrivacySettings = {
    profileVisibility: 'students',
    showEmail: false,
    showPhone: false,
    allowMessages: true
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);

    // Load from localStorage
    useEffect(() => {
        const savedNotifications = localStorage.getItem('notificationSettings');
        const savedPrivacy = localStorage.getItem('privacySettings');

        if (savedNotifications) {
            setNotificationSettings(JSON.parse(savedNotifications));
        }
        if (savedPrivacy) {
            setPrivacySettings(JSON.parse(savedPrivacy));
        }
    }, []);

    const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
        const newSettings = { ...notificationSettings, ...settings };
        setNotificationSettings(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    };

    const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
        const newSettings = { ...privacySettings, ...settings };
        setPrivacySettings(newSettings);
        localStorage.setItem('privacySettings', JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{
            notificationSettings,
            privacySettings,
            updateNotificationSettings,
            updatePrivacySettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
