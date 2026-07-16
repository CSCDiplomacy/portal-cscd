// Deployment entry point (Hostinger Node hosting, GitHub-connected deploy).
//
// The full Express app — every route, including POST /api/me/interview/mark-taken
// — is defined in app.js, which EXPORTS the app and only opens a socket when run
// directly. Hostinger's Node loader imports this startup file and serves the
// exported app, so in production requiring app.js is all that's needed. When run
// directly (`node server.js`) we open the port ourselves so local runs still work.
const app = require('./app');

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`CSCD Delegate App listening on :${port}`));
}

module.exports = app;
