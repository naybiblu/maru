const colors = require('colors/safe');
const axios = require("axios");
const mongo = require("mongoose");
const { 
  MONGO_URL: url,
  GOOGLE_KEY: key,
  GOOGLE_SHEETID: id,
  GOOGLE_SHEETID3: id2,
  DISCORD_PUPWEATHER_CHANNELID: weatherChanId,
  DISCORD_PUBPOSTS_CHANNELID: pubPostsChanId,
  PUPWEATHER_APIKEY: weatherLink,
  FB_PAGEID: pageId,
  FB_TOKEN: fbToken
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

  let hours, minutes;
  const [time, modifier] = string.split(' ');

  if (Array.isArray(time.split(","))) {

    let [h, m] = time.split(',').slice(0, 2);
    hours = h;
    minutes = m;

  } else {

    hours = time;
    minutes = "00";

  };

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

  const newDate = new Date(`${date[1]} ${date[2]} ${date[3]} ${this.toMilitaryTime(`${date[5].split(":").slice(0, 2)} ${date[6]}`)}`);
  
  let output;

  switch (element) {

    case "whole": output = date.join(" "); break;
    case "dayWord": output = date[0].replace(",", ""); break;
    case "monthWord": output = date[1]; break;
    case "monthNumber": output = monthEnum[date[1]]; break;
    case "dayNumber": output = parseInt(date[2].replace(",", ""), 10); break;
    case "year": output = parseInt(date[3], 10); break;
    case "time": output = date[5] + " " + date[6]; break;
    case "unix": output = Math.floor(newDate.getTime() / 1000);

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

exports.fancyText = (text, type) => {

  const boldSansCharMap = {"0":"𝟬","1":"𝟭","2":"𝟮","3":"𝟯","4":"𝟰","5":"𝟱","6":"𝟲","7":"𝟳","8":"𝟴","9":"𝟵","a":"𝗮","b":"𝗯","c":"𝗰","d":"𝗱","e":"𝗲","f":"𝗳","g":"𝗴","h":"𝗵","i":"𝗶","j":"𝗷","k":"𝗸","l":"𝗹","m":"𝗺","n":"𝗻","o":"𝗼","p":"𝗽","q":"𝗾","r":"𝗿","s":"𝘀","t":"𝘁","u":"𝘂","v":"𝘃","w":"𝘄","x":"𝘅","y":"𝘆","z":"𝘇","A":"𝗔","B":"𝗕","C":"𝗖","D":"𝗗","E":"𝗘","F":"𝗙","G":"𝗚","H":"𝗛","I":"𝗜","J":"𝗝","K":"𝗞","L":"𝗟","M":"𝗠","N":"𝗡","O":"𝗢","P":"𝗣","Q":"𝗤","R":"𝗥","S":"𝗦","T":"𝗧","U":"𝗨","V":"𝗩","W":"𝗪","X":"𝗫","Y":"𝗬","Z":"𝗭"};
  const italicCharMap = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝘢","b":"𝘣","c":"𝘤","d":"𝘥","e":"𝘦","f":"𝘧","g":"𝘨","h":"𝘩","i":"𝘪","j":"𝘫","k":"𝘬","l":"𝘭","m":"𝘮","n":"𝘯","o":"𝘰","p":"𝘱","q":"𝘲","r":"𝘳","s":"𝘴","t":"𝘵","u":"𝘶","v":"𝘷","w":"𝘸","x":"𝘹","y":"𝘺","z":"𝘻","A":"𝘈","B":"𝘉","C":"𝘊","D":"𝘋","E":"𝘌","F":"𝘍","G":"𝘎","H":"𝘏","I":"𝘐","J":"𝘑","K":"𝘒","L":"𝘓","M":"𝘔","N":"𝘕","O":"𝘖","P":"𝘗","Q":"𝘘","R":"𝘙","S":"𝘚","T":"𝘛","U":"𝘜","V":"𝘝","W":"𝘞","X":"𝘟","Y":"𝘠","Z":"𝘡"};
  const boldItalicCharMap = {"0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","a":"𝙖","b":"𝙗","c":"𝙘","d":"𝙙","e":"𝙚","f":"𝙛","g":"𝙜","h":"𝙝","i":"𝙞","j":"𝙟","k":"𝙠","l":"𝙡","m":"𝙢","n":"𝙣","o":"𝙤","p":"𝙥","q":"𝙦","r":"𝙧","s":"𝙨","t":"𝙩","u":"𝙪","v":"𝙫","w":"𝙬","x":"𝙭","y":"𝙮","z":"𝙯","A":"𝘼","B":"𝘽","C":"𝘾","D":"𝘿","E":"𝙀","F":"𝙁","G":"𝙂","H":"𝙃","I":"𝙄","J":"𝙅","K":"𝙆","L":"𝙇","M":"𝙈","N":"𝙉","O":"𝙊","P":"𝙋","Q":"𝙌","R":"𝙍","S":"𝙎","T":"𝙏","U":"𝙐","V":"𝙑","W":"𝙒","X":"𝙓","Y":"𝙔","Z":"𝙕"};
  let chosenType = type === 0 ? boldSansCharMap : type === 1 ? italicCharMap : boldItalicCharMap;
  let output = "";

  text.split("").forEach(char => {
    if (undefined || chosenType[char] === undefined) output += char;
    else output += chosenType[char];
  });

  return output;

}

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

  let data = (await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${position}?key=${key}`)).data;

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

exports.deleteMessage = async(channelId, messageId) => {

  dc.channels.fetch(channelId)
    .then(channel => channel.messages.fetch())
    .then(messages => {

      if (!messageId) messages.forEach(async message => {
        await messages.delete(message.id);
      });
      else messages.first().channel.messages.delete(messageId);

  });

};

exports.getMessage = async (channelId) => {

  return dc.channels.fetch(channelId)
    .then(channel => channel.messages.fetch({ limit: 1 }))
    .then(messages => {
      return messages.first();
    });

};

exports.getMessageWithTitle = async (text, channelId) => {

  return dc.channels.fetch(channelId)
    .then(channel => channel.messages.fetch())
    .then(messages => {

      let message = {};
      let count = 0;

      messages.forEach(msg => {

        if (msg.embeds.length > 0 && msg.embeds[0].title && msg.embeds[0].title.includes(text)) {

          message = msg; 
          count++;

        }

      });

      return {
        data: message,
        count: count
      };

    });

};

exports.getSimilarFooterCount = async (footerText, channelId) => {

  return dc.channels.fetch(channelId)
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
  const similarFooterCount = await getSimilarFooterCount(`M${month}D${day}Y${year}`, weatherChanId);

  if (similarFooterCount >= 1) return;
  if (today < targetDate + 46800) return;

  const dailyData = (await axios.get(weatherLink)).data.daily;
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

exports.publishFBPost = async (pageId, text, photoURL) => {

  let post;

  if (photoURL) post = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
    message: text,
    access_token: fbToken,
    url: photoURL
  });
  else post = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
    message: text,
    access_token: fbToken
  });

  return photoURL ? post?.data.id : post?.data.id.split("_")[1];

};

exports.getFBComments = async (pageId, postId) => {

  let refinedComments = [];
  let comments = await axios.get(`https://graph.facebook.com/v21.0/${pageId}_${postId}/comments?access_token=${fbToken}`);
  comments?.data.data.forEach(comment => {

    if (!comment.from) refinedComments.push(comment);

  });

  return refinedComments;

};

exports.publishFBComment = async (pageId, postId, text, commentId) => {

  let comment;
  
  if (!commentId) comment = await axios.post(`https://graph.facebook.com/v21.0/${pageId}_${postId}/comments`, {
    message: text,
    access_token: fbToken
  });
  else comment = await axios.post(`https://graph.facebook.com/v21.0/${postId}_${commentId}/comments`, {
    message: text,
    access_token: fbToken
  });

  return comment?.data;

};

exports.getLETData = async (getAll = false) => {

  const {
    getRandomInt,
    getAccurateDate
  } = this;
  let subjectMatter;
  let photo;
  const photoArray = [
    "https://preview.redd.it/lets-review-online-assets-v0-anlkpkwx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=9709231d0be766de0e068c0f447d456ea96381a4",
    "https://preview.redd.it/lets-review-online-assets-v0-5y7tzkwx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=ab0d0ac1e4814493772a40219916dae226769cef",
    "https://preview.redd.it/lets-review-online-assets-v0-w0sj0axx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=f17de3af54bd5206ef3838ea16154f12eab7741b",
    "https://preview.redd.it/lets-review-online-assets-v0-48izi8xx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=6706ad9cb44e670bba6064eb92cf431a9bd536de",
    "https://preview.redd.it/lets-review-online-assets-v0-dt05j6xx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=229cedad814124ba39126897e106a5f2109b6dac",
    "https://preview.redd.it/lets-review-online-assets-v0-iujb06xx6g1e1.jpg?width=3375&format=pjpg&auto=webp&s=70579c42df01ec2abd21067789fdadf4ae151a93"
  ];
  const subMatArray = [
    "GenEd",
    "ProfEd",
    "Maj"
  ];

  switch (getAccurateDate("dayWord")) {

    case "Monday": photo = photoArray[0]; subjectMatter = subMatArray[0]; break;
    case "Tuesday": photo = photoArray[1]; subjectMatter = subMatArray[0]; break;
    case "Wednesday": photo = photoArray[2]; subjectMatter = subMatArray[1]; break;
    case "Thursday": photo = photoArray[3]; subjectMatter = subMatArray[1]; break;
    case "Friday": photo = photoArray[4]; subjectMatter = subMatArray[2]; break;
    case "Saturday": photo = photoArray[5]; subjectMatter = subMatArray[2]; break;

  };

  let data = (await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${id2}/values/${subjectMatter}?key=${key}`)).data.values;

  data = data.slice(1).map(item => {
    return {
      id: item[0],
      subMatter: item[1],
      majType: item[2],
      item: item[3],
      photo: photo,
      answer: item[4],
      rationale: item[5],
    };
  });

  return getAll ? data : data[getRandomInt(0, data.length - 1)];

};

exports.sendLETData = async () => {

  const {
    getLETData,
    getAccurateDate,
    publishFBPost,
    publishFBComment,
    sendMessage,
    fancyText
  } = this;
  let data = await getLETData();
  const shorthand = data.subMatter === "General Education" ? "GenEd" : data.subMatter === "Professional Education" ? "ProfEd" : data.subMatter;

  // posting to Facebook page
  const post = await publishFBPost(pageId, `💡 #${shorthand}${getAccurateDate("dayWord")} | ${fancyText(data.item, 0)}\n\n` +
    "Ano pang hinihintay ninyo, preservice teachers? #LETsReview and comment the correct answer! 🚀✨\n\n" +
    `${fancyText("Note:", 2)} ${fancyText("The correct answer will be revealed after one (1) hour.", 1)}`, data.photo);

  data.postId = post;
  
  await publishFBComment(pageId, data.postId, fancyText("How to answer?", 0) +
    "\n\n❎ A. Ito ang sagot\n❎ A.\n❎ A\n❎ a\n✅ Snorlax Dela Fuentes-A\n✅ Snorlax Dela Fuentes-a");

  // auditing logs to Discord
  // GREEN >> posted, answer not revealed
  // RED >> posted and answer is revealed
  await sendMessage(pubPostsChanId, {
    embeds: [
      {
        title: `GREEN_${data.id}`,
        description: JSON.stringify(data),
        footer: {
          text: `${getAccurateDate("dayWord")}_${getAccurateDate("unix")}`
        }
      }
    ]
  });

};

exports.revealLETAnswer = async () => {

  const {
    sendMessage,
    publishFBComment,
    deleteMessage,
    getMessageWithTitle,
    getAccurateDate,
    getFBComments,
    toMilitaryTime,
    fancyText
  } = this;
  const message = await getMessageWithTitle("GREEN", pubPostsChanId);

  if (message.count === 0) return;

  const embed = message.data.embeds[0];
  const data = JSON.parse(embed.description);
  const today = getAccurateDate("unix");
  const targetDate = parseInt(embed.footer.text.split("_")[1]) + 60; // seconds

  if (today < targetDate) return;

  const comments = await getFBComments(pageId, data.postId);

  await publishFBComment(pageId, data.postId, 
    `The correct answer is: ${fancyText(data.answer, 0)}! ✨\n\n` +
    "Bakit? 🤔 Here\'s why:\n\n" +
    fancyText(data.rationale, 0) + "😲");
  
  comments.forEach(async comment => {
    
    const answer = comment.message.split("-");

    await publishFBComment(pageId, data.postId, data.answer.toLowerCase() === answer[answer.length - 1].toLowerCase() ? "✅" : "❎", comment.id.split("_")[1]);

  });

  await sendMessage(pubPostsChanId, {
    embeds: [
      {
        title: `RED_${embed.title.split("_")[1]}`,
        description: JSON.stringify(data),
        footer: {
          text: embed.footer.text
        }
      }
    ]
  });

  await deleteMessage(pubPostsChanId, message.data.id);

};