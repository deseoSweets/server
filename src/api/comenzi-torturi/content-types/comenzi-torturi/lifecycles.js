require('dotenv').config();
const mail = require('@sendgrid/mail');

mail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    async afterCreate(event) {
        const { result, params } = event;

        const modelAlesLink = result.tort.modelAles !== "Personalizat"? `<a href="${result.tort.modelAlesUrl}">Click pt poza</a>` : ""
        const HTML = `
                 <table style="width: 100%; font-family: Arial, sans-serif; padding: 20px; box-sizing: border-box; border-collapse: collapse;">
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Blat:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.blat.tip}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Crema:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.crema.tip}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Crema 2:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.crema2.tip ? result.tort.crema2.tip : "Fara Selectie"}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Insertie:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.insertie.tip ? result.tort.insertie.tip : "Fara Selectie"}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Greutate:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.greutate}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Mesaj Tort:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.mesajTort ? result.tort.mesajTort : "Fara Selectie"}</td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Cerinte speciale:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.specificatii ? result.tort.specificatii : "Fara Selectie"}</td>
                 </tr>
                 <tr>
                 <td style="padding: 10px; font-size: 16px; font-weight: bold;">Model: </td>
                     <td style="padding: 10px; font-size: 16px;">
                     <span>${result.tort.modelAles}</span>
                     ${modelAlesLink}
                     </td>
                 </tr>
                 <tr>
                     <td style="padding: 10px; font-size: 16px; font-weight: bold;">Pret:</td>
                     <td style="padding: 10px; font-size: 16px;">${result.tort.pret}</td>
                 </tr>
             </table>`

        if (result.email) {

            try {
                await mail.send({
                    from: 'Deseo Sweets<noreply@deseosweets.ro>',
                    replyTo: 'contact@deseosweets.ro',
                    templateId: "d-271fd4006f3b436c9776d01b7a6919dd",
                    personalizations: [
                        {
                            to: `${result.email}`,
                            dynamicTemplateData: {
                                infotort: HTML,
                            }
                        }
                    ]
                });
            } catch (error) {
                console.log(error);
            }
        }

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
                            nume: result.nume,
                            prenume: result.prenume,
                            email: result.email,
                            telefon: result.telefon,
                            infotort: HTML,
                            dynamicSubject: `Comanda tort - ${result.nume} ${result.prenume}`
                        }
                    }
                ]
            });
        } catch (error) {
            console.log(error);
        }
    },
};
