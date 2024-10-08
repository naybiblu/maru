const { get } = require("axios");
const {
    GOOGLE_SHEETID2: id,
    GOOGLE_KEY: key
} = process.env;
const { getCollegeInfo } = require("./../../assets/func/components");
require("dotenv").config();

module.exports = {
    name: "colleges",
    async execute (ctx, args) {

        const colleges = (await get(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Colleges?key=${key}`)).data.values;

        colleges.shift();
        
        let collegeList = [];

        colleges.forEach(college => collegeList.push(college[1]));

        if (args.length === 0) return ctx.reply("*📚  Welcome to /colleges, where you can retrieve information of various colleges from PUP.*\n\n" +
            "To properly use this, kindly _long press_ the command, instead of clicking.\n\n" +
            `\`\`\`format /colleges <initialism>\`\`\`\n\`\`\`initialism ${collegeList.join("\n\t")}\`\`\``,
            { parse_mode: "Markdown" }
        );

        if (collegeList.forEach(c => c[1].toLowerCase() === args[0].toLowerCase())) return ctx.reply("*📚  Welcome to /colleges, where you can retrieve information of various colleges from PUP.*\n\n" +
            "To properly use this, kindly input the appropriate initialism as stated below.\n\n" +
            `\`\`\`format /colleges <initialism>\`\`\`\n\`\`\`initialism ${collegeList.join("\n\t")}\`\`\``,
            { parse_mode: "Markdown" }
        );

        await getCollegeInfo(ctx, colleges, false, args);
        
    }
}