export default 
class ContactDBAPI {
  constructor(url, app) {
    this.url = url;
    this.app = app;
  }

  async fetchContacts() {
    let path = "/contacts";
    try {
      let response = await fetch(this.url + path);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      let contacts = await response.json();
      return contacts;
    } catch(error) {
      throw new Error(error);
    }
  }
}