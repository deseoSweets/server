'use strict';
require('dotenv').config();
const { EuPlatesc } = require('euplatesc');
const mail = require('@sendgrid/mail');
const axios = require('axios')

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
    dateObj.setUTCMinutes(dateObj.getUTCMinutes() + 180);

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
    const productListHTML = `<div style="width:100%; ">
    <table style="width: 80%; border-collapse: collapse; margin:auto;">
      <thead>
        <tr style="background-color: #FFECEA;">
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
        from: 'Comenzi Deseo Sweets <noreply@deseosweets.ro>',
        replyTo: 'contact@deseosweets.ro',
        templateId: "d-e249b7b12dcc48febaab1e52b67f9d1c",
        personalizations: [
            {
                to: `${tranzactie.email}`,
                dynamicTemplateData: {
                    invoiceId: tranzactie.invoiceId,
                    date: formatOrderDate(tranzactie.createdAt),
                    clientName: `${tranzactie.fname + " " + tranzactie.lname}`,
                    email: tranzactie.email,
                    phone:tranzactie.phone,
                    dataRidicare: tranzactie.dataRidicare,
                    produse: productListHTML,
                    amount: tranzactie.amount
                }
            }
        ]
    })
    const cristinaRes = await mail.send({
        from: 'Comanda Noua <noreply@deseosweets.ro>',
        replyTo: 'contact@deseosweets.ro',
        templateId: "d-e249b7b12dcc48febaab1e52b67f9d1c",
        personalizations: [
            {
                to: "contact@deseosweets.ro",
                subject:`Comanda noua de la ${tranzactie.fname + " " + tranzactie.lname}`,
                dynamicTemplateData: {
                    invoiceId: tranzactie.invoiceId,
                    date: formatOrderDate(tranzactie.createdAt),
                    clientName: `${tranzactie.fname + " " + tranzactie.lname}`,
                    email: tranzactie.email,
                    phone:tranzactie.phone,
                    dataRidicare: tranzactie.dataRidicare,
                    produse: productListHTML,
                    amount: tranzactie.amount
                }
            }
        ]
    })


    return {res, cristinaRes}
}
function removeDiacriticsAndUppercase(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
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
            const { amount, currency, orderDescription, discount, inputedDiscountCode, lname, fname, company, phone, email, dataRidicare, oras, judet, tara, adresa } = await ctx.request.body;

            if (orderDescription.produse.length) {
                let dbProductAmount = 0;
                const promises = orderDescription.produse.map(async (produs) => {
                    const res = await strapi.entityService.findOne('api::produs.produs', produs.id);
                    if (res) {
                        dbProductAmount += res.pret * produs.cantitate;
                    }
                });
                // Wait for all the promises from the map to complete
                await Promise.all(promises);

                // Apply the discount after all the promises have resolved
                if (discount && inputedDiscountCode !== "") {
                    const res = await strapi.entityService.findMany('api::coduri-discount.coduri-discount', {
                        filters: {
                            cod: inputedDiscountCode
                        }
                    })
                    if (res[0].procent) {
                        dbProductAmount *= (1 - (res[0].procent / 100));
                    }
                }

                if (dbProductAmount === amount) {
                    const orderEuPlatesc = orderDescription.produse.map((produs) => {
                        return `${produs.cantitate}x${removeDiacriticsAndUppercase(produs.nume)}`
                    }).join(', ')



                    // Generate EuPlatesc paymentURL
                    const paymentUrl = await epClient.paymentUrl({
                        amount,
                        currency,
                        invoiceId: `${formattedDate + todayRecords.length}`,
                        orderDescription: orderEuPlatesc,
                        billingFirstName: fname,
                        billingLastName: lname,
                        billingCompany: company,
                        billingPhone: phone,
                        billingEmail: email,
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
                            oras,
                            judet,
                            tara,
                            adresa,
                            email,
                            produse: orderDescription,
                            paymentUrl: paymentUrl.paymentUrl,
                            dataRidicare
                        }
                    })

                    ctx.send(paymentUrl.paymentUrl);
                }
            }
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
            const strapiTransaction = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
                filters: {
                    invoiceId: id
                }
            })

            //change strapi status to platit
            await strapi.entityService.update('api::tranzactii.tranzactii', strapiTransaction[0].id, {
                data: {
                    status: 'platit',
                },
            });
            const now = new Date();
            // Convert to Bucharest time zone
            const bucharestTime = new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/Bucharest',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(now);

            const bucharestDate = bucharestTime.split('/').reverse().join('-');


            // Smartbill
            const produseSmartbill = strapiTransaction[0].produse.produse.map((produs) => {
                return {
                    "name": `${produs.nume}`,
                    "isDiscount": false,
                    "measuringUnitName": "buc",
                    "currency": "RON",
                    "quantity": produs.cantitate,
                    "price": produs.pret,
                    "isTaxIncluded": true,
                    "saveToDb": false,
                    "isService": false
                }
            })
            const smartbillUsername = 'admin@deseosweets.ro'
            const smartbillPassword = '002|ace37491865b27d3d4c7baad3594bce2'
            const basicAuth = 'Basic ' + Buffer.from(smartbillUsername + ':' + smartbillPassword).toString('base64')
            const smartbillData = {
                "companyVatCode": "46403540",
                "client": {
                    "name": `${strapiTransaction[0].fname} ${strapiTransaction[0].lname} `,
                    "vatCode": `${strapiTransaction[0].company}`,
                    "address": `${strapiTransaction[0].adresa}, ${strapiTransaction[0].judet}`,
                    "city": `${strapiTransaction[0].oras}`,
                    "country": `${strapiTransaction[0].tara}`,
                    "email": `${strapiTransaction[0].email}`,
                    "saveToDb": true
                },
                "issueDate": bucharestDate,
                "seriesName": "DSO",
                "sendEmail": false,
                "dueDate": bucharestDate,
                "deliveryDate": bucharestDate,
                "products": produseSmartbill
            }
            axios.post('https://ws.smartbill.ro/SBORO/api/invoice', smartbillData, {
                headers: {
                    'Authorization': basicAuth,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    console.log('Data:', response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });





            
            const res = await sendOrderEmail(strapiTransaction[0])

            ctx.redirect('https://deseosweets.ro/comanda-a-fost-confirmata');
        } else {
            const strapiTransaction = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
                filters: {
                    invoiceId: id
                }
            })
            await strapi.entityService.delete('api::tranzactii.tranzactii', strapiTransaction[0].id)
            ctx.redirect('https://deseosweets.ro/comanda-nu-a-fost-confirmata');
        }
    }
}));
