Komandoo C13 Live Sync – Setup Guide

1) Install Node.js (v16+).
2) Upload these files to your GitHub repo: sync-server.js, data.json, package.json, KomandooC13-Contacts-App-Online-Filters.html
3) In Render: New Web Service -> Connect repo -> Start command: node sync-server.js
4) After deploy, set API base in client: localStorage.setItem('api_base','https://<your-app>.onrender.com'); location.reload();
