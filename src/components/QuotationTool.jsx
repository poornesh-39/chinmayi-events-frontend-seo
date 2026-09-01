import { useMemo, useState } from 'react';
import { apiUrl, eventTypes } from '../data/site.js';

const createItem = (id) => ({
  id,
  material: '',
  quantity: 1,
  amount: 0
});

const today = () => new Date().toISOString().split('T')[0];

const normalizeQuotationNumber = (value) => value.trim().toUpperCase();

const quotationSearchCandidates = (value) => {
  const normalized = normalizeQuotationNumber(value);
  const candidates = [normalized];
  const match = normalized.match(/^(CE)-(\d{4})-(\d+)$/);

  if (match) {
    const [, prefix, year, sequence] = match;
    const numericSequence = String(Number(sequence));

    if (numericSequence !== 'NaN') {
      candidates.push(`${prefix}-${year}-${numericSequence.padStart(4, '0')}`);
      candidates.push(`${prefix}-${year}-${numericSequence.padStart(3, '0')}`);
      candidates.push(`${prefix}-${year}-${numericSequence}`);
    }
  }

  return [...new Set(candidates)];
};

export default function QuotationTool() {
  const [items, setItems] = useState([createItem(1)]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventType, setEventType] = useState('');
  const [quotationDate, setQuotationDate] = useState(today());
  const [eventDate, setEventDate] = useState('');
  const [transportationCharge, setTransportationCharge] = useState(0);
  const [searchQuotationNumber, setSearchQuotationNumber] = useState('');
  const [currentQuotationNumber, setCurrentQuotationNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState('');

  const isEditMode = Boolean(currentQuotationNumber);
  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.amount || 0), 0),
    [items]
  );
  const grandTotal = itemsTotal + Number(transportationCharge || 0);

  const cleanItems = () => items.map(({ material, quantity, amount }) => ({
    material: material.trim(),
    quantity: Number(quantity || 0),
    amount: Number(amount || 0)
  }));

  const quotationPayload = (quotationNumber = currentQuotationNumber) => ({
    quotationNumber,
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    clientPhone: clientPhone.trim(),
    eventType,
    quotationDate,
    eventDate,
    items: cleanItems(),
    total: itemsTotal,
    transportationCharge: Number(transportationCharge || 0)
  });

  const validate = () => {
    if (!clientName.trim()) return 'Client name is required.';
    if (!eventType) return 'Event type is required.';
    if (items.some((item) => !item.material.trim() || Number(item.amount) <= 0 || Number(item.quantity) <= 0)) {
      return 'Each item needs material, quantity and amount.';
    }
    return '';
  };

  const addItem = () => {
    const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
    setItems((current) => [...current, createItem(nextId)]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems((current) => current.map((item) => (
      item.id === id
        ? { ...item, [field]: field === 'material' ? value : Number(value) }
        : item
    )));
  };

  const resetForm = () => {
    setItems([createItem(1)]);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setEventType('');
    setQuotationDate(today());
    setEventDate('');
    setTransportationCharge(0);
    setCurrentQuotationNumber('');
    setStatus('New quotation ready.');
  };

  const loadQuotation = async () => {
    const quotationNumber = normalizeQuotationNumber(searchQuotationNumber);
    if (!quotationNumber) {
      setStatus('Enter a quotation number to search.');
      return;
    }

    setSearching(true);
    setStatus('Searching quotation...');
    try {
      let data = null;
      let matchedQuotationNumber = quotationNumber;

      for (const candidate of quotationSearchCandidates(quotationNumber)) {
        const response = await fetch(`${apiUrl}/api/quotation/${encodeURIComponent(candidate)}`);
        if (response.ok) {
          data = await response.json();
          matchedQuotationNumber = candidate;
          break;
        }
      }

      if (!data) throw new Error('Quotation not found');
      const quotation = data.quotation;

      setClientName(quotation.clientName || '');
      setClientEmail(quotation.clientEmail || '');
      setClientPhone(quotation.clientPhone || '');
      setEventType(quotation.eventType || '');
      setQuotationDate(quotation.quotationDate || today());
      setEventDate(quotation.eventDate || '');
      setTransportationCharge(Number(quotation.transportationCharge || 0));
      setItems((quotation.items || []).map((item, index) => ({
        id: index + 1,
        material: item.material || '',
        quantity: Number(item.quantity || 1),
        amount: Number(item.amount || 0)
      })) || [createItem(1)]);
      setCurrentQuotationNumber(quotation.quotationNumber || matchedQuotationNumber);
      setSearchQuotationNumber('');
      setStatus(`Editing quotation ${quotation.quotationNumber || quotationNumber}.`);
    } catch {
      setStatus('Could not find that quotation number.');
    } finally {
      setSearching(false);
    }
  };

  const saveQuotation = async () => {
    const error = validate();
    if (error) {
      setStatus(error);
      return null;
    }

    const endpoint = isEditMode
      ? `${apiUrl}/api/quotation/${encodeURIComponent(currentQuotationNumber)}`
      : `${apiUrl}/api/quotation/save`;

    const response = await fetch(endpoint, {
      method: isEditMode ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotationPayload(isEditMode ? currentQuotationNumber : ''))
    });

    if (!response.ok) throw new Error('Save failed');
    const data = await response.json();
    const quotationNumber = data.quotation?.quotationNumber || currentQuotationNumber;
    setCurrentQuotationNumber(quotationNumber);
    return quotationNumber;
  };

  const downloadPdf = async (quotationNumber) => {
    const response = await fetch(`${apiUrl}/api/quotation/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotationPayload(quotationNumber))
    });

    if (!response.ok) throw new Error('PDF generation failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quotation_${clientName.trim().replace(/\s+/g, '_') || 'Client'}_${quotationDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const saveAndDownload = async () => {
    setLoading(true);
    setStatus(isEditMode ? 'Updating quotation...' : 'Saving quotation...');
    try {
      const quotationNumber = await saveQuotation();
      if (!quotationNumber) return;
      setStatus('Generating PDF...');
      await downloadPdf(quotationNumber);
      setStatus(isEditMode ? `Quotation ${quotationNumber} updated and downloaded.` : `Quotation ${quotationNumber} saved and downloaded.`);
    } catch {
      setStatus('Could not process quotation. Check backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotation-tool">
      <section className="admin-card quote-search-card">
        <div className="quote-title-row">
          <div>
            <h2>Quotation Tool</h2>
            <p>Create, edit and download Chinmayi Events quotation PDFs.</p>
          </div>
          {isEditMode && <button type="button" onClick={resetForm}>New Quotation</button>}
        </div>

        <div className="quote-search-row">
          <label>
            <span>Search existing quotation</span>
            <input
              value={searchQuotationNumber}
              onChange={(event) => setSearchQuotationNumber(event.target.value)}
              placeholder="Example: CE-2026-0064"
              disabled={searching}
            />
          </label>
          <button type="button" onClick={loadQuotation} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {isEditMode && <p className="edit-pill">Editing quotation: {currentQuotationNumber}</p>}
        {status && <p className="admin-status">{status}</p>}
      </section>

      <section className="admin-card quotation-form-card">
        <div className="quote-form-grid">
          <label>
            <span>Client Name *</span>
            <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client full name" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} placeholder="client@email.com" />
          </label>
          <label>
            <span>Phone</span>
            <input value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} placeholder="Phone number" />
          </label>
          <label>
            <span>Event Type *</span>
            <select value={eventType} onChange={(event) => setEventType(event.target.value)}>
              <option value="">Select event type</option>
              {eventTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Quotation Date</span>
            <input type="date" value={quotationDate} onChange={(event) => setQuotationDate(event.target.value)} />
          </label>
          <label>
            <span>Event Date</span>
            <input type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
          </label>
          <label>
            <span>Transportation Charge</span>
            <input type="number" min="0" value={transportationCharge} onChange={(event) => setTransportationCharge(Number(event.target.value))} />
          </label>
        </div>
      </section>

      <section className="admin-card quote-items-card">
        <div className="quote-title-row">
          <div>
            <h2>Quotation Items</h2>
            <p>Add materials, decor items, services or package lines.</p>
          </div>
          <button type="button" onClick={addItem}>Add Item</button>
        </div>

        <div className="quote-items-table">
          <div className="quote-items-head">
            <span>Material / Item</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Total</span>
            <span></span>
          </div>
          {items.map((item) => (
            <div className="quote-item-row" key={item.id}>
              <label>
                <span>Material / Item</span>
                <input value={item.material} onChange={(event) => updateItem(item.id, 'material', event.target.value)} placeholder="Flowers, stage backdrop, lighting..." />
              </label>
              <label>
                <span>Qty</span>
                <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} />
              </label>
              <label>
                <span>Rate</span>
                <input type="number" min="0" value={item.amount} onChange={(event) => updateItem(item.id, 'amount', event.target.value)} />
              </label>
              <div className="quote-line-total">
                <span>Total</span>
                <strong>Rs. {(Number(item.quantity || 0) * Number(item.amount || 0)).toFixed(2)}</strong>
              </div>
              <button type="button" className="remove-item-btn" onClick={() => removeItem(item.id)} disabled={items.length === 1}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="quote-summary-card">
        <div>
          <span>Items Total</span>
          <strong>Rs. {itemsTotal.toFixed(2)}</strong>
        </div>
        <div>
          <span>Transportation</span>
          <strong>Rs. {Number(transportationCharge || 0).toFixed(2)}</strong>
        </div>
        <div className="grand-total">
          <span>Grand Total</span>
          <strong>Rs. {grandTotal.toFixed(2)}</strong>
        </div>
        <button type="button" onClick={saveAndDownload} disabled={loading}>
          {loading ? 'Processing...' : isEditMode ? 'Update & Download PDF' : 'Save & Download PDF'}
        </button>
      </section>
    </div>
  );
}


