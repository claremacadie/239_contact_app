export default class ContactList {
  constructor(app) {
      this.app = app;
      this.init();
  }

  init() {
      this.filteredContacts = this.app.allContacts;
      this.searchCriteria = {'full_name': '', 'tags': []};

      this.$buttonDiv = document.createElement('div');
      this.$addContactButton = document.createElement('button');
      this.$filterDiv = document.createElement('div');
      this.$searchInput = document.createElement('input');
      this.$tagsFieldset = document.createElement('fieldset');
      this.$listDiv = document.createElement("div");

      this.createHTML();
      this.populateHTML();
  }

  createHTML() {
      this.$buttonDiv.append(this.$addContactButton);
      this.$addContactButton.textContent = "Add Contact";
      
      this.$filterDiv.append( this.$searchInput, this.$tagsFieldset);

      this.$searchInput.className = 'search';
      this.$searchInput.setAttribute('type', 'text');
      this.$searchInput.setAttribute('placeholder', 'Search');
  }

  populateHTML() {
      this.populateTagsFieldset();
      this.displayContacts();
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

  displayContacts() {
      this.$listDiv.innerHTML = '';
      this.filteredContacts.forEach(contact => {
      this.$listDiv.append(contact.$li);
      });
  }

  filterContacts() {
      if (this.searchCriteria['full_name'] === '') {
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

  resetSearchCriteria() {
      this.searchCriteria = {'full_name': '', 'tags': []};
  }

  updateSearchTextCriteria() {
      let searchText = this.$searchInput.value.trim();
      this.searchCriteria['full_name'] = searchText;
  }

  updateTagSelectCriteria() {
      let selectedTags = [];
      [...this.$tagsFieldset.querySelectorAll('input')].forEach(checkbox => {
      if (checkbox.checked) selectedTags.push(checkbox.value);
      });

      this.searchCriteria['tags'] = selectedTags;
  }

  reloadContactList() {
      this.filteredContacts = this.app.allContacts;
      this.filterContacts();
      this.displayContacts();
  }
}
