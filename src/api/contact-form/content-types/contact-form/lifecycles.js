
require('dotenv').config();
const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event
        try {

            await client.sendEmailWithTemplate({
                From: 'Deseo Sweets <noreply@deseosweets.ro>',
                ReplyTo: 'contact@deseosweets.ro',
                To: result.email,
                TemplateId: 40986841,
                TemplateModel: {}
            });

            // DE IMBUNATATIT - CE I SE TRIMITE CRISTINEI
            await client.sendEmailWithTemplate({
                From: 'Deseo Sweets <noreply@deseosweets.ro>',
                ReplyTo: 'contact@deseosweets.ro',
                To: 'contact@deseosweets.ro',
                TemplateId: 40986841,
                TemplateModel: {}
            });
        } catch (error) {
            console.log(error)
        }
    },
}