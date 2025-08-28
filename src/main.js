/*
Home page view:
  Add Contact button:
    Form: name, phone number, email, tag

  Search input box:
    - Search name only
    - Dynamically specify results in list
      - name, phone, email, edit, delete
    - delete: alert are you sure you want to delete the contact? Ok, Cancel
    - use debounce to prevent overwhelm

  Tag box:
    - radio buttons so can select multiple

  List:
    - all contacts initially
    - dynamically change with search
    - change when selected tags

Alternative view:
  Create Contact Form:
    - Form: Full name, Email address, Telephone number, Tags (multiple, radio) submit, cancel
    - ensure valid inputs
    - ensure unique name, email and telephone

  Edit Contact Form:
    - as above, but with fields filled in

Decisions:
  - HTML in file and hide?
  - Dynamically create HTML - do this because it is harder?
  - Error handling:
    - try/catch for fetch
    - messages to user

Classes:
  - App
  - HTMLTemplate
  - Form

To do:
  - Add CSS whitespace reset
  - Decide if tags are free text? How will I get a list of them all? Don't over-complicate
  - Search box: ensure Search is grey

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

    this.$phoneDiv = document.createElement('div');
    this.$phoneDt = document.createElement('dt');
    this.$phoneDt.textContent = 'Phone Number:';
    this.$phoneDd = document.createElement('dd');
    this.$phoneDiv.append(this.$phoneDt, this.$phoneDd);
    
    this.$emailDiv = document.createElement('div');
    this.$emailDt = document.createElement('dt');
    this.$emailDt.textContent = 'Email:';
    this.$emailDd = document.createElement('dd');
    this.$emailDiv.append(this.$emailDt, this.$emailDd);
    
    this.$tagsDiv = document.createElement('div');
    this.$tagsDt = document.createElement('dt');
    this.$tagsDt.textContent = 'Tags:';
    this.$tagsDd = document.createElement('dd');
    this.$tagsDiv.append(this.$tagsDt, this.$tagsDd);

    this.$contactDetailsDl.append(this.$phoneDiv, this.$emailDiv, this.$tagsDiv);

    this.$editButton = document.createElement('button');
    this.$editButton.textContent = 'Edit';
    this.$editButton.classList.add('edit-button');
    this.$deleteButton = document.createElement('button');
    this.$deleteButton.textContent = 'Delete';
    this.$deleteButton.classList.add('delete-button');

    this.$li.append(this.$nameH3, this.$contactDetailsDl, this.$editButton, this.$deleteButton);
  }
}

class App {
  constructor(url) {
    this.url = url;
    this.init();
  }

  async fetchContacts() {
    let path = '/contacts';
    try {
      let response = await fetch(this.url + path);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      let contacts = await response.json();
      return contacts;
    } catch(error) {
      console.log(error)
    }
  }

  async createContactsObj() {
    let contactsArr = await this.fetchContacts();
    return contactsArr.map(contact => new Contact(contact));
  }

  displayAllContacts() {
    this.contactsObj.forEach(contact => {
      this.$contactListDiv.append(contact.$li);
    });
  }

  async init() {
    this.$addContactButton = document.getElementById("add-contact");
    this.$searchInput = document.getElementById("search-contacts");
    this.$contactListDiv = document.getElementById("contact-list");
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");
    this.contactsObj = await this.createContactsObj();
    this.displayAllContacts();;
  }
}


function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener('DOMContentLoaded', main);