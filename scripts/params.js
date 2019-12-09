'use strict';

let file_url = Symbol("param_file");
file_url = '../assets/materials.json';
let headers = ["Метериал","Т, мм","Плотность, кг/м3","Цена за кг, сом","Плазменная резка","Лазерная резка","Газовая резка"];
let subheaders = ["Газ/час, сом", "V резки, мм/час", "Пробивка, сом"];
let steel_name = ["Сталь х/к", "Сталь г/к"];

function startPoint() {
    loadJson(file_url, function (response) {
        parseJson(response);
    });
}

function loadJson(filename, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(xobj.responseText);
        } else if (xobj.status !== 200) {
            console.log("Loading JSON error");
        }
    };
    xobj.send(null);
}

function parseJson(response) {
    let raw_array  = JSON.parse(response);
    let mats = new Materials(raw_array[Object.keys(raw_array)[0]]);
    buildMaterialsTable(mats.materials_array);
}

function buildMaterialsTable(data_array) {
    let table = document.createElement("table");
    table.setAttribute("id", "data_table");
    table.setAttribute("class", "table table-striped table-bordered");
    table.setAttribute("style", "width: 100%;");

    let t_head = table.createTHead();
    let t_body = table.createTBody();
    let header_row1 = t_head.insertRow(0);
    let header_row2 = t_head.insertRow(1);

    for (let i = 0; i < headers.length; i++) {
        let th = document.createElement("th");
        th.innerHTML = headers[i];
        if (i < 4) {
            th.setAttribute("rowspan", "2");
        } else {
            th.setAttribute("colspan", "3");
        }
        header_row1.appendChild(th);
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < subheaders.length; j++) {
            let th = document.createElement("th");
            th.innerHTML = subheaders[j];
            header_row2.appendChild(th);
        }
    }

    for (let i = 0; i < data_array.length; i++) {
        let tr = t_body.insertRow(-1);
        for (let j = 0; j < 13; j++) {
            let t_cell = tr.insertCell(-1);
            if (j === 0) {
                if (data_array[i].m_id.toString().substring(0,2) === "CR") {
                    t_cell.innerHTML = steel_name[0];
                } else {
                    t_cell.innerHTML = steel_name[1];
                }
            } else if (j === 1) {
                t_cell.innerHTML = data_array[i].thickness;
            } else if (j === 2) {
                t_cell.innerHTML = data_array[i].density;
            } else if (j === 3) {
                let cost_kg = document.createElement('input');
                cost_kg.type = "number";
                cost_kg.min = "0";
                cost_kg.value = data_array[i].cost_per_kg;
                t_cell.innerHTML = "";
                t_cell.appendChild(cost_kg);
            } else if (j === 4) {
                t_cell.innerHTML = data_array[i].tech_processes[0].gas_cost_per_hour;
            } else if (j === 5) {
                t_cell.innerHTML = data_array[i].tech_processes[0].cut_speed;
            } else if (j === 6) {
                t_cell.innerHTML = data_array[i].tech_processes[0].cost_per_entry;
            } else if (j === 7) {
                t_cell.innerHTML = data_array[i].tech_processes[1].gas_cost_per_hour;
            } else if (j === 8) {
                t_cell.innerHTML = data_array[i].tech_processes[1].cut_speed;
            } else if (j === 9) {
                t_cell.innerHTML = data_array[i].tech_processes[1].cost_per_entry;
            } else if (j === 10) {
                t_cell.innerHTML = data_array[i].tech_processes[2].gas_cost_per_hour;
            } else if (j === 11) {
                t_cell.innerHTML = data_array[i].tech_processes[2].cut_speed;
            } else if (j === 12) {
                t_cell.innerHTML = data_array[i].tech_processes[2].cost_per_entry;
            }
        }
    }


    let divContainer = document.getElementById("main_table");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    createDataTable(table.getAttribute("id"));
}

function createDataTable(mTable) {
    let table_name = '#' + mTable;
    $(document).ready(function() {
        $(table_name).DataTable({
            "searching": false,
            "paging": false,
            "info": false,
            "ordering": false,
            "order": [[ 1, 'asc' ]],
            language: {
                url: '../scripts/Russian.json'
            }
        });
    });
}

class Materials {
    constructor(mats_array) {
        this.mats_array = mats_array;
    }
    get materials_array() {
        return this.mats_array;
    }
}
