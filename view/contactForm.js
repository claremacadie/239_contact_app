export default class ContactForm {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    this.$form = document.createElement('form');
    this.$submitButton = document.createElement('button');
    this.$updateButton = document.createElement('button');
    this.$cancelButton = document.createElement('button');
    this.$nameInput = document.createElement('input');
    this.$emailInput = document.createElement('input');
    this.$phoneInput = document.createElement('input');
    this.$tagsFieldset = document.createElement('fieldset');

    this.createHTML();
    this.populateHTML();
  }

  createHTML() {
    let nameLabel = this.createLabelHTML(this.$nameInput, "Full name:", 'full_name', 'text');
    let emailLabel = this.createLabelHTML(this.$emailInput, "Email address:", 'email', 'email');
    let phoneLabel = this.createLabelHTML(this.$phoneInput, "Telephone number:", 'phone_number', 'text');
    this.$tagsFieldset.className = 'tags';
    this.populateTagsFieldsetHTML();
    let tagsLabel = this.createTagsLabelHTML();

    this.$form.append(nameLabel, emailLabel, phoneLabel, this.$tagsFieldset, tagsLabel, this.$submitButton, this.$updateButton, this.$cancelButton);
  }

  populateHTML() {
    this.$submitButton.textContent = 'Submit';
    this.$submitButton.setAttribute('type', 'submit');
    this.$updateButton.textContent = 'Update Contact';
    this.$updateButton.setAttribute('type', 'button');
    this.$updateButton.classList.add('hidden');
    this.$cancelButton.textContent = 'Cancel';
    this.$cancelButton.setAttribute('type', 'button');

    this.$form.setAttribute('action', this.app.url);
    this.$form.setAttribute('method', 'POST');
  }

  createLabelHTML($input, labelText, inputName, inputType) {
    let label = document.createElement('label');
    label.textContent = labelText;
    $input.name = inputName;
    $input.setAttribute('type', inputType);
    if (inputName === 'full_name') $input.required = true;
    label.append($input);
    return label;
  }

  populateTagsFieldsetHTML() {
    this.$tagsFieldset.innerHTML = '';
    let legend = document.createElement('legend');
    legend.textContent = 'Select tags:';
    this.$tagsFieldset.append(legend);

    this.app.tagOptions.forEach(tagOption => {
      let label = document.createElement('label');
      let labelText = document.createTextNode(tagOption);
      let input = document.createElement('input');
      input.name = 'selected-tags';
      input.setAttribute('type', 'checkbox');
      input.setAttribute('value', tagOption);
      label.append(input, labelText);

      this.$tagsFieldset.append(label);
    });
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

  setFormToAddContact() {
    this.$updateButton.classList.add('hidden');
    this.$submitButton.classList.remove('hidden');
  }

  setFormToEditContact(contact) {
    this.$updateButton.dataset.contactId = contact.id;
    this.$nameInput.value = contact.full_name;
    this.$emailInput.value = contact.email;
    this.$phoneInput.value = contact.phone_number;

    [...this.$tagsFieldset.querySelectorAll('input')].forEach(tagInput => {
      if (contact.tags.includes(tagInput.value)) tagInput.checked = true;
    });

    this.$updateButton.classList.remove('hidden');
    this.$submitButton.classList.add('hidden');
  }
}
