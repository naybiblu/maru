const { foodWatchInfo } = require("./../../assets/func/components");

module.exports = {
    name: "ftLoc2",
    async run (ctx) {

        await foodWatchInfo(ctx, {
            paginated: false,
            location: "PUP Stop and Shop"
        });

    }
}