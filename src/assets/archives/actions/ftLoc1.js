const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftLoc1",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: false,
            location: "PUP Lagoon"
        });

    }
}