module.exports = ({ env }) => ({
    // ...
    email: {
      config: {
        provider: 'sendgrid',
        providerOptions: {
          apiKey: env('SENDGRID_API_KEY'),
        },
        settings: {
          defaultFrom: env('EMAIL_FROM'),
          defaultReplyTo: env('EMAIL_FROM'),
        },
      },
    },
    // ...
  });