'use strict';

let srv_address = Symbol("server");
let part1 = Symbol("start");
let part2 = Symbol("finish");
let part3 = Symbol("branch");
let branchId = Symbol("branch_id");
//srv_address = 'http://192.168.0.14:5002/';
srv_address = 'http://points.temirtulpar.com/app/';
part1 = 'events?st=';
part2 = '&et=';
part3 = '&br=';
branchId = 0; //1

function buildUrl() {
    let day_in_mil = 86400000;
    let _start = "";
    let _finish = "";
    let _period = document.getElementById("period_selector");
    let period_name = _period.value.toLowerCase();

    if (_period.selectedIndex === 1) {
        _finish = getTodayDateInMillisFromMidnight();
        _start = _finish - day_in_mil;
    } else if (_period.selectedIndex === 2) {
        _finish = getTodayDateInMillisFromMidnight() + day_in_mil;
        _start = _finish - day_in_mil * 8;
        period_name = "неделю";
    } else if (_period.selectedIndex === 3) {
        _finish = getTodayDateInMillisFromMidnight() + day_in_mil;
        _start = _finish - day_in_mil * 31;
    }

    document.title = "ЗТТА СКОО - События за " + period_name;

    return srv_address + part1 + _start + part2 + _finish + part3 + branchId;
}

function startPoint() {
    let srv_url = buildUrl();
    loadJson(srv_url, function (response) {
        parseJson(response);
    });
}

function loadJson(url, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(xobj.responseText);
        } else if (xobj.status !== 200) {
            buildErrorMessage();
        }
    };
    xobj.send(null);
}

function buildErrorMessage() {
    let root = document.getElementById("alert_msg");

    if (!document.getElementById("custom_alert")) {
        let error_alert = document.createElement("div");
        let close_button = document.createElement("button");
        let button_span = document.createElement("span");

        close_button.setAttribute("type", "button");
        close_button.setAttribute("class", "close");
        close_button.setAttribute("data-dismiss", "alert");
        close_button.setAttribute("aria-label", "Close");

        button_span.setAttribute("aria-hidden", "true");
        button_span.innerHTML = "&times;";
        close_button.appendChild(button_span);

        error_alert.setAttribute("id", "custom_alert");
        error_alert.setAttribute("class", "alert alert-danger alert-dismissible fade show mt-3");
        error_alert.setAttribute("role", "alert");
        error_alert.innerHTML = "Проблема получения данных. Свяжитесь с отделом ИТ чтобы решить эту проблему";
        error_alert.appendChild(close_button);
        root.appendChild(error_alert);
        root.setAttribute("class", "visible");
    }
}

function parseJson(response) {
    let raw_array  = JSON.parse(response);
    let docs = new Points(raw_array[Object.keys(raw_array)[0]]);
    buildTable(docs.points);
}

function buildTable(data_array) {
    let table = document.createElement("table");
    table.setAttribute("id", "data_table");
    table.setAttribute("class", "table table-striped table-bordered");
    let labels = ["Метка", "Дата и время"];

    let col = [];
    for (let i = 0; i < data_array.length; i++) {
        for (let key in data_array[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }

    let t_header = table.createTHead();
    let thr = t_header.insertRow(-1);
    for (let i = 0; i < 2; i++) {
        let th = document.createElement("th");
        th.innerHTML = labels[i];
        thr.appendChild(th);
    }

    let t_body = table.createTBody();
    for (let i = 0; i < data_array.length; i++) {
        let tr = t_body.insertRow(-1);
        for (let j = 2 ; j >= 0; j--) {
            if (j !== 1) {
                let tabCell = tr.insertCell(-1);
                if (j === 0) {
                    tabCell.innerHTML = convertMillisToDate(data_array[i][col[j]]);
                } else {
                    tabCell.innerHTML = data_array[i][col[j]];
                }
            }
        }
    }

    let divContainer = document.getElementById("right_column");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);

    createDataTable(table.getAttribute("id"));
}

function convertMillisToDate(value) {
    if (value !== null) {
        let date = new Date(parseInt(value, 10));
        let aYear = date.getFullYear();
        let aMonth = date.getMonth() + 1;
        let aDay = date.getDate();
        let aHour = date.getHours();
        let aMinute = date.getMinutes();
        let aSecond = date.getSeconds();
        //let str = aYear + "/" + formatDateTwoSign(aMonth) + "/" + formatDateTwoSign(aDay) + " " + formatDateTwoSign(aHour) + ":" + formatDateTwoSign(aMinute) + ":" + formatDateTwoSign(aSecond);
        if (aHour >= 17 && aHour <= 23) {
            return `${aYear}/${formatDateTwoSign(aMonth)}/${formatDateTwoSign(aDay)} <span class="badge badge-secondary badge-pill">${formatDateTwoSign(aHour)}:${formatDateTwoSign(aMinute)}:${formatDateTwoSign(aSecond)}</span>`;
        } else {
            return `${aYear}/${formatDateTwoSign(aMonth)}/${formatDateTwoSign(aDay)} <span class="badge badge-info badge-pill">${formatDateTwoSign(aHour)}:${formatDateTwoSign(aMinute)}:${formatDateTwoSign(aSecond)}</span>`;
        }
    } else return "-"
}

function formatDateTwoSign(value) {
    if (value < 10) {
        return "0" + value;
    } else {
        return value;
    }
}

function createDataTable(mTable) {
    let table_name = '#' + mTable;
    $(document).ready(function() {
        $(table_name).DataTable({
            "lengthMenu": [[-1, 15, 30, 50], ["All", 15, 30, 50]],
            /*"paging": false,*/
            "order": [[ 1, "desc" ]],
            "searching": false,
            language: {
                url: 'scripts/Russian.json'
            }
        });
    });
}

function getTodayDateInMillisFromMidnight() {
    let cur_date = new Date();
    cur_date.setHours(0,0,0);
    cur_date.setMinutes(0,0,0);
    cur_date.setSeconds(0,0);
    cur_date.setMilliseconds(0);
    return cur_date.getTime();
}

class Points {
    constructor(points_array) {
        this.points_array = points_array;
    }

    get points() {
        return this.points_array;
    }
}
