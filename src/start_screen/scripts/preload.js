

console.log("Preloading")
const ipc = require('electron').ipcRenderer;
const bridge = require('electron').contextBridge;

bridge.exposeInMainWorld(
    'splash',
    {
        edurov_search:{
            start: () => ipc.send("edurov_search_start"),
            on_result: (callback) => ipc.on("edurov_search_result", callback),
        },
        start: (address) => ipc.send("start", address)
    }
)
