"use client";

import { useEffect, useState } from "react";
import { getUserDataSources } from "@/lib/api/connections";

interface DataSource {
  id: string;
  name: string;
  type: string;
  connected: boolean;
}

interface UseDataSourcesReturn {
  hasDataSources: boolean;
  loading: boolean;
  dataSources: DataSource[];
}

/**
 * Hook to manage data source state
 * Returns real connected data sources from the database
 */
export function useDataSources(): UseDataSourcesReturn {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnections() {
      try {
        setLoading(true);
        const sources = await getUserDataSources();
        const connectedSources = sources.filter((s) =>
          s.connection_status === "connected"
        );

        setDataSources(connectedSources.map((s) => ({
          id: s.id,
          name: s.platform,
          type: s.platform,
          connected: true,
        })));
      } catch (error) {
        console.error("Failed to check data sources:", error);
        setDataSources([]);
      } finally {
        setLoading(false);
      }
    }

    checkConnections();
  }, []);

  return {
    hasDataSources: dataSources.length > 0,
    loading,
    dataSources,
  };
}

export default useDataSources;
