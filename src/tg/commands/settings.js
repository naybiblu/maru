const { message } = require("telegraf/filters");
const { model } = require("../../assets/db/models/user");
const { getRandomInt } = require("../../assets/func/misc");
const { tg } = require("../../assets/func/clients");

module.exports = {
    name: "settings",
    async execute (ctx) {

        /*const author = ctx.update.message.from;
        let user = await model.findOne({ id: author.id });

        if ([1, 2].includes(user.chatStatus)) return ctx.reply("You are still on chat mode! Type \"!stop\" to go back to main menu.");
        
        user = await model.findOneAndUpdate(
            { id: user.id }, 
            { $set: { chatStatus: 1 } },
            { returnNewDocument: true }
        );

        ctx.reply("Finding a PUPian...");

        let users = await model.find({ $and: [
            { id: { $ne: user.id } },
            { chatStatus: 0 }
        ] });
        let target = await users[getRandomInt(0, users.length - 1)];
        console.log(users, target)
        
        await model.updateOne(
            { id: user.id }, 
            { $set: { chatWith: target?.id } }
        );

        await model.updateOne(
            { id: target?.id }, 
            { $set: { chatWith: user.id } }
        );

        user = await model.findOneAndUpdate(
            { id: user.id }, 
            { $set: { chatStatus: 2 } },
            { returnNewDocument: true }
        );

        ctx.reply(`Congratulations! Meet ${target?.username}!`);

        tg.on(message("text"), async (c) => {

            if (c.text.startsWith("!stop")) await model.updateOne(
                { id: user.id }, 
                [
                    { $set: { chatStatus: 0 } },
                    { $unset: [ "chatWith" ] }
                ]
            );

            if ([0, 1].includes((await model.findOne({ id: user.id })).chatStatus)) return;
            console.log(ctx.text)
            //ctx.reply(`**${target?.username}**: ${ctx.text}`);
            c.telegram.sendMessage((await model.findOne({ id: user.id })).chatWith, `${user.username}: ${c.text}`);

        });*/
        
    }
}