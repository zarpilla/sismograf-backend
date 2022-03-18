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
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/templates/user/:id",
      handler: "template.findUserTemplates",
    },
    {
      // Path defined with a URL parameter
      method: "GET",
      path: "/templates/import/",
      handler: "template.import",
    }
  ],
};
