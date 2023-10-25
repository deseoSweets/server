
require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        try {

            await mail.send({
                from: 'Deseo Sweets<noreply@deseosweets.ro>',
                replyTo: 'contact@deseosweets.ro',
                templateId: "d-5fa8254a5844474a81dcfd80b8df3930",
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