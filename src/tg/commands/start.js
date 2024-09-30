const { model } = require("./../../assets/db/models/user");

module.exports = {
    name: "start",
    async run (ctx) {

        const user = ctx.update.message.from;
        let existingUser = await model.findOne({ id: user.id });

        if (!existingUser) await model.create({
            id: user.id,
            username: user.username
        });
        
        await ctx.reply(`Is your username ${existingUser?.username ?? user.username}?`)


    }
}