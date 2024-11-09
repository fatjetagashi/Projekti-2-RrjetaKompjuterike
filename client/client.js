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
