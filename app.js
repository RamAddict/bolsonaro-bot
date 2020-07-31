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

async function sendRandom4ChanThread(channel, board) {
    switch (board)
    {
        case 'b':
        case 'pol':
        case 'r9k':
        case 'bant':
        case 'soc':
        case 's4s':
        case 's':
        case 'hc':
        case 'hm':
        case 'h':
        case 'e':
        case 'u':
        case 'y':
        case 'd':
        case 't':
        case 'hr':
        case 'gif':
        case 'aco':
        case 'r':
            msg = board + "is NSFW, you naughty";
            channel.setNSFW(true, msg);
    }
    let result = 0;
    let catalog = 0;
    try {
        catalog = await ( axios.get('https://a.4cdn.org/' + board + '/catalog.json'));
    } catch (err) {
        if (err.response.status == 404)
        {
            await channel.send('No such board "' + board + '"');
            return;
        }
    }
    const threadNo = await catalog.data[parseInt(Math.random()*8)].threads[2].no;
    // if (chanThreadCache.length != 0) {
    //     result = chanThreadCache.pop();
    // } else {
        /** @type  { {body: {threads : Array<Object>} } } */
        result = await axios.get('https://a.4cdn.org/'+ board +'/thread/' + threadNo + '.json');
    // }

    // Parse text part of post
    let opText = striptags(result.data.posts[0].com) || '[No text]';
    try {
        opText = decodeURI(opText)
    } catch (malFormedUri) {
        opText = striptags(result.data.posts[0].com) || '[No text]';
        if (URIError == malFormedUri)
            console.log("MalFormedUri")
    }

    // Parse image part of post
    const opImage = result.data.posts[0].tim;
    const opImageExt = result.data.posts[0].ext;

    // Parse title part of post
    const opTitle = result.data.posts[0].sub || '[No Title]';

    // Create footerLink and Embed URL
    const footerLink = 'https://boards.4chan.org/' + board + '/thread/' + threadNo;
    
    // Send embed
    const embed = new Discord.MessageEmbed()
    .setTitle(opTitle)
    .setURL('https://boards.4chan.org/' + board + '/thread/' + threadNo)
    .setColor('RANDOM')
    .setImage('https://i.4cdn.org/' + board + '/' + opImage + opImageExt)
    .setFooter(footerLink)
    .setDescription(opText);
    channel.send(embed);
    console.log(embed.toJSON());
    
    // Fill chanThreadCache
    // if (chanThreadCache.length == 0)
    // chanThreadCache = [await axios.get('https://a.4cdn.org/' + board + '/thread/' + catalog.data[0].threads[3 + parseInt(Math.random()*4)].no + '.json'),
    //         await axios.get('https://a.4cdn.org/' + board + '/thread/' + catalog.data[0].threads[8 + parseInt(Math.random()*4)].no + '.json')];
}

function displayHelp(channel, language) {
    if (language === 'pt')
    {
        const embed = new Discord.MessageEmbed()
        .setTitle('Lista de comandos:')
        .setColor(0xFCAA00)
        .setDescription('`Use b. para falar comigo`')
        .addField('`Quote`', 'Mando uma elocução do passado', true)
        .addField('`Chan [board]`', 'Mando uma thread do [board] do 4chan, ex: "b.chan lit"', false)
        .addField('`Help`', 'Mostro essa mensagem', false)
        .setFooter('type "b.helpu" for english version');
        channel.send('Brasil acima de tudo, Deus acima de todos.', embed);
    }
    else
    {
        const embed = new Discord.MessageEmbed()
        .setTitle('Bolsonaro command list:')
        .setColor(0xFCAA00)
        .setDescription('Use b. to ')
        .addField('`Quote`', 'I\'ll send a famous quote of mine', true)
        .addField('`Chan [board]`', 'Send a 4chan board [board], ex: "b.chan lit"', false)
        .addField('`Help`', 'Show this message', false);
        channel.send('Brasil acima de tudo, Deus acima de todos.', embed);
    }
}

/** @param {import("discord.js").Message} msg */
async function clientHandlerMesssage(msg) {
    lowerCaseMessage = msg.content.toLowerCase();
    // for now invocation line is b.
    if (lowerCaseMessage.startsWith('b.', 0) == true) {
        // b.Help function
        if (lowerCaseMessage.search('help') != -1) {
            displayHelp(msg.channel, 'pt');
        }
        else
        //b.Helpu (en)
        if (lowerCaseMessage.search('helpu') != -1) {
            displayHelp(msg.channel, 'en');
        }
        else
        // b.Quote function
        if (lowerCaseMessage.search('quote') != -1) {
            sendRandomQuote(msg.channel);
        }
        else
        // b.chan <board>
        if (lowerCaseMessage.search('chan') != -1) {
            sendRandom4ChanThread(msg.channel, lowerCaseMessage.split(' ', 2)[1]);
        }
    }
    // only respond to non bot messages

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
