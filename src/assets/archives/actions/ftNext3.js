const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftNext3",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: true,
            operator: "next",
            location: "Teresa Drive"
        });

    }
}