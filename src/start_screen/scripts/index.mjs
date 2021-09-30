var selected_row = null;
const edurov_servers = {};


function start_app(address=null)
{
    if (address == null)
    {
        address = document.getElementById("input_url").value;
    }
    window.splash.start(address);
}

function on_table_row_click()
{
    if (selected_row != null)
    {
        selected_row.classList.remove("table-primary");
    }

    selected_row = this;
    this.classList.add("table-primary");
    var input = document.getElementById("input_url");
    input.value = this.cells[0].innerHTML;
}

function on_edurov_search_result(event, result)
{
    var table = document.getElementById("table_edurov_results");

    if (result["ip"] in edurov_servers)
    {
        // Ignore already existing servers.
        return;
    }

    edurov_servers[result["ip"]] = result;
    
    console.log("Found new edurov server: \n" + JSON.stringify(result, null, 4));        

    // Create an empty <tr> element and add it to the 1st position of the table:
    var row = table.insertRow();
    row.onclick = on_table_row_click;

    // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
    var cell_address = row.insertCell(0);
    var cell_interface = row.insertCell(1);
    var cell_message = row.insertCell(2);
    var cell_button = row.insertCell(3);

    // Add some text to the new cells:
    cell_address.innerHTML = result["ip"];
    cell_interface.innerHTML = result["interface"];
    cell_message.innerHTML = result["message"]; 
    cell_button.innerHTML = `<button type="button" class="btn btn-outline-primary btn-sm btn-block" title="Connect to server at ${result["ip"]}.">Connect</button>`
    cell_button.onclick = () => start_app(result["ip"]);
}

function start_search()
{
    // Clear search results
    selected_row = null;
    document.getElementById("table_edurov_results").innerHTML = "";
    window.splash.edurov_search.start();
}

document.getElementById("button_start_app").onclick = start_app;
window.splash.edurov_search.on_result(on_edurov_search_result);

start_search();