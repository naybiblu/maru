const { tg } = require("../../../func/clients");
const { model } = require("../../../db/models/user");

module.exports = {
    type: "text",
    async run (ctx) {

        //if (ctx.text.startsWith("/")) await tg.commands.get(ctx.text.split("/")[1]).run(ctx);
        //ctx.reply("teka lang beh teka nga lang kasi")
        // can be used for sending msg to other users: ctx.telegram.sendMessage("6212937325", ctx.text)
        //console.log(ctx.update.message.from)

    }
}

// ctx.update.message.from = user info