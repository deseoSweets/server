
require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        try {

            await mail.send({
                from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
                replyTo: 'comezni@insightweb.ro',
                templateId: "d-43e6ecffe8054b81b82dfadc128b6144",
                personalizations: [
                    {
                        to: `${result.email}`,
                    }
                ]
            })
        } catch (error) {
            console.log(error)
        }
    },
}