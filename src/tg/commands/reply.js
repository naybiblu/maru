const Markup = require('telegraf/markup');
const { model } = require("../../assets/db/models/user");

module.exports = {
    name: "reply",
    async execute (ctx, args) {

        let senderId = args.shift();
        let sender = await model.findOne({ id: senderId });
        let author = ctx.update.message.from;
        let user = await model.findOne({ id: author.id });

        if (args.length === 0) return ctx.reply("Be sure to add your message after the command. To do this, kindly hold the slash command, instead of clicking.")
        if (sender?.settings.noPaperPlane) return ctx.reply(`${sender?.settings.showUsername ? "Someone" : sender?.username} is not available for this feature. Please try again later.`);

        await ctx.telegram.sendMessage(senderId, 
            `*💌 ${!user?.settings.showUsername ? "Someone" : author.username} had sent you a message!*\n\n\`\`\`message \"${args.join()}\"\`\`\``, {
            parse_mode: 'Markdown'
        })
        await ctx.telegram.sendMessage(senderId, 
            `Kindly _copy_ the text below to reply and add your message after:`, 
            { parse_mode: 'Markdown' }
        )
        ctx.telegram.sendMessage(senderId,
            `/reply ${ctx.chat.id}`
        )
        .then(() => ctx.reply(`✅ You have sent a message to *${!sender?.settings.showUsername ? "someone" : sender?.username}*!`,
            { parse_mode: "Markdown" }
        ));
        
    }
}