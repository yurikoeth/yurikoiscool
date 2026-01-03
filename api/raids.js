import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const adminKey = process.env.RAID_ADMIN_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  // GET - Fetch all raids
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('raids')
        .select(`
          *,
          items:raid_items(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST - Create new raid
  if (req.method === 'POST') {
    const providedKey = req.headers['x-admin-key'];
    if (providedKey !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { date, map, status, notes, items } = req.body;

      // Calculate total value
      const totalValue = items?.reduce((sum, item) =>
        sum + (item.quantity * item.value), 0) || 0;

      // Insert raid
      const { data: raid, error: raidError } = await supabase
        .from('raids')
        .insert({
          date: date || new Date().toISOString(),
          map,
          status,
          notes,
          total_value: totalValue,
        })
        .select()
        .single();

      if (raidError) throw raidError;

      // Insert items if any
      if (items && items.length > 0) {
        const itemsWithRaidId = items.map(item => ({
          raid_id: raid.id,
          item_name: item.item_name,
          quantity: item.quantity || 1,
          value: item.value || 0,
          fir: item.fir !== false,
        }));

        const { error: itemsError } = await supabase
          .from('raid_items')
          .insert(itemsWithRaidId);

        if (itemsError) throw itemsError;
      }

      return res.status(201).json({ success: true, raid });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE - Delete raid
  if (req.method === 'DELETE') {
    const providedKey = req.headers['x-admin-key'];
    if (providedKey !== adminKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Raid ID required' });
      }

      const { error } = await supabase
        .from('raids')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
