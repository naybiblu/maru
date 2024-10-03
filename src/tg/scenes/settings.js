const { Scenes, session } = require("telegraf");
const { message } = require("telegraf/filters");
const { model } = require("../../assets/db/models/user");
const { getRandomInt } = require("../../assets/func/misc");

module.exports = {
    name: "chat",
    async run (tg) {

        const scene = new Scenes.BaseScene("chat");

        scene.enter(async ctx => {

            const user = await model.findOne({ id: ctx.update.message.from.id });

            ctx.reply("Finding a PUPian...");

            let users = await model.find({ id: { $ne: "5751128680" } });
            let target = await users[getRandomInt(0, users.length - 1)];
            console.log(users);

            ctx.reply(`Congratulations! Meet ${target?.username}!`);

            tg.on(message("text"), async (c) => {
                c.telegram.sendMessage(target.id, c.text);
                if (c.text.startsWith("!stop")) tg.removeListener(message("text"));
                console.log(32)
            });

        });

        scene.hears("!stop", ctx => { ctx.reply(0); ctx.scene.leave() });

        const stage = new Scenes.Stage([scene]);
        tg.use(stage.middleware());

    }
}