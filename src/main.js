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
  - Contact
  - HTMLTemplate?
  - Form?
  - Search/Display contacts
  - Fetching data, inc error handling

To do:
  - Create add Contact functionality
    - fetch(send) data, error handling

  - Edit/Delete contact
    - Need to put id as data attribute somewhere in the Contact HTML
    - Beware using the same form for editing a contact because the `method` attribute is PUT, not POST

  - Error handling:
    - try/catch for all fetch
    - messages to user
      - when app does something, even involving another class, if an error message comes back, display it and tell user to refresh page?
      - messages about loading data?

  - When should data be fetched? What if other people are adding contacts?
    - Use setInterval to call every minute?
  - When should tagOptions be fetched? Especially for add contact form.
    - Every time data is fetched?
  - Use debounce?
  - Cancel requests if another one comes in?
*/

class Contact {
  constructor(obj) {
    this.id = obj['id'];
    this.name = obj['full_name'];
    this.email = obj['email'];
    this.phone = obj['phone-number'];
    this.tags = obj['tags'] === null ? [] : obj['tags'].split(',');
    this.init();
    this.populateHTML();
  }

  matchName(searchText) {
    return this.name.toLowerCase().match(searchText);
  }

  matchTags(tags) {
    for (let i = 0; i < this.tags.length; i++) {
      let tag = this.tags[i];
      if (tags.includes(tag)) return true;
    }
    return false;
  }

  addContactDetailsDivHTML() {
    this.$phoneDiv = document.createElement('div');
    this.addPhoneDivHTML();
    this.$emailDiv = document.createElement('div');
    this.addEmailDivHTML();
    this.$tagsDiv = document.createElement('div');
    this.addTagsDivHTML();
    this.$contactDetailsDl.append(this.$phoneDiv, this.$emailDiv, this.$tagsDiv);
  }

  addPhoneDivHTML() {
    this.$phoneDt = document.createElement('dt');
    this.$phoneDt.textContent = 'Phone Number:';
    this.$phoneDd = document.createElement('dd');
    this.$phoneDiv.append(this.$phoneDt, this.$phoneDd);
  }

  addEmailDivHTML() {
    this.$emailDt = document.createElement('dt');
    this.$emailDt.textContent = 'Email:';
    this.$emailDd = document.createElement('dd');
    this.$emailDiv.append(this.$emailDt, this.$emailDd);
  }

  addTagsDivHTML() {
    this.$tagsDt = document.createElement('dt');
    this.$tagsDt.textContent = 'Tags:';
    this.$tagsDd = document.createElement('dd');
    this.$tagsDiv.append(this.$tagsDt, this.$tagsDd);
  }

  addButtonsDivHTML() {
    this.$editButton = document.createElement('button');
    this.$editButton.textContent = 'Edit';
    this.$editButton.classList.add('edit-button');
    this.$deleteButton = document.createElement('button');
    this.$deleteButton.textContent = 'Delete';
    this.$deleteButton.classList.add('delete-button');
    this.$buttonsDiv.append(this.$editButton, this.$deleteButton);
  }

  populateHTML() {
    this.$li.dataset['contactId'] = this.id;
    this.$nameH3.textContent = this.name;
    this.$phoneDd.textContent = this.phone || 'None';
    this.$emailDd.textContent = this.email || 'None';
    this.$tagsDd.textContent = this.tags.length === 0 ? 'None' : this.tags.join(', ');
  }
  
  init() {
    this.$li = document.createElement('li');

    this.$nameH3 = document.createElement('h3');
    this.$contactDetailsDl = document.createElement('dl');
    this.addContactDetailsDivHTML();
    this.$buttonsDiv = document.createElement('div');
    this.addButtonsDivHTML();

    this.$li.append(this.$nameH3, this.$contactDetailsDl, this.$buttonsDiv);
  }
}

class ContactForm {
  constructor(app) {
    this.app = app;
    this.init();
  }

  createNameLabelHTML() {
    let nameLabel = document.createElement('label');
    nameLabel.textContent = "Full name:";
    let nameInput = document.createElement('input');
    nameInput.name = 'name';
    nameInput.setAttribute('type', 'text');
    nameLabel.append(nameInput);
    return nameLabel;
  }

  createEmailLabelHTML() {
    let emailLabel = document.createElement('label');
    emailLabel.textContent = "Email address:";
    let emailInput = document.createElement('input');
    emailInput.name = 'email';
    emailInput.setAttribute('type', 'email');
    emailLabel.append(emailInput);
    return emailLabel;
  }

  createPhoneLabelHTML() {
    let phoneLabel = document.createElement('label');
    phoneLabel.textContent = "Telephone number:";
    let phoneInput = document.createElement('input');
    phoneInput.name = 'phone';
    phoneInput.setAttribute('type', 'text');
    phoneLabel.append(phoneInput);
    return phoneLabel;
  }

  createTagsFieldsetHTML() {
    let tagsFieldset = document.createElement('fieldset');
    tagsFieldset.className = 'tags';
    
    let legend = document.createElement('legend');
    legend.textContent = 'Select tags:';
    tagsFieldset.append(legend);

    this.app.tagOptions.forEach(tagOption => {
      let label = document.createElement('label');
      let labelText = document.createTextNode(tagOption);
      let input = document.createElement('input');
      input.name = 'selected-tags';
      input.setAttribute('type', 'checkbox');
      // input.setAttribute('name', `selectedTag-${tagOption}`);
      input.setAttribute('value', tagOption);
      label.append(input, labelText);

      tagsFieldset.append(label);
    });

    return tagsFieldset;
  }

  createTagsLabelHTML() {
    let tagsLabel = document.createElement('label');
    tagsLabel.textContent = "Add new tags, comma-separated";
    let tagsInput = document.createElement('input');
    tagsInput.name = 'new-tags';
    tagsInput.setAttribute('type', 'text');
    tagsLabel.append(tagsInput);
    return tagsLabel;
  }

  createSubmitButtonHTML() {
    let submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.setAttribute('type', 'submit');
    return submitButton;
  }

  createFormHTML() {
    let nameLabel = this.createNameLabelHTML();
    let emailLabel = this.createEmailLabelHTML();
    let phoneLabel = this.createPhoneLabelHTML();
    let tagsFieldset = this.createTagsFieldsetHTML();
    let tagsLabel = this.createTagsLabelHTML();
    let submitButton = this.createSubmitButtonHTML();

    this.$cancelButton.textContent = 'Cancel';
    this.$cancelButton.setAttribute('type', 'button');

    this.$form.setAttribute('action', this.app.url);
    this.$form.setAttribute('method', 'POST');
    this.$form.append(nameLabel, emailLabel, phoneLabel, tagsFieldset, tagsLabel, submitButton, this.$cancelButton);
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

  sendData(data) {
    // use try/catch with fetch
    // post messages if fetch doesn't work
  }

  handleFormSubmit(event) {
    event.preventDefault();
    let data = this.extractData(new FormData(this.$form));

    // use a flag for whether data is valid? or put the rest in try/catch block?
    this.validateInputs(data);  
    let dataToSend = this.formatDataToSend(data);
    this.sendData(dataToSend);
  }
  
  handleCancelButton(event) {
    event.preventDefault();
    this.app.displayContactList();
  }
  
  init() {
    this.$form = document.createElement('form');
    this.$cancelButton = document.createElement('button');
    this.createFormHTML();
    this.bind();
  }
  
  bind() {
    this.$form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.$cancelButton.addEventListener('click', this.handleCancelButton.bind(this));
  }
}

class ContactList {
  constructor(app) {
    this.app = app;
    this.init();
  }

  async init() {
    this.filteredContacts = this.app.allContacts;
    this.searchCriteria = {'name': '', 'tags': []};

    this.$buttonDiv = document.createElement('div');
    this.$filterDiv = document.createElement('div');
    this.$listDiv = document.createElement("div");

    this.createButtonDivHTML();
    this.createFilterDivHTML();
    this.displayContacts();

    this.bind();
  }

  bind() {
    this.$addContactButton.addEventListener('click', this.handleAddContact.bind(this));
    this.$searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect.bind(this));
  }

  createButtonDivHTML() {
    this.$addContactButton = document.createElement('button');
    this.$addContactButton.textContent = "Add Contact";
    this.$buttonDiv.append(this.$addContactButton);
  }

  populateTagsFieldset() {
    this.$tagsFieldset.className = 'tags';
    
    let legend = document.createElement('legend');
    legend.textContent = 'Select tags:';
    this.$tagsFieldset.append(legend);

    this.app.tagOptions.forEach(tagOption => {
      let label = document.createElement('label');
      let labelText = document.createTextNode(tagOption);
      let input = document.createElement('input');
      input.setAttribute('type', 'checkbox');
      input.setAttribute('name', 'tags');
      input.setAttribute('value', tagOption);
      label.append(input, labelText);

      this.$tagsFieldset.append(label);
    });
  }

  createFilterDivHTML() {
    this.$searchInput = document.createElement('input');
    this.$searchInput.className = 'search';
    this.$searchInput.setAttribute('type', 'text');
    this.$searchInput.setAttribute('placeholder', 'Search');

    this.$tagsFieldset = document.createElement('fieldset');
    this.populateTagsFieldset();
    this.$filterDiv.append( this.$searchInput, this.$tagsFieldset);
  }

  displayContacts() {
    this.$listDiv.innerHTML = '';
    this.filteredContacts.forEach(contact => {
      this.$listDiv.append(contact.$li);
    });
  }

  filterContacts() {
    if (this.searchCriteria['name'] === '') {
      this.filteredContacts = this.app.allContacts;
    } else {
      this.filteredContacts = this.app.allContacts.filter(contactObj => contactObj.matchName(this.searchCriteria['name']));
    }

    if (this.searchCriteria['tags'].length === 0) {
      return;
    } else {
      this.filteredContacts = this.filteredContacts.filter(contactObj => contactObj.matchTags(this.searchCriteria['tags']));
    }
  }

  redisplayContactList() {
    this.filteredContacts = this.app.allContacts;
    this.searchCriteria = {'name': '', 'tags': []};
    this.displayContacts();
  }

  handleAddContact(event) {
    event.preventDefault();
    this.app.displayContactForm();
  }

  handleSearch(event) {
    event.preventDefault();
    
    let searchText = this.$searchInput.value.trim();
    this.searchCriteria['name'] = searchText;
    this.filterContacts();
    this.displayContacts();
  }

  handleTagSelect(event) {
    event.preventDefault();

    let selectedTags = [];
    [...this.$tagsFieldset.querySelectorAll('input')].forEach(checkbox => {
      if (checkbox.checked) selectedTags.push(checkbox.value);
    });

    this.searchCriteria['tags'] = selectedTags;
    this.filterContacts();
    this.displayContacts();
  }
}

class App {
  constructor(url) {
    this.url = url;
    this.init();
  }

  async init() {
    this.allContacts = await this.getAllContacts();
    this.tagOptions = this.getTagOptions();

    this.contactList = new ContactList(this);
    this.$contactInterfaceDiv = document.getElementById("contact-interface");
    this.$contactInterfaceDiv.append(this.contactList.$buttonDiv, this.contactList.$filterDiv, this.contactList.$listDiv);

    this.contactForm = new ContactForm(this);
    this.$contactFormDiv = document.getElementById('contact-form');
    this.$contactFormDiv.append(this.contactForm.$form);
    this.$contactFormDiv.classList.add('hidden');
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");

    // Use this for debugging: this.$userMessage.textContent
  }

  async fetchContacts() {
    let path = "/contacts";
    try {
      let response = await fetch(this.url + path);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      let contacts = await response.json();
      return contacts;
    } catch(error) {
      console.log(error)
    }
  }

  async getAllContacts() {
    let contactsArr = await this.fetchContacts();
    return contactsArr.map(contact => new Contact(contact));
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

function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener("DOMContentLoaded", main);
