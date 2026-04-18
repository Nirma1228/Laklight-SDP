const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: process.env,
    shell: true
});

let output = '';

child.stdout.on('data', (data) => {
    output += data.toString();
    console.log(data.toString());
});

child.stderr.on('data', (data) => {
    output += data.toString();
    console.error(data.toString());
});

child.on('close', (code) => {
    fs.writeFileSync('full_crash_report.txt', output);
    console.log(`Child process exited with code ${code}`);
});
