import HttpError from '../utils/httpError.js';

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
  async #request(path, requestInitObj = {}, expectJson = true) {
    const res = await fetch(`${this.url}${path}`, requestInitObj);

    if (!res.ok) {
      let text = '';
      try { text = await res.text(); } catch {}
      throw new HttpError(res.status, res.statusText, text);
    }

    if (!expectJson) return true;

    if (res.status === 204) return null; // no content response
    try { return await res.json(); } catch { return null; }
  }
}
