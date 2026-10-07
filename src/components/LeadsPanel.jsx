import { useCallback, useEffect, useState } from 'react';
import { authFetch } from '../data/adminAuth.js';
import { categoryLabels, whatsappHref } from '../data/site.js';

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost'
};

const formatReceived = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

/** Strips separators so a stored number works in a tel: or wa.me link. */
const dialable = (phone) => String(phone || '').replace(/[^\d+]/g, '');

export default function LeadsPanel({ onAuthError }) {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [newCount, setNewCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: '25' });
      if (filter !== 'all') query.set('status', filter);

      const response = await authFetch(`/api/contact?${query}`);
      if (!response.ok) throw new Error('Could not load enquiries');

      const data = await response.json();
      setLeads(data.contacts || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      setNewCount(data.newCount || 0);
      setStatus('');
    } catch (error) {
      if (!onAuthError?.(error)) setStatus('Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filter, page, onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id, nextStatus) => {
    // Optimistic: the dropdown should not stall on a round trip.
    const previous = leads;
    setLeads((current) =>
      current.map((lead) => (lead._id === id ? { ...lead, status: nextStatus } : lead))
    );

    try {
      const response = await authFetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();
      setLeads((current) => current.map((lead) => (lead._id === id ? data.contact : lead)));
      setNewCount((count) => (nextStatus === 'new' ? count : Math.max(0, count - (previous.find((l) => l._id === id)?.status === 'new' ? 1 : 0))));
      setStatus('');
    } catch (error) {
      setLeads(previous);
      if (!onAuthError?.(error)) setStatus('Could not update that enquiry.');
    }
  };

  return (
    <div className="admin-card leads-card">
      <div className="leads-head">
        <div>
          <h2>Enquiries</h2>
          <p>
            {pagination.total} total
            {newCount > 0 && <span className="leads-new-pill">{newCount} new</span>}
          </p>
        </div>
        <div className="leads-controls">
          <label className="leads-filter">
            <span className="sr-only">Filter by status</span>
            <select
              value={filter}
              onChange={(event) => {
                setPage(1);
                setFilter(event.target.value);
              }}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>{STATUS_LABELS[value]}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>

      {status && <p className="admin-status">{status}</p>}

      {loading && leads.length === 0 && <p>Loading enquiries...</p>}

      {!loading && leads.length === 0 && (
        <p className="leads-empty">
          {filter === 'all'
            ? 'No enquiries yet. Submissions from the website contact form appear here.'
            : `No enquiries with the status "${STATUS_LABELS[filter]}".`}
        </p>
      )}

      <ul className="leads-list">
        {leads.map((lead) => (
          <li key={lead._id} className={`lead lead-${lead.status}`}>
            <div className="lead-main">
              <div className="lead-identity">
                <strong>{lead.name}</strong>
                <span className="lead-event">{categoryLabels[lead.eventType] || lead.eventType}</span>
              </div>
              <time dateTime={lead.createdAt}>{formatReceived(lead.createdAt)}</time>
            </div>

            <div className="lead-contact">
              <a href={`tel:${dialable(lead.phone)}`}>{lead.phone}</a>
              <a
                href={whatsappHref(`Hello ${lead.name}, thank you for your enquiry with Chinmayi Events.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
              {lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}
            </div>

            {lead.message && <p className="lead-message">{lead.message}</p>}

            <label className="lead-status">
              <span className="sr-only">Status for {lead.name}</span>
              <select value={lead.status} onChange={(event) => changeStatus(lead._id, event.target.value)}>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>{STATUS_LABELS[value]}</option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>

      {pagination.pages > 1 && (
        <div className="leads-pager">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
