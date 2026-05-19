import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

let client: ReturnType<typeof createBrowserClient> | undefined;

function getSupabaseBrowserClient() {
    if (client) {
        return client;
    }

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return client;
}
    
function createSupabaseBrowser() {
    return getSupabaseBrowserClient();
}

export default createSupabaseBrowser;
