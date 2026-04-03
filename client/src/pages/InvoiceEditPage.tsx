import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus } from 'lucide-react';
import { useI18n } from '../i18n';
import { invoiceService } from '../services/invoiceService';
import { formatCurrency } from '../utils/formatters';
import SuccessAnimation from '../components/SuccessAnimation';

export default function InvoiceEditPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', invoice_date: '', description: '' });

  useEffect(() => {
    invoiceService.getById(Number(id)).then((inv: any) => {
      setInvoice(inv);
      setForm({ invoice_number: inv.invoice_number, invoice_date: inv.invoice_date, description: inv.description || '' });
      const invItems = inv.items && inv.items.length > 0 ? inv.items : [{ description: inv.description || '', quantity: 1, unit_price: inv.subtotal || 0, btw_rate: 21 }];
      setItems(invItems);
    }).finally(() => setLoading(false));
  }, [id]);

  const updateItem = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, btw_rate: 21 }]);
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);
  const btwAmount = items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0) * ((i.btw_rate || 0) / 100), 0);
  const total = subtotal + btwAmount;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...form, items, subtotal: Math.round(subtotal * 100) / 100, btw_amount: Math.round(btwAmount * 100) / 100, total: Math.round(total * 100) / 100 }),
      });
      if (res.ok) { setSuccess(true); setTimeout(() => navigate('/invoices'), 2000); }
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;
  if (!invoice) return <div className="h-full flex items-center justify-center text-gray-400">Factuur niet gevonden</div>;
  if (success) return <SuccessAnimation message={t('settings.opgeslagen')} />;

  return (
    <div className="h-full flex flex-col safe-top">
      <div className="px-6 pt-6 flex items-center gap-3 mb-4 flex-shrink-0">
        <button onClick={() => navigate('/invoices')} className="p-2 -ml-2 rounded-xl hover:bg-gray-100"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-extrabold text-dark flex-1">{t('history.wijzigen')}</h1>
      </div>
      <div className="page-scroll px-6 pb-6">
        <div className="space-y-4 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-send">Factuurnummer</label>
              <input type="text" value={form.invoice_number} onChange={e => setForm(p => ({...p, invoice_number: e.target.value}))} className="input-send notranslate" />
            </div>
            <div>
              <label className="label-send">Datum</label>
              <input type="date" value={form.invoice_date} onChange={e => setForm(p => ({...p, invoice_date: e.target.value}))} className="input-send" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="label-send mb-0">Items</p>
              <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-dark text-xs font-bold active:scale-95 transition-all">
                <Plus size={14} /> {t('invoice.regelToevoegen')}
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-2xl space-y-2">
                  <div className="flex items-start gap-2">
                    <input type="text" value={item.description || ''} onChange={e => updateItem(i, 'description', e.target.value)} className="input-send text-sm flex-1" placeholder="Omschrijving" />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mt-1">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Aantal</span>
                      <input type="text" inputMode="decimal" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} className="input-send text-sm py-2" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">Prijs</span>
                      <input type="text" inputMode="decimal" value={item.unit_price || ''} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value.replace(',', '.')) || 0)} className="input-send text-sm py-2" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">BTW %</span>
                      <input type="text" inputMode="decimal" value={item.btw_rate || ''} onChange={e => updateItem(i, 'btw_rate', parseFloat(e.target.value) || 0)} className="input-send text-sm py-2" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 notranslate">{formatCurrency((item.quantity || 0) * (item.unit_price || 0) * (1 + (item.btw_rate || 0) / 100))}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
            <div className="flex justify-between text-sm text-gray-500"><span>Subtotaal</span><span className="notranslate">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-500"><span>BTW</span><span className="notranslate">{formatCurrency(btwAmount)}</span></div>
            <div className="flex justify-between text-base font-extrabold text-dark border-t border-gray-200 pt-2 mt-2"><span>Totaal</span><span className="notranslate">{formatCurrency(total)}</span></div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-brand w-full flex items-center justify-center gap-2">
            <Save size={18} /> {saving ? '...' : t('settings.opslaan')}
          </button>
        </div>
      </div>
    </div>
  );
}
