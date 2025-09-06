export default class AppController {
  constructor(app) {
    this.app = app;
    this.init();
    this.bind();
  }

  init() {
    this.contactForm = this.app.contactForm;
    this.$addContactForm = this.contactForm.$form;
    this.$cancelAddContactButton = this.contactForm.$cancelButton;

    this.contactList = this.app.contactList;
    this.$addContactButton = this.contactList.$addContactButton;
    this.$searchInput = this.contactList.$searchInput;
    this.$tagsFieldset = this.contactList.$tagsFieldset;
    this.$contactListDiv = this.contactList.$listDiv;

    this.contactDBAPI = this.app.contactDBAPI;
  }

  bind() {
    this.$addContactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.$cancelAddContactButton.addEventListener('click', this.handleCancelButton.bind(this));

    this.$addContactButton.addEventListener('click', this.handleAddContact.bind(this));
    this.$searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect.bind(this));

    this.$contactListDiv.addEventListener('click', this.handleContactListClick.bind(this));
  }

  handleContactListClick(event) {
    let target = event.target;

    if (target.nodeName === 'BUTTON') {
      event.preventDefault();
      let contactId = target.dataset.contactId;
      if (target.classList.contains('edit-contact')) this.app.displayEditContactForm(contactId);
      if (target.classList.contains('delete-contact')) this.deleteContact(contactId);
    }
  }

  handleAddContact(event) {
    event.preventDefault();
    this.app.displayAddContactForm();
  }

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
  
  async handleFormSubmit(event) {
    event.preventDefault();
    let data = this.extractData(new FormData(this.$addContactForm));
    try {
      this.validateInputs(data);  
      let dataToSend = this.formatDataToSend(data);
      let response = await this.contactDBAPI.postNewContactData(dataToSend);
      this.contactForm.$form.reset();
      this.app.$userMessage.textContent = `New contact added: ${response.full_name}`;
      await this.app.resetContactListDisplay();
    } catch(error) {
      console.log(error.message);
      this.app.$errorMessage.textContent = error.message;
    }
  }
  
  async handleCancelButton(event) {
    event.preventDefault();
    this.contactForm.$form.reset();
    await this.app.resetContactListDisplay();
  }

  extractData(formData) {
    let data = Object.fromEntries(formData.entries());
    for (let key in data) {
      data[key] = data[key].trim();
    }
    let selectedTags = formData.getAll('selected-tags');
    let newTags = data['new-tags']
                  .split(',')
                  .map(tag => tag.trim().toLowerCase())
                  .filter(tag => tag);
    
    let allTags = [... new Set(selectedTags.concat(newTags))];

    data['tags'] = allTags;
    delete data['selected-tags'];
    delete data['new-tags'];
    return data;
  }

  validateInputs(data) {
    let invalidEntries = [];

    const namePattern = /^(?=.{2,50}$)[A-Za-z][A-Za-z .'-]*[A-Za-z]$/;
    const emailPattern = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
    const phonePattern = /^(?=(?:.*\d){7,15}$)[+()\-.\s\d]+$/;
    const tagPattern = /^[A-Za-z]+$/;

    if (!data.full_name.match(namePattern)) invalidEntries.push('Full name');
    if (data.email && !data.email.match(emailPattern)) invalidEntries.push('Email');
    if (data.phone_number && !data.phone_number.match(phonePattern)) invalidEntries.push('Telephone number');
    if (!data.tags.every(tag => tag.match(tagPattern))) invalidEntries.push('Tag names');

    if (invalidEntries.length !== 0) {
      throw new Error(`These fields have invalid values: ${invalidEntries.join(', ')}`);
    }
  }

  formatDataToSend(data) {
    if (data.tags.length === 0) {
      delete data.tags;
    } else {
      data.tags = data.tags.join(', ');
    }
    return JSON.stringify(data);
  }

  async deleteContact(contactId) {
    let contactFullName = this.app.allContacts.find(contact => Number(contactId) === Number(contact.id)).full_name;

    if (!confirm(`Are you sure you want to delete: ${contactFullName}`)) return;
    try {
      await this.contactDBAPI.deleteContact(contactId);
      this.app.$userMessage.textContent = `${contactFullName} has been deleted.`
      await this.app.resetContactListDisplay();
    } catch(error) {
      this.app.$errorMessage.textContent = `Delete failed for contact id = ${contactId}: ${error.message}`;
    }
  }
}