import { useState } from 'react';
import { apiUrl, eventTypes, services, whatsappHref } from '../data/site.js';

const initialState = {
  name: '',
  phone: '',
  email: '',
  eventType: '',
  message: ''
};

export default function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Sending your enquiry...' });


    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Unable to submit enquiry');
      }

      setForm(initialState);
      setStatus({
        type: 'success',
        message: 'Thank you. Chinmayi Events will contact you soon.'
      });
    } catch {
      setStatus({
        type: 'error',
        message: 'Could not send the form. Please call or WhatsApp us directly.'
      });
    }
  };

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          <span>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
        <label>
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            pattern="[0-9+\-\s()]{10,15}"
            title="Enter a valid mobile number"
            value={form.phone}
            onChange={onChange}
            required
            placeholder="Mobile number"
          />
        </label>
      </div>
      <label>
        <span>Email <i>(optional)</i></span>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email address"
        />
      </label>
      <label>
        <span>Event type</span>
        <select name="eventType" value={form.eventType} onChange={onChange} required>
          <option value="">Select event type</option>
          {eventTypes.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Event details <i>(optional)</i></span>
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          rows={3}
          placeholder={`Example: ${services[0].shortTitle}, event date, venue, guest count and preferred theme`}
        />
      </label>
      <button type="submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Sending...' : 'Request Event Quote'}
      </button>
      <p className="form-alt">
        Prefer to chat?{' '}
        <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp
        </a>
      </p>
      <p className={`status ${status.type}`} role="status" aria-live="polite">
        {status.message}
      </p>
    </form>
  );
}

