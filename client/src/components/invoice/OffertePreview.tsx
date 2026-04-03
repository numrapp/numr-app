import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoiceItem } from '../../types';

interface Props {
  supplierName: string; supplierAddress: string; supplierPostcode: string; supplierCity: string;
  supplierKvk: string; supplierBtw: string; supplierIban: string; supplierPhone: string;
  supplierLogo?: string;
  customerName: string; customerAddress: string; customerPostcode: string; customerCity: string; customerCountry: string;
  offerteNumber: string; offerteDate: string; validUntil: string;
  description: string; items: InvoiceItem[]; subtotal: number; btwAmount: number; total: number;
}

export default function OffertePreview(props: Props) {
  return (
    <div className="notranslate bg-white rounded-xl shadow-md border border-gray-200 text-[11px] leading-relaxed" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="px-5 pt-5 pb-3 flex justify-between items-start">
        {props.supplierLogo ? (
          <img src={props.supplierLogo} alt="" className="h-10 object-contain" />
        ) : (
          <span className="text-lg font-bold text-blue-800 tracking-wide">OFFERTE</span>
        )}
        <div className="text-right text-[10px] text-gray-700">
          <p className="font-semibold">{props.supplierName}</p>
          <p>{props.supplierAddress}</p>
          <p>{props.supplierPostcode} {props.supplierCity}</p>
          {props.supplierKvk && <p>KVK: {props.supplierKvk}</p>}
          {props.supplierBtw && <p>BTW: {props.supplierBtw}</p>}
          {props.supplierPhone && <p>Tel: {props.supplierPhone}</p>}
        </div>
      </div>

      <div className="border-t border-gray-200 mx-5" />

      <div className="px-5 py-3 flex justify-between">
        <div className="text-[10px]">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Offerte aan</p>
          <p className="font-medium text-gray-900">{props.customerName || '-'}</p>
          <p>{props.customerAddress}</p>
          <p>{props.customerPostcode} {props.customerCity}</p>
          {props.customerCountry && props.customerCountry !== 'Nederland' && <p>{props.customerCountry}</p>}
        </div>
        <div className="text-[10px] text-right space-y-0.5">
          <Row label="Offertenummer" value={props.offerteNumber || 'OFF001'} />
          <Row label="Offertedatum" value={props.offerteDate ? formatDate(props.offerteDate) : '-'} />
          <Row label="Geldig tot" value={props.validUntil ? formatDate(props.validUntil) : '-'} />
        </div>
      </div>

      {props.description && (
        <div className="px-5 pb-2 text-[10px]">
          <span className="text-gray-400">Opmerking: </span><span className="text-gray-700">{props.description}</span>
        </div>
      )}

      <div className="mx-5">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-y border-gray-200">
              <th className="text-left py-1.5 font-semibold text-gray-500">Omschrijving</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-14">Aantal</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-16">Prijs</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-12">BTW</th>
              <th className="text-right py-1.5 font-semibold text-gray-500 w-16">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            {props.items.map((item, i) => {
              const sub = item.quantity * item.unit_price;
              const lineTotal = sub + sub * (item.btw_rate / 100);
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1">{item.description || '-'}</td>
                  <td className="py-1 text-right">{item.quantity}</td>
                  <td className="py-1 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-1 text-right">{item.btw_rate}%</td>
                  <td className="py-1 text-right">{formatCurrency(lineTotal)}</td>
                </tr>
              );
            })}
            {props.items.length === 0 && <tr><td colSpan={5} className="py-3 text-center text-gray-400">Geen items</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 flex justify-end">
        <div className="w-44 text-[10px] space-y-0.5">
          <div className="flex justify-between text-gray-500"><span>Subtotaal:</span><span className="text-gray-900">{formatCurrency(props.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>BTW:</span><span className="text-gray-900">{formatCurrency(props.btwAmount)}</span></div>
          <div className="flex justify-between font-bold text-blue-800 text-[11px] border-t border-gray-300 pt-1 mt-1"><span>Totaal:</span><span>{formatCurrency(props.total)}</span></div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-b-xl px-5 py-1.5 text-[8px] text-gray-400 text-center border-t border-gray-100">
        {props.supplierName} | KVK: {props.supplierKvk} | BTW: {props.supplierBtw}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-2 justify-end"><span className="text-gray-400">{label}:</span><span className="font-medium text-gray-700 w-24 text-right">{value}</span></div>;
}
