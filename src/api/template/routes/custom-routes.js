"use strict";

/**
 * template router.
 */

module.exports = {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/templates/indicators/:id",
      handler: "template.findOneWithIndicators",
    },
  ],
};
