
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
                templateId: "d-9f5e0caa5b514bc6888cfc6707f432e2",
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