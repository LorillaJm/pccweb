export interface NotificationSound {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: 'default',
    name: 'Default',
    url: '/sounds/notification-default.mp3',
    description: 'Standard notification sound'
  },
  {
    id: 'urgent',
    name: 'Urgent',
    url: '/sounds/notification-urgent.mp3',
    description: 'High priority alert sound'
  },
  {
    id: 'gentle',
    name: 'Gentle',
    url: '/sounds/notification-gentle.mp3',
    description: 'Soft notification chime'
  },
  {
    id: 'announcement',
    name: 'Announcement',
    url: '/sounds/notification-announcement.mp3',
    description: 'Official announcement tone'
  }
];

export class NotificationSoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  constructor() {
    this.loadUserPreferences();
    this.preloadSounds();
  }

  // Load user preferences from localStorage
  private loadUserPreferences(): void {
    try {
      const preferences = localStorage.getItem('notificationSoundPreferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        this.isEnabled = parsed.enabled ?? true;
        this.volume = parsed.volume ?? 0.7;
      }
    } catch (error) {
      console.error('Error loading sound preferences:', error);
    }
  }

  // Save user preferences to localStorage
  private saveUserPreferences(): void {
    try {
      const preferences = {
        enabled: this.isEnabled,
        volume: this.volume
      };
      localStorage.setItem('notificationSoundPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving sound preferences:', error);
    }
  }

  // Preload all notification sounds
  private preloadSounds(): void {
    NOTIFICATION_SOUNDS.forEach(sound => {
      try {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.audioCache.set(sound.id, audio);
      } catch (error) {
        console.error(`Error preloading sound ${sound.id}:`, error);
      }
    });
  }

  // Play notification sound
  async playSound(soundId: string = 'default', options: { 
    volume?: number; 
    loop?: boolean; 
    priority?: 'low' | 'normal' | 'high' | 'urgent' 
  } = {}): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      // Check if user has interacted with the page (required for autoplay)
      if (!this.hasUserInteracted()) {
        console.warn('Cannot play notification sound: User has not interacted with the page');
        return;
      }

      let audio = this.audioCache.get(soundId);
      
      if (!audio) {
        // Fallback to default sound if requested sound not found
        audio = this.audioCache.get('default');
        if (!audio) {
          console.error('No notification sounds available');
          return;
        }
      }

      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Set volume
      const volume = options.volume ?? this.volume;
      audio.volume = Math.max(0, Math.min(1, volume));
      
      // Set loop
      audio.loop = options.loop ?? false;

      // Play with priority handling
      if (options.priority === 'urgent') {
        // For urgent notifications, try to interrupt other sounds
        this.stopAllSounds();
        audio.volume = Math.min(1, volume * 1.2); // Slightly louder for urgent
      }

      await audio.play();
      
      // Auto-stop looped sounds after a reasonable time
      if (audio.loop) {
        setTimeout(() => {
          audio.pause();
          audio.loop = false;
        }, 10000); // Stop after 10 seconds
      }

    } catch (error) {
      console.error('Error playing notification sound:', error);
      
      // Try fallback sound if the requested one fails
      if (soundId !== 'default') {
        this.playSound('default', { ...options, priority: 'normal' });
      }
    }
  }

  // Stop all currently playing sounds
  stopAllSounds(): void {
    this.audioCache.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.loop = false;
    });
  }

  // Check if user has interacted with the page
  private hasUserInteracted(): boolean {
    // Modern browsers require user interaction before playing audio
    // We'll track this with a simple flag
    return (window as any).__userHasInteracted ?? false;
  }

  // Enable/disable notification sounds
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveUserPreferences();
    
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  // Set volume for all notification sounds
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
    this.saveUserPreferences();
  }

  // Get current settings
  getSettings(): { enabled: boolean; volume: number } {
    return {
      enabled: this.isEnabled,
      volume: this.volume
    };
  }

  // Test a notification sound
  async testSound(soundId: string): Promise<void> {
    await this.playSound(soundId, { volume: this.volume });
  }

  // Play sound based on notification type and priority
  async playNotificationSound(notification: {
    type?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    soundType?: string;
    customSoundUrl?: string;
  }): Promise<void> {
    let soundId = 'default';
    
    // Determine sound based on notification properties
    if (notification.customSoundUrl) {
      // Handle custom sound URL
      try {
        const customAudio = new Audio(notification.customSoundUrl);
        customAudio.volume = this.volume;
        await customAudio.play();
        return;
      } catch (error) {
        console.error('Error playing custom sound, falling back to default:', error);
      }
    }
    
    if (notification.soundType) {
      soundId = notification.soundType;
    } else if (notification.priority) {
      // Map priority to sound
      switch (notification.priority) {
        case 'urgent':
          soundId = 'urgent';
          break;
        case 'high':
          soundId = 'announcement';
          break;
        case 'low':
          soundId = 'gentle';
          break;
        default:
          soundId = 'default';
      }
    }

    await this.playSound(soundId, {
      priority: notification.priority,
      loop: notification.priority === 'urgent'
    });
  }
}

// Initialize user interaction tracking
if (typeof window !== 'undefined') {
  const trackUserInteraction = () => {
    (window as any).__userHasInteracted = true;
    // Remove listeners after first interaction
    document.removeEventListener('click', trackUserInteraction);
    document.removeEventListener('keydown', trackUserInteraction);
    document.removeEventListener('touchstart', trackUserInteraction);
  };

  document.addEventListener('click', trackUserInteraction);
  document.addEventListener('keydown', trackUserInteraction);
  document.addEventListener('touchstart', trackUserInteraction);
}

// Create singleton instance
export const notificationSoundManager = new NotificationSoundManager();