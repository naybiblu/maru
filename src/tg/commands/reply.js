const { model } = require("../../assets/db/models/user");

module.exports = {
    name: "reply",
    async execute (ctx, args) {

        let senderId = args.shift();
        let sender = await model.findOne({ id: senderId });
        let author = ctx.update.message.from;
        let user = await model.findOne({ id: author.id });

        if (args.length === 0) return ctx.reply("*✈️  Welcome to /reply, where you can send a response to a random message.*\n\nTo properly use this, kindly utilize the command provided with the message.\n\n\`\`\`format /reply <user_id> <message>\`\`\`\n\`\`\`format /paperplane <message>\`\`\`",
            { parse_mode: "Markdown" }
        );
        if (user.settings.noPaperPlane) return ctx.reply("You have disabled /paperplane and /reply commands. To enable, kindly visit the /settings.");
        if (sender?.settings.noPaperPlane) return ctx.reply(`${sender?.settings.showUsername ? "Someone" : sender?.username} is not available for this feature. Please try again later.`);

        await ctx.telegram.sendMessage(senderId, 
            `*💌 You have a new message!*\n\n\`\`\`${!user?.settings.showUsername ? "anonyPUPian" : author.username} ${args.join()}\`\`\``,  
            { parse_mode: 'Markdown' })
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