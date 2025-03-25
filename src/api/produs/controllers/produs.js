'use strict';

/**
 * produs controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::produs.produs', ({strapi}) => ({
    async getProduseLocale(ctx) {
        try {
          const { slug } = ctx.params;
    
          // Fetch the product by slug and populate localizations
          const product = await strapi.entityService.findMany('api::produs.produs', {
            filters: { slug: slug },
            populate: ['localizations'],
          });
    
          if (!product || product.length === 0) {
            return ctx.notFound('Product not found');
          }
    
          const foundProduct = product[0];
          const localizations = foundProduct.localizations.map((locale)=>{
            if(locale){

                return{
                    locale:locale.locale,
                    slug:locale.slug,
                }
            }
          });
    
    
          return ctx.send({
            product: {
                ...foundProduct,
                localizations:localizations
            },
          });
    
        } catch (error) {
          console.error('Error in getProduseLocale:', error);
          return ctx.internalServerError('Something went wrong fetching the product');
        }
      }
}));
