import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = hasSupabase
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

let demoFoods = [
  { id:'demo-1', title:'Fresh vegetable harvest box', category:'Produce', quantity:'4 boxes', location:'Banjara Hills, Hyderabad', expires_at:new Date(Date.now()+86400000).toISOString(), description:'Seasonal tomatoes, greens, carrots and beans. Please bring a reusable bag.', donor_name:'Green Patch Community', status:'available' },
  { id:'demo-2', title:'Homemade lunch packs', category:'Meals', quantity:'6 portions', location:'Madhapur, Hyderabad', expires_at:new Date(Date.now()+5*3600000).toISOString(), description:'Freshly prepared vegetarian rice and dal. Contains mustard seeds.', donor_name:'Ananya', status:'available' },
  { id:'demo-3', title:'Bread and buns', category:'Bakery', quantity:'12 pieces', location:'Kukatpally, Hyderabad', expires_at:new Date(Date.now()+18*3600000).toISOString(), description:'Bakery surplus from today. Best consumed soon.', donor_name:'Corner Bakehouse', status:'available' },
  { id:'demo-4', title:'Rice, lentils and pantry staples', category:'Pantry', quantity:'3 grocery bags', location:'Ameerpet, Hyderabad', expires_at:new Date(Date.now()+3*86400000).toISOString(), description:'Unopened packets in date, shared to reduce waste.', donor_name:'Community Pantry', status:'available' }
];

app.get('/api/health', (_req, res) => res.json({ ok:true, storage:hasSupabase?'supabase':'demo' }));

app.get('/api/foods', async (req, res) => {
  const { q = '', category = '' } = req.query;
  try {
    let foods;
    if (supabase) {
      let query = supabase.from('food_listings').select('*').order('created_at', { ascending:false });
      if (category && category !== 'All food') query = query.eq('category', category);
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      foods = data || [];
    } else {
      foods = demoFoods.filter(f => {
        const matchesCategory = !category || category === 'All food' || f.category === category;
        const haystack = `${f.title} ${f.description || ''} ${f.location || ''} ${f.donor_name || ''}`.toLowerCase();
        return matchesCategory && haystack.includes(String(q).toLowerCase());
      });
    }
    res.json(foods);
  } catch (error) {
    console.error('GET /api/foods:', error.message);
    res.status(500).json({ error:'Could not load food listings.' });
  }
});

app.post('/api/foods', async (req, res) => {
  const { title, category, quantity, location, expires_at, description = '', donor_name } = req.body || {};
  if (![title, category, quantity, location, expires_at, donor_name].every(v => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error:'title, category, quantity, location, expires_at, and donor_name are required.' });
  }
  const listing = { title:title.trim(), category, quantity:quantity.trim(), location:location.trim(), expires_at, description:String(description).trim(), donor_name:donor_name.trim(), status:'available' };
  try {
    if (supabase) {
      const { data, error } = await supabase.from('food_listings').insert(listing).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    const created = { ...listing, id:randomUUID(), created_at:new Date().toISOString() };
    demoFoods.unshift(created);
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /api/foods:', error.message);
    res.status(500).json({ error:'Could not create listing.' });
  }
});

app.post('/api/foods/:id/claim', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('food_listings').update({ status:'claimed' }).eq('id', req.params.id).eq('status','available').select().maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error:'Listing was not found or is already claimed.' });
      return res.json(data);
    }
    const index = demoFoods.findIndex(f => String(f.id) === req.params.id);
    if (index < 0) return res.status(404).json({ error:'Listing not found.' });
    demoFoods[index] = { ...demoFoods[index], status:'claimed' };
    res.json(demoFoods[index]);
  } catch (error) {
    console.error('POST /api/foods/:id/claim:', error.message);
    res.status(500).json({ error:'Could not claim listing.' });
  }
});

app.listen(PORT, () => {
  console.log(`FoodShare API listening on http://localhost:${PORT}`);
  console.log(`Storage mode: ${hasSupabase ? 'Supabase' : 'in-memory demo'}`);
});
