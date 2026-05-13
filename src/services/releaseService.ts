import { supabase } from '../lib/supabase';
import type { PRDData } from '../types/prd';

export interface ReleaseRecord {
  id: string;
  prd_id: string;
  version_number: number;
  release_notes: string | null;
  snapshot: PRDData;
  feature_name: string;
  created_by: string;
  created_at: string;
}

export async function createRelease(
  draftId: string,
  forkedFromPrdId: string | null,
  data: PRDData,
  releaseNotes: string,
): Promise<ReleaseRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Use the original series ID — forks stay in the same release lineage
  const seriesId = forkedFromPrdId ?? draftId;

  const { count } = await supabase
    .from('releases')
    .select('*', { count: 'exact', head: true })
    .eq('prd_id', seriesId);

  const versionNumber = (count ?? 0) + 1;

  const { data: record, error } = await supabase
    .from('releases')
    .insert({
      prd_id: seriesId,
      version_number: versionNumber,
      release_notes: releaseNotes || null,
      snapshot: data,
      feature_name: data.featureName || 'Untitled PRD',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Draft is no longer needed — delete it after a successful release
  await supabase.from('prds').delete().eq('id', draftId);

  return record as ReleaseRecord;
}

export async function fetchAllReleases(search = ''): Promise<ReleaseRecord[]> {
  let query = supabase
    .from('releases')
    .select('id, prd_id, version_number, release_notes, feature_name, created_by, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (search) query = query.ilike('feature_name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data as ReleaseRecord[];
}

export async function fetchRelease(id: string): Promise<ReleaseRecord> {
  const { data, error } = await supabase
    .from('releases')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ReleaseRecord;
}

export async function fetchPRDReleases(prdId: string): Promise<ReleaseRecord[]> {
  const { data, error } = await supabase
    .from('releases')
    .select('id, prd_id, version_number, release_notes, feature_name, created_by, created_at')
    .eq('prd_id', prdId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data as ReleaseRecord[];
}
