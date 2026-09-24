# MediGo Frontend

MediGo is a mobile-friendly healthcare discovery website. It helps people find hospitals, compare options, estimate treatment costs, review scheme information, and open emergency guidance.

## Run it

The backend also serves the website, so the easiest local setup is in [the backend README](../MediGo-Backend/README.md). After starting the backend, open `http://localhost:3000`.

You can also preview the website files without the API:

```sh
cd MediGo-Frontend
python3 -m http.server 8080 --directory public
```

Then open `http://localhost:8080`. Hospital search, cost estimates, scheme lookup, chat, and report reading use the backend. No account is required.

## Main pages

- `public/index.html` — hospital search, maps, cost estimator, schemes, and report reader.
- `public/emergency.html` — public emergency help and nearby hospital options. It does not dispatch an ambulance.
- `public/results.html` — hospital search results.
- `public/compare.html` — compare saved hospitals.

## Technology

- HTML, CSS, and JavaScript
- Leaflet maps with OpenStreetMap tiles
- Capacitor for the Android app wrapper
- Express API and MongoDB are in the sibling `MediGo-Backend` folder

For emergencies in India, call 108 for an ambulance or 112 for emergency help. Hospital listings and AI summaries can be incomplete; confirm details with a hospital or a qualified health professional.
