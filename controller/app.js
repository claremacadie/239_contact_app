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
  - Add loading indicators when fetch requests are happening
  - Consider extracting some of the longer methods like createHTML into smaller, more focused functions. For example, in ContactForm, you could break down the form creation into separate methods for each section.
  - Create a generic fetch request function, with error handling

  - Be more specific about which errors to catch and re-throw versus which ones to handle directly.
    - How might you distinguish between a network connectivity issue versus a "contact not found" error from your API server?

      Form Validation vs. System Errors
      In your ContactForm class, consider separating validation errors (which should be shown to users) from unexpected system errors (which might need to be logged differently).

      Re-throwing vs. Direct Handling
      Think about the difference between errors that should bubble up to higher-level handlers versus ones that should be handled immediately. For example, if a contact fails to save due to validation issues, should that error be handled right in the form, or passed up to the calling code?

      Next Step
      Start by looking at your ContactDBAPI class methods - can you identify which specific error conditions you want to handle differently based on the type of problem that occurred? Look at the `deleteContact` method.

  - In app.js, setInterval to: 
    - fetch allContacts
    - reset tagOptions
    - update tag checkboxes in contactList
    - update tag checkboxes in contactForm

  - Use debounce to cancel requests if another one comes in?

  - Add some timeouts to cancel requests if they take too long
*/

