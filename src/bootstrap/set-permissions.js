// const strapi = require('@strapi/strapi')

async function setPermissions(roleType, newPermissions) {

    // Find the ID of the public role
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: {
          type: roleType,
        },
    });
  
    const permissions = await strapi
      .query("plugin::users-permissions.permission")
      .findMany({
        where: {
            role: publicRole.id,
        },
        populate: true
    });

    // Update permission to match new config
    const controllersToUpdate = Object.keys(newPermissions);

    const updatePromises = []
    controllersToUpdate.forEach(async (controller) => {
      newPermissions[controller].forEach(async (action) => {
        const permissionToAdd = `${controller}.${action}`
        if (!permissions.find(p => p.action === `${controller}.${action}`)) {
          const promise = strapi.query("plugin::users-permissions.permission").create({
            data: {
              action: permissionToAdd,
              role: publicRole.id
            }
          })
          updatePromises.push(promise)
        }
      })
    })

    await Promise.all(updatePromises);
}

  
async function importSeedData() {    
    await setPermissions("authenticated",       
      {
        "api::template.template": ["find", "findOne", "findOneWithIndicators"],
        "api::indicator.indicator": ["find", "findOne"],
        "api::pattern.pattern": ["find", "findOne"],
        "api::indicator-option.indicator-option": ["find", "findOne"],
        "api::domain.domain": ["find", "findOne"],
        "api::principle.principle": ["find", "findOne"],
        "api::principle-type.principle-type": ["find", "findOne"],
        "api::resilience-level.resilience-level": ["find", "findOne"],
        "api::analysis.analysis": ["create", "update", "delete", "find", "findOne"],
        "api::label.label": ["find", "findOne"],
      }
    );
}

module.exports = async () => {
  try {
    await importSeedData();
  } catch (error) {
    console.log("Could not import seed data");
    console.error(error);
  }
};