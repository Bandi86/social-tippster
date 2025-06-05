/**
 * Comprehensive auth state reset utility
 * This function completely clears all possible auth-related data from the browser
 */

export const completeAuthReset = () => {
  if (typeof window === 'undefined') return;

  console.log('🔄 Starting complete auth reset...');

  // 1. Clear localStorage
  try {
    const localStorageKeys = Object.keys(localStorage);
    console.log('📦 LocalStorage keys before clearing:', localStorageKeys);

    localStorageKeys.forEach(key => {
      if (
        key.includes('auth') ||
        key.includes('token') ||
        key.includes('user') ||
        key.includes('session') ||
        key === 'auth-storage' ||
        key === 'authToken' ||
        key === 'accessToken'
      ) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }

  // 2. Clear sessionStorage
  try {
    const sessionStorageKeys = Object.keys(sessionStorage);
    console.log('📦 SessionStorage keys before clearing:', sessionStorageKeys);

    sessionStorageKeys.forEach(key => {
      if (
        key.includes('auth') ||
        key.includes('token') ||
        key.includes('user') ||
        key.includes('session') ||
        key === 'auth-storage' ||
        key === 'authToken' ||
        key === 'accessToken'
      ) {
        sessionStorage.removeItem(key);
        console.log(`🗑️ Removed sessionStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.error('❌ Error clearing sessionStorage:', error);
  }

  // 3. Clear cookies
  try {
    console.log('🍪 Current cookies:', document.cookie);

    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      if (
        name.includes('auth') ||
        name.includes('token') ||
        name.includes('session') ||
        name.includes('user') ||
        name.includes('refresh')
      ) {
        // Clear for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Clear for parent domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Clear for wildcard domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        console.log(`🗑️ Removed cookie: ${name}`);
      }
    });
  } catch (error) {
    console.error('❌ Error clearing cookies:', error);
  }

  // 4. Clear IndexedDB (if any auth data is stored there)
  try {
    if ('indexedDB' in window) {
      // This is a more complex operation, but we'll attempt basic cleanup
      indexedDB
        .databases?.()
        .then(databases => {
          databases.forEach(db => {
            if (
              db.name?.includes('auth') ||
              db.name?.includes('user') ||
              db.name?.includes('token')
            ) {
              indexedDB.deleteDatabase(db.name);
              console.log(`🗑️ Removed IndexedDB: ${db.name}`);
            }
          });
        })
        .catch(error => {
          console.warn('⚠️ Could not clear IndexedDB:', error);
        });
    }
  } catch (error) {
    console.error('❌ Error clearing IndexedDB:', error);
  }

  // 5. Clear any browser cache (this is limited from JS)
  try {
    if ('caches' in window) {
      caches
        .keys()
        .then(names => {
          names.forEach(name => {
            if (name.includes('auth') || name.includes('user') || name.includes('api')) {
              caches.delete(name);
              console.log(`🗑️ Removed cache: ${name}`);
            }
          });
        })
        .catch(error => {
          console.warn('⚠️ Could not clear caches:', error);
        });
    }
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }

  console.log('✅ Complete auth reset finished');

  // Return a summary
  return {
    cleared: [
      'localStorage auth keys',
      'sessionStorage auth keys',
      'auth-related cookies',
      'IndexedDB auth databases',
      'browser caches',
    ],
    timestamp: new Date().toISOString(),
  };
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).completeAuthReset = completeAuthReset;
}
