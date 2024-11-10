const dgram = require('dgram')
const server = dgram.createSocket('udp4') // krijo serverin
const fileSystem = require('fs')
const rl = require('readline')
require('colors')

const ip = 'localhost' // ipconfig getifaddr en0 - adresa e interface te wifi, en0
const port = 41234
const maxClients = 4
const adminPassword = 'admin'
const ttlInit = 60 // initial ttl
const vacantTime = 30000; 
const delayForRegularClients = 2000; // Koha e vonesës për klientët e zakonshëm në milisekonda 


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

server.on('message', (msg, remoteInfo) => {
    const clientKey = remoteInfo.address + ':' + remoteInfo.port;
    let mesazhi = msg.toString().split('; '); // 0-username, 1-password, 2-ctrl

    const timestamp = new Date().toISOString(); // Merr kohen aktuale në format ISO
    const auditMessage = `[${timestamp}] [${remoteInfo.address}:${remoteInfo.port}] - ${msg}\n`;

    if (clients[clientKey]) {
        clients[clientKey].lastActivity = Date.now();
        clients[clientKey].ttl = ttlInit;  //nese ka aktivitet e perditeson ttl
    }
    
    fileSystem.writeFile(`${__dirname}/auditim.txt`, auditMessage, {flag: 'a'}, (error) => { 
        if (error) {
            server.send('Serveri nuk mund te auditoj'.red, remoteInfo.port, remoteInfo.address);
            console.error('Serveri nuk mund te auditoj');
            return;
        }
    });
    const adminExists = Object.values(clients).some(client => client.isAdmin);
            if (adminExists && mesazhi[1] === adminPassword) {
                server.send("Nuk mund te regjistroheni si admin. Vetem nje admin lejohet.".red, remoteInfo.port, remoteInfo.address);
                return;
            }
    
    if(!clients[clientKey]) {   // nese nuk osht n guest list
        if (mesazhi.length < 3) {
            server.send("Ju lutemi siguroni emrin, passwordin dhe komanden.".yellow, remoteInfo.port, remoteInfo.address)
            return
        }

        if(Object.keys(clients).length < maxClients){       // nese ka ven
            clients[clientKey] = {
                'username': mesazhi[0],
                'password': mesazhi[1],
                'ttl': 100,
                'isAdmin': mesazhi[1] == adminPassword,
        
            }
        
            console.log(`Kane mbete edhe ${maxClients - Object.keys(clients).length} vende`.green)
        } else { // nese ska ven
            server.send("Me vjen keq, nuk ka vend.".yellow, remoteInfo.port, remoteInfo.address)
            return
        }
    }

    setInterval(() => {
        Object.keys(clients).forEach(key => {
            if(clients[key].ttl > 0) {
                clients[key].ttl--; 
            } else {
                console.log(`Client ${clients[key].username} disconnected due to inactivity.`);
                delete clients[key];  
            }
        });
    }, 60000);  // Ekzekutohet cdo 1 min
    
    

    console.log(`[${clients[clientKey].username}] => ${msg}`) // print cili klient qka po thot

    // kqyr qka po don & kqyr a bon
    const command = clients[clientKey] ? mesazhi[mesazhi.length - 1].toString().split(' ') : mesazhi[2].toString().split(' ')

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
            server.send("Nuk keni autorizim".yellow, remoteInfo.port, remoteInfo.address)
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
            // Kontrollon nëse klienti është admin për të vendosur vonesën
            if (clients[clientKey].isAdmin === true) {
                server.send(`Permbajtja e fajllit '${command[1].magenta}':\n${fileData.toString().green}`, remoteInfo.port, remoteInfo.address);
            } else {
                setTimeout(() => {
                    server.send(`Permbajtja e fajllit '${command[1].magenta}':\n${fileData.toString().green}`, remoteInfo.port, remoteInfo.address);
                }, delayForRegularClients);
            }
        });
    }

    //execute <command>
    else if (command[0] === 'execute'){
    
        if (clients[clientKey].isAdmin) { 
            const exec = require('child_process').exec;
            const execCommand = command.slice(1).join(" "); 
            exec(execCommand, (error, stdout, stderr) => {
                if (error) {
                    server.send(`Error gjate ekzekutimit te komandes: ${error.message}`.red, remoteInfo.port, remoteInfo.address);
                    return;
                }
                let message = 'Komanda ne fjale u ekzekutua'
                  server.send(message, remoteInfo.port, remoteInfo.address)
            });
        } else {
            server.send("Nuk keni autorizim per te ekzekutuar komanda.".red, remoteInfo.port, remoteInfo.address);
        }
    }

<<<<<<< HEAD
    // print
    else if (command[0] === 'print'){
        // server.send(JSON.stringify(clients, null, 2), remoteInfo.port, remoteInfo.address)
        server.send(colorizeJSON(clients), remoteInfo.port, remoteInfo.address)
=======
    
   else if (command[0] === 'print'){
    if (clients[clientKey].isAdmin) {
        server.send(colorizeJSON(clients), remoteInfo.port, remoteInfo.address);
    } else {
        server.send("Nuk keni autorizim per te shfaqur informacionin e klienteve.".red, remoteInfo.port, remoteInfo.address);
>>>>>>> 1c6ab06e62f466ad0517ee9ec66dd5051bc6293d
    }
}


    // kick
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
        server.send("Nuk keni autorizim per te larguar klientet.".red, remoteInfo.port, remoteInfo.address);
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