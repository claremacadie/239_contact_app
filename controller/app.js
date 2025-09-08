import Contact from '../model/contact.js';
import ContactList from '../view/contactList.js';
import ContactForm from '../view/contactForm.js';
import ContactDBAPI from '../services/contactDBAPI.js';
import AppController from './appController.js';
import ValidationError from '../utils/validationError.js';
import TimeoutError from '../utils/timeoutError.js';
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
      this.displayUserMessage('Loading contacts…');
      await this.#refreshContactsAndTags();
      
      this.contactList = new ContactList(this);
      this.contactForm = new ContactForm(this);
      this.appController = new AppController(this);
      
      this.#createHTML();
      this.#configureHTML();
      this.#periodicDataFetch(); 
    } catch(error) {
        this.handleError(error, 'Could not load contacts.');
    } finally {
      this.clearUserMessage();
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

handleError(err, msg='Something went wrong.') {
  if (err instanceof TimeoutError) {
    this.displayErrorMessage('Request timed out. Please try again.');
    return;
  }
  // ...existing ValidationError / HttpError / AbortError branches
}

  handleError(error, msg='Something went wrong. Please try again.') {
    if (error instanceof ValidationError) {
      this.displayErrorMessage(error.message);
    } else if (error instanceof HttpError) {
      this.displayErrorMessage(`Request failed (${error.status}): ${error.message}`);
      return;
    } else if (error?.name === 'AbortError') {
      this.displayUserMessage('Request aborted.');
    } else if (err instanceof TimeoutError) {
      this.displayErrorMessage('Request timed out. Please try again.');
    } else {
      console.error(error);
      this.displayErrorMessage(msg);
    }
  }

  // -- Contacts --
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
      await this.#refreshContactsAndTags();
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
  async #refreshContactsAndTags() {
    this.allContacts = await this.#getAllContacts();
    this.tagOptions  = this.#getTagOptions();
  }
  
  async #loadContactsAndTagOptions() {
    try {
      this.#refreshContactsAndTags()
      console.log('Contacts reloaded');
    } catch(error) {
      console.error(`Could not load contacts, error: ${error}`);
    }
  }

  #periodicDataFetch() {
    let ms = 60_000; 
    this._refreshing = false;
    this._intervalId = setInterval(async () => {
      if (this._refreshing) return;
      this._refreshing = true;
      try {
        await this.#loadContactsAndTagOptions();
      } finally {
        this._refreshing = false;
      }
    }, ms);
  }

  async #getAllContacts() {
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

  #getTagOptions() {
    return this.allContacts.reduce((tagOptions, contact) => {
      contact.tags.forEach(tag => {
        if (!tagOptions.includes(tag)) tagOptions.push(tag);
      });
      return tagOptions;
    }, []).sort();
  }

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
}

/*
To do:
- Use debounce to cancel requests if another one comes in?
  https://launchschool.com/lessons/1b723bd0/assignments/72dd3b59 
*/

