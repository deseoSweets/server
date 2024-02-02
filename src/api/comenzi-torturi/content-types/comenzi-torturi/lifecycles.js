require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event;
        const HTML = `
        <table style="width: 100%; font-family: Arial, sans-serif; padding: 20px; box-sizing: border-box; border-collapse: collapse;">
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Blat:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.blat}</td>
        </tr>
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Crema:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.crema}</td>
        </tr>
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Insertie:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.insertie}</td>
        </tr>
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Greutate:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.greutate}</td>
        </tr>
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Informatii aditionale:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.comentariu}</td>
        </tr>
        <tr>
        <td style="padding: 10px; font-size: 16px; font-weight: bold;">Model: </td>
            <td style="padding: 10px; font-size: 16px;">
            <span>${result.tort.designAles}</span>
            <a href="${result.tort.designAlesUrl}">Click pt poza</a>
            </td>
        </tr>
        <tr>
            <td style="padding: 10px; font-size: 16px; font-weight: bold;">Pret:</td>
            <td style="padding: 10px; font-size: 16px;">${result.tort.pret}</td>
        </tr>
    </table>
    
        `
        const sendToCristina = "contact@deseosweets.ro"
        try {
            await mail.send({
                from: 'Deseo Sweets<noreply@deseosweets.ro>',
                replyTo: 'contact@deseosweets.ro',
                templateId: "d-bf89833b11a643b48e5b29febef6aae1",
                personalizations: [
                    {
                        to: `${sendToCristina}`,
                        dynamicTemplateData: {
                            email: result.email,
                            telefon: result.telefon,
                            infotort: HTML
                        }
                    }
                ]
            });
        } catch (error) {
            console.log(error);
        }
    },
};
