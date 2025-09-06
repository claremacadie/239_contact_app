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

    this.contactDBAPI = this.app.contactDBAPI;
  }

  bind() {
    this.$addContactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.$cancelAddContactButton.addEventListener('click', this.handleCancelButton.bind(this));

    this.$addContactButton.addEventListener('click', this.handleAddContact.bind(this));
    this.$searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect.bind(this));
  }

  handleAddContact(event) {
    event.preventDefault();
    this.app.displayContactForm();
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
    // debugging
    // console.log('SUBMIT', { defaultPrevented: event.defaultPrevented, target: event.target });

    let data = this.extractData(new FormData(this.$addContactForm));
    try {
      this.validateInputs(data);  
      let dataToSend = this.formatDataToSend(data);
      console.log(dataToSend)
      let response = await this.contactDBAPI.postNewContactData(dataToSend);
      console.log(response);
      // user message to say contact was added - might be nice to have their name
      this.app.$userMessage.textContent = `New contact added: ${response.full_name}`;
      this.app.displayContactList();
    } catch(error) {
      console.log(error.message);
      this.app.$errorMessage.textContent = error.message;
    }
  }
  
  handleCancelButton(event) {
    event.preventDefault();
    this.contactList.resetSearchCriteria();
    this.contactList.reloadContactList();
    this.app.displayContactList();
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
    data.tags = data.tags.join(', ');
    return JSON.stringify(data);
  }
}