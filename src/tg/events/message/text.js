module.exports = {
    type: "text",
    async run (ctx) {

        await ctx.reply(ctx.text);

    }
}