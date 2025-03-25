module.exports = {
  routes: [
    {
      method: "GET",
      path: "/produs/getProduseLocale/:slug",
      handler: "api::produs.produs.getProduseLocale",
      config: {
        // policies: []
      },
    },
  ],
};
