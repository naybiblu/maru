const { Scenes, session } = require("telegraf");
const Markup = require('telegraf/markup');
const { startShowUsername, endStart } = require("./../../assets/func/components");
const { model } = require("./../../assets/db/models/user");

module.exports = {
    name: "start",
    async run (tg) {

        const scene = new Scenes.BaseScene("start");

        scene
            .enter(async (ctx) => {

                await ctx.reply("Hi, I am *Maru*! I can be your virtual companion in attending PUP Sta. Mesa! 👋", 
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            Markup.button.callback('Hi!', 'sHi')
                        ])
                    }
                );

            })
            .action("sHi", async (ctx) => {

                await ctx.answerCbQuery();
                await ctx.editMessageText("Before we continue this exciting conversation, I just want to ask you a few things. Is that okay?",
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            Markup.button.callback('Sure!', 'sSure')
                        ])
                    }
                );
                
            })
            .action("sSure", async (ctx) => {

                await ctx.answerCbQuery();
                await ctx.editMessageText("First, kindly read this Data Privacy Notice:\n\n*Republic Act No. 10173, otherwise known as the Data Privacy Act, is a law that seeks to protect all forms of information, be it private, personal, or sensitive. It is meant to cover both natural and juridical persons involved in the processing of personal information.\n\nWith this, the BEST Society respect and value your rights as a data subject under the Data Privacy Act. The organization are committed to protecting the personal data you provide in accordance with its requirements. In this regard, we implement reasonable and appropriate security measures to maintain the confidentiality, integrity, and availability of your personal data.*\n\nPlease click the button below if you understand the aforementioned text.", 
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            Markup.button.callback('I understand.', 'sUnderstood')
                        ])
                    }
                );

            })
            .action("sUnderstood", async (ctx) => { 
            
                await ctx.answerCbQuery();
                await ctx.editMessageText("Do you want to send and receive messages from random PUPian(s)?",
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            Markup.button.callback('Yes', 'sYes1'),
                            Markup.button.callback('No', 'sNo1')
                        ])
                    }
                );

            }) 
            .action("sYes1", async (ctx) => await startShowUsername(ctx))
            .action("sNo1", async (ctx) => {

                await model.updateOne( 
                    { id: ctx.update.callback_query.from.id },
                    { $set: { "settings.noPaperPlane": true } }
                );

                await startShowUsername(ctx);
                
            })
            .action("sYes2", async (ctx) => {
                
                await model.updateOne( 
                    { id: ctx.update.callback_query.from.id },
                    { $set: { "settings.showUsername": false } }
                );

                await endStart(ctx);
            })
            .action("sNo2", async (ctx) => await endStart(ctx));

        const stage = new Scenes.Stage([scene]);
        tg.use(session());
        tg.use(stage.middleware());

    }
}