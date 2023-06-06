'use strict';

/**
 * import controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::import.import');
