const dgram = require('dgram')
const server = dgram.createSocket('udp4') // krijo serverin
const fileSystem = require('fs')
const rl = require('readline')
require('colors')

const ip = 'localhost' // ipconfig getifaddr en0 - adresa e interface te wifi, en0
const port = 41234
const maxClients = 4
const adminPassword = 'admin'
const ttlInit = 10 // initial ttl

let clients = {} // objekt

server.bind(port, ip) // anllaseri :D

server.on('listening', () => {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log(`Serveri po degjon ne socketin: ` + `[${ip}:${port}]`.magenta)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    const readLine = rl.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    readLine.addListener('line', (input) => {
        if (input.toLowerCase() === 'reset'){
            clients = {}
            console.log('Klientat u resetuan me sukses!'.green)
        }
    })
    
})

/**
 * TODO:
 *      me bo execute
 *      me mbyll lidhjen mas ni vacant time
 */

server.on('message', (msg, remoteInfo) => {
    const clientKey = remoteInfo.address + ':' + remoteInfo.port
    let mesazhi = msg.toString().split('; ') // 0-username, 1-password, 2-ctrl

    const timestamp = new Date().toISOString(); // Merr kohën aktuale në format ISO
    const auditMessage = `[${timestamp}] [${remoteInfo.address}:${remoteInfo.port}] - ${msg}\n`;
    
    fileSystem.writeFile(`${__dirname}/auditim.txt`, auditMessage, {flag: 'a'}, (error) => { 
        if (error) {
            server.send('Serveri nuk mund te auditoj'.red, remoteInfo.port, remoteInfo.address);
            console.error('Serveri nuk mund te auditoj');
            return;
        }
    });
    
    if(!clients[clientKey]) {       // nese nuk osht n guest list
        if(Object.keys(clients).length < maxClients){       // nese ka ven
            clients[clientKey] = {
                'username': mesazhi[0],
                'password': mesazhi[1],
                'ttl': 100,
                'isAdmin': false
            }
            if(mesazhi[1] === adminPassword){        // nese e din passin
                clients[clientKey].isAdmin = true
            }
            console.log(`Kane mbete edhe ${maxClients - Object.keys(clients).length} vende`.green)
        } else { // nese ska ven
            server.send("Me vjen keq, nuk ka vend.".yellow, remoteInfo.port, remoteInfo.address)
            return
        }
    }

    Object.keys(clients).forEach(key => { // decrement ttl and delete client if neccesary
        clients[clientKey].ttl = ttlInit // reset ttl
        if(key != clientKey) // nese ski qu mesazh
            if(clients[key].ttl > 0) clients[key].ttl-- // edhe ki ttl , ule ttl
            else delete clients[key] // perndryshe myte
    })

    console.log(`[${clients[clientKey].key}] => ${msg}`) // print cili klient qka po thot

    // kqyr qka po don & kqyr a bon
    command = mesazhi[2].toString().split(' ') // write/read/execute 
    //write <file> <message>
    if(command[0] === 'write'){
        if(clients[clientKey].isAdmin === true){
            if(command[1] === 'auditim.txt'){
            server.send("Fajlli eshte READ-ONLY".red, remoteInfo.port, remoteInfo.address)
            return;
            }
        let file = `${__dirname}/${command[1]}`
        let message = command.slice(2).join(" ")
        fileSystem.writeFile(file, `\n${message}`, {flag: 'a'}, (error) => {
            if (error) {
                server.send("Error gjate shkrimit ne fajll".red, remoteInfo.port, remoteInfo.address)
                return
            }
            server.send("Fajlli u shkrua me sukses".green, remoteInfo.port, remoteInfo.address)
        })
        } else {
            server.send("Nuk ki tdrejt dost".yellow, remoteInfo.port, remoteInfo.address)
        }
    }

    //read <file>  <message>
    else if (command[0] === 'read'){
        let file = `${__dirname}/${command[1]}`;
        fileSystem.readFile(file, (error, fileData) => {
            if (error) {
                console.error("Error gjate leximit te fajllit");
                server.send("Error gjate leximit te fajllit".red, remoteInfo.port, remoteInfo.address);
                return;
            }
            server.send(`Permbajtja e fajllit '${command[1].magenta}':\n${fileData.toString().green}`, remoteInfo.port, remoteInfo.address);
        });
    }
    

    //execute <command>
    else if (command[0] === 'execute'){
        // komanda ekzekutohet

        let message = 'komanda ne fjale u ekzekutua'
        server.send(message, remoteInfo.port, remoteInfo.address)
    }

    // print
    else if (command[0] === 'print'){
        // server.send(JSON.stringify(clients, null, 2), remoteInfo.port, remoteInfo.address)
        server.send(colorizeJSON(clients), remoteInfo.port, remoteInfo.address)
    }

    

    

    else if (command[0] === 'kick') {
        if (clients[clientKey].isAdmin === true) {
            let usernameToKick = command.slice(1).join(" ");
            let keyToKick = Object.keys(clients).find(key => clients[key].username === usernameToKick);
            if (keyToKick) {
                delete clients[keyToKick];
                server.send(`Klienti '${usernameToKick}' u largua me sukses.`.green, remoteInfo.port, remoteInfo.address);
                console.log(`Klienti '${usernameToKick}' u largua nga serveri.`);
            } else {
                server.send("Klienti i specifikuar nuk ekziston.".yellow, remoteInfo.port, remoteInfo.address);
            }
        } else {
            server.send("Nuk keni autorizim për të larguar klientët.".red, remoteInfo.port, remoteInfo.address);
        }
    }
});

function colorizeJSON(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 4);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        if (/^"/.test(match)) {
            return /:$/.test(match) ? match.red : match.green;
        } else if (/true|false/.test(match)) {
            return match.blue;
        } else if (/null/.test(match)) {
            return match.blue;
        }
        return match.yellow;
    });
}