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

readLine.question(
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
    '                Zgjidhni nje nga opsionet e meposhtme\n\n' +
    '    Formati: username; password; komanda \n\n' +
    '   Komandat:\n' +
    '       - write <file> <message>   : Shkruani nje mesazh ne nje file\n' +
    '       - read <file>              : Lexoni permbajtjen e nje file-it\n' +
    '       - execute <command>        : Ekzekutoni nje komande te percaktuar\n' +
    '       - kick <username>          : Largoni nje klient\n' +
    '       - print                    : Shfaqni informacion per te gjithe klientet\n' +
    '       - logout                   : Logout nga serveri\n' +
    '       - exit                     : Dilni nga programi\n' +
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
    'Shkruani kerkesen tuaj:\n',
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


