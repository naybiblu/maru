const colors = require('colors/safe');
const { get } = require("axios");
const mongo = require("mongoose");
const { 
  MONGO_URL: url,
  GOOGLE_KEY: key,
  GOOGLE_SHEETID: id,
  DISCORD_PUPWEATHER_CHANNELID: weatherChanId,
  PUPWEATHER_APIKEY: weatherLink
} = process.env;
const { readdirSync } = require("fs");
const { dc } = require("./clients");
const { threadId } = require('worker_threads');

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

exports.changeTimezone = (date, ianatz = "Asia/Manila") => {

  var invdate = new Date(date.toLocaleString('en-US', {
      timeZone: ianatz
    }));

  var diff = date.getTime() - invdate.getTime();

  return new Date(date.getTime() - diff); 

};

exports.toMilitaryTime = (string) => {

  const [time, modifier] = string.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === "12" && modifier === 'PM') hours = "12";
  else if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
  else if (hours === '12' && modifier === "AM") hours = '00';

  return `${hours}:${minutes}`;

};

exports.getAccurateDate = (element, date = Date.now()) => {

  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Manila',
  });
  const monthEnum = {
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  };
  date = formatter.format(date).split(" ");
  let output;

  switch (element) {

    case "whole": output = date.join(" "); break;
    case "dayWord": output = date[0].replace(",", ""); break;
    case "monthWord": output = date[1]; break;
    case "monthNumber": output = monthEnum[date[1]]; break;
    case "dayNumber": output = parseInt(date[2].replace(",", ""), 10); break;
    case "year": output = parseInt(date[3], 10); break;
    case "time": output = date[5] + " " + date [6];

  };

  return output;

};

exports.getStateOfTheDay = (time = Date.now()) => {

  const {
    toMilitaryTime,
    getAccurateDate
  } = this;
  const militaryTime = toMilitaryTime(getAccurateDate("time", time));
  const rawHour = militaryTime.split(":")[0];
  const hour = parseInt(rawHour, 10);
  let output;

  if (hour < 12 && hour !== 12) output = { en: "morning", tl: "umaga" };
  else if (hour === 12) output = { en: "noon", tl: "tanghali" };
  else if (hour < 18) output = { en: "afternoon", tl: "hapon" };
  else output = { en: "evening", tl: "gabi" };

  console.log(hour === 12, hour, time)

  return output;

};

exports.getWeekNumber = () => {

  const date = new Date();
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const millisecondsSinceFirstDay = date - firstDayOfYear;
  const daysSinceFirstDay = (millisecondsSinceFirstDay + 86400000) / (24 * 60 * 60 * 1000);
  const weekNumber = Math.ceil(daysSinceFirstDay / 7);

  return weekNumber;

};

exports.getDay = (unix, humanized = false) => {

  const daysOftheWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const date = new Date(unix * 1000);
  let day = this.changeTimezone(date).getDay();

  return humanized ? daysOftheWeek[day] : day;

};

exports.weekToUnix = (weekNumber, year) => {

  const firstDayOfYear = new Date(year, 0, 1);
  const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
  const startOfWeek = firstDayOfYear.getTime() + (weekNumber - 1) * millisecondsInWeek;

  return startOfWeek / 1000;

};

exports.mdyToUnix = (month, day, year) => {

  const date = new Date(year, month, day);

  return Math.floor(date.getTime() / 1000);

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
      cluster: item[1],
      foodName: item[2],
      type: item[3],
      price: item[4],
      date: item[5],
      location: item[6]
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

exports.extractCode = async () => {

  const channel = await dc.channels.fetch(weatherChanId);
  const rawCode = (await channel.messages.fetch({ limit: 1 })).first().embeds[0].footer.text;
  const extractedCode = rawCode.match(/\d+/g).map(Number);
  const [month, day, year] = extractedCode;

  return this.mdyToUnix(month, day, year);

};

exports.sendMessage = async (channelId, message) => {

  dc.channels.fetch(channelId)
    .then(channel => channel.send(message));

};

exports.getMessage = async (channelId) => {

  return dc.channels.fetch(channelId)
    .then(channel => channel.messages.fetch({ limit: 1 }))
    .then(messages => {
      return messages.first();
    });

};

exports.getSimilarFooterCount= async (footerText) => {

  return dc.channels.fetch(weatherChanId)
    .then(channel => channel.messages.fetch({ limit: 1 }))
    .then(messages => {

      let count = 0;

      messages.forEach(message => {

        if (message.embeds.length > 0 && message.embeds[0].footer && message.embeds[0].footer.text === footerText) count++;
      
      });

      return count;
    
    });

};

exports.getFooterText = async () => {

  return dc.channels.fetch(weatherChanId)
    .then(channel => channel.messages.fetch({ limit: 1 }))
    .then(messages => {

      return messages.first().embeds[0].footer.text;

    });

};

exports.sendDailyPUPWeather = async () => {

  const {
    extractCode,
    getSimilarFooterCount,
    sendMessage,
    getAccurateDate,
    log
  } = this;

  const targetDate = await extractCode();
  const today = Math.floor(Date.now() / 1000);
  const month = getAccurateDate("monthNumber");
  const day = getAccurateDate("dayNumber");
  const year = getAccurateDate("year");
  const similarFooterCount = await getSimilarFooterCount(`M${month}D${day}Y${year}`);

  console.log(similarFooterCount >= 1, month, day, year, today, targetDate)
  if (similarFooterCount >= 1) return;
  console.log("hi")
  if (today < targetDate + 46800) return;
  console.log("gana")

  const dailyData = (await get(weatherLink)).data.daily;
  const time = dailyData.time;
  const weatherCode = dailyData.weather_code;
  const maxTemperature = dailyData.temperature_2m_max;
  const minTemperature = dailyData.temperature_2m_min;
  const precipitationProb = dailyData.precipitation_probability_max;
  const organizedData = [];

  for (let i = 0; i < time.length; i++) {

    const dataObject = {
      time: time[i],
      weatherCode: weatherCode[i],
      maxTemp: maxTemperature[i],
      minTemp: minTemperature[i],
      rainProb: precipitationProb[i]
    };

    organizedData.push(dataObject);

  };

  await sendMessage(weatherChanId, {
    embeds: [
      {
        description: JSON.stringify(organizedData),
        footer: {
          text: `M${month}D${day}Y${year}`
        }
      }
    ]
  });

  log.success(
    "Discord",
    `Sent PUP weather update for ${getAccurateDate("whole")}`
  );

};

exports.humanizedPUPWeatherData = (jsonData) => {

  const weatherCodeReading = {
    "0": { text: "Clear skies", emoji: "☀", code: "0" },
    "1": { text: "Mainly clear skies", emoji: "🌤", code: "1" }, 
    "2": { text: "Partly cloudy", emoji: "🌥", code: "2" },
    "3": { text: "Overcast", emoji: "☁", code: "3" },
    "51": { text: "Light drizzle", emoji: "🌦", code: "51"},
    "53": { text: "Moderate drizzle", emoji: "🌦", code: "53"},
    "55": { text: "Heavy drizzle", emoji: "🌦", code: "55"},
    "61": { text: "Light rain", emoji: "🌧", code: "61"},
    "63": { text: "Moderate rain", emoji: "🌧", code: "63"},
    "65": { text: "Heavy rain", emoji: "🌧", code: "65"},
    "80": { text: "Slight rain showers", emoji: "🌧", code: "80"},
    "81": { text: "Moderate rain showers", emoji: "🌧", code: "81"},
    "82": { text: "Violent rain showers", emoji: "🌧", code: "82"},
    "95": { text: "Slight or heavy thunderstorm", emoji: "⛈", code: "95"},
    "96": { text: "Slight or heavy thunderstorm", emoji: "⛈", code: "96"}
  };
  let data = [];
  
  if (Array.isArray(jsonData)) {
    
    for (let i = 0; i < jsonData.length; i++) {

    const dataObject = {
      time: jsonData[i].time,
      weatherCode: weatherCodeReading[jsonData[i].weatherCode],
      maxTemp: `${jsonData[i].maxTemp} °C`,
      minTemp: `${jsonData[i].minTemp} °C`,
      rainProb: `${jsonData[i].rainProb}%`
    };

    data.push(dataObject);

  };

} else data = {
    time: jsonData.time,
    weatherCode: weatherCodeReading[jsonData.weatherCode],
    maxTemp: `${jsonData.maxTemp} °C`,
    minTemp: `${jsonData.minTemp} °C`,
    rainProb: `${jsonData.rainProb}%`
  };

  return data;

};

exports.readPUPWeatherData = async (getTodayData = true, humanized = true) => {

  const { 
    getDay, 
    humanizedPUPWeatherData: humanize 
  } = this;
  const today = Math.floor(Date.now());
  const rawData = (await (await dc.channels.fetch(weatherChanId)).messages.fetch({ limit: 1 })).first().embeds[0];
  const JSONifiedData = JSON.parse(rawData.description);

  //let weatherForTodayAndTom = [];

  /*for (let i = 0; i < JSONifiedData.length; i++) {
    if (getDay(today) === getDay(JSONifiedData[i].time)) weatherForTodayAndTom = [JSONifiedData[i], JSONifiedData[i+1]];
  
    console.log(getDay(today) === getDay(JSONifiedData[i].time + 28800), getDay(today), getDay(JSONifiedData[i].time + 28800), JSONifiedData[i].time + 28800)
  }*/
  
  const processedData = getTodayData ? [JSONifiedData[0], JSONifiedData[1]] : JSONifiedData;

  return humanized ? humanize(processedData) : processedData;

};