'use strict';

/**
 * produs controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::produs.produs', ({strapi}) => ({
  async getProduseLocale(ctx) {
    try {
      const { slug } = ctx.params;
      const { locale } = ctx.query; // Expecting 'en' or 'ro'

      if (!locale || (locale !== 'en' && locale !== 'ro')) {
        return ctx.badRequest('Invalid or missing locale');
      }

      // Fetch product in the requested locale
      const product = await strapi.entityService.findMany('api::produs.produs', {
        filters: { slug },
        locale,
        populate: ['localizations','SEO'],
      });

      if (!product || product.length === 0) {
        return ctx.notFound('Product not found');
      }

      const foundProduct = product[0];

      // Find the opposite locale (assuming only RO and EN are used)
      const oppositeLocale = locale === 'ro' ? 'en' : 'ro';

      // Extract the opposite localization from `localizations`
      const opposite = foundProduct.localizations.find(
        (loc) => loc.locale === oppositeLocale
      );

      const localizedInfo = {
        locale: opposite?.locale || null,
        slug: opposite?.slug || null,
      };

      return ctx.send({
        product: {
          ...foundProduct,
          localizations: localizedInfo,
        },
      });

    } catch (error) {
      console.error('Error in getProduseLocale:', error);
      return ctx.internalServerError('Something went wrong fetching the product');
    }
  }

}));
