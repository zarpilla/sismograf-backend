const fs = require("fs");
const { parse } = require("csv-parse");
const axios = require("axios").default;
const csvOptions = {
    delimiter: ',',
    columns: true
};
const locale = 'es'


async function isFirstRun() {
    const pluginStore = strapi.store({
      environment: strapi.config.environment,
      type: "type",
      name: "setup",
    });
    const initHasRun = await pluginStore.get({ key: "initHasRun" });
    await pluginStore.set({ key: "initHasRun", value: true });
    return !initHasRun;
  }

async function importData() {

    try {

        const shouldImportSeedData = await isFirstRun();
        if (!shouldImportSeedData) {
            return
        }
        
        const records = await readCSV('impsismo.csv');
        const imported = []
        let domainName = ''
        let domainId = 0
        let principleName = ''
        let principleId = 0
        let patternName = ''
        let patternId = 0
        let patternOrder = 0
        
        await strapi.db.query('api::template.template').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::domain.domain').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::principle.principle').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::principle-type.principle-type').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::pattern.pattern').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::indicator.indicator').deleteMany({ where: { id: { $gt: 0 } } })
        // await strapi.db.query('api::indicator-option.indicator-option').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.db.query('api::resilience-level.resilience-level').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.query('components.principle-level').deleteMany({ where: { id: { $gt: 0 } } })
        await strapi.query('components.indicator-option').deleteMany({ where: { id: { $gt: 0 } } })
        
        const templateData = { data: { locale: locale, publishedAt: new Date(), name: 'IMPSISMO' } }
        const templateEntry = await strapi.query('api::template.template').create(templateData);
        const levels = ['Resistencia', 'Determinación', 'Orden', 'Progreso', 'Sostenibilidad', 'Restauración', 'Reconciliación', 'Regeneración']
        for (var i in levels) {
            await strapi.query('api::resilience-level.resilience-level').create( { data: { locale: locale, publishedAt: new Date(), name: levels[i], value: i + 1, principle: null } });
        }
        
        const principleType = await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'SER' } });
        await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'FUNCIÓN' } });
        await strapi.query('api::principle-type.principle-type').create( { data: { locale: locale, publishedAt: new Date(), name: 'VOLUNTAD' } });
        
        for (var i = 0; i < records.length; i++) {
            
            const record = records[i]
            if (record.domain !== domainName && record.domain !== '') {
                const domainData = { data: { locale: locale, publishedAt: new Date(), name: record.domain, description: record.domain_desc } }
                const domainEntry = await strapi.query('api::domain.domain').create(domainData);
                domainId = domainEntry.id
                domainName = record.domain
            }

            if (record.principle !== principleName && record.principle !== '') {
                const resilience_levels = []
                let level = await strapi.query('components.principle-level').create({ data: { name: record.r1, value: 1 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r2, value: 2 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r3, value: 3 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r4, value: 4 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r5, value: 5 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r6, value: 6 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r7, value: 7 } })                
                resilience_levels.push(level.id)
                level = await strapi.query('components.principle-level').create({ data: { name: record.r8, value: 8 } })                
                resilience_levels.push(level.id)
                const principleData = { data: { locale: locale, publishedAt: new Date(), name: record.principle, description: record.principle_desc, principle_levels: resilience_levels, domain: domainId, principle_type: principleType.id + parseInt(record.principle_type) - 1 } }                
                const principleEntry = await strapi.query('api::principle.principle').create(principleData);
                principleId = principleEntry.id
                principleName = record.principle

            }
            if (record.pattern !== patternName && record.pattern !== '') {
                patternOrder == 1
                const patternData = { data: { locale: locale, publishedAt: new Date(), name: record.pattern, order: patternOrder, principle: principleId } }
                const patternEntry = await strapi.query('api::pattern.pattern').create(patternData);
                patternOrder++
                patternId = patternEntry.id
                patternName = record.pattern
            }

            if (record.indicator) {
                const options = []
                let option = await strapi.query('components.indicator-option').create({ data: { name: record.o1, value: 1 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o2, value: 2 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o3, value: 3 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o4, value: 4 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o5, value: 5 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o6, value: 6 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o7, value: 7 } })                
                options.push(option.id)
                option = await strapi.query('components.indicator-option').create({ data: { name: record.o8, value: 8 } })                
                options.push(option.id)

                // console.log('options', options)

                const indicatorData = { data: { locale: locale, publishedAt: new Date(), question: record.indicator, pattern: patternId, templates: [templateEntry.id], max: record.max, indicator_options: options } }
                const indicatorEntry = await strapi.query('api::indicator.indicator').create(indicatorData);                
            }            
        }
        return {
            success: true,
            imported : imported.length,
            // records
        }
    }
    catch (e) {
        console.error('Error importing file (1)', e)
        return {
            messsage: 'Error importing file',
            success: false,
            e
        }
    }
}


async function readCSV(filename) {
    return new Promise(async (resolve, reject) => {
        try {
            const content = await fs.readFileSync(__dirname + '/' + filename);
            parse(content, csvOptions, (err, records) => {
                if (err) {
                    console.error('Error importing file (2)', e)
                    reject(err)
                }
                resolve(records)
            })
        }
        catch (e) {
            console.error('Error importing file (3)', e)
            reject(e);
        }
    });
}



module.exports = async () => {
    try {
      await importData();
    } catch (error) {
      console.log("Could not import seed data");
      console.error(error);
    }
  };