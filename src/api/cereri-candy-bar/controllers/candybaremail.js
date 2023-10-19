'use strict';
require('dotenv').config();
const { EuPlatesc } = require('euplatesc');
const mail = require('@sendgrid/mail');



mail.setApiKey(process.env.SENDGRID_API_KEY);


const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cereri-candy-bar.cereri-candy-bar', () => ({

    async create(ctx) {
        const { nume, numarTelefon, adresaEmail, numarPersoane, tipulEvenimentului, comentariu } = ctx.request.body;

        if (nume && numarTelefon && tipulEvenimentului) {
            try {

                await strapi.entityService.create("api::cereri-candy-bar.cereri-candy-bar", {
                    data: {
                        nume,
                        numarTelefon,
                        adresaEmail,
                        numarPersoane,
                        tipulEvenimentului,
                        comentariu
                    }
                })
            } catch (error) {
                ctx.send({ status: 400, message: error })
            }
            if (adresaEmail) {
                try {
                    await mail.send({
                        from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
                        replyTo: 'comezni@insightweb.ro',
                        templateId: " d-15e06de3b9944bb09ca95b9313079a18",
                        personalizations: [
                            {
                                to: `${adresaEmail}`,
                            }
                        ]
                    })

                } catch (error) {
                    ctx.send({ status: 400, message: "Invalid Data" })
                }
            }
        }

    }

}));


