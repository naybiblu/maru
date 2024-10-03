const Markup = require('telegraf/markup');
const { model } = require("../../assets/db/models/user");
const { getRandomInt } = require("./../../assets/func/misc");

module.exports = {
    name: "paperplane",
    async execute (ctx, args) {

        let author = ctx.update.message.from;
        let user = await model.findOne({ id: author.id });
        let users = await model.find({ $and: [ 
            { id: { $ne: author.id } },
            { "settings.noPaperPlane": false } 
        ] });
        let target = await users[getRandomInt(0, users.length - 1)];

        if (args.length === 0) return ctx.reply("Be sure to add your message after the command. To do this, kindly hold the slash command, instead of clicking.")
        if (users.length < 0 || !target || target === undefined) return ctx.reply("This feature is unavailable for the mean time. Please try again later.");

        await ctx.telegram.sendMessage(target?.id, 
            `*💌 ${!user?.settings.showUsername ? "Someone" : author.username} had sent you a message!*\n\n\`\`\`message \"${args.join()}\"\`\`\``, 
            { parse_mode: 'Markdown' }
        );
        await ctx.telegram.sendMessage(target?.id, 
            `Kindly _copy_ the text below to reply and add your message after:`, 
            { parse_mode: 'Markdown' }
        )
        ctx.telegram.sendMessage(target?.id,
            `/reply ${ctx.chat.id}`
        )
        .then((c) => ctx.reply(`✅ You have sent a message to *${!target?.settings.showUsername ? "someone" : target?.username}*!`,
            { parse_mode: "Markdown" }
        ));
        
    }
}