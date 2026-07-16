// Deployment entry point.
//
// The full Express app — every route, including POST /api/me/interview/mark-taken
// — lives in app.js, which self-starts via app.listen(). Hostinger's Node
// hosting is configured to run `server.js` as its entry file, so this thin shim
// boots app.js. Keeping it in the repo guarantees the deployed server always
// runs the current code, rather than an untracked server.js left on the host
// that can drift out of date.
module.exports = require('./app');
