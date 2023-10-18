module.exports = {
    routes: [
        {
            method: "POST",
            path: "/tranzactii/euplatesc",
            handler: "euplatesc.create",
        },
        {
            method: "POST",
            path: "/tranzactii/euplatesc/raspuns",
            handler: "euplatesc.raspuns",
        }
    ]
}