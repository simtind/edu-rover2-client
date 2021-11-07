const dgram = require('dgram');
const os = require("os");

var client = null;

function stop()
{
    if (client == null)
    {
        return;
    }

    client.close();    
}

function start(window)
{
    if (client != null)
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
    hosts.forEach(
        (host) => 
        {
            try
            {
                client = dgram.createSocket('udp4');
            
                client.on('listening', 
                    function () {
                        try
                        {
                            var address = client.address();
                            console.log('UDP Client listening on ' + address.address + ":" + address.port);
                            client.setBroadcast(true)
                            client.setMulticastTTL(128); 
                            client.addMembership(CHANNEL, host["ip"]);
                        }
                        catch (error)
                        {
                            console.log("Failed to start listener on IP " + host["ip"])
                            console.log(error);
                            // client.close();
                        }
                    }
                );
            
                client.on('message', 
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
                                interface: host["interface"]
                            }
                        );
                    }
                );
            
                client.bind(PORT, host["ip"]);
                console.log("Listening for EDUROV servers on interface with IP: " + host["ip"]);
            }
            catch (error)
            {
                console.log("Failed to start listener on IP " + host["ip"])
                console.log(error);
            }
        }
    );
}


module.exports = { start, stop };
