


















// async function updateTransactionStatus(id, status) {
//     const transactions = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
//         filters: {
//             invoiceId: id
//         }
//     });

//     if (transactions.length === 0) {
//         throw new Error('Transaction not found');
//     }

//     return await strapi.entityService.update('api::tranzactii.tranzactii', transactions[0].id, {
//         data: { status },
//     });
// }

// async function deleteTransaction(id) {
//     const transactions = await strapi.entityService.findMany('api::tranzactii.tranzactii', {
//         filters: {
//             invoiceId: id
//         }
//     });

//     if (transactions.length === 0) {
//         throw new Error('Transaction not found');
//     }

//     return await strapi.entityService.delete('api::tranzactii.tranzactii', transactions[0].id);
// }

// async function sendEmail(transaction) {
//     const productListHTML = /* Your HTML logic here, using `transaction.produse` */;

//     return await mail.send({
//         from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
//         replyTo: 'comezni@insightweb.ro',
//         templateId: "d-53bdb57bb9c543a98049f7aa9a0c453f",
//         personalizations: [
//             {
//                 to: transaction.email,
//                 dynamicTemplateData: {
//                     invoiceId: transaction.invoiceId,
//                     date: "20/04/23",
//                     clientName: "Victor",
//                     email: "cvpod95@gmail.com",
//                     dataRidicare: "20 August 2023 Sambata",
//                     produse: productListHTML
//                 }
//             }
//         ]
//     });
// }














// const productListHTML = `
// <table style="width: 100%; border-collapse: collapse;">
//   <thead>
//     <tr style="background-color: #f2f2f2;">
//       <th style="border: 1px solid #ddd; padding: 8px;">Product Name</th>
//       <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
//       <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
//     </tr>
//   </thead>
//   <tbody>
//   ${strapiID[0].produse}
//   </tbody>
// </table>
// `

// // ${strapiID[0].map(product => `
// //   <tr>
// //     <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
// //     <td style="border: 1px solid #ddd; padding: 8px;">${product.qty}</td>
// //     <td style="border: 1px solid #ddd; padding: 8px;">${product.price}</td>
// //   </tr>
// // `).join('')}

// const res = await mail.send({
//     from: 'Comenzi Insightweb <noreplay@insightweb.ro>',
//     replyTo: 'comezni@insightweb.ro',
//     templateId: "d-53bdb57bb9c543a98049f7aa9a0c453f",
//     personalizations: [
//         {
//             to: `${strapiID[0].email}`,
//             dynamicTemplateData: {
//                 invoiceId: "2345",
//                 date: "20/04/23",
//                 clientName: "Victor",
//                 email: "cvpod95@gmail.com",
//                 dataRidicare: "20 August 2023 Sambata",
//                 produse: productListHTML
//             }
//         }
//     ]
// })