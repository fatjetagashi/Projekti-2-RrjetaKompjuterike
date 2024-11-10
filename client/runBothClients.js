const { exec } = require('child_process');


// Nis regularClient.js
exec('node client/regularClient.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Gabim në regularClient: ${err}`);
        return;
    }
    console.log(`Rezultatet nga regularClient:\n${stdout}`);
});
// Nis adminClient.js
exec('node client/adminClient.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`Gabim në adminClient: ${err}`);
        return;
    }
    console.log(`Rezultatet nga adminClient:\n${stdout}`);
});