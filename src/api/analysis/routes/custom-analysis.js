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
      path: "/analyses/wheel/:group1",
      handler: "analysis.getWheel",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/analyses/results/:id",
      handler: "analysis.findOneWithResults",
    },
    
  ],
};
