const { get } = require("axios");
const {
    GOOGLE_SHEETID2: id,
    GOOGLE_KEY: key
} = process.env;
const { getCollegeInfo } = require("./../../assets/func/components");
require("dotenv").config();

module.exports = {
    name: "randomCollege",
    async run (ctx) {

        const colleges = (await get(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Colleges?key=${key}`)).data.values;
        
        colleges.shift();

        await getCollegeInfo(ctx, colleges).catch(async (err) => await ctx.reply("Something went wrong. Please try again later."));

    }
};