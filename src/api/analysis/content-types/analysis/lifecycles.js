var _ = require('lodash');


const calculateResilienceLevel = async (data) => {
    if (data._internal) {
        return
    }        
    const analysis = await strapi.service('api::analysis.analysis').findOne(data.id, {
        populate:  ['results']
    });
    try {
        const average = _.meanBy(analysis.results.filter(r => r.value > 0), (r) => r.value);
        await strapi.query('api::analysis.analysis').update({ where: { id: data.id }, data: { resilienceLevel: average, _internal: true } })
    }
    catch (e) {
        await strapi.query('api::analysis.analysis').update({ where: { id: data.id }, data: { resilienceLevel: 0, _internal: true } })
    }
    
}


module.exports = {
    
    // beforeCreate(event) {
    //   const { data, where, select, populate } = event.params;  
    //   // let's do a 20% discount everytime
    //   event.params.data.price = event.params.data.price * 0.8;
    // },

  
    async afterCreate(event) {
        // console.log('beforeCreate', event)
        await calculateResilienceLevel(event.result)
    },

    beforeUpdate(event) {
        // console.log('beforeUpdate', JSON.parse(JSON.stringify(event.params.data)))
        // console.log('beforeUpdate', JSON.parse(JSON.stringify(event.params.data.results)))

        // const average = _.meanBy(event.params.data.results, (r) => r.value);
        //event.params.data.resilienceLevel = average
        // data.resilienceLevel = 4.4        
        // do something to the result;
    },
    async afterUpdate(event) {
        await calculateResilienceLevel(event.params.data)
    },

    
};