import Contact from '../model/contact.js';
import ContactList from '../view/contactList.js';
import ContactForm from '../view/contactForm.js';
import ContactDBAPI from '../services/contactDBAPI.js';
import AppController from './appController.js';
import ValidationError from '../utils/validationError.js';
import HttpError from '../utils/httpError.js';


export default class App {
  constructor(url) {
    this.url = url;
    this.#init();
  }
  
  async #init() {
    this.$contactInterfaceDiv = document.getElementById("contact-interface");
    this.$contactFormDiv = document.getElementById('contact-form');
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");

    this.contactDBAPI = new ContactDBAPI(this.url);

    try {
      this.allContacts = await this.getAllContacts();
      this.tagOptions = this.#getTagOptions();
      
      this.contactList = new ContactList(this);
      this.contactForm = new ContactForm(this);
      this.appController = new AppController(this);
      
      this.#createHTML();
      this.#configureHTML();
    } catch(error) {
        this.handleError(err, 'Could not load contacts.');
    }
  }

  // ---------- public API ----------
  displayUserMessage(msg) {
    this.$userMessage.textContent = msg;
  }

  displayErrorMessage(msg) {
    this.$errorMessage.textContent = msg;
  }

  clearUserMessage() {
    this.$userMessage.textContent = '';
  }
  
  clearErrorMessage() {
    this.$errorMessage.textContent = '';
  }

  handleError(error) {
    if (error instanceof ValidationError) {
      this.displayErrorMessage(error.message);
    } else if (error instanceof HttpError) {
      this.displayErrorMessage(`Request failed (${err.status}): ${error.message}`);
      return;
    } else if (error?.name === 'AbortError') {
      this.displayUserMessage('Request aborted.');
    } else {
      console.error(error);
      this.displayErrorMessage('Something went wrong. Please try again.');
    }
  }

  // -- Contacts --
  async getAllContacts() {
    let contactsArr = await this.contactDBAPI.fetchContacts();
    return contactsArr
      .map(contact => new Contact(contact))
      .sort((a, b) => {
        if (a.full_name.toLowerCase() < b.full_name.toLowerCase()) return -1;
        if (a.full_name.toLowerCase() > b.full_name.toLowerCase()) return 1;
        return 0;
      }
    )
  }

  getContactById(id) {
    return this.allContacts.find(contact => Number(id) === Number(contact.id))
  }
  
  // -- ContactList --
  displayContactList() {
    this.clearErrorMessage();
    this.$contactFormDiv.classList.add('hidden');
    this.$contactInterfaceDiv.classList.remove('hidden');
  }

  async resetContactListDisplay() {
    this.clearErrorMessage();
    try {
      this.allContacts = await this.getAllContacts();
      this.tagOptions = this.#getTagOptions();
    } catch(error) {
      this.handleError(error, 'Please refresh the page, there has been an error.');
    }
    this.contactList.resetSearch();
    this.contactList.renderTagsFieldset();
    this.contactList.reloadContactList();
    this.displayContactList();
  }

  // -- ContactForm --
  displayAddContactForm() {
    this.clearUserMessage();
    this.clearErrorMessage();
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
    this.contactForm.renderTagOptions();
    this.contactForm.displayAddMode();
  }
  
  displayEditContactForm(contactId) {
    this.clearUserMessage();
    this.clearErrorMessage();
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
    this.contactForm.renderTagOptions();
    
    let contact = this.getContactById(contactId);
    this.contactForm.displayEditMode(contact);
  }

  // ---------- private API ----------
  #createHTML() {
    this.$contactInterfaceDiv.append(
      this.contactList.$buttonDiv, 
      this.contactList.$filterDiv, 
      this.contactList.$listDiv
    );
    this.$contactFormDiv.append(this.contactForm.$form);
  }
  
  #configureHTML() {
    this.$contactFormDiv.classList.add('hidden');
  }

  #getTagOptions() {
    return this.allContacts.reduce((tagOptions, contact) => {
      contact.tags.forEach(tag => {
        if (!tagOptions.includes(tag)) tagOptions.push(tag);
      });
      return tagOptions;
    }, []).sort();
  }
}

/*
To do:
- Create a generic fetch request function, with error handling
- Add loading indicators when fetch requests are happening

- create test framework

- In app.js, setInterval to: 
  - fetch allContacts
  - reset tagOptions
  - update tag checkboxes in contactList
  - update tag checkboxes in contactForm

- Use debounce to cancel requests if another one comes in?

- Add some timeouts to cancel requests if they take too long
*/

