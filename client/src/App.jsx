import { useEffect, useMemo, useState } from 'react';
import { Apple, Search, MapPin, Clock, Leaf, Heart, Plus, X, CheckCircle2, Utensils, Users, Recycle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const categories = ['All food', 'Meals', 'Produce', 'Bakery', 'Dairy', 'Pantry'];

const fallbackFoods = [
  { id:'demo-1', title:'Fresh vegetable harvest box', category:'Produce', quantity:'4 boxes', location:'Banjara Hills, Hyderabad', expires_at: new Date(Date.now()+86400000).toISOString(), description:'Seasonal tomatoes, greens, carrots and beans. Please bring a reusable bag.', donor_name:'Green Patch Community', status:'available' },
  { id:'demo-2', title:'Homemade lunch packs', category:'Meals', quantity:'6 portions', location:'Madhapur, Hyderabad', expires_at: new Date(Date.now()+5*3600000).toISOString(), description:'Freshly prepared vegetarian rice and dal. Contains mustard seeds.', donor_name:'Ananya', status:'available' },
  { id:'demo-3', title:'Bread and buns', category:'Bakery', quantity:'12 pieces', location:'Kukatpally, Hyderabad', expires_at: new Date(Date.now()+18*3600000).toISOString(), description:'Bakery surplus from today. Best consumed soon.', donor_name:'Corner Bakehouse', status:'available' },
  { id:'demo-4', title:'Rice, lentils and pantry staples', category:'Pantry', quantity:'3 grocery bags', location:'Ameerpet, Hyderabad', expires_at: new Date(Date.now()+3*86400000).toISOString(), description:'Unopened packets in date, shared to reduce waste.', donor_name:'Community Pantry', status:'available' },
];

function prettyTime(date) {
  const hours = Math.max(0, Math.round((new Date(date).getTime() - Date.now()) / 3600000));
  return hours < 1 ? 'Expires soon' : hours < 24 ? `${hours}h left` : `${Math.ceil(hours/24)}d left`;
}

export default function App() {
  const [foods, setFoods] = useState(fallbackFoods);
  const [category, setCategory] = useState('All food');
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ title:'', category:'Produce', quantity:'', location:'', expires_at:'', description:'', donor_name:'' });

  async function loadFoods() {
    try {
      const res = await fetch(`${API}/foods`);
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      if (Array.isArray(data) && data.length) setFoods(data);
      else if (Array.isArray(data)) setFoods([]);
    } catch { /* demo content remains available when backend is offline */ }
  }
  useEffect(() => { loadFoods(); }, []);

  const filtered = useMemo(() => foods.filter(f => {
    const matchesCategory = category === 'All food' || f.category === category;
    const haystack = `${f.title} ${f.description || ''} ${f.location || ''} ${f.donor_name || ''}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase()) && f.status !== 'claimed';
  }), [foods, category, query]);

  async function addFood(e) {
    e.preventDefault();
    const payload = { ...form, expires_at: new Date(form.expires_at).toISOString(), status:'available' };
    try {
      const res = await fetch(`${API}/foods`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      if (!res.ok) throw new Error('API unavailable');
      const created = await res.json();
      setFoods(prev => [created, ...prev]);
    } catch {
      setFoods(prev => [{ ...payload, id:`local-${Date.now()}` }, ...prev]);
      setNotice('Added in this browser session. Start the backend to save listings through the API.');
      setTimeout(() => setNotice(''), 5000);
    }
    setForm({ title:'', category:'Produce', quantity:'', location:'', expires_at:'', description:'', donor_name:'' });
    setShowForm(false);
  }

  async function claimFood(food) {
    if (!window.confirm(`Request “${food.title}”? The donor may need to confirm collection details.`)) return;
    try {
      const res = await fetch(`${API}/foods/${food.id}/claim`, { method:'POST' });
      if (!res.ok) throw new Error('API unavailable');
      const updated = await res.json();
      setFoods(prev => prev.map(f => f.id === food.id ? updated : f));
    } catch {
      setFoods(prev => prev.map(f => f.id === food.id ? { ...f, status:'claimed' } : f));
    }
    setNotice('Listing marked as claimed. Please coordinate collection details with the donor.');
    setTimeout(() => setNotice(''), 5000);
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-icon"><Apple size={22}/></span><span>food<span className="brand-light">share</span></span></a>
      <nav><a href="#browse">Browse food</a><a href="#how">How it works</a></nav>
      <button className="button button-dark top-cta" onClick={() => setShowForm(true)}><Plus size={17}/> Share food</button>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Leaf size={15}/> GOOD FOOD DESERVES ANOTHER CHANCE</div>
          <h1>Share more.<br/><em>Waste less.</em></h1>
          <p className="hero-lead">Connect surplus food with people who need it. A little sharing can make a big difference in your neighbourhood.</p>
          <div className="hero-actions"><a className="button button-light" href="#browse">Find food <span>↗</span></a><button className="button button-outline" onClick={() => setShowForm(true)}>Donate surplus</button></div>
          <div className="hero-proof"><div className="avatar-stack"><span>🌱</span><span>🥕</span><span>🍞</span></div><span><strong>Small acts, real impact</strong><br/><small>Join your local food-sharing community</small></span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of fresh food">
          <div className="sun"></div><div className="art-leaf leaf-a"></div><div className="art-leaf leaf-b"></div>
          <div className="food-bowl"><div className="bowl-top"><span className="veggie v1"></span><span className="veggie v2"></span><span className="veggie v3"></span><span className="veggie v4"></span><span className="veggie v5"></span><span className="veggie v6"></span></div><div className="bowl-bottom"></div></div>
          <div className="floating-note note-top"><span>🌿</span><div><b>Good for the planet</b><small>One share at a time</small></div></div>
          <div className="floating-note note-bottom"><span>💚</span><div><b>Community first</b><small>Food is better shared</small></div></div>
        </div>
      </section>

      <section className="impact-strip">
        <div><span className="impact-icon"><Recycle size={20}/></span><p><b>Less food waste</b><small>Keep good food out of landfills</small></p></div>
        <div><span className="impact-icon"><Users size={20}/></span><p><b>Stronger communities</b><small>Help neighbours support neighbours</small></p></div>
        <div><span className="impact-icon"><Heart size={20}/></span><p><b>Every share matters</b><small>Make surplus food useful again</small></p></div>
      </section>

      <section id="browse" className="browse-section">
        <div className="section-heading"><div><div className="eyebrow">FROM YOUR COMMUNITY</div><h2>Food up for sharing</h2><p>Discover what's available near you.</p></div><button className="button button-dark desktop-share" onClick={() => setShowForm(true)}><Plus size={17}/> Add a listing</button></div>
        <div className="toolbar"><div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search food or location..." aria-label="Search food or location"/></div><div className="category-pills">{categories.map(c => <button key={c} className={category===c?'pill active':'pill'} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
        {filtered.length ? <div className="food-grid">{filtered.map((food, i) => <article className="food-card" key={food.id}><div className={`food-visual visual-${i%4}`}><span className="food-emoji">{food.category==='Produce'?'🥬':food.category==='Meals'?'🍲':food.category==='Bakery'?'🥖':food.category==='Dairy'?'🥛':'🛍️'}</span><span className="availability"><span></span> Available</span></div><div className="food-info"><div className="food-meta"><span>{food.category}</span><span className="time"><Clock size={13}/>{prettyTime(food.expires_at)}</span></div><h3>{food.title}</h3><p className="food-desc">{food.description || 'Surplus food shared by a community member.'}</p><div className="food-details"><span><MapPin size={14}/>{food.location}</span><span><Utensils size={14}/>{food.quantity}</span></div><div className="food-footer"><div className="donor"><span className="donor-avatar">{(food.donor_name||'F').slice(0,1).toUpperCase()}</span><span><small>Shared by</small><b>{food.donor_name || 'Community member'}</b></span></div><button className="claim-button" onClick={() => claimFood(food)}>Claim food ↗</button></div></div></article>)}</div> : <div className="empty-state"><span>🥗</span><h3>No listings found</h3><p>Try another search or category, or be the first to share food.</p><button className="button button-dark" onClick={() => setShowForm(true)}>Share food</button></div>}
      </section>

      <section id="how" className="how-section"><div className="eyebrow">SIMPLE AS 1, 2, 3</div><h2>Good things happen when we share.</h2><div className="steps"><div><span className="step-number">01</span><span className="step-icon">📸</span><h3>Post what you have</h3><p>List surplus meals, produce or pantry items with clear collection details.</p></div><div><span className="step-number">02</span><span className="step-icon">🤝</span><h3>Connect locally</h3><p>Neighbours discover available food and request what they can use.</p></div><div><span className="step-number">03</span><span className="step-icon">🌎</span><h3>Make an impact</h3><p>Coordinate a safe pickup and help good food find a happy home.</p></div></div></section>
    </main>
    <footer><a className="brand footer-brand" href="#"><span className="brand-icon"><Apple size={19}/></span><span>food<span className="brand-light">share</span></span></a><span>Good food, shared with care. © {new Date().getFullYear()} FoodShare</span><a href="#browse">Explore listings ↑</a></footer>

    {notice && <div className="toast"><CheckCircle2 size={18}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
    {showForm && <div className="modal-backdrop" onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}><div className="modal"><div className="modal-head"><div><div className="eyebrow">PASS IT FORWARD</div><h2>Share surplus food</h2><p>Tell your community what's available.</p></div><button className="close-button" onClick={() => setShowForm(false)} aria-label="Close"><X/></button></div><form onSubmit={addFood} className="listing-form">
      <label>Food title<input required maxLength="90" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Fresh vegetable box"/></label>
      <div className="form-row"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(c=>c!=='All food').map(c=><option key={c}>{c}</option>)}</select></label><label>Quantity<input required value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="e.g. 3 portions"/></label></div>
      <label>Pickup location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Neighbourhood or landmark"/></label>
      <label>Available until<input required type="datetime-local" min={new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)} value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})}/></label>
      <label>Your name or organisation<input required value={form.donor_name} onChange={e=>setForm({...form,donor_name:e.target.value})} placeholder="Name shown on listing"/></label>
      <label>Details and allergens<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Ingredients, storage, collection notes..."/></label>
      <button className="button button-dark submit-button" type="submit">Publish listing <span>↗</span></button>
    </form></div></div>}
  </div>;
}
