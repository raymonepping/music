let session = {
  lastSong: null,
  userName: null,
};

const getSession = () => session;

const updateSession = (key, value) => {
  session[key] = value;
};

module.exports = { getSession, updateSession };
