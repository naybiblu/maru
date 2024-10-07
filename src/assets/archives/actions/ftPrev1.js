const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftPrev1",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: true,
            operator: "prev",
            location: "PUP Lagoon"
        });

    }
}