'use strict';

/**
 * indicator service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::indicator.indicator');
