import Contact from '../model/contact.js';
import ContactList from '../view/contactList.js';
import ContactForm from '../view/contactForm.js';
import ContactDBAPI from '../services/contactDBAPI.js';
import AppController from './appController.js';

export default class App {
  constructor(url) {
    this.url = url;
    this.init();
  }
  
  async init() {
    this.$contactInterfaceDiv = document.getElementById("contact-interface");
    this.$contactFormDiv = document.getElementById('contact-form');
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");

    this.contactDBAPI = new ContactDBAPI(this.url);

    try {
      this.allContacts = await this.getAllContacts();
      this.tagOptions = this.getTagOptions();
      
      this.contactList = new ContactList(this);
      this.contactForm = new ContactForm(this);
      this.appController = new AppController(this);
      
      this.createHTML();
      this.populateHTML();
    } catch(error) {
      this.$errorMessage.textContent = `Please refresh the page, there has been an error: ${error.message}`;
    }
  }

  async getAllContacts() {
    try {
      let contactsArr = await this.contactDBAPI.fetchContacts();
      return contactsArr
        .map(contact => new Contact(contact))
        .sort((a, b) => {
          if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return -1;
          if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return 1;
          return 0;
        }
      );
    } catch(error) {
      throw new Error(error);
    }
  }

  getContactById(id) {
    return this.allContacts.find(contact => Number(id) === Number(contact.id))
  }
  
  createHTML() {
    this.$contactInterfaceDiv.append(
      this.contactList.$buttonDiv, 
      this.contactList.$filterDiv, 
      this.contactList.$listDiv
    );
    this.$contactFormDiv.append(this.contactForm.$form);
  }
  
  populateHTML() {
    this.$contactFormDiv.classList.add('hidden');
  }

  getTagOptions() {
    return this.allContacts.reduce((tagOptions, contact) => {
      contact.tags.forEach(tag => {
        if (!tagOptions.includes(tag)) tagOptions.push(tag);
      });
      return tagOptions;
    }, []).sort();
  }

  displayContactList() {
    this.$contactFormDiv.classList.add('hidden');
    this.$contactInterfaceDiv.classList.remove('hidden');
  }

  displayAddContactForm() {
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
    this.contactForm.setFormToAddContact();
  }

  displayEditContactForm(contactId) {
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');

    let contact = this.getContactById(contactId);
    this.contactForm.setFormToEditContact(contact);
  }

  async resetContactListDisplay() {
    try {
      this.allContacts = await this.getAllContacts();
      this.tagOptions = this.getTagOptions();
    } catch(error) {
      this.$errorMessage.textContent = `Please refresh the page, there has been an error: ${error.message}`;
    }
    this.contactList.resetSearchCriteria();
    this.contactList.populateTagsFieldset();
    this.contactList.reloadContactList();
    this.displayContactList();
  }
}

/*
To do:
  - Edit contact event handler:
    - display contact form with fields filled in
    - form needs contactId somewhere
    - very similar to creating, but dataToSend has additional key of id
      - use same form, if when submit button is pressed there is an id, then updating, otherwise, creating new
    - use different DBAPI as need to use method = PUT, path: contacts/:id

  - rename addContactForm to contactForm

  - ensure submit button is not hidden when adding contact, and update button is hidden

  - greggy tag raising error, tagOptions is not being updated with new tags unless I refresh the page, I've now got two 'friend' and ' friend'

  - update deleting contact to use this.app.getContactById()

  - should the list of contacts be a class with getContactById as a method?

  - check tags are lowercased and trimmed to prevent duplicates - I saw `greggy` and ` greggy`

  - When should data be fetched? What if other people are adding contacts?
    - Use setInterval to call every minute?
    - Reset tagOptions when contacts refetched

  - Use debounce to cancel requests if another one comes in?

  - Think about when to clear user and error messages

  - Why do I get Fetch failed in the console when deleting a contact?
*/

