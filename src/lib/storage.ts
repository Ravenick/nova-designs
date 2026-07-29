import { supabase } from "@/integrations/supabase/client";

export const PLAN_FILES_BUCKET = "plan-files";

/**
 * Recursively list every file under a storage folder prefix.
 * Returns full object paths.
 */
export async function listFolderFiles(prefix: string): Promise<string[]> {
  const clean = prefix.replace(/\/+$/, "");
  const out: string[] = [];
  const queue: string[] = [clean];

  while (queue.length) {
    const dir = queue.shift()!;
    const { data, error } = await supabase.storage
      .from(PLAN_FILES_BUCKET)
      .list(dir, { limit: 1000, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    for (const entry of data ?? []) {
      const full = `${dir}/${entry.name}`;
      // Folders come back without metadata/id
      if (entry.id === null || entry.metadata === null) queue.push(full);
      else out.push(full);
    }
  }
  return out;
}
