const Markup = require('telegraf/markup');


module.exports = {
    name: "spotifyplaylist",
    async execute (ctx) {

        await ctx.reply(`*🎶 Welcome to /spotifyplaylist, where you can get random Spotify playlist shared by your fellow PUPians!\n\n*` +
            "You may share your Spotify playlist by clicking *Contribute*.",
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [ Markup.button.url('Contribute', "https://forms.gle/QjgxwfX5DZiA8TyM6") ],
                    [ Markup.button.callback('Feeling Lucky?', 'randomSP'), Markup.button.callback('Back', 'mainMenu') ]
                ])
            }
        );

    }
};