const moment = require("moment");
const Markup = require('telegraf/markup');
const { getFoodData } = require("../../assets/func/misc");
const { model } = require("./../../assets/db/models/user");

exports.foodWatchInfo = async ( ctx, { paginated, operator, location }) => {

    let data = await getFoodData(location);
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

    await ctx.editMessageText(`*[📍 ${location}]*\nThe following are the food prices from *${business.businessName}*, as of _${moment().format('MMMM Do YYYY')}_:\n\n${business.types.map(type => `\t*${type.type}:*\n${type.entries.map(entry => `\t\t\t${entry.foodName} (Php ${entry.price})\n`).join('')}`).join('\n')}`, 
        { 
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                Markup.button.callback('<', `ftPrev${suffixCode[location]}`, checkIfHide),
                Markup.button.callback('Back', 'ftBack'),
                Markup.button.callback('>', `ftNext${suffixCode[location]}`, checkIfHide)
            ],  
            { columns: checkIfHide ? 1 : 3 } )
        }
    );

};

exports.foodWatchMenu = async (ctx) => {

    await model.updateOne(
        { id: ctx.update.callback_query.from.id }, 
        { $set: { indexPagination: 0 } }
    );

    await ctx.answerCbQuery();

    await ctx.editMessageText(
        `*🍴 Welcome to /foodtrip: your guide to every food establishment within and around PUP.*\n\nKindly choose a location you want to visit or contribute with us in updating the _PUP Sta. Mesa Food Price Watch_ Google Sheets file.`, 
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                Markup.button.callback('PUP Lagoon', 'ftLoc1'),
                Markup.button.callback('PUP Stop and Shop', 'ftLoc2'),
                Markup.button.callback('Teresa Drive', 'ftLoc3'),
                Markup.button.url('Contribute', 'https://docs.google.com/spreadsheets/d/1NfHae5yGx0fbi_0WnbbZKKW0fuUOhLluYvBO53Ej2XM/edit?usp=sharing')
            ],  
            { columns: 1 } )
        }
    );

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