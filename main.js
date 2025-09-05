/*
Contact list:
  - edit: navigate to form
  - delete: alert are you sure you want to delete the contact? Ok, Cancel
  - use debounce to prevent overwhelm

Alternative view:
  Create Contact Form:
    - ensure valid inputs
    - ensure unique name, email and telephone

Edit Contact Form:
  - as above, but with fields filled in

Classes:
  - App
  - Controller
  - ContactDBAPI
  - Contact
  - ContactList
  - ContactForm
  - FetchData
  - HTMLTemplate?

To do:
- Move classes to files/modules
  - debounce.js: export obj = {};
  - main.js: import obj from './debounce.js';

- Create add Contact functionality
    - fetch(send) data, error handling

  - Edit/Delete contact
    - Need to put id as data attribute somewhere in the Contact HTML
    - Beware using the same form for editing a contact because the `method` attribute is PUT, not POST

  - When should data be fetched? What if other people are adding contacts?
    - Use setInterval to call every minute?
  - When should tagOptions be fetched? Especially for add contact form.
    - Every time data is fetched?
  - Use debounce?
  - Cancel requests if another one comes in?

  - Which classes actually need the url?
*/

import App from './controller/app.js';

function main() {
  let url = "http://localhost:3000/api";
  let app = new App(url);
}

document.addEventListener("DOMContentLoaded", main);
