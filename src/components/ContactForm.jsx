import { useState } from 'react';
import { apiUrl, services } from '../data/site.js';

const initialState = {
  name: '',
  phone: '',
  email: '',
  eventType: '',
  message: ''
};

const eventTypes = [
  ['wedding', 'Wedding'],
  ['birthday', 'Birthday'],
  ['engagement', 'Engagement'],
  ['reception', 'Reception'],
  ['housewarming', 'Housewarming'],
  ['haldi(pre-wedding)', 'Haldi (Pre-Wedding)'],
  ['naming-ceremony', 'Naming Ceremony'],
  ['corporate', 'Corporate'],
  ['other', 'Other']
];

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
          <input name="name" value={form.name} onChange={onChange} required placeholder="Your name" />
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" value={form.phone} onChange={onChange} required placeholder="Mobile number" />
        </label>
      </div>
      <label>
        <span>Email</span>
        <input name="email" type="email" value={form.email} onChange={onChange} required placeholder="Email address" />
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
        <span>Event details</span>
        <textarea
          name="message"
          value={form.message}
          onChange={onChange}
          required
          rows={5}
          placeholder={`Example: ${services[0].shortTitle}, event date, venue, guest count and preferred theme`}
        />
      </label>
      <button type="submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Sending...' : 'Request Event Quote'}
      </button>
      {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
    </form>
  );
}

