const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftPrev3",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: true,
            operator: "prev",
            location: "Teresa Drive"
        });

    }
}