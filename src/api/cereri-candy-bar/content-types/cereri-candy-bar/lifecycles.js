
require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        if (result.adresaEmail) {
            try {

                await mail.send({
                    from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
                    replyTo: 'comezni@insightweb.ro',
                    templateId: "d-15e06de3b9944bb09ca95b9313079a18",
                    personalizations: [
                        {
                            to: `${result.adresaEmail}`,
                        }
                    ]
                })
            } catch (error) {
                console.log(error)
            }
        }
    },
}