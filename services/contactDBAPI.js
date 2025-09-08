import HttpError from '../utils/httpError.js';
import TimeoutError from '../utils/timeoutError.js';

export default class ContactDBAPI {
  constructor(url) {
    this.url = url;
  }

  // ---------- public API ----------
  fetchContacts() {
    return this.#request('/contacts');
  }

  postNewContactData(data) {
    return this.#request('/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
  }

  updateContactData(data, contactId) {
    return this.#request(`/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
  }

  deleteContact(contactId) {
    return this.#request(`/contacts/${contactId}`, { method: 'DELETE' }, false);
  }

  // ---------- private API ----------
  #setTimeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new TimeoutError('Fetch request timed out')), ms);
    });
  }

  async #request(path, requestInitObj = {}, expectJson = true) {
    const res = await Promise.race([
      fetch(`${this.url}${path}`, requestInitObj),
      this.#setTimeoutPromise(2000),
    ]);

    if (!res.ok) {
      let text = '';
      try { text = await res.text(); } catch {}
      throw new HttpError(res.status, res.statusText, text);
    }

    if (!expectJson) return true;

    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }
}
