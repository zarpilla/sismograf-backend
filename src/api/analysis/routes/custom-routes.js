"use strict";

/**
 * analysis router.
 */

module.exports = {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/analyses/results/:id",
      handler: "analysis.findOneWithResults",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/templates/results",
      handler: "analysis.findWithResults",
    },
  ],
};
