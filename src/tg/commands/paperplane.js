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

        if (args.length === 0) return ctx.reply("*✈️  Welcome to /paperplane, where you can send a message to a random PUPian.*\n\nTo properly use this, kindly _long press_ the command, instead of clicking.\n\n\`\`\`format /paperplane <message>\`\`\`\n\`\`\`format /reply <user_id> <message>\`\`\`",
            { parse_mode: "Markdown" }
        );
        if (user.settings.noPaperPlane) return ctx.reply("You have disabled /paperplane and /reply commands. To enable, kindly visit the /settings.");
        if (users.length < 0 || !target || target === undefined) return ctx.reply("This feature is unavailable for the mean time. Please try again later.");

        await ctx.telegram.sendMessage(target?.id, 
            `*💌 You have a new message!*\n\n\`\`\`${!user?.settings.showUsername ? "anonyPUPian" : author.username} ${args.join()}\`\`\``, 
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