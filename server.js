import app from './api/index.js';

const PORT = process.env.PORT || 3001;

// kick off the server for local development
app.listen(PORT, () => {
  console.log(`Local dev server chilling at http://localhost:${PORT}`);
});
