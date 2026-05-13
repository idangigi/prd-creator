import { supabase } from '../lib/supabase';
import type { PRDData } from '../types/prd';

export interface PRDRecord {
  id: string;
  user_id: string;
  feature_name: string;
  data: PRDData;
  forked_from_prd_id: string | null;
  created_at: string;
  updated_at: string;
}

export const DRAFTS_PAGE_SIZE = 20;

export async function fetchUserPRDs(
  search = '',
  page = 0,
): Promise<{ data: Pick<PRDRecord, 'id' | 'feature_name' | 'created_at' | 'updated_at'>[]; hasMore: boolean }> {
  const from = page * DRAFTS_PAGE_SIZE;
  const to = from + DRAFTS_PAGE_SIZE - 1;
  let query = supabase
    .from('prds')
    .select('id, feature_name, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .range(from, to);
  if (search) query = query.ilike('feature_name', `%${search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return { data, hasMore: data.length === DRAFTS_PAGE_SIZE };
}

export async function fetchPRD(id: string): Promise<PRDRecord> {
  const { data, error } = await supabase
    .from('prds')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as PRDRecord;
}

export async function createPRD(prdData: PRDData, forkedFromPrdId?: string): Promise<PRDRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('prds')
    .insert({
      user_id: user.id,
      feature_name: prdData.featureName || 'Untitled PRD',
      data: prdData,
      forked_from_prd_id: forkedFromPrdId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PRDRecord;
}

export async function updatePRD(id: string, prdData: PRDData): Promise<void> {
  const { error } = await supabase
    .from('prds')
    .update({
      feature_name: prdData.featureName || 'Untitled PRD',
      data: prdData,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deletePRD(id: string): Promise<void> {
  const { error } = await supabase.from('prds').delete().eq('id', id);
  if (error) throw error;
}
