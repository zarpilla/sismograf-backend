'use strict';

/**
 *  resilience-level controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::resilience-level.resilience-level');
