'use strict';

/**
 * produs controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::produs.produs', ({strapi}) => ({
  async getProduseLocale(ctx) {
    try {
      const { slug } = ctx.params;
      const { locale } = ctx.query;

      if (!locale) {
        return ctx.badRequest('Missing locale');
      }

      // Fetch product in the requested locale
      const products = await strapi.entityService.findMany('api::produs.produs', {
        filters: { slug },
        locale,
        populate: ['localizations', 'SEO'],
      });

      if (!products || products.length === 0) {
        return ctx.notFound('Product not found');
      }

      const product = products[0];

      // Map localizations into { locale, slug }
      const localizations = (product.localizations || []).map((loc) => ({
        locale: loc.locale,
        slug: loc.slug,
      }));

      return ctx.send({
        product: {
          ...product,
          localizations,
        },
      });

    } catch (error) {
      console.error('Error in getProduseLocale:', error);
      return ctx.internalServerError('Something went wrong fetching the product');
    }
  }

}));
