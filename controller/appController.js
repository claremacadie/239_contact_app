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
    let data = this.extractData(new FormData(this.$addContactForm));
    console.log(data);
    // try {
    //   this.validateInputs(data);  
    //   let dataToSend = this.formatDataToSend(data);
    //   let response = await new FetchData(dataToSend); // create new class
    //   // do something with response
    // } catch(error) {
    //   // do something with error
    // }
  }
  
  handleCancelButton(event) {
    event.preventDefault();
    this.contactList.resetSearchCriteria();
    this.contactList.reloadContactList();
  }

  extractData(formData) {
    let data = Object.fromEntries(formData.entries());
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
    // name: must be a string of letters
    // email: must match easy email regex
    // phone: must match easy phone number regex
    // tags: must be strings of letters
    // post messages if invalid, use a flag for whether data is valid?
  }

  formatDataToSend(data) {
    // change tags array to comma separated list
    // JSON.stringify
  }
}