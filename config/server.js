module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'http://127.0.0.1:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
