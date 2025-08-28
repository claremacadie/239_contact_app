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
  - Contact
  - HTMLTemplate?
  - Form?

To do:
  - Ensure new tags are lowercase
  - Decide if tags are free text? How will I get a list of them all? Don't over-complicate: radio button, or add new
  - HTML class?

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
    return this.contactsObj.reduce((tagOptions, contact) => {
      contact.tags.forEach(tag => {
        if (!tagOptions.includes(tag)) tagOptions.push(tag);
      });
      return tagOptions;
    }, []).sort();
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

  populateTagsDivHTML() {
    // use this.tagOptions to create
      //     <fieldset>
      //   <legend>Extras (choose any)</legend>
      //   <label><input type="checkbox" name="extras" value="gift-wrap"> Gift wrap</label>
      //   <label><input type="checkbox" name="extras" value="note"> Handwritten note</label>
      //   <label><input type="checkbox" name="extras" value="rush"> Rush handling</label>
      // </fieldset>
  }

  populateButtonsDivHTML() {
    this.$addContactButton = document.createElement('button');
    this.$addContactButton.textContent = "Add Contact";

    this.$searchInput = document.createElement('input');
    this.$searchInput.setAttribute('type', 'text');
    this.$searchInput.setAttribute('placeholder', 'Search');

    this.$tagsDiv = document.createElement('div');
    this.populateTagsDivHTML();

    this.$buttonsDiv.append(this.$addContactButton, this.$searchInput, this.$tagsDiv);
  }

  async init() {
    this.contactsObj = await this.createContactsObj();
    this.tagOptions = this.getTagOptions();
    console.log(this.tagOptions)

    this.$buttonsDiv = document.getElementById("buttons");
    this.populateButtonsDivHTML();
    this.$contactListDiv = document.getElementById("contact-list");
    this.$userMessage = document.getElementById("user-message");
    this.$errorMessage = document.getElementById("error-message");

    this.displayAllContacts();
  }
}

function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener("DOMContentLoaded", main);