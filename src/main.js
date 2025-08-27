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
  - Search box: ensure Search is grey

  <button id="add-contact">Add Contact</button>
      <input id="search-contacts" name="name" type="text" placeholder="Search">
      <div id="contact-list"></div>
*/

class App {
  constructor(url) {
    this.url = url;
    this.init();
  }

  init() {
    this.$addContactButton = document.getElementById("add-contact");
    this.$searchInput = document.getElementById("search-contacts");
    this.$contactListDiv = document.getElementById("contact-list");
  }
}


function main() {
  let url = "http://localhost:3000/";
  let app = new App(url);
  console.log(app.$addContactButton, app.$contactListDiv, app.$searchInput)
}

document.addEventListener('DOMContentLoaded', main);