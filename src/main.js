/*
Home page view:
  Add Contact button:
    Form: name, phone number, email, tag (checkboxes and free text for new tag)

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
  - Filtering
    - what if we want to select all contacts without tags? Add 'No tags' radio box
    - what does the user expect? Should we have a 'No preference for tags' option as the default?
    - at the moment, when I deselect all tags nothing is listed....
  - Ensure both filters work together

  - CSS to add space between Phone Number: etc.

  - Ensure new tags are lowercase
  - HTML class?
  - When should data be fetched? What if other people are adding contacts?
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

  displayContacts(contactsList) {
    this.$contactListDiv.innerHTML = '';
    contactsList.forEach(contact => {
      this.$contactListDiv.append(contact.$li);
    });
  }

  populateTagsFieldsetHTML() {
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

  populateButtonsDivHTML() {
    this.$addContactButton = document.createElement('button');
    this.$addContactButton.textContent = "Add Contact";

    this.$searchInput = document.createElement('input');
    this.$searchInput.className = 'search';
    this.$searchInput.setAttribute('type', 'text');
    this.$searchInput.setAttribute('placeholder', 'Search');

    this.$tagsFieldset = document.createElement('fieldset');
    this.populateTagsFieldsetHTML();

    this.$buttonsDiv.append(this.$addContactButton, this.$searchInput, this.$tagsFieldset);
  }

  async init() {
    this.allContacts = await this.getAllContacts();
    this.filteredContacts = this.allContacts;
    this.tagOptions = this.getTagOptions();

    this.$buttonsDiv = document.getElementById("buttons");
    this.populateButtonsDivHTML();
    this.$contactListDiv = document.getElementById("contact-list");
    this.$userMessage = document.getElementById("user-message");

    this.$errorMessage = document.getElementById("error-message");
    
    this.displayContacts(this.allContacts);
    
    this.bind();
  }

  filterContacts(searchObj) {
    if (Object.keys(searchObj).includes('searchName')) {
      return this.allContacts.filter(contactObj => contactObj.matchName(searchObj['searchName']));
    }

    if (Object.keys(searchObj).includes('tags')) {
      return this.allContacts.filter(contactObj => contactObj.matchTags(searchObj['tags']));
    }
  }
  
  handleSearch(event) {
    event.preventDefault();
    
    let searchText = this.$searchInput.value.trim();
    this.filteredContacts = this.filterContacts({'searchName': searchText});
    this.displayContacts(this.filteredContacts);
  }

  handleTagSelect(event) {
    event.preventDefault();

    let selectedTags = [];
    [...this.$tagsFieldset.querySelectorAll('input')].forEach(checkbox => {
      if (checkbox.checked) selectedTags.push(checkbox.value);
    });

    this.filteredContacts = this.filterContacts({'tags': selectedTags});
    this.displayContacts(this.filteredContacts);
  }
  
  bind() {
    this.$searchInput.addEventListener('input', this.handleSearch.bind(this));
    this.$tagsFieldset.addEventListener('change', this.handleTagSelect.bind(this));
    // To do:
      // Refactor initial state to use this.searchCriteria = {name: '', tags: []}
      // Update event listeners to:
        // change state, 
        // refilter:
          // if name blank, set filtered to all, then filter by tags (if no tags, no nothing)
          // otherwise, set filtered to those that match name, then filter by tags (if no tags, no nothing)
        // redisplay filtered

    // Use this for debugging: this.$userMessage.textContent
  }
}

function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener("DOMContentLoaded", main);