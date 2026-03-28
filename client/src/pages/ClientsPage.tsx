import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useI18n } from '../i18n';
import { clientService } from '../services/clientService';
import { Client } from '../types';

export default function ClientsPage() {
  const { t } = useI18n();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', address: '', postcode: '', city: '', country: 'Nederland', kvk_number: '', btw_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => { setLoading(true); clientService.getAll().then(setClients).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const filtered = clients.filter(c => c.company_name.toLowerCase().includes(search.toLowerCase()) || c.contact_name.toLowerCase().includes(search.toLowerCase()));
  const openNew = () => { setEditing(null); setForm({ company_name:'',contact_name:'',email:'',address:'',postcode:'',city:'',country:'Nederland',kvk_number:'',btw_number:'' }); setError(''); setShowForm(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ company_name:c.company_name,contact_name:c.contact_name,email:c.email,address:c.address,postcode:c.postcode,city:c.city,country:c.country,kvk_number:c.kvk_number,btw_number:c.btw_number }); setError(''); setShowForm(true); };
  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!form.company_name.trim()){setError('Required');return;} setSaving(true);setError(''); try{if(editing)await clientService.update(editing.id,form);else await clientService.create(form);setShowForm(false);load();}catch(err:any){setError(err.response?.data?.error||'Failed');}finally{setSaving(false);} };
  const handleDelete = async (id: number) => { if(!confirm(t('clients.deleteConfirm')))return; try{await clientService.remove(id);load();}catch{alert('Failed');} };
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [f]: e.target.value }));

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">{t('clients.title')}</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> {t('clients.add')}</button>
      </div>
      <div className="relative max-w-sm"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('clients.search')} className="input-field pl-10" /></div>
      {filtered.length === 0 ? (<div className="card text-center py-14 text-gray-400">{t('clients.noClients')}</div>) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <div key={c.id} className="card group hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex justify-between items-start mb-3"><div><h3 className="font-bold text-gray-900">{c.company_name}</h3>{c.contact_name && <p className="text-sm text-gray-500">{c.contact_name}</p>}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button><button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button></div>
              </div>
              {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
              {c.city && <p className="text-sm text-gray-400 mt-1">{c.postcode} {c.city}</p>}
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100"><h2 className="text-lg font-bold">{editing ? t('clients.edit') : t('clients.new')}</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
              <div><label className="label">{t('clients.companyName')} *</label><input type="text" value={form.company_name} onChange={set('company_name')} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="label">{t('clients.contactPerson')}</label><input type="text" value={form.contact_name} onChange={set('contact_name')} className="input-field" /></div><div><label className="label">{t('clients.email')}</label><input type="email" value={form.email} onChange={set('email')} className="input-field" /></div></div>
              <div><label className="label">{t('clients.address')}</label><input type="text" value={form.address} onChange={set('address')} className="input-field" /></div>
              <div className="grid grid-cols-3 gap-3"><div><label className="label">{t('clients.postcode')}</label><input type="text" value={form.postcode} onChange={set('postcode')} className="input-field" /></div><div><label className="label">{t('clients.city')}</label><input type="text" value={form.city} onChange={set('city')} className="input-field" /></div><div><label className="label">{t('clients.country')}</label><input type="text" value={form.country} onChange={set('country')} className="input-field" /></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="label"><span className="notranslate">KVK</span> {t('common.number')}</label><input type="text" value={form.kvk_number} onChange={set('kvk_number')} className="input-field" /></div><div><label className="label"><span className="notranslate">BTW</span> {t('common.number')}</label><input type="text" value={form.btw_number} onChange={set('btw_number')} className="input-field" /></div></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">{t('common.cancel')}</button><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? t('common.loading') : t('common.save')}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
