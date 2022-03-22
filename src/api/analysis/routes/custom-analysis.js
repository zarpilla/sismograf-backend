"use strict";

/**
 * analysis router.
 */

module.exports = {
  routes: [
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/analyses/compare/:group1/:group2",
      handler: "analysis.findWithResults",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/analyses/compare/:g1/:g2",
      handler: "analysis.findWithResults",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/analyses/results/:id",
      handler: "analysis.findOneWithResults",
    },
    
  ],
};
