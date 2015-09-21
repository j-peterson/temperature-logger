/*
  Collect data from the BK Precision 710 RS232 Thermometer to a csv file.

  Usage: node temperature-logger.js /dev/tty.your-serial-device [samplePeriod]

    /dev/tty.your-serial-device - You must specify the absolute path to the serial port. For example: /dev/ttyO0
    [samplePeriod] - You may optionally specify a sampling period, which is the time interval between samples. If null, default is 1 second.

    This will collect data from the "main screen" temperature reading in whatever mode and units are active.
    It's recommended that the thermometer be used only be in mode "T1" or "T2" and should not be in modes: "REL", "AVG", "MAX", "MIN", or "T1-T2".
*/
"use strict";
var fs = require('fs');
var serialport = require('serialport');
var moment = require('moment');

var SerialPort = serialport.SerialPort;
var device = process.argv[2];
var samplePeriod = process.argv[3];
// var device = "/dev/tty.USA19H141P1.1";

function getSamplePeriod() {
  if (samplePeriod >= 1 && samplePeriod <= 3600) {
    console.log('Sending requests with a sampling period of ' + samplePeriod + ' seconds');
    return samplePeriod * 1000;
  } else if (samplePeriod === undefined) {
    return 1000;
  } else {
    console.log('Sample period must be a number of seconds between 1 and 3600');
    process.exit();
  }
}

function time() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

function getData() {
  console.log('Starting to send data to serial port');
  var timer = setInterval(function () {
    sp.write('D', function (err, results) {   // send 'D' for thermometer primary window display and 'B' for secondary
      if(err) { console.err('Error sending command "D" to serial port - ' + err) };
    });
  }, getSamplePeriod());
}

function writeToFile(fd, buffer) {
  buffer = new Buffer(buffer + '\r\n');
  var offset = 0;
  var length = buffer.length;
  var position = null;
  fs.write(fd, buffer, offset, length, position, function (err, written, buffer) {
    if(err) { console.err('Error writing to file') };
    // console.log(err, written, buffer);
  });
}

// fix me - this should be wrapped in a function to isolate from global scope
if(device !== null && fs.existsSync(device)) {
  var file = device.split('/');
  file = './' + file[file.length - 1] + '_' + moment().format('YY-MM-DDTHHmm') + '.csv';

  var sp = new SerialPort(device, {
    baudrate: 9600,
    databits: 8,
    stopbits: 1,
    parser: serialport.parsers.readline('\r')
    // parser: serialport.parsers.raw
  });

  fs.open(file, 'w', function (err, fd) {
    if(!err) {
      sp.open(function (error) {
        if(!error) {
          console.log('Opened serial connection with ' + device + ' at ' + time());
          writeToFile(fd, 'Opened serial connection with ' + device + ' at ' + time());
          writeToFile(fd, 'Probe Label,Temperature,Units,Time/Date Stamp');
          
          sp.on('data', function (data) {
            console.log(data, time());
            var d = data.match(/(T[1|2])\s+(-?)\s*(\d+\.?\d*)\s+([C|F])/).splice(1,4);
            if (d) {
              writeToFile(fd, d[0] + ',' + d[1] + d[2] + ',' + d[3] + ',' + time());
            }
          });
          
          sp.on('close', function (error) {
            clearInterval(timer);
            console.log('Closed serial connection at ' + time());
          });
          getData();
        } else {
          console.log("Error opening serial port - " + error);
          process.exit();
        }
      });
    } else {
      console.log('Error creating file - ' + fd + ' Error - ' + err);
    }
  });
} else {
  console.log('You must specify the absolute path to a serial port that exists. For example: /dev/ttyO0');
  process.exit();
}
