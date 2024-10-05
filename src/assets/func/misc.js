const colors = require('colors/safe');
const { get } = require("axios");
const mongo = require("mongoose");
const { 
  MONGO_URL: url,
  GOOGLE_KEY: key,
  GOOGLE_SHEETID: id
} = process.env;
const { readdirSync } = require("fs");

exports.log = { 

    error (provider, message, err = undefined) {
  
      console.log(colors.red.bold(`[${provider}]: `) + colors.red(`${message}\n${err}`));
  
    },
  
    success (provider, message) {
  
      console.log(colors.green.bold(`[${provider}]: `) + colors.green(`${message}`));
  
    }
  
};

exports.readDirGetJS = (path, func = () => {}) => {

  readdirSync(path).filter((e) => e.endsWith(".js")).forEach(func);

};

exports.getRandomInt = (min, max) => {
  
  return Math.floor(Math.random() * (max - min)) + min;
  
};

exports.mongo = {

    async connect () {

      mongo.set('strictQuery', true);
	    mongo.set('autoIndex', false);

	    await mongo.connect(url);
	    mongo.Promise = global.Promise;

    },

    async disconnect () {

        setTimeout(async () => {

            await mongo.disconnect();

        }, 2000);

    }

};

exports.getFoodData = async (position) => {

  let data = (await get(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${position}?key=${key}`)).data;

  data = data.values.slice(1).map(item => {
    return {
      businessName: item[0],
      location: item[1],
      foodName: item[2],
      type: item[3],
      price: item[4],
      date: item[5]
    };
  });

  return data.reduce((acc, item) => {

    const existingBusiness = acc.find(business => business.businessName === item.businessName);
  
    if (existingBusiness) {
      const existingType = existingBusiness.types.find(type => type.type === item.type);
  
      if (existingType) {
        existingType.entries.push(item);
      } else {
        existingBusiness.types.push({
          type: item.type,
          entries: [item]
        });
      }
    } else {
      acc.push({
        businessName: item.businessName,
        types: [{
          type: item.type,
          entries: [item]
        }]
      });
    }
  
    return acc;
  }, []);

};