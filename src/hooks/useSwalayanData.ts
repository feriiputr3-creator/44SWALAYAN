/// <reference types="vite/client" />
import { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceData, Product, MutationLog } from '../types';
import { fetchFromGithub, pushToGithub } from '../lib/githubSync';

const LOCAL_STORAGE_KEY = '44swalayan_data';

const defaultData: WorkspaceData = {
  products: [],
  mutationLogs: []
};

export function useSwalayanData() {
  const [data, setData] = useState<WorkspaceData>(defaultData);
  const [isLoadedFromCloud, setIsLoadedFromCloud] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const token = import.meta.env.VITE_GITHUB_TOKEN || '';
  const shaRef = useRef<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const isFirstLoad = useRef(true);

  // Initial Load (Local then Cloud)
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. Load from local storage immediately for fast UX
      const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localStr) {
        try {
          const parsed = JSON.parse(localStr);
          setData({
            products: Array.isArray(parsed.products) ? parsed.products : [],
            mutationLogs: Array.isArray(parsed.mutationLogs) ? parsed.mutationLogs : []
          });
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }
      }

      // 2. Pull from GitHub if token exists
      if (token) {
        setIsSyncing(true);
        setSyncError(null);
        try {
          const { data: cloudData, sha } = await fetchFromGithub(token);
          if (cloudData) {
            const validData = {
              products: Array.isArray(cloudData.products) ? cloudData.products : [],
              mutationLogs: Array.isArray(cloudData.mutationLogs) ? cloudData.mutationLogs : []
            };
            setData(validData);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validData));
          }
          shaRef.current = sha;
          setIsLoadedFromCloud(true);
          setLastSyncTime(new Date());
        } catch (err: any) {
          console.error("Cloud fetch failed:", err);
          setSyncError(err.message || 'Failed to connect to GitHub');
          setIsLoadedFromCloud(true); // Proceed with local data
        } finally {
          setIsSyncing(false);
        }
      } else {
        setIsLoadedFromCloud(true); // No token, just use local
      }
    };

    loadInitialData();
  }, [token]);

  // Auto-Push logic with Debounce
  const scheduleSync = useCallback((newData: WorkspaceData) => {
    if (!token) return;
    
    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }
    
    setIsSyncing(true);
    setSyncError(null);
    
    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        const newSha = await pushToGithub(token, newData, shaRef.current);
        shaRef.current = newSha;
        setLastSyncTime(new Date());
        setSyncError(null);
      } catch (err: any) {
        console.error("Push to GitHub failed:", err);
        setSyncError(err.message || "Sync Failed");
      } finally {
        setIsSyncing(false);
      }
    }, 2000); // 2 seconds debounce
  }, [token]);

  // Data Modifiers
  const updateData = useCallback((updater: (prev: WorkspaceData) => WorkspaceData) => {
    setData((prev) => {
      const next = updater(prev);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      
      // Only push if we have successfully loaded once from cloud (or if no token)
      if (isLoadedFromCloud) {
        scheduleSync(next);
      }
      
      return next;
    });
  }, [isLoadedFromCloud, scheduleSync]);

  return {
    data,
    updateData,
    isLoadedFromCloud,
    isSyncing,
    syncError,
    lastSyncTime
  };
}
