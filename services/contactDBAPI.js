import HttpError from '../utils/httpError.js';

export default class ContactDBAPI {
  constructor(url, app) {
    this.url = url;
    this.app = app;
  }

  async fetchContacts() {
    let path = "/contacts";
    let response = await fetch(this.url + path);
    if (!response.ok) throw new HttpError(response.status, response.statusText, await response.text().catch(()=>''));
    return await response.json();
  }

  async postNewContactData(data) {
    let path = "/contacts";
    let method = 'POST';
    
    let response = await fetch(this.url + path, {
      'method': method,
      'body': data,
      'headers': {'Content-Type': 'application/json'},
    });

    if (!response.ok) throw new HttpError(response.status, response.statusText, await response.text().catch(()=>''));
    return await response.json();
  }

  async updateContactData(data, contactId) {
    let path = `/contacts/${contactId}`;
    let method = 'PUT';
    
    let response = await fetch(this.url + path, {
      'method': method,
      'body': data,
      'headers': {'Content-Type': 'application/json'},
    });
    if (!response.ok) throw new HttpError(response.status, response.statusText, await response.text().catch(()=>''));
    return await response.json();
  }

  async deleteContact(contactId) {
    let path = "/contacts";
    let method = 'DELETE';
    
    let response = await fetch(this.url + path + `/${contactId}`, {'method': method});
    if (!response.ok) throw new HttpError(response.status, response.statusText, await response.text().catch(()=>''));
    return true;
  }
}