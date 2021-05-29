# CAMCaching

Website online at: https://camcaching.web.app/

Add new locations at: https://camcaching.web.app/admin

To run locally, `firebase emulators:start` and go to the indicated `Hosting` site (usually `localhost:5000`).

# TODO:

- Rules
- instructions/about section
- scoreboard
- donate section - maybe stripe?
- images slideshow
- interactive heatmap for caches found (~ interactive - currently set to a simple heatmap indicating zone popularity)
- location deletion
- locations checklist ("/checklist" page with 2 options: enter location ID (input field) + button to load checklist (redirects url to /checklist?id="...") or create new checklist - gen UUID or create a new firestore checklists entry)

# Done: 

- Locations display
- Locations search
- Responsive design
- Basic header + footer
- Basic scoreboard
- Basic heatmap
- Admin page with location input form
- Location edit form
- Tags
