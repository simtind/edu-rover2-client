var client = null;

export function io_send(data) {
    if (client && client.readyState == 1)
    {
        client.send(JSON.stringify(data));
    }
}

export function io_close(){
    if (client)
    {
        client.close();
    }
}

export function io_open(address, message_handler, close_handler) {

    console.log("Starting I/O server client");
    
    // Create WebSocket connection.
    client = new WebSocket(address + ":8082");
    
    client.addEventListener(
        'open', 
        ()  =>
        {
            console.log("I/O server Connection made");
            client.send("Start");
        }
    );            
    client.addEventListener('message', message_handler);
    client.addEventListener(
        'close', 
        () => 
        {
            console.log("I/O server connection closed"); 
            close_handler();
            client = null;
        }
    );
}