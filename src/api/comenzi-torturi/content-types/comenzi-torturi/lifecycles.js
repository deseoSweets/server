require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event;

        console.log(result)
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
            <td colspan="2" style="padding: 10px; text-align: center;">
                <span style="font-size: 16px; font-weight: bold;">${result.tort.designAles}</span><br>
                <img style="width: 200px; height: 200px; padding: 10px; box-sizing: border-box;" src="${result.tort.designAlesUrl}" alt="designTort" />
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
