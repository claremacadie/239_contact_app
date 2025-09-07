export default class Contact {
  constructor(obj) {
    this.id = obj.id;
    this.full_name = obj.full_name;
    this.email = obj.email;
    this.phone_number = obj.phone_number;
    this.tags = obj.tags === null ? [] : obj.tags.split(',');

    this.#init();
    this.#render();
  }

  #init() {
    this.$li = document.createElement('li');
    this.$nameH3 = document.createElement('h3');
    this.$contactDetailsDl = document.createElement('dl');
    this.$phoneDiv = document.createElement('div');
    this.$emailDiv = document.createElement('div');
    this.$tagsDiv  = document.createElement('div');
    this.$buttonsDiv = document.createElement('div');

    this.$phoneDd = this.#createField(this.$phoneDiv, 'Phone Number:');
    this.$emailDd = this.#createField(this.$emailDiv, 'Email:');
    this.$tagsDd  = this.#createField(this.$tagsDiv,  'Tags:');

    this.#createButtons();

    this.$li.append(this.$nameH3, this.$contactDetailsDl, this.$buttonsDiv);
    this.$contactDetailsDl.append(this.$phoneDiv, this.$emailDiv, this.$tagsDiv);
  }

  // ---------- public API ----------
  matchName(searchText) {
    return this.full_name
      .toLowerCase()
      .includes(String(searchText)
      .toLowerCase());
  }

  matchTags(tags) {
    let set = new Set(tags);
    for (let i = 0; i < this.tags.length; i++) {
      if (set.has(this.tags[i])) return true;
    }
    return false;
  }

  // ---------- private API ----------
  #render() {
    this.$li.dataset.contactId = this.id;
    this.$nameH3.textContent = this.full_name;
    this.$phoneDd.textContent = this.phone_number || 'None';
    this.$emailDd.textContent = this.email || 'None';
    this.$tagsDd.textContent  = this.tags.length === 0 ? 'None' : this.tags.join(', ');
  }

  // ---------- helpers ----------
  #createField(containerDiv, termText) {
    let dt = document.createElement('dt');
    dt.textContent = termText;
    let dd = document.createElement('dd');
    containerDiv.append(dt, dd);
    return dd;
  }

  #createButtons() {
    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit-contact');
    editButton.dataset.contactId = this.id;
    editButton.type = 'button';

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-contact');
    deleteButton.dataset.contactId = this.id;
    deleteButton.type = 'button';

    this.$buttonsDiv.append(editButton, deleteButton);
  }
}
