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
    this.$errorMessage.textContent = '';
    this.$contactFormDiv.classList.add('hidden');
    this.$contactInterfaceDiv.classList.remove('hidden');
  }

  displayAddContactForm() {
    this.$userMessage.textContent = '';
    this.$errorMessage.textContent = '';
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
    this.contactForm.populateTagsFieldsetHTML();
    this.contactForm.setFormToAddContact();
  }
  
  displayEditContactForm(contactId) {
    this.$userMessage.textContent = '';
    this.$errorMessage.textContent = '';
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
    this.contactForm.populateTagsFieldsetHTML();
    
    let contact = this.getContactById(contactId);
    this.contactForm.setFormToEditContact(contact);
  }
  
  async resetContactListDisplay() {
    this.$errorMessage.textContent = '';
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
  - Add there are no contacts to display when filtering removes everything!
  - Add loading indicators when fetch requests are happening

  - In app.js, setInterval to: 
    - fetch allContacts
    - reset tagOptions
    - update tag checkboxes in contactList
    - update tag checkboxes in contactForm

  - Use debounce to cancel requests if another one comes in?
*/

