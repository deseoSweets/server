
require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        try {

            await mail.send({
                from: 'Deseo Sweets <noreply@deseosweets.ro>',
                replyTo: 'contact@deseosweets.ro',
                templateId: "d-0b7e00d399e24886bf8b83f8f9016ae5",
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