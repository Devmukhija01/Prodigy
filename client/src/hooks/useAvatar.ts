import { useState, useEffect } from 'react';

export const useAvatar = (initialAvatarUrl?: string) => {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialAvatarUrl);

  // Update avatarUrl when initialAvatarUrl changes
  useEffect(() => {
    setAvatarUrl(initialAvatarUrl);
  }, [initialAvatarUrl]);

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail.avatarUrl);
    };

    // Listen for avatar updates from anywhere in the app
    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  return avatarUrl;
}; 