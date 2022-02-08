'use strict';

/**
 * resilience-level service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::resilience-level.resilience-level');
