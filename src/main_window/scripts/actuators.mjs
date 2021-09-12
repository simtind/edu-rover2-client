import { io_send } from './ioclient.mjs';
var actuators = {armed:false, lights:0.0, interval:100, sensitivity:255, vertical:0.0, port:0.0, starboard:0.0}

var interval = null;

function update_interval()
{
    if (interval != null)
    {
        clearInterval(interval);
    }
    interval = setInterval( () => { actuators_send(); }, actuators["interval"]);
}

export function actuators_send()
{
    if (!actuators["armed"])
    {
        actuators["starboard"] = 0;
        actuators["port"] = 0;
        actuators["vertical"] = 0;
    }

    io_send(actuators);
}

export function actuators_set(key, value)
{
    actuators[key] = value;

    if (key == "interval")
    {
        update_interval();
    }
}

export function actuators_toggle(key)
{
    actuators[key] = !actuators[key];
}

export function actuators_get(key)
{
    return actuators[key];
}

export function actuators_init()
{    
    update_interval();
}