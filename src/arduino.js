import { arch, platform } from 'process';
const execute = require('child_process');
const download = require("./download");

let list_cmd = null;
let list = [];

export function init()
{
    console.log("Downloading arduino-cli.");
    let arduino_cli_url = "";
    if (platform === "win32")
    {
        if (arch == "x64")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip"
        }
        else if (arch == "x32")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_32bit.zip"
        }
    }
    if (platform === "linux")
    {
        if (arch == "arm")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARMv7.tar.gz"
        }
        else if (arch == "arm64")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARM64.tar.gz"
        }
        else if (arch == "x64")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz"
        }
        else if (arch == "x32")
        {
            arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_32bit.tar.gz"
        }
    }
    if (platform === "darwin")
    {
        arduino_cli_url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz"
    }
    download.download_archive_contents(arduino_cli_url, "./arduino");
    
    console.log("arduino-cli downloaded to ./arduino/arduino-cli");

    console.log("Install ardunio coores.");
    cmd = execute.spawn("./arduino/arduino-cli",  ["core", "install", "arduino:mbed_nano", "arduino:megaavr"]);
    
    cmd.stdout.on('data', (data) => {console.log(`stdout: ${data}`);});
    cmd.stderr.on('data', (data) => {console.error(`stderr: ${data}`);});
    cmd.on('close', (code) => {console.log(`Core install process exited with code ${code}`);});
}

function handleListEvent(data, onresult)
{
    data = JSON.parse(data);

    if (data["type"] == "add")
    {
        list.push(data);
    }
    else
    {
        list = list.filter(item => item["address"] != data["address"]);
    }

    onresult(list)
}

export function startList(onresult)
{
    if (list_cmd != null)
    {
        return;
    }

    list_cmd = execute.spawn(
        "./arduino/arduino-cli", 
        ["board", "install", "list", "--format", "json", "-w"]
    );
    
    list_cmd.stdout.on('data', (data) => {handleListEvent(data, onresult);});
}

export function stopList(onresult)
{
    if (list_cmd == null)
    {
        return;
    }

    list_cmd.kill();
    list_cmd = null;
}


export function program(file, board, progress)
{

    list_cmd = execute.spawn(
        "./arduino/arduino-cli", 
        ["upload", "-b", board["boards"][0]["fqbn"], "-i", file, "-p", board["address"], "-v", "--format", "json"]
    );
    
    list_cmd.stdout.on('data', (data) => {progress(data);});
}