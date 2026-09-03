import { useCallback, useEffect, useRef, useState } from 'react';

import { DEFAULT_PROFILES } from '../constants';

export default function useProjectionProfiles(orientation) {
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const profilesRef = useRef(profiles);
  const profileName = orientation.startsWith('landscape')
    ? 'landscape'
    : 'portrait';

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  const changeProfile = useCallback(
    (field, delta) => {
      setProfiles((current) => {
        const profile = current[profileName];
        const isFov = field === 'horizontalFov' || field === 'verticalFov';
        const minimum = isFov ? 30 : -20;
        const maximum = isFov ? 100 : 20;
        const value = Math.max(
          minimum,
          Math.min(maximum, profile[field] + delta)
        );

        return {
          ...current,
          [profileName]: { ...profile, [field]: value },
        };
      });
    },
    [profileName]
  );

  return {
    profileName,
    profile: profiles[profileName],
    profilesRef,
    changeProfile,
  };
}
