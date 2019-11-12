#!/usr/bin/env node

const fs = require('fs'),
    arg = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    { exec } = require('child_process'),
    temp = './temp-set.json',
    setting = require(temp)

const chekELProc = function () {
    if (!setting.LE) {
        console.log('You need to set Locale Emulator path, leportable set "<path>"')
        return false
    }
    if (fs.existsSync(path.join(setting.LE, 'LEProc.exe'))) {
        return true
    } else {
        console.log(`LEProc.exe not found in ${setting.LE}, leportable set "<path>" to set Locale Emulator path`)
        return false
    }
}

const setELProc = function (a) {
    if (fs.existsSync(path.join(a, 'LEProc.exe'))) {
        fs.writeFileSync(path.resolve(__dirname, temp), JSON.stringify({ LE: a }, null, 4))
        console.log(`Success set Locale Emulator path`)
    } else {
        console.log(`LEProc.exe not found in ${a}`)
    }
}

const makeBatch = function (le, a) {
    return `@ECHO off

set ERR[0]=0
set ERR[1]=0

set LE="${le}"
set VN="${a}"

IF EXIST %LE% (set ERR[0]=1)
IF EXIST %VN% (set ERR[1]=1)

IF /I "%ERR[0]%" EQU "0" GOTO errormsg
IF /I "%ERR[1]%" EQU "0" GOTO errormsg

GOTO end

:errormsg
IF /I "%ERR[0]%" EQU "0" (ECHO %LE% Not Found)
IF /I "%ERR[1]%" EQU "0" (ECHO %VN% Not Found)
PAUSE

:end
%LE% %VN%`
}

let cmd = arg._[0] || 'help'

if (arg.help || arg.h) {
    cmd = 'help'
}

switch (cmd) {
    case 'start':
        if (chekELProc()) {
            if (arg._[1]) {
                if (fs.existsSync(path.join(process.cwd(), arg._[1]))) {
                    exec(`${path.join(setting.LE, 'LEProc.exe')} "${path.join(process.cwd(), arg._[1])}"`, (err, stdout, stderr) => {
                        if (err) {
                            return;
                        }
                    })
                } else {
                    console.log(`${arg._[1]} not found`)
                }
            } else {
                console.log(`You forget to add game executable file to argument`)
            }
        }
        break;
    case 'bat':
        if (chekELProc()) {
            if (arg._[1]) {
                if (fs.existsSync(path.join(process.cwd(), arg._[1]))) {
                    fs.writeFileSync('start.bat', makeBatch(path.join(setting.LE, 'LEProc.exe'), path.join(process.cwd(), arg._[1])))
                    console.log('Success make start.bat file')
                } else {
                    console.log(`${arg._[1]} not found`)
                }
            } else {
                console.log(`You forget to add game executable file to argument`)
            }
        }
        break;
    case 'set':
        if (arg._[1]) {
            setELProc(arg._[1])
        } else {
            console.log(`You forget to add path Locale Emulator to argument`)
        }
        break;
    case 'help':
        console.log(`Usage: leportable <command>
Command :
- set "<path>"
++ set path Locale Emulator
- start "<executable file>"
++ start with Locale Emulator
- bat "<executable file>"
++ create start.bat file so you can just click bat file to start with Locale Emulator`)
        break;
    default:
        console.error(`"${cmd}" is not a valid command!`)
        break;
}