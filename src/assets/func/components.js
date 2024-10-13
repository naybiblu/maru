const moment = require("moment-timezone");
const Markup = require('telegraf/markup');
const { parse } = require('rss-to-json');
const { 
    getFoodData,
    getDay,
    getRandomInt,
    getMessage,
    getStateOfTheDay: statify,
    readPUPWeatherData: weatherData
} = require("../../assets/func/misc");
const { model } = require("./../../assets/db/models/user");
const { 
    GOOGLE_SHEETLINK: sheet,
    DISCORD_DEVSMSG_CHANNELID: dmChanId
} = process.env;
require("dotenv").config();

exports.foodWatchInfo = async ( ctx, { paginated, operator, cluster }) => {

    let data = await getFoodData(cluster);
    let author = ctx.update.callback_query.from; 
    let user = await model.findOne({ id: author.id });
    let checkIfHide = data.length <= 1;
    let index, condition;

    let suffixCode = {
        "PUP Lagoon": "1",
        "PUP Stop and Shop": "2",
        "Teresa Drive": "3"
    };

    if (operator && operator.includes("prev")) condition = user?.indexPagination <= 0 ? data.length - 1 : 0;
    if (operator && operator.includes("next")) condition = user?.indexPagination >= data.length - 1 ? 0 : user.indexPagination + 1;
    
    if (paginated) {

        index = condition;

        await model.updateOne(
            { id: user?.id }, 
            { $set: { indexPagination: condition } }
        );

    } else {

        index = 0;

        await model.updateOne(
            { id: user?.id }, 
            { $set: { indexPagination: 0 } }
        );

    };

    let business = await data[index];

    console.log(condition, business)

    await ctx.answerCbQuery();

    await ctx.editMessageText(`*[📍 ${cluster}]*\nThe following are the food prices from *${business.businessName}*:\n\n${business.types.map(type => `\t*${type.type}:*\n${type.entries.map(entry => `\t\t\t_${entry.foodName}_ (Php ${entry.price})\n`).join('')}`).join('\n')}`, 
        { 
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                Markup.button.callback('◄ Previous', `ftPrev${suffixCode[cluster]}`, checkIfHide),
                Markup.button.callback('Back', 'ftBack'),
                Markup.button.callback('Next ►', `ftNext${suffixCode[cluster]}`, checkIfHide)
            ],  
            { columns: checkIfHide ? 1 : 3 } )
        }
    );

};

exports.foodWatchMenu = async (ctx, queryBased = true) => {

    const author = queryBased ? ctx.update.callback_query.from : ctx.update.message.from;

    await model.updateOne(
        { id: author.id }, 
        { $set: { indexPagination: 0 } }
    );

    const content = {
        text: `*🍴 Welcome to /foodtrip: your guide to every food establishment within and around PUP.*\n\nKindly choose a location you want to visit or contribute with us in updating the _PUP Sta. Mesa Food Price Watch_ Google Sheets file.`, 
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ Markup.button.callback('PUP Lagoon', 'ftLoc1') ],
                [ Markup.button.callback('PUP Stop and Shop', 'ftLoc2') ],
                [ Markup.button.callback('Teresa Drive', 'ftLoc3') ],
                [ Markup.button.url('Contribute', sheet), Markup.button.callback('Back', 'mainMenu') ]
            ])
        }
    };

    if (queryBased) { 
        
        await ctx.answerCbQuery();
        await ctx.editMessageText(content.text, content.options);

    } else await ctx.reply(content.text, content.options);

};

exports.settingsMenu = async (ctx, queryBased = true) => {

    const author = queryBased ? ctx.update.callback_query.from : ctx.update.message.from;
    const user = await model.findOne( { id: author.id });
    const content = {
        text: "*🔑 Welcome to /settings, where you can change your profile and/or preferences.*\n\nKindly click the button that favors on your preferred course of action. To change your username, you may utilize the Settings tab of Telegram app." +
        `\n\nUsername: *${user?.username}*\nUse /paperplane: *${user?.settings.noPaperPlane ? "No" : "Yes"}*\nShow username: *${user?.settings.showUsername ? "Yes" : "No"}*`, 
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ Markup.button.callback(`Use /paperplane`, 'setNoPP'), Markup.button.callback(`Show Username`, 'setShowUN') ],
                [ Markup.button.callback(`Back`, 'mainMenu') ]
            ])
        }
        
    };

    if (queryBased) {

        await ctx.answerCbQuery();
        await ctx.editMessageText(content.text, content.options);

    } else await ctx.reply(content.text, content.options); 

};

exports.startShowUsername = async (ctx) => {

    await ctx.answerCbQuery();
    await ctx.editMessageText("Do you want to hide your Telegram username to the public?",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('Yes', 'sYes2'),
                Markup.button.callback('No', 'sNo2')
            ])
        }
    );

};

exports.endStart = async (ctx) => {

    const author = ctx.update.callback_query.from;
    await model.updateOne( 
        { id: author.id },
        { $set: { oldie: true } }
    );

    await ctx.answerCbQuery();
    await ctx.editMessageText("Thank you for your cooperation. You may visit the main /menu.");
    await ctx.scene.leave();

};

exports.checkPUPWeather = async (ctx, queryBased = true, getToday = true) => {

    const author = queryBased ? ctx.update.callback_query.from : ctx.update.message.from;
    const [today, tomorrow] = await weatherData();
    const data = getToday ? today : tomorrow;
    //const checkIfToday = getDay(data.time + 28800) === getDay(Date.now());
    const date = new Date(data.time * 1000);
    const content = {
        text: `*👋 Good ${statify().en}, ${author.username}!\n\n*` +
        `We expect${data.weatherCode.text.endsWith("s") ? " " : ["a", "e", "i", "o", "u"].includes([...data.weatherCode.text][0]) ? " an " : " a "}` +
        `${data.weatherCode.emoji} *${data.weatherCode.text.toLowerCase()}* ${getToday ? "today" : "tomorrow"} (${moment.tz(data.time * 1000, "Asia/Manila").format("LL")}) in PUP Sta. Mesa, ` +
        `with *${data.rainProb} chance of raining*.\n\n` +
        `\`\`\`temperature maximum: ${data.maxTemp}\n\tminimum: ${data.minTemp}\`\`\``,
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ 
                    Markup.button.callback("◄ Announcement", "mAnn", !getToday), 
                    Markup.button.callback(`Tomorrow ►`, 'mWeatherTom', !getToday),
                    Markup.button.callback("◄ Today", "mWeatherToday", getToday), 
                    Markup.button.callback(`Dev\'s Message ►`, 'mDevMsg', getToday)
                ]
            ])
        }
    };

    if (queryBased) {

        await ctx.answerCbQuery();
        await ctx.editMessageText(content.text, content.options);

    } else await ctx.reply(content.text, content.options);

};

exports.checkPUPNews = async (ctx) => {

    const rss = await parse('https://www.pup.edu.ph/rss/news');
    const firstNews = rss.items[0];
    const article = firstNews.description.split("<br/>");
    const [author, text] = article;
    const sentences = text.split("\n\n");
    //const photo = text.match(/<img.*?src="(.*?)"/i)[1];
    const content = {
        text: `NEWS | *${firstNews.title}*\n` +
        `by _${author}_\n\n` +
        `${sentences[1].replace(/<[^>]*>?/gm, '')}...`,
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ Markup.button.url("Read More", firstNews.link) ],
                [ 
                    Markup.button.callback("◄ Dev\'s Message", "mDevMsg"), 
                    Markup.button.callback(`Announcement ►`, 'mAnn'),
                ]
            ])
        }
    };

    await ctx.answerCbQuery();
    await ctx.editMessageText(content.text, content.options);
    //await ctx.editMessageMedia({ source: photo });

};

exports.checkPUPAnnouncement = async (ctx) => {

    const rss = await parse('https://www.pup.edu.ph/rss/announcements/');
    const firstAnn = rss.items[0];
    const article = firstAnn.description.split("<br/>")[1];
    //const photo = text.match(/<img.*?src="(.*?)"/i)[1];
    const content = {
        text: `ANNOUNCEMENT | *${firstAnn.title}*\n\n` +
        `${article.replace(/<[^>]*>?/gm, '')}`,
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ Markup.button.url("Read More", firstAnn.link) ],
                [ 
                    Markup.button.callback("◄ News", "mNews"), 
                    Markup.button.callback(`Weather ►`, 'mWeatherToday'),
                ]
            ])
        }
    };

    await ctx.answerCbQuery();
    await ctx.editMessageText(content.text, content.options);
    //await ctx.editMessageMedia({ source: photo });

};

exports.checkDevMsg = async (ctx) => {

    const devMsg = await getMessage(dmChanId);
    const content = { 
        text: devMsg.content,
        options: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [ 
                    Markup.button.callback("◄ Weather", "mWeatherTom"), 
                    Markup.button.callback(`News ►`, 'mNews'),
                ]
            ])
        }
    };

    await ctx.answerCbQuery();
    await ctx.editMessageText(content.text, content.options);

};

exports.getCollegeInfo = async (ctx, collegesArray, queryBased = true, args = 0) => {

    const college = queryBased ? collegesArray[getRandomInt(0, collegesArray.length - 1)] : collegesArray.find(c => c[1].toLowerCase() === args[0].toLowerCase());
    const content = {
        text: `The following programs are offered by the *PUP ${college[0]} (${college[1]})*:\n\n${college[2].split("\n").map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
        options: {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [ Markup.button.url("More Info", `https://www.pup.edu.ph/${college[1].toLowerCase()}`) ],
                [ Markup.button.url("Official Facebook Page", college[3] === "" ? "https://facebook.com" : college[3] , college[3] === "") ],
                [ Markup.button.url("Student Council Facebook Page", college[4]) ],
                [ /*Markup.button.callback("Feeling Lucky?", "randomCollege"), */Markup.button.callback("Back", "mainMenu") ]
            ])
        }
    };

    if (queryBased) {

        await ctx.answerCbQuery();
        await ctx.editMessageText(content.text, content.options);

    } else await ctx.reply(content.text, content.options);

};