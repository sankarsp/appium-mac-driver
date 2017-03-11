#!/usr/bin/env node
/* eslint-disable no-console */

var fs = require('fs')
  , path = require('path')
  , system = require('appium-support').system;


function waitForDeps (cb) {
  // see if we can import the necessary code
  // try it a ridiculous (but finite) number of times
  var i = 0;
  function check () {
    i++;
    try {
      require('./build/lib/installer');
      cb();
    } catch (err) {
      if (err.message.indexOf("Cannot find module './build/lib/installer'") !== -1) {
        console.warn('Project does not appear to built yet. Please run `gulp transpile` first.');
        return cb('Could not install module: ' + err);
      }
      console.warn('Error trying to install AppiumForMacDriverServer MSI. Waiting and trying again.', err.message);
      if (i <= 200) {
        setTimeout(check, 1000);
      } else {
        cb('Could not import installation module: ' + err);
      }
    }
  }
  check();
}

if (require.main === module) {
  if (!system.isWindows()) {
    console.warn("Not installing AppiumForMacDriverServer since did not detect a Windows system");
    process.exit(0);
  }
  // check if cur dir exists
  var installScript = path.resolve(__dirname, 'build', 'lib', 'installer.js');
  waitForDeps(function (err) {
    if (err) {
      console.warn("Unable to import install script. Re-run `install appium-windows-driver` manually.");
      return;
    }
    fs.stat(installScript, function (err) {
      if (err) {
        console.warn("NOTE: Run 'gulp transpile' before using");
        return;
      }
      require('./build/lib/installer').setupWAD().catch(function (err) {
        console.error(err.message);
        console.error("AppiumForMacDriverServer was not installed; please check your " +
                      "system and re-run npm install if you need AppiumForMacDriverServer");
      });
    });
  });
}
