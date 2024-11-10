const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = Buffer.from('AdminUser; admin; write testAdmin.txt Mesazh nga admin');
const serverPort = 41234;
const serverIp = 'localhost';

const startTime = Date.now(); // Koha e dergimit

client.send(message, 0, message.length, serverPort, serverIp, (err) => {
    if (err) {
        console.error('Gabim gjate dergimit te mesazhit:', err);
    } else {
        console.log(`Mesazhi i adminit u dergua ne kohen: ${new Date(startTime).toISOString()}`);
    }

    
    client.on('message', (msg) => {
        const endTime = Date.now(); // Koha e marrjes se pergjigjes
        console.log(`Pergjigjja per admin u mor pas ${endTime - startTime} ms ne kohen: ${new Date(endTime).toISOString()}`);
        client.close();
    });
});
