require('dotenv').config();
const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

module.exports = {
    async beforeCreate(event) {
        const data = event.params.data;
        if (data.tort.crema2.tip === "Fistic") {
          data.tort.pret = data.tort.crema2.pret * data.tort.greutate ;
        } else {
          data.tort.pret = data.tort.crema.pret * data.tort.greutate ;
        }  
    },

    async afterCreate(event) {
        const { result, params } = event;

        const modelAlesLink = result.tort.modelAles !== "Personalizat" ? `<a href="${result.tort.modelAlesUrl}">Click pentru vizualizare</a>` : ""
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
                await client.sendEmailWithTemplate({
                    From: 'Deseo Sweets <noreply@deseosweets.ro>',
                    ReplyTo: 'contact@deseosweets.ro',
                    To: result.email,
                    TemplateId: 41029921,
                    TemplateModel: {
                        infotort: HTML,
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }

        const sendToCristina = "contact@deseosweets.ro"
        try {
            await client.sendEmailWithTemplate({
                From: 'Deseo Sweets <noreply@deseosweets.ro>',
                ReplyTo: 'contact@deseosweets.ro',
                To: sendToCristina,
                TemplateId: 40986828,
                TemplateModel: {
                    nume: result.nume,
                    prenume: result.prenume,
                    email: result.email,
                    telefon: result.telefon,
                    dataRidicare: result.tort.dataRidicare,
                    infotort: HTML,
                }
            });
        } catch (error) {
            console.log(error);
        }
    },
};
