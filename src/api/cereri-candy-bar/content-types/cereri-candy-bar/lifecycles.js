
require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        if (result.adresaEmail) {
            try {
                await mail.send({
                    from: 'Deseo Sweets <noreply@deseosweets.ro>',
                    replyTo: 'contact@deseosweets.ro',
                    templateId: "d-f3a1e32223c74d2bbda7b7ae519a5831",
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