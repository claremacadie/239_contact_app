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
      return contactsArr.map(contact => new Contact(contact));
    } catch(error) {
      throw new Error(error);
    }
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

  displayContactForm() {
    this.$contactInterfaceDiv.classList.add('hidden');
    this.$contactFormDiv.classList.remove('hidden');
  }

  displayContactList() {
    this.$contactFormDiv.classList.add('hidden');
    this.$contactInterfaceDiv.classList.remove('hidden');
  }
}

/*
Contact list:
  - edit: navigate to form
  - delete: alert are you sure you want to delete the contact? Ok, Cancel
  - use debounce to prevent overwhelm

Alternative view:
  Create Contact Form:
    - ensure valid inputs
    - ensure unique name, email and telephone

Edit Contact Form:
  - as above, but with fields filled in

Classes:
  - App
  - AppController
  - ContactDBAPI
  - Contact
  - ContactList
  - ContactForm
  - HTMLTemplate?

To do:
- Create add Contact functionality
    - fetch(send) data, error handling

  - Edit/Delete contact
    - Need to put id as data attribute somewhere in the Contact HTML
    - Beware using the same form for editing a contact because the `method` attribute is PUT, not POST

  - When should data be fetched? What if other people are adding contacts?
    - Use setInterval to call every minute?
  - When should tagOptions be fetched? Especially for add contact form.
    - Every time data is fetched?
  - Use debounce?
  - Cancel requests if another one comes in?

  - Which classes actually need the url?

  - Think about when to clear user and error messages

  - It would be nice for contacts to be listed alphabetically
*/

