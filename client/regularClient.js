const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = Buffer.from('RegularUser; user123; read asd.txt');
const serverPort = 41234;
const serverIp = 'localhost';

const startTime = Date.now(); 

client.send(message, 0, message.length, serverPort, serverIp, (err) => {
    if (err) {
        console.error('Gabim gjate dergimit te mesazhit:', err);
    } else {
        console.log(`Mesazhi i klientit te zakonshem u dergua ne kohen: ${new Date(startTime).toISOString()}`);
    }

 
client.on('message', (msg) => {
        const endTime = Date.now(); //Koha e marrjes se pergjigjes
        console.log(`Pergjigjja per klientin e zakonshem u mor pas ${endTime - startTime} ms ne kohen: ${new Date(endTime).toISOString()}`);
        client.close();
    });
});
