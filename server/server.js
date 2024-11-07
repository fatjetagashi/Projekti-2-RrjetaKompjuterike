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

//~~
server.on('message', (msg, remoteInfo) => {
    const clientKey = remoteInfo.address + ':' + remoteInfo.port
    let mesazhi = msg.toString().split('; ') // 0-username, 1-password, 2-ctrl

    // [gentpodvorica, admin, commana askdlsadkjfsa;lk]
    fileSystem.writeFile(`${__dirname}/auditim.txt`, `\n${msg}`, {flag: 'a'}, (error) => { // audito kerkesen!
        if(error){
            server.send('Serveri nuk mund te auditoj'.red, remoteInfo.port, remoteInfo.address)
            console.error('Serveri nuk mund te auditoj')
            return
        }
    })

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
}
//~~

function colorizeJSON(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 4);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
                return match.red
            } else {
                cls = 'string';
                return match.green
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
            return match.blue
        } else if (/null/.test(match)) {
            cls = 'null';
            return match.blue
        }
        return match.yellow
    });
}