const emailController = require('../src/api/analysis/controllers/email');

module.exports = {
    /**
     * Simple example.
     * Every monday at 1am.
     */
  
    myJob: {
      task: ({ strapi }) => {
        emailController.email(strapi)
      },
      options: {
        rule: "* * * * *",
      },
    },
  };