import { supabase, isSupabaseConfigured } from './supabase';

// Mock data for development/demo
const mockRaids = [
  {
    id: '1',
    date: new Date().toISOString(),
    map: 'Volta',
    status: 'survived',
    notes: 'Great run, found rare loot',
    total_value: 45000,
    items: [
      { id: '1', item_name: 'Titanium Ore', quantity: 5, value: 2000, fir: true },
      { id: '2', item_name: 'Advanced Circuit', quantity: 2, value: 8000, fir: true },
      { id: '3', item_name: 'Weapon Parts', quantity: 10, value: 1900, fir: true },
    ]
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    map: 'Karst',
    status: 'kia',
    notes: 'Ambushed by ARC',
    total_value: 0,
    items: []
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000).toISOString(),
    map: 'Volta',
    status: 'extract',
    notes: 'Quick extract with valuables',
    total_value: 28500,
    items: [
      { id: '4', item_name: 'Rare Component', quantity: 1, value: 15000, fir: true },
      { id: '5', item_name: 'Scrap Metal', quantity: 27, value: 500, fir: true },
    ]
  }
];

export async function fetchRaids() {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using mock data');
    return { data: mockRaids, error: null, isDemo: true };
  }

  try {
    // Fetch raids with their items
    const { data: raids, error } = await supabase
      .from('raids')
      .select(`
        *,
        items:raid_items(*)
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    return { data: raids, error: null, isDemo: false };
  } catch (error) {
    console.error('Error fetching raids:', error);
    return { data: mockRaids, error, isDemo: true };
  }
}

export async function createRaid(raidData) {
  const response = await fetch('/api/raids', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(raidData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create raid');
  }

  return response.json();
}

export async function deleteRaid(raidId, adminKey) {
  const response = await fetch(`/api/raids?id=${raidId}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': adminKey,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete raid');
  }

  return response.json();
}

export async function parseScreenshot(imageBase64) {
  const response = await fetch('/api/raids/parse-screenshot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to parse screenshot');
  }

  return response.json();
}

// Calculate stats from raids
export function calculateStats(raids) {
  if (!raids || raids.length === 0) {
    return {
      totalRaids: 0,
      survivalRate: 0,
      totalValue: 0,
      avgValuePerRaid: 0,
    };
  }

  const survived = raids.filter(r => r.status === 'survived').length;
  const extracted = raids.filter(r => r.status === 'extract').length;
  const totalValue = raids.reduce((sum, r) => sum + (r.total_value || 0), 0);

  return {
    totalRaids: raids.length,
    survivalRate: Math.round(((survived + extracted) / raids.length) * 100),
    totalValue,
    avgValuePerRaid: Math.round(totalValue / raids.length),
  };
}
