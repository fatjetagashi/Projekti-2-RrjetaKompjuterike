//write-file-message
//read-file-message
//execute-command

const dgram = require('dgram')
const rl = require('readline')
const fileSystem = require('fs')

const client = dgram.createSocket('udp4')

const ip = 'localhost'
const port = 41234

const readLine = rl.createInterface({
    input: process.stdin,
    output: process.stdout
});

readLine.question('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
                'Shenoni kerkesen tuaj:\n\n' +
                '    username; password; write <file> <message>\n' +
                                '\t\t\tread <file>\n' +
                                '\t\t\texecute <command>\n' +
                                '\t\t\tkick <username>\n' +
                                '\t\t\tprint\n' +
                                '\t\t\tlogout\n' +
                                '\t\t\t\'exit\' exit\n' +
                '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n', 
    (answer) => {
        if (answer.trim().toLowerCase() === 'exit') {
            readLine.close()
            return
        } else {
            client.send(answer, port, ip)
        }
    }
)

client.on('message', (msg, rinfo) => {
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n[serveri] => \n${msg}\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
})

readLine.on('line', (input) => {
    client.send(input, port, ip)
})
