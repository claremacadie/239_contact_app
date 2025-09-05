export default class ContactForm {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    this.$form = document.createElement('form');
    this.$cancelButton = document.createElement('button');

    this.createHTML();
    this.populateHTML();
  }

  createHTML() {
    let nameLabel = this.createLabelHTML("Full name:", 'full_name', 'text');
    let emailLabel = this.createLabelHTML("Email address:", 'email', 'email');
    let phoneLabel = this.createLabelHTML("Telephone number:", 'phone_number', 'text');
    let tagsFieldset = this.createTagsFieldsetHTML();
    let tagsLabel = this.createTagsLabelHTML();
    let submitButton = this.createSubmitButtonHTML();

    this.$form.append(nameLabel, emailLabel, phoneLabel, tagsFieldset, tagsLabel, submitButton, this.$cancelButton);
  }

  populateHTML() {
    this.$cancelButton.textContent = 'Cancel';
    this.$cancelButton.setAttribute('type', 'button');

    this.$form.setAttribute('action', this.app.url);
    this.$form.setAttribute('method', 'POST');
  }

  createLabelHTML(labelText, inputName, inputType) {
    let label = document.createElement('label');
    label.textContent = labelText;
    let input = document.createElement('input');
    input.name = inputName;
    input.setAttribute('type', inputType);
    if (inputName === 'full_name') input.required = true;
    label.append(input);
    return label;
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
}
