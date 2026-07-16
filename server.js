// Alternate deployment entry point, kept in sync with app.js for hosts whose
// panel is configured with "server.js" as the startup file rather than
// "app.js" — both boot the same app. app.js calls app.listen() unconditionally
// (Hostinger's Node hosting requires the startup file to always call listen();
// guarding it behind `require.main === module` silently breaks the boot, since
// their loader doesn't set require.main the way plain `node app.js` would), so
// requiring it here is all that's needed.
module.exports = require('./app');
