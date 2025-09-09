Contact Manager
- Run front-end
  cd contact_manager_application
  python3 -m http.server 8080


- Open http://127.0.0.1:8080 in your browser.
  ⚠️ Don’t open index.html via Finder — ES modules won’t load with file://.


- Backend
  App expects a backend at:
  http://localhost:3000/api/contacts

  Make sure your server is running and reachable at that URL by going to contact_manager_node and running npm start.

- Notes
  Turn Live Server off in VS Code (status bar should show Go Live).
  If you see a CORS error, allow origin http://127.0.0.1:8080 on your backend.