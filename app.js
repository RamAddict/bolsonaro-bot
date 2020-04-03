const bolsonaroQuotes = require("./bolsonaro.quotes.json");
const Discord = require('discord.js');
const axios = require('axios').default;
let striptags = require('striptags');
var chanThreadCache = []; // pol4chan thread cache

function getRandomLine() {
    const filesize = 25;
    return bolsonaroQuotes[parseInt(Math.random() * filesize)];
}

function clientHandlerReady(client) {
    console.log(`Logged in as ${client.user.tag}!, I should be online now`);
}

function sendRandomQuote(channel) {
    channel.send(getRandomLine());
}

function sendRandomPolThread(channel) {
    let result = 0;
    const catalog = await axios.get('https://a.4cdn.org/pol/catalog.json');
    if (chanThreadCache.length != 0) {
        result = chanThreadCache.pop();
    } else {
        /** @type  { {body: {threads : Array<Object>} } } */
        const threadNo = catalog.data[parseInt(Math.random()*6)].threads[2].no;
        result = await axios.get('https://a.4cdn.org/pol/thread/' + threadNo + '.json');
    }

    // Parse text part of post
    const opText = striptags(result.data.posts[0].com) || '[No text]';
            
    // Parse image part of post
    const opImage = result.data.posts[0].tim;
    const opImageExt = result.data.posts[0].ext;

    // Parse title part of post
    const opTitle = result.data.posts[0].sub || '[No Title]';

    // Send embed
    const embed = new Discord.MessageEmbed()
    .setTitle(await opTitle)
    .setImage('https://i.4cdn.org/pol/' + await opImage + opImageExt)
    .setDescription(await opText);
    msg.channel.send(embed);

    // Fill chanThreadCache
    if (chanThreadCache.length == 0)
    chanThreadCache = [await axios.get('https://a.4cdn.org/pol/thread/' + catalog.data[0].threads[3 + parseInt(Math.random()*4)].no + '.json'),
            await axios.get('https://a.4cdn.org/pol/thread/' + catalog.data[0].threads[8 + parseInt(Math.random()*4)].no + '.json'),
            await axios.get('https://a.4cdn.org/pol/thread/' + catalog.data[0].threads[12 + parseInt(Math.random()*4)].no + '.json')];
}

function displayHelp(channel) {
    const embed = new Discord.MessageEmbed()
    .setTitle('Bolsonaro command list:')
    .setColor(0xFCAA00)
    .setDescription('Use b. para falar comigo')
    .addField('Quote', 'Mando uma elocução do passado', true)
    .addField('Help', 'Mostro essa mensagem', false);
    channel.send('Brasil acima de tudo, Deus acima de todos.', embed);
}

/** @param {import("discord.js").Message} msg */
async function clientHandlerMesssage(msg) {
    lowerCaseMessage = msg.content.toLowerCase();
    // for now invocation line is b.
    if (lowerCaseMessage.startsWith('b.', 0) == true) {
        // b.Help function
        if (lowerCaseMessage.search('help') != -1) {
            displayHelp(msg.channel);
        }
        else
        // b.Quote function
        if (lowerCaseMessage.search('quote') != -1) {
            sendRandomQuote(msg.channel);
        }
        else
        // b.pol
        if (lowerCaseMessage.search('pol') != -1) {
            sendRandomPolThread(channel);
        }
    }
    // only respond to non bot messages
    if (!msg.author.bot) {
        //   random text replies section EASTEREGGS
        if (lowerCaseMessage.search('adriano') != -1) {
            msg.reply('Adriano é viado eim')
        }
        if (lowerCaseMessage.search('joao') != -1) {
            msg.reply('joao é corno')
        }
        if (lowerCaseMessage.search('web dev') != -1 || lowerCaseMessage.search('webedeve') != -1) {
            msg.reply('Web dev nem gente é')
        }
    }
}

function initializeBot() {
    const client = new Discord.Client();
    client.on('ready', () => clientHandlerReady(client));
    client.on('message', clientHandlerMesssage);
    client.login('Njk0NjYzNjk1MDg2NjQ5MzY2.XoQBUw.Oxk-eWFIp0hTUnXYX59SnjRPbJw');
}

// Begin Listen
initializeBot()