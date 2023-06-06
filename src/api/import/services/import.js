'use strict';

/**
 * import service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::import.import');
