const dgram = require('dgram');
const os = require("os");

var socket = null;

function stop()
{
    if (socket == null)
    {
        return;
    }

    socket.close();    
}

function start(window)
{
    if (socket != null)
    {
        stop();
    }

    const interfaces = os.networkInterfaces();
    var hosts = []

    for (const key in interfaces) {
        const interface = interfaces[key];
        for (const index in interface) {
            const connection = interface[index];
            if (connection.internal || connection.family == "IPv6") {
                continue;
            }
            
            hosts.push({"interface": key, "ip": connection.address});
        }
    }

    const PORT = 8083;
    const CHANNEL = "224.0.0.50";
    socket = dgram.createSocket('udp4');

    socket.on("error", (error) => 
        {
            console.log(`Socket error: ${error.stack}`);
            socket.close();
        }
    );

    socket.on('message', 
        function (message, remote) 
        {
            if (message.toString() == "edurov_waiting")
            {
                // Skip submitting "waiting" message
                return;
            }
            
            window.webContents.send("edurov_search_result",
                {
                    ip: remote.address,
                    message: message.toString(),
                }
            );
        }
    );

    socket.bind(
        PORT,
        undefined, 
        function () {
            try
            {
                socket.setBroadcast(true);
                socket.setMulticastTTL(128);
                hosts.forEach((host) => 
                    {
                        socket.addMembership(CHANNEL, host["ip"]);
                        console.log("Listening for EDUROV servers on interface with name: " + host["interface"]);
                    }
                )
            }
            catch (error)
            {
                console.log("Failed to start listener")
                console.log(error);
                socket.close();
            }
        }
    );
}


module.exports = { start, stop };
