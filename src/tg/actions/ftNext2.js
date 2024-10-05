const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftNext2",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: true,
            operator: "next",
            location: "PUP Stop and Shop"
        });

    }
}