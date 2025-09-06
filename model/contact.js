export default class Contact {
    constructor(obj) {
      this.id = obj['id'];
      this.full_name = obj['full_name'];
      this.email = obj['email'];
      this.phone_number = obj['phone_number'];
      this.tags = obj['tags'] === null ? [] : obj['tags'].split(',');
  
      this.init();
    }
  
    init() {
      this.$li = document.createElement('li');
      this.$nameH3 = document.createElement('h3');
      this.$contactDetailsDl = document.createElement('dl');
  
      this.$phoneDiv = document.createElement('div');
      this.$emailDiv = document.createElement('div');
      this.$tagsDiv = document.createElement('div');
  
      this.$buttonsDiv = document.createElement('div');
      this.$editButton = document.createElement('button');
      this.$deleteButton = document.createElement('button');
  
      this.createHTML();
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
      this.createInputDivHTML(this.$phoneDiv, 'Phone Number:')
      this.createInputDivHTML(this.$emailDiv, 'Email:')
      this.createInputDivHTML(this.$tagsDiv, 'Tags:')
  
      this.$contactDetailsDl.append(this.$phoneDiv, this.$emailDiv, this.$tagsDiv);
    }
  
    createInputDivHTML(div, dtText) {
      let dt = document.createElement('dt');
      dt.textContent = dtText;
      let dd = document.createElement('dd');
      div.append(dt, dd);
    }
  
    addButtonsDivHTML() {
      this.$editButton.textContent = 'Edit';
      this.$editButton.classList.add('edit-button');
      this.$deleteButton.textContent = 'Delete';
      this.$deleteButton.classList.add('delete-button');
      this.$buttonsDiv.append(this.$editButton, this.$deleteButton);
    }
  
    createHTML() {
      this.addContactDetailsDivHTML();
      this.addButtonsDivHTML();
      this.$li.append(this.$nameH3, this.$contactDetailsDl, this.$buttonsDiv);
    }
    
    populateHTML() {
      this.$li.dataset['contactId'] = this.id;
      this.$nameH3.textContent = this.full_name;
      this.$phoneDiv.querySelector('dd').textContent = this.phone_number || 'None';
      this.$emailDiv.querySelector('dd').textContent = this.email || 'None';
      this.$tagsDiv.querySelector('dd').textContent = this.tags.length === 0 ? 'None' : this.tags.join(', ');
    }
  }