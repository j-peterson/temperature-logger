#temperature-logger

Collect data from the BK Precision 710 RS232 Thermometer to a csv file with node.js.

Usage: `node temperature-logger.js /dev/tty.your-serial-device [samplePeriod]`

Options:
* `/dev/tty.your-serial-device` - You must specify the absolute path to the serial port. For example: /dev/ttyO0
* `samplePeriod` - You may optionally specify a sampling period, which is the time interval between samples. `samplePeriod` must be an integer between 1 and 3600 seconds. If null, default is 1 second.

This will collect data from the "main screen" temperature reading in whatever mode and units are active.
It's recommended that the thermometer be used only be in mode "T1" or "T2" and should not be in modes: "REL", "AVG", "MAX", "MIN", or "T1-T2".
