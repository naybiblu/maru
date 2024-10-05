const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftNext1",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: true,
            operator: "next",
            location: "PUP Lagoon"
        });

    }
}