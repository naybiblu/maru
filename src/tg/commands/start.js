const { model } = require("./../../assets/db/models/user");

module.exports = {
    name: "start",
    async execute (ctx) {

        const user = ctx.update.message.from;
        let existingUser = await model.findOne({ id: user.id });

        if (existingUser && existingUser?.oldie) return await ctx.reply("You do not need to use this command anymore. Kindly visit /settings instead.");

        await model.create({
            id: user.id,
            username: user.username
        });
        
        await ctx.scene.enter("start");

    }
}