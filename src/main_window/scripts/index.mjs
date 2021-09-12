import { video_enter_cinema, video_rotate, video_update_size, video_init } from './video.mjs';
import { gamepad_init } from './gamepad.mjs';
import { keyboard_init } from './keyboard.mjs';
import { actuators_init, actuators_set, actuators_get } from './actuators.mjs';
import { io_send, io_open } from './ioclient.mjs';

const critical = {voltage:10.0, disk_space:500.0, cpu_temp:80.0};
var roll_ui = true;

function set_button_state(id, value)
{    
    var btn = document.getElementById(id);
    if(value){
        btn.className += " active";
    }else{
        btn.className = btn.className.replace(" active", "");
    }
}

export function armed_toggle() 
{
    actuators_set('armed', !actuators_get('armed'));
    set_button_state("button_arm", actuators_get('armed'));
}

function get_slider(id)
{
    return document.getElementById(id).value; 
}

function light_update() 
{
    const intensity =  Number(document.getElementById("slider_headlight_intensity").value);

    if (actuators_get('lights') > 0.0)
    {
        actuators_set('lights', intensity);        
    }
    set_button_state("button_toggle_light", intensity > 0.0);
}

export function light_toggle()
{
    var intensity =  Number(document.getElementById("slider_headlight_intensity").value);

    intensity = actuators_get('lights') > 0.0 ? 0.0 : intensity;
    
    actuators_set('lights', intensity);
    set_button_state("button_toggle_light", intensity > 0.0);
}

function roll_toggle(){
    roll_ui = !roll_ui;
    document.getElementById("rollOverlay").style.visibility = roll_ui ? "visible" : "hidden";
    set_button_state("button_toggle_roll", roll_ui);
}

function refresh_ui(sensors){
    var roll_val = sensors.roll
    document.getElementById("rollOverlay").style.transform =
        `rotate(${roll_val}deg)`;

    for (var key in sensors){
        var element = document.getElementById(key);
        if (element){
            var val = sensors[key];
            if (isNaN(val)){
                element.innerHTML = val;
            } else{
                if (key.endsWith("_current"))
                {
                    element.innerHTML = (val * 1000).toFixed(1);
                }
                else
                {
                    element.innerHTML = val.toFixed(1);
                }
            }
        }
    }

    // Check critical system values
    var voltElem = document.getElementById("voltageTr");
    var diskElem = document.getElementById("diskTr");
    var cpuElem = document.getElementById("cpuTr");
    if (sensors.batteryVoltage < critical.voltage){
        voltElem.className = " table-danger";
    } else{
        voltElem.className = voltElem.className.replace(" table-danger", "");
    }
    if (sensors.free_space < critical.disk_space){
        diskElem.className = " table-danger";
    } else{
        diskElem.className = diskElem.className.replace(" table-danger", "");
    }
    if (sensors.cpu_temp > critical.cpu_temp){
        cpuElem.className = " table-danger";
    } else{
        cpuElem.className = cpuElem.className.replace(" table-danger", "");
    }
}

document.getElementById("button_arm").onclick =                     armed_toggle;
document.getElementById("button_rotate_image").onclick =            video_rotate;
document.getElementById("button_toggle_roll").onclick =             roll_toggle;
document.getElementById("button_enter_cinema").onclick =            () => set_button_state("button_enter_cinema", video_enter_cinema());
document.getElementById("button_stop_rov").onclick =                () => io_send("stop");
document.getElementById("button_toggle_light").onclick =            light_toggle;
document.getElementById("slider_sensor_interval").onchange =        () => actuators_set("interval", Number(document.getElementById("slider_sensor_interval").value));
document.getElementById("slider_headlight_intensity").onchange =    light_update;
document.getElementById("slider_actuator_sensitivity").onchange =   () => actuators_set("sensitivity", Number(document.getElementById("slider_actuator_sensitivity").value));
window.addEventListener("resize",                                   video_update_size);

function start(event, address)
{
    console.log("Got address " + address);
    video_init(`ws://${address}`);
    io_open(
        `ws://${address}`, 
        (event) => { refresh_ui(JSON.parse(event.data)); },
        () =>      { }
    );
    
    actuators_init();
    gamepad_init();
    keyboard_init();
}

window.rov.get_address(start);