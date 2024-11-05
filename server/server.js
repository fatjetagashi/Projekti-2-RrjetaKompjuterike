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