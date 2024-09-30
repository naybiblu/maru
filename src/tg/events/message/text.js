const { tg } = require("./../../../assets/func/clients");
const { model } = require("./../../../assets/db/models/user");

module.exports = {
    type: "text",
    async run (ctx) {

        await model.updateOne(
            { id: user.id },
            { }
        );
        if (ctx.text.startsWith("/")) await tg.commands.get(ctx.text.split("/")[1]).run(ctx);
        
        // can be used for sending msg to other users: ctx.telegram.sendMessage("6212937325", ctx.text)
        //if (ctx.text === "/start") await ctx.reply(`Is your username ${ctx.update.message.from.username}?;`)
        //console.log(ctx.update.message.from)

    }
}

// ctx.update.message.from = user info