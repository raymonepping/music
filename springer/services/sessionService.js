// services/sessionService.js

let session = {};

function getSession() {
  return session;
}

function updateSession(key, value) {
  session[key] = value;
}

module.exports = {
  getSession,
  updateSession,
};
