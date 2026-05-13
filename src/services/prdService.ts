import { supabase } from '../lib/supabase';
import type { PRDData } from '../types/prd';

export interface PRDRecord {
  id: string;
  user_id: string;
  feature_name: string;
  data: PRDData;
  created_at: string;
  updated_at: string;
}

export async function fetchUserPRDs(): Promise<Pick<PRDRecord, 'id' | 'feature_name' | 'created_at' | 'updated_at'>[]> {
  const { data, error } = await supabase
    .from('prds')
    .select('id, feature_name, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
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

export async function createPRD(prdData: PRDData): Promise<PRDRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('prds')
    .insert({
      user_id: user.id,
      feature_name: prdData.featureName || 'Untitled PRD',
      data: prdData,
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
