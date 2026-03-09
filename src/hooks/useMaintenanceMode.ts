import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      setIsMaintenanceMode(data?.value === "true");
      setIsLoading(false);
    };

    fetch();

    const channel = supabase
      .channel("maintenance-mode")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "key=eq.maintenance_mode" },
        (payload: any) => {
          setIsMaintenanceMode(payload.new?.value === "true");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { isMaintenanceMode, isLoading };
}
