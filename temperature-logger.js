/*
  Collect data from the BK Precision 710 RS232 Thermometer to a csv file.

  Usage: node temperature-logger.js /dev/tty.your-serial-device

    This will collect data from the "main screen" temperature reading in whatever mode and units are active.
    It's recommended that the thermometer be used only be in mode "T1" or "T2" and should not be in modes: "REL", "AVG", "MAX", "MIN", or "T1-T2".
    You must specify the absolute path to the serial port. For example: /dev/ttyO0
*/

var fs = require('fs');
var serialport = require('serialport');
var moment = require('moment');

var SerialPort = serialport.SerialPort;
var device = process.argv[2];
// var device = "/dev/tty.USA19H141P1.1";
var serialOpen = false;

if (!device) {
  console.log('You must specify the absolute path to a serial port. For example: /dev/ttyO0');
  process.exit();
} else {
  var sp = new SerialPort(device, {
    baudrate: 9600,
    databits: 8,
    stopbits: 1,
    parser: serialport.parsers.readline('\r')
    // parser: serialport.parsers.raw
  });

  sp.open(function (error) {
    if(!error) {
      serialOpen = true
      console.log('Opened serial connection at ' + moment().format('YYYY-MM-DDTHH:mm:ss'));
      
      sp.on('data', function (data) {
        console.log(data, moment().format('YYYY-MM-DDTHH:mm:ss'));
        fs.write(fd, data.replace(/\s*$/, '').replace(/\s+/g, ',') + ',' + moment().format('YYYY-MM-DDTHH:mm:ss'));
      });
      
      sp.on('close', function (error) {
        clearInterval(timer);
        console.log('closed serial connection at ' + moment().format('YYYY-MM-DDTHH:mm:ss'));
      });      
    } else {
      console.log("Error opening serial port - " + error);
      process.exit();
    }
  });
};

if(serialOpen) {
  var file = device.split('/');
  file = file[file.length - 1] + '_' + moment().format('YY-MM-DDTHHmm') + '.csv';
  fs.open('./' + file, 'w', function (err, fd) {
    if(!err) {
      // fs.open callback
      var timer = setInterval(function() {
        sp.write('D', function (err, results) {
          if(err) { console.log('err: ' + err) };
        });
      }, 1000);
    } else {
      console.log('error opening file: ' + err);
    };
  });
};    



