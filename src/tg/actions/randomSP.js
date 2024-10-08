const { get } = require("axios");
const Markup = require('telegraf/markup');
const {
    GOOGLE_SHEETID2: id,
    GOOGLE_KEY: key
} = process.env;
const { getRandomInt } = require("./../../assets/func/misc");
require("dotenv").config();

module.exports = {
    name: "randomSP",
    async run (ctx) {

        const data = (await get(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Spotify%20Playlist%20Links?key=${key}`)).data.values;

        await ctx.answerCbQuery();
        await ctx.editMessageText(`*🎶 Welcome to /spotifyplaylist, where you can get random Spotify playlist shared by your fellow PUPians!*\n\n` +
            "You may share your Spotify playlist by clicking *Contribute*.\n\n" +
            `Here is your playlist:\n${data[getRandomInt(0, data.length - 1)][0]}`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [ Markup.button.url('Listen', data[getRandomInt(0, data.length - 1)][0]), Markup.button.url('Contribute', "https://forms.gle/QjgxwfX5DZiA8TyM6") ],
                    [ Markup.button.callback('Feeling Lucky?', 'randomSP'), Markup.button.callback('Back', 'mainMenu') ]
                ])
            }
        );

    }
};