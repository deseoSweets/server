'use strict';
require('dotenv').config();
const { EuPlatesc } = require('euplatesc');
const mail = require('@sendgrid/mail');

const epClient = new EuPlatesc({
    merchantId: process.env.EUPLATESC_MERCHANT_ID,
    secretKey: process.env.EUPLATESC_SECRET_KEY,
    testMode: 'true' === process.env.EUPLATESC_TEST_MODE,
});

mail.setApiKey(process.env.SENDGRID_API_KEY);


const { createCoreController } = require('@strapi/strapi').factories;

function getTodayDateRange() {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" }))
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const year = today.getFullYear().toString().slice(-2);  // get last two digits of the year
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    return { startOfDay, endOfDay, formattedDate };
}

function formatOrderDate(dateStr) {
    const dateObj = new Date(dateStr);

    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const hours = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate; 
}

async function sendOrderEmail(tranzactie) {
    const productListHTML =`<div style="width:100%; ">
    <table style="width: 80%; border-collapse: collapse; margin:auto;">
      <thead>
        <tr style="background-color: #FFEEF4;">
          <th style="border-top: 1px solid #ddd; padding: 8px; font-size:12px; text-align:center;">DESCRIERE</th>
          <th style="border-top: 1px solid #ddd; padding: 8px; font-size:12px; text-align:center;">CANTITATE</th>
          <th style="border-top: 1px solid #ddd; padding: 8px; font-size:12px; text-align:center;">PRET</th>
        </tr>
      </thead>
      <tbody>
        ${tranzactie.produse.produse.map(produs => `
        <tr>
          <td style="border-bottom: 1px solid #ddd; padding: 8px; text-align:center;">${produs.nume}</td>
          <td style="border-bottom: 1px solid #ddd; padding: 8px; text-align:center;">${produs.cantitate}</td>
          <td style="border-bottom: 1px solid #ddd; padding: 8px; text-align:center;">${produs.pret * produs.cantitate}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;

    const res = await mail.send({
        from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
        replyTo: 'comezni@insightweb.ro',
        templateId: "d-53bdb57bb9c543a98049f7aa9a0c453f",
        personalizations: [
            {
                to: `${tranzactie.email}`,
                dynamicTemplateData: {
                    invoiceId: tranzactie.invoiceId,
                    date: formatOrderDate(tranzactie.createdAt),
                    clientName: `${tranzactie.fname + " " +  tranzactie.lname}`,
                    email: tranzactie.email,
                    dataRidicare: tranzactie.dataRidicare,
                    produse: productListHTML,
                    amount: tranzactie.amount
                }
            }
        ]
    })

    return res
}


module.exports = createCoreController('api::tranzactii.tranzactii', () => ({


    async create(ctx) {
        const { startOfDay, endOfDay, formattedDate } = getTodayDateRange();
        try {

            // Count Invoices
            const todayRecords = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
                filters: {
                    created_at_gte: startOfDay,
                    created_at_lte: endOfDay,
                }
            })

            // Get req body
            const { amount, currency, orderDescription, lname, fname, company, phone, email, dataRidicare } = ctx.request.body;

            // Generate EuPlatesc paymentURL
            const paymentUrl = await epClient.paymentUrl({
                amount,
                currency,
                invoiceId: `${formattedDate + todayRecords.length}`,
                orderDescription,
                successUrl: `https://deseo-f115ed0b1de4.herokuapp.com/api/tranzactii/euplatesc/raspuns`,
                backToSite: `https://deseo-f115ed0b1de4.herokuapp.com/api/tranzactii/euplatesc/raspuns`,
                backToSiteMethod: 'POST',
                failedUrl: `https://deseo-f115ed0b1de4.herokuapp.com/api/tranzactii/euplatesc/raspuns`
            });

            // Create Strapi Trazaction
            await strapi.entityService.create('api::tranzactii.tranzactii', {
                data: {
                    amount,
                    currency,
                    invoiceId: `${formattedDate + todayRecords.length}`,
                    fname,
                    lname,
                    company,
                    phone,
                    email,
                    produse: orderDescription,
                    paymentUrl: paymentUrl.paymentUrl,
                    dataRidicare
                }
            })

            ctx.send(paymentUrl.paymentUrl);
        } catch (error) {
            console.error('Error:', error);
            ctx.status = 500;
            ctx.send({ error: 'Internal Server Error' });
        }
    },



    async raspuns(ctx) {

        //Get Check response props
        const {
            amount,
            curr,
            invoice_id: id,
            ep_id,
            merch_id,
            action,
            message,
            approval,
            timestamp,
            nonce,
            fp_hash
        } = ctx.request.body;
        const data = {
            amount,
            currency: curr,
            invoiceId: id,
            epId: ep_id,
            merchantId: merch_id,
            action,
            message,
            approval,
            timestamp,
            nonce,
            fpHash: fp_hash
        };

        // Check Response
        const res = epClient.checkResponse(data);
        if (res.success === true && res.response === "complete") {

            // get strapi tranzaction
            const strapiID = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
                filters: {
                    invoiceId: id
                }
            })

            //change strapi status to platit
            await strapi.entityService.update('api::tranzactii.tranzactii', strapiID[0].id, {
                data: {
                    status: 'platit',
                },
            });
            const res = await sendOrderEmail(strapiID[0])
            console.log(res);
            ctx.redirect('https://client-nine-roan.vercel.app/comanda-a-fost-confirmata');
        } else {
            const strapiID = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
                filters: {
                    invoiceId: id
                }
            })
            await strapi.entityService.delete('api::tranzactii.tranzactii', strapiID[0].id)
            ctx.redirect('https://client-nine-roan.vercel.app/comanda-nu-a-fost-confirmata');
        }
    }
}));
