import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type UseLocalStorageReturn<T> = [T, Dispatch<SetStateAction<T>>];

function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
    // Get from localStorage then fallback to initialValue
    const readValue = (): T => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Update localStorage when state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch {
            // Ignore write errors
        }
    }, [key, storedValue]);

    // Listen for storage changes (cross-tab sync)
    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === key) {
                setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [key, initialValue]);

    return [storedValue, setStoredValue];
}

export default useLocalStorage;