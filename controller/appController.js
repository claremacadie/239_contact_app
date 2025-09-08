import ValidationError from '../utils/validationError.js';
import HttpError from '../utils/httpError.js';
import debounce from '../utils/debounce.js';

export default class AppController {
  constructor(app) {
    this.app = app;
    this.#init();
    this.#bind();
  }

  #init() {
    this.contactForm = this.app.contactForm;
    this.$form = this.contactForm.$form;
    this.$updateContactButton = this.contactForm.$updateButton;
    this.$cancelAddContactButton = this.contactForm.$cancelButton;

    this.contactList = this.app.contactList;
    this.$addContactButton = this.contactList.$addContactButton;
    this.$searchInput = this.contactList.$searchInput;
    this.$tagsFieldset = this.contactList.$tagsFieldset;
    this.$contactListDiv = this.contactList.$listDiv;

    this.contactDBAPI = this.app.contactDBAPI;

    this.handleSearch = debounce(this.handleSearch.bind(this));
    this.handleTagSelect = debounce(this.handleTagSelect.bind(this));
  } 

  #bind() {
    this.$form.addEventListener('submit', this.#handleFormSubmit.bind(this));
    this.$cancelAddContactButton.addEventListener('click', this.#handleCancelButton.bind(this));
    this.$updateContactButton.addEventListener('click', this.#handleUpdateContact.bind(this));

    this.$addContactButton.addEventListener('click', this.#handleAddContact.bind(this));
    this.$searchInput.addEventListener('input', this.handleSearch);
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect);

    this.$contactListDiv.addEventListener('click', this.#handleContactListClick.bind(this));
  }

  // ---------- Public handlers ----------
  handleSearch(event) {
    event.preventDefault();
    this.contactList.updateSearchTextCriteria();
    this.contactList.reloadContactList();
  }
  
  handleTagSelect(event) {
    event.preventDefault();
    this.contactList.updateTagSelectCriteria();
    this.contactList.reloadContactList();
  }

  // ---------- Private handlers ----------
  // -- ContactList --
  #handleContactListClick(event) {
    let target = event.target;

    if (target.nodeName === 'BUTTON') {
      event.preventDefault();
      let contactId = target.dataset.contactId;
      if (target.classList.contains('edit-contact')) this.app.displayEditContactForm(contactId);
      if (target.classList.contains('delete-contact')) this.#deleteContact(contactId);
    }
  }

  #handleAddContact(event) {
    event.preventDefault();
    this.app.displayAddContactForm();
  }
  
  // -- ContactForm --
  async #handleFormSubmit(event) {
    event.preventDefault();

    try {
      this.app.displayUserMessage("Validating inputs...");
      let data = this.#extractData(new FormData(this.$form));
      this.#validateInputs(data);  
      this.app.displayUserMessage("Adding new contact...");
      let dataToSend = this.#formatDataToSend(data);
      let response = await this.contactDBAPI.postNewContactData(dataToSend);
      this.contactForm.$form.reset();
      this.app.displayUserMessage(`New contact added: ${response.full_name}`);
      await this.app.resetContactListDisplay();
    } catch(error) {
      this.app.handleError(error);
    } finally {
      this.app.clearUserMessage();
    }
  }

  async #handleUpdateContact(event) {
    event.preventDefault();
    let target = event.target;
    let contactId = target.dataset.contactId;
    let data = this.#extractData(new FormData(this.$form));
    try {
      this.app.displayUserMessage("Validating inputs...");
      this.#validateInputs(data);  
      this.app.displayUserMessage("Updating contact...");
      let dataToSend = this.#formatDataToSendWithId(data, contactId);
      let response = await this.contactDBAPI.updateContactData(dataToSend, contactId);
      this.contactForm.$form.reset();
      this.app.displayUserMessage(`Contact updated: ${response.full_name}`);
      await this.app.resetContactListDisplay();
    } catch(error) {
      this.app.handleError(error);
    } finally {
      this.app.clearUserMessage();
    }
  }
  
  async #handleCancelButton(event) {
    event.preventDefault();
    this.contactForm.$form.reset();
    await this.app.resetContactListDisplay();
  }

  // ---------- helpers ----------
  // -- ContactList --
  async #deleteContact(contactId) {
    let contactFullName = this.app.getContactById(contactId).full_name;

    if (!confirm(`Are you sure you want to delete: ${contactFullName}`)) return;
    try {
      this.app.displayUserMessage("Deleting contact...");
      await this.contactDBAPI.deleteContact(contactId);
      this.app.displayUserMessage(`${contactFullName} has been deleted.`);
      await this.app.resetContactListDisplay();
    } catch(error) {
      if (error instanceof HttpError) {
        this.app.displayErrorMessage(`Delete failed for contact id = ${contactId} (${error.status}): ${error.message}`);
      } else {
        console.error(error);
        this.app.handleError(error, `Delete failed for ${contactFullName}.`);
      }
    } finally {
      this.app.clearUserMessage();
    }
  }

  // -- ContactForm --
  #extractData(formData) {
    let data = Object.fromEntries(formData.entries());
    for (let key in data) {
      data[key] = data[key].trim();
    }
    let selectedTags = formData.getAll('selected-tags');
    let newTags = data['new-tags']
                  .split(',')
                  .map(tag => tag.trim().toLowerCase())
                  .filter(tag => tag); // this removes empty strings

    let allTags = [...new Set(selectedTags.concat(newTags))];

    data['tags'] = allTags;
    delete data['selected-tags'];
    delete data['new-tags'];
    return data;
  }

  #validateInputs(data) {
    let invalidEntries = [];

    const nameRgx = /^(?=.{2,50}$)[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
    const emailRgx = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
    const phoneRgx = /^(?=(?:.*\d){7,15}$)[+()\-.\s\d]+$/;
    const tagRgx = /^[A-Za-z]+$/;

    if (!data.full_name.match(nameRgx)) invalidEntries.push('Full name');
    if (data.email && !data.email.match(emailRgx)) invalidEntries.push('Email');
    if (data.phone_number && !data.phone_number.match(phoneRgx)) invalidEntries.push('Telephone number');
    if (data.tags.length !== 0 && !data.tags.every(tag => tag.match(tagRgx))) invalidEntries.push('Tag names');

    if (invalidEntries.length !== 0) {
      throw new ValidationError(`These fields have invalid values: ${invalidEntries.join(', ')}`, invalidEntries);
    }
  }

  #formatDataToSend(data) {
    if (data.tags.length === 0) {
      data['tags'] = null;
    } else {
      data.tags = data.tags.join(',');
    }
    return JSON.stringify(data);
  }

  #formatDataToSendWithId(data, contactId) {
    if (data.tags.length === 0) {
      data['tags'] = null;
    } else {
      data.tags = data.tags.join(',');
    }
    data.id = contactId;
    return JSON.stringify(data);
  }
}