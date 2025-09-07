export default class ContactForm {
  constructor(app) {
    this.app = app;
    this.#init();
  }

  #init() {
    this.$form = document.createElement('form');
    this.$submitButton = document.createElement('button');
    this.$updateButton = document.createElement('button');
    this.$cancelButton = document.createElement('button');
    this.$nameInput = document.createElement('input');
    this.$emailInput = document.createElement('input');
    this.$phoneInput = document.createElement('input');
    this.$tagsFieldset = document.createElement('fieldset');

    this.#createHTML();
    this.#configureHTML();
  }

  // ---------- public API ----------
  renderTagOptions() {
    this.$tagsFieldset.innerHTML = '';
    const legend = document.createElement('legend');
    legend.textContent = 'Select tags:';
    this.$tagsFieldset.append(legend);

    this.app.tagOptions.forEach(tag => {
      const label = document.createElement('label');
      const text  = document.createTextNode(tag);
      const input = document.createElement('input');
      input.name = 'selected-tags';
      input.type = 'checkbox';
      input.value = tag;
      label.append(input, text);
      this.$tagsFieldset.append(label);
    });
  }

  displayAddMode() {
    this.$updateButton.classList.add('hidden');
    this.$submitButton.classList.remove('hidden');
  }

  displayEditMode(contact) {
    this.$updateButton.dataset.contactId = contact.id;
    this.$nameInput.value = contact.full_name;
    this.$emailInput.value = contact.email;
    this.$phoneInput.value = contact.phone_number;

    let checkboxes = this.$tagsFieldset.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(tagInput => { 
      if (contact.tags.includes(tagInput.value)) tagInput.checked = true; 
    });

    this.$updateButton.classList.remove('hidden');
    this.$submitButton.classList.add('hidden');
  }

  // ---------- private API ----------
  #createHTML() {
    const [nameLabel, emailLabel, phoneLabel] = this.#createInputFields();
    const tagsLabel = this.#createTagsSection();

    this.$form.append(
      nameLabel,
      emailLabel,
      phoneLabel,
      this.$tagsFieldset,
      tagsLabel,
      this.$submitButton,
      this.$updateButton,
      this.$cancelButton
    );
  }

  #configureHTML() {
    this.$submitButton.textContent = 'Submit';
    this.$submitButton.type = 'submit';

    this.$updateButton.textContent = 'Update Contact';
    this.$updateButton.type = 'button';
    this.$updateButton.classList.add('hidden');

    this.$cancelButton.textContent = 'Cancel';
    this.$cancelButton.type = 'button';

    this.$form.action = this.app.url;
    this.$form.method = 'POST';
  }

  // ---------- helpers ----------
  #createInputFields() {
    const nameLabel  = this.#createLabeledInput(this.$nameInput,  'Full name:',        'full_name',   'text', true);
    const emailLabel = this.#createLabeledInput(this.$emailInput, 'Email address:',    'email',       'email');
    const phoneLabel = this.#createLabeledInput(this.$phoneInput, 'Telephone number:', 'phone_number','text');
    return [nameLabel, emailLabel, phoneLabel];
  }

  #createTagsSection() {
    this.$tagsFieldset.className = 'tags';
    this.renderTagOptions();
    return this.#createNewTagsInput();
  }

  #createLabeledInput($input, labelText, name, type, required = false) {
    const label = document.createElement('label');
    label.textContent = labelText;
    $input.name = name;
    $input.type = type;
    if (required) $input.required = true;
    label.append($input);
    return label;
  }

  #createNewTagsInput() {
    const label = document.createElement('label');
    label.textContent = 'Add new tags, comma-separated';
    const input = document.createElement('input');
    input.name = 'new-tags';
    input.type = 'text';
    label.append(input);
    return label;
  }
}
