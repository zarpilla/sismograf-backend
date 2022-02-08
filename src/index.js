'use strict';

const permisssionSetter = require('./bootstrap/set-permissions')
const importer = require('./bootstrap/index')




module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    permisssionSetter().then(() => {
      console.log('permissions set')
    })
    
    importer().then(() => {
      console.log('importer done')
    })
    
  },
};
