/*
Contact list:
    - edit: navigate to form
    - delete: alert are you sure you want to delete the contact? Ok, Cancel
    - use debounce to prevent overwhelm

Alternative view:
  Create Contact Form:
    - Form: Full name, Email address, Telephone number, Tags (checkboxes and add new) submit, cancel
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
    - Ensure new tags are lowercase

  - Beware using the same form for editing a contact because the `method` attribute is PUT, not POST
 
  - Create class for contact interface

  - When should data be fetched? What if other people are adding contacts?
  - When should tagOptions be fetched? Especially for add contact form.

  - Error handling:
    - try/catch for all fetch
    - messages to user
  - App class: bind is inside init because init has an await call and bind() can't happen until element is created, and actually, you don't want to trigger the listener until the data has returned.

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
  constructor(url, tagOptions) {
    this.url = url;
    this.tagOptions = tagOptions;
    this.init();
  }

createFormHTML() {
  let nameLabel = document.createElement('label');
  nameLabel.textContent = "Full name:";
  let nameInput = document.createElement('input');
  nameInput.setAttribute('type', 'text');
  nameLabel.append(nameInput);

  let emailLabel = document.createElement('label');
  emailLabel.textContent = "Email address:";
  let emailInput = document.createElement('input');
  emailInput.setAttribute('type', 'email');
  emailLabel.append(emailInput);

  let phoneLabel = document.createElement('label');
  phoneLabel.textContent = "Telephone number:";
  let phoneInput = document.createElement('input');
  phoneInput.setAttribute('type', 'text');
  phoneLabel.append(phoneInput);

  let tagsFieldset = document.createElement('fieldset');
  tagsFieldset.className = 'tags';
    
  let legend = document.createElement('legend');
  legend.textContent = 'Select tags:';
  tagsFieldset.append(legend);

  this.tagOptions.forEach(tagOption => {
    let label = document.createElement('label');
    let labelText = document.createTextNode(tagOption);
    let input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('name', 'tags');
    input.setAttribute('value', tagOption);
    label.append(input, labelText);

    tagsFieldset.append(label);
  });

  let tagsLabel = document.createElement('label');
  tagsLabel.textContent = "Add new tags, comma-separated";
  let tagsInput = document.createElement('input');
  tagsInput.setAttribute('type', 'text');
  tagsLabel.append(tagsInput);

  let submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.setAttribute('type', 'submit');

  this.$cancelButton.textContent = 'Cancel';
  submitButton.setAttribute('type', 'button');

  this.$form.setAttribute('action', this.url);
  this.$form.setAttribute('method', 'POST');
  this.$form.append(nameLabel, emailLabel, phoneLabel, tagsFieldset, tagsLabel, submitButton, this.$cancelButton);
}

  init() {
    this.$form = document.createElement('form');
    this.$cancelButton = document.createElement('button');
    this.createFormHTML();
    // bind listeners for form and cancel button
  }
}

class App {
  constructor(url) {
    this.url = url;
    this.init();
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

  getTagOptions() {
    return this.allContacts.reduce((tagOptions, contact) => {
      contact.tags.forEach(tag => {
        if (!tagOptions.includes(tag)) tagOptions.push(tag);
      });
      return tagOptions;
    }, []).sort();
  }

  async getAllContacts() {
    let contactsArr = await this.fetchContacts();
    return contactsArr.map(contact => new Contact(contact));
  }

  displayContacts() {
    this.$contactListDiv.innerHTML = '';
    this.filteredContacts.forEach(contact => {
      this.$contactListDiv.append(contact.$li);
    });
  }

  populateTagsFieldset() {
    this.$tagsFieldset.className = 'tags';
    
    let legend = document.createElement('legend');
    legend.textContent = 'Select tags:';
    this.$tagsFieldset.append(legend);

    this.tagOptions.forEach(tagOption => {
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

  populateControlsDiv() {
    this.$contactControlsDiv.append( this.$searchInput, this.$tagsFieldset);
  }

  populateButtonsDiv() {
    this.$contactButtonsDiv.append(this.$addContactButton);
  }

  createButtonsDivHTML() {
    this.$addContactButton = document.createElement('button');
    this.$addContactButton.textContent = "Add Contact";
    this.populateButtonsDiv();
  }

  createControlsDivHTML() {
    this.$searchInput = document.createElement('input');
    this.$searchInput.className = 'search';
    this.$searchInput.setAttribute('type', 'text');
    this.$searchInput.setAttribute('placeholder', 'Search');

    this.$tagsFieldset = document.createElement('fieldset');
    this.populateTagsFieldset();

    this.populateControlsDiv();
  }

  async init() {
    this.allContacts = await this.getAllContacts();
    this.filteredContacts = this.allContacts;
    this.tagOptions = this.getTagOptions();
    this.searchCriteria = {'name': '', 'tags': []};
    this.contactForm = new ContactForm(this.url, this.tagOptions);

    this.$contactControlsDiv = document.getElementById("contacts-controls");
    this.$contactButtonsDiv = document.getElementById("contacts-buttons");
    this.$contactListDiv = document.getElementById("contacts-list");
    this.$contactFormDiv = document.getElementById('contact-form')
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");

    this.createButtonsDivHTML();
    this.createControlsDivHTML();
    this.displayContacts(this.allContacts);

    this.bind();
  }

  filterContacts() {
    if (this.searchCriteria['name'] === '') {
      this.filteredContacts = this.allContacts;
    } else {
      this.filteredContacts = this.allContacts.filter(contactObj => contactObj.matchName(this.searchCriteria['name']));
    }

    if (this.searchCriteria['tags'].length === 0) {
      return;
    } else {
      this.filteredContacts = this.filteredContacts.filter(contactObj => contactObj.matchTags(this.searchCriteria['tags']));
    }
  }

  populateContactForm() {
    this.$contactFormDiv.append(this.contactForm.$form);
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

  handleAddContact(event) {
    event.preventDefault();
    this.$contactButtonsDiv.innerHTML = '';
    this.$contactControlsDiv.innerHTML = '';
    this.$contactListDiv.innerHTML = '';
    this.populateContactForm();
  }
  
  bind() {
    this.$searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect.bind(this));
    this.$addContactButton.addEventListener('click', this.handleAddContact.bind(this));
    // Use this for debugging: this.$userMessage.textContent
  }
}

function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener("DOMContentLoaded", main);