const { Scenes, session } = require("telegraf");
const Markup = require('telegraf/markup');
const { 
    startShowUsername, 
    endStart, 
    settingsMenu, 
    foodWatchInfo, 
    foodWatchMenu,
    checkPUPWeather,
    checkPUPNews,
    checkDevMsg
} = require("./../assets/func/components");
const { model } = require("./../assets/db/models/user");
const { GOOGLE_SHEETLINK: sheet } = process.env;
require("dotenv").config();

module.exports = {
    name: "scenes",
    async run (tg) {

        // start
        const startScene = new Scenes.BaseScene("start");

        startScene
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

        
        // menu
        const menuScene = new Scenes.BaseScene("menu");

        menuScene
            .enter(async ctx => await checkPUPWeather(ctx, ctx.update["message"] ? false : true))
            .action("mWeatherToday", async ctx => await checkPUPWeather(ctx, true))
            .action("mWeatherTom", async ctx => await checkPUPWeather(ctx, true, false))
            .action("mNews", async ctx => await checkPUPNews(ctx))
            .action("mDevMsg", async ctx => await checkDevMsg(ctx));


        // settings
        const settingsScene = new Scenes.BaseScene("settings");

        settingsScene 
            .enter(async ctx => {

                const author = ctx.update.message.from;

                await model.updateOne(
                    { id: author.id },
                    { $set: { username: author.username } }
                );

                await settingsMenu(ctx, false);

            })
            .action("setNoPP", async ctx => {

                const author = ctx.update.callback_query.from;
                const user = await model.findOne( { id: author.id });

                await model.updateOne(
                    { id: author.id },
                    { $set: { "settings.noPaperPlane": !user?.settings.noPaperPlane } }
                );

                await settingsMenu(ctx);

            })
            .action("setShowUN", async ctx => {

                const author = ctx.update.callback_query.from;
                const user = await model.findOne( { id: author.id });

                await model.updateOne(
                    { id: author.id },
                    { $set: { "settings.showUsername": !user?.settings.showUsername } }
                );

                await settingsMenu(ctx);

            });

            // foodtrip
            const ftScene = new Scenes.BaseScene("foodtrip");

            ftScene
                .enter(async ctx => {

                    await model.updateOne(
                        { id: ctx.update.message.from.id }, 
                        { $set: { indexPagination: 0 } }
                    );
            
                    await foodWatchMenu(ctx, false);

                })
                .action("ftLoc1", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: false,
                        cluster: "PUP Lagoon"
                    });

                })
                .action("ftNext1", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "next",
                        cluster: "PUP Lagoon"
                    });

                })
                .action("ftPrev1", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "prev",
                        cluster: "PUP Lagoon"
                    });

                })
                .action("ftLoc2", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: false,
                        cluster: "PUP Stop and Shop"
                    });

                })
                .action("ftNext2", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "next",
                        cluster: "PUP Stop and Shop"
                    });

                })
                .action("ftPrev2", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "prev",
                        cluster: "PUP Stop and Shop"
                    });

                })
                .action("ftLoc3", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: false,
                        cluster: "Teresa Drive"
                    });

                })
                .action("ftNext3", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "next",
                        cluster: "Teresa Drive"
                    });

                })
                .action("ftPrev3", async ctx => {

                    await foodWatchInfo(ctx, {
                        paginated: true,
                        operator: "prev",
                        cluster: "Teresa Drive"
                    });

                })
                .action("ftBack", async ctx => {

                    await foodWatchMenu(ctx);

                });


            // registering scenes
            const stage = new Scenes.Stage([
                startScene, 
                settingsScene, 
                ftScene,
                menuScene
            ]);
            tg.use(session());
            tg.use(stage.middleware());

    }

};