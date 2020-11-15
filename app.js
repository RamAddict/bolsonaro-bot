const bolsonaroQuotes = require("./bolsonaro.quotes.json");
const Discord = require('discord.js');
const axios = require('axios').default;
const fs = require('fs');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');
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
    // console.log(embed.toJSON());
    
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
    ultimoCanalInteragido = msg.channel.id;


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
        else
        if (lowerCaseMessage.search('play') != -1) {
           await playVideoYt(msg, msg.content.split(' ').slice(1).join(" "));
        }
        else
        if (lowerCaseMessage.search('stop') != -1) {
            stopVideoYt(msg);
        }
    }
    // only respond to non bot messages

    }

/**
 * @param {import("discord.js").Message} msg
 */
function stopVideoYt(msg) {
    const connection = msg.client.voice.connections
    .find((c) => {
        return c.channel.id === msg.member.voice.channel.id
    });
    if (connection) {
        connection.emit("videoStop")    ;
    }
}

/**
 * @param {import("discord.js").Message} msg
 */
async function playVideoYt(msg, song) {
    const channel = msg.member.voice.channel;
    if (channel) {
        // Login voice channel
        // Start Streaming to Channel
        try {
            // Try to find or create connection
            const connection = msg.client.voice.connections
                .find((c) => {
                    c.channel.id === channel.id
                })
                || await channel.join();
                console.log(song)
            // const searchResults = await ytsr(null, options);
            // Try fetch url data
            let uri = song;
            try {
                new URL(uri);
            } catch(e) {
                const filterFinder = await ytsr.getFilters(song);
                const filter1 = filterFinder.get('Type').find(o => o.name === 'Video');
                const search = await ytsr(uri, {nextpageRef: filter1.ref, limit: 10});
                uri = search.items.find(i => i.type === "video").link
                console.log(uri)
                
            }
            const urlParams = new URL(uri).searchParams;
            const videoBegin = Number(urlParams.get("t") || 0);
            console.log(videoBegin);

            const info = await ytdl.getInfo(uri);
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Now Playing").setImage(info.videoDetails.thumbnail.thumbnails[0].url)
            .setDescription(`[${info.videoDetails.title}](${info.videoDetails.video_url})`);
            const sentEmbed = await msg.channel.send(embed);
            const deleteEmbed = () => sentEmbed.delete();
            // const format = ytdl.chooseFormat(info.formats, {
            //     filter: "audioonly"
            // });
            // const byteStart = Number.parseInt(Math.floor((format.audioBitrate * 1000 * videoBegin) / 8));
            // const byteEnd = Number.parseInt(format.contentLength);
            // console.log(format.audioBitrate)
            // console.log(byteStart)
            // console.log(byteEnd)
            // connection.dispatcher.end();

            const audio = await ytdl(uri, {
                begin: videoBegin
            })
            const dispatcher = connection.play(audio, { type: 'opus'}); // Toca a fita
            

            audio.on("close", deleteEmbed);
            dispatcher.on('error', console.error);
            connection.on("videoStop", async () => {
                await deleteEmbed();
                dispatcher.destroy();
            })

            // dispatcher.destroy();
        } catch (error) {
            console.error(error);
        }
    } else {
        msg.channel.send("Entra num serveró ai, va-ga-bun-do.")
    }
}

function initializeBot() {
    const client = new Discord.Client();
    client.on('ready', () => clientHandlerReady(client));
    client.on('message', async (...args) => {
        try {
            await clientHandlerMesssage(...args)
        } catch(error) {
            console.error(error);
        }
    });
    client.login('Njk0NjYzNjk1MDg2NjQ5MzY2.XoO5-w.OQ5BmfgHdFRJXYwk9dQuRc_weSs');
    registerExitHandler(async () => {


    //   const ch = client.channels.cache.get(ultimoCanalInteragido);
        // const embed = new Discord.MessageEmbed();
        // embed.setTitle("Morri ...").setImage("https://static.poder360.com.br/2018/09/bolsonaroesfaqueado2-1-1-868x644.jpeg");
        // await ch.send(embed);
        process.exit(0);
    });
    
}


// Begin Listen
initializeBot()

var ultimoCanalInteragido = null;
function registerExitHandler(exitHandler) {
    [
        'beforeExit',
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 
        'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 
        'SIGUSR2', 'SIGTERM', 
    ].forEach(evt => process.on(evt, exitHandler));
}

// // Antes de 2015
// //... codigo
// funcaoAssincrona(parametro, function (err, res) {
//     funcaoAssincrona2(p, function(err1, res1) {
//         // Callback hell
//     })
// })
// //... codigo
// const prom = funcaoAssincrona(parametro)
// prom
//     .then()
//     .then()
//     .then()
// // ES7
// // Aqui Fora, tudo oq está dentro de funcaoAssincrona é visto 
// // como a propria função funcaoAssincrona rodando de maneira assincrona
// funcaoAssincrona = async () => {
//     // Sincronizar o código aqui dentro
//     const ap = f1();
//     const bp = f2();
//     const cp = f3();
//     const [a,b,c] = await Promise.all([ap, bp, cp])
// }
// funcaoAssincrona();