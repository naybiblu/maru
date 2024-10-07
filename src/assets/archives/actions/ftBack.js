const { foodWatchMenu } = require("./../../assets/func/components");

module.exports = {
    name: "ftBack",
    async run (ctx) {

        await foodWatchMenu(ctx);

    }
};