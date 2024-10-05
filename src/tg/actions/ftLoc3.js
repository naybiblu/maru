const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftLoc3",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: false,
            location: "Teresa Drive"
        });

    }
}