'use strict';

let constants = Symbol("consts");
constants = "assets/constants.json";

let materialList = Symbol("mats");
materialList = "assets/materials.json";

const steel_prefix = ["CR", "HR"];
const steel_type = ["Сталь х/к", "Сталь г/к"];

let user_details = [];
let cur_tech_process = "plasma";

let headers = ["Метериал","Т, мм","Плотность, кг/м3","Цена за кг, сом","Плазменная резка","Лазерная резка","Газовая резка"];
let subheaders = ["Газ/час, сом", "V резки, мм/час", "Пробивка, сом"];
let steel_name = ["Сталь х/к", "Сталь г/к"];

let labels = ["Коэфициент жадности","Время подготовки станка (мин)", "Время программирования (мин)", "Стоимость подготовки материала (сом)","Стоимость программирования (сом)"];
let const_headers = ["", "Плазменная резка","Лазерная резка","Газовая резка"];
let const_subheaders = ["Стоимость расходных материалов", "Базовая стоимость"];
let tooltips = ["Сохранённые значения будут доступны, \nпока страница не перезагружена", "Сохранённые значения будут записаны в файл. \nДля дальнейшего использования потребуется загрузить этот файл на сервер"];
let values = ["Сохранить", "Сохранить в файл"];
let ids = ["profitRatio", "prepareTime", "programmingTime", "prepareCost", "programmingCost"];

let flag = false;
let load_mat_flag = false;
let load_const_flag = false;

let calcConsts;
let calcMaterial;
let matObj;
let constObj;

function startPoint() {
    initialize();
}

function show_table() {
    if (load_mat_flag !== true) {
        startPoint();
        show_table();
    } else {
        let container = document.getElementById("materials");
        if (container.childElementCount === 0) {
            container.appendChild(matObj.get_materials_table());
            container.appendChild(matObj.get_save_menu());
            createDataTable("data_table");
        }
    }
}

function show_params() {
    if (load_const_flag !== true) {
        startPoint();
        show_params();
    } else {
        let cont = document.getElementById("constants");
        if (cont.childElementCount === 0) {
            cont.appendChild(constObj.get_consts_form());
        }
    }
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
                url: 'scripts/Russian.json'
            }
        });
    });
}

class Material {
    constructor(raw_array) {
        this.materials_array = raw_array;
        this.build_table();
        this.build_toolbar();
    }

    get_mat_array() {
        return this.materials_array;
    }

    replace_metal_cost(index, value) {
        this.materials_array[index].cost_per_kg = value;
    }

    build_table() {
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

        for (let i = 0; i < this.materials_array.length; i++) {
            let tr = t_body.insertRow(-1);
            for (let j = 0; j < 13; j++) {
                let t_cell = tr.insertCell(-1);
                if (j === 0) {
                    if (this.materials_array[i].m_id.toString().substring(0,2) === "CR") {
                        t_cell.innerHTML = steel_name[0];
                    } else {
                        t_cell.innerHTML = steel_name[1];
                    }
                } else if (j === 1) {
                    t_cell.innerHTML = this.materials_array[i].thickness;
                } else if (j === 2) {
                    t_cell.innerHTML = this.materials_array[i].density;
                } else if (j === 3) {
                    let cost_kg = document.createElement('input');
                    cost_kg.classList.add("metal-cost");
                    cost_kg.type = "number";
                    cost_kg.min = "0";
                    cost_kg.value = this.materials_array[i].cost_per_kg;
                    t_cell.innerHTML = "";
                    t_cell.appendChild(cost_kg);
                } else if (j === 4) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[0].gas_cost_per_hour;
                } else if (j === 5) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[0].cut_speed;
                } else if (j === 6) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[0].cost_per_entry;
                } else if (j === 7) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[1].gas_cost_per_hour;
                } else if (j === 8) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[1].cut_speed;
                } else if (j === 9) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[1].cost_per_entry;
                } else if (j === 10) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[2].gas_cost_per_hour;
                } else if (j === 11) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[2].cut_speed;
                } else if (j === 12) {
                    t_cell.innerHTML = this.materials_array[i].tech_processes[2].cost_per_entry;
                }
            }
        }

        this.mat_table = table;
    }

    get_materials_table() {
        return this.mat_table;
    }

    build_toolbar() {
        let save_toolbar = document.createElement("div");
        save_toolbar.setAttribute("class", "mt-1 mb-2");

        let btn1 = document.createElement("a");
        let btn2 = document.createElement("button");
        btn1.classList.add("btn");
        btn1.classList.add("btn-outline-danger");
        btn1.classList.add("mr-2");
        btn2.classList.add("btn");
        btn2.classList.add("btn-secondary");
        btn2.classList.add("mr-2");
        btn1.setAttribute("role", "button");
        btn1.setAttribute("data-toggle", "tooltip");
        btn1.setAttribute("data-placement", "top");
        btn1.setAttribute("title", tooltips[1]);
        btn1.setAttribute("id", "save_to_file");
        btn2.setAttribute("data-toggle", "tooltip");
        btn2.setAttribute("data-placement", "top");
        btn2.setAttribute("title", tooltips[0]);
        btn2.setAttribute("id", "save_temporary");

        btn2.onclick = function() {
            let table = document.getElementById("data_table");
            let cost_values = table.getElementsByClassName("metal-cost");
            for (let i = 0; i < cost_values.length; i++) {
                matObj.replace_metal_cost(i, cost_values[i].value);
            }
        };

        btn1.onclick = function() {
            let table = document.getElementById("data_table");
            let cost_values = table.getElementsByClassName("metal-cost");
            for (let i = 0; i < cost_values.length; i++) {
                matObj.replace_metal_cost(i, cost_values[i].value);
            }
            let json_obj = JSON.stringify({"materials": matObj.get_mat_array()});
            btn1.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json_obj));
            btn1.setAttribute('download', 'materials.json');
        };

        btn1.innerHTML = values[1];
        btn2.innerHTML = values[0];

        save_toolbar.appendChild(btn2);
        save_toolbar.appendChild(btn1);
        this.save_menu = save_toolbar;
    }

    get_save_menu() {
        return this.save_menu;
    }
}

class Constants {
    constructor(json_array) {
        this.consts = json_array;
        this.build_form();
    }

    build_form() {
        let container = document.createElement("div");
        container.setAttribute("class", "container mt-4");

        let table_elem = document.createElement("table");
        table_elem.setAttribute("id", "const_table");
        table_elem.setAttribute("class", "table table-striped table-bordered");

        let t_head = table_elem.createTHead();
        let t_body = table_elem.createTBody();
        let header_row = t_head.insertRow(-1);

        for (let k = 0; k < const_headers.length; k++) {
            let th = document.createElement("th");
            th.innerHTML = const_headers[k];
            header_row.appendChild(th);
        }

        for (let i = 0; i < 2; i++) {
            let tr = t_body.insertRow(-1);
            for (let j = 0; j < 4; j++) {
                let t_cell = tr.insertCell(-1);
                if (i === 0) {
                    if (j === 0) {
                        t_cell.innerHTML = const_subheaders[i];
                    } else if (j === 1) {
                        t_cell.innerHTML = this.consts.tech_process[0].expandable_materials_cost;
                    } else if (j === 2) {
                        t_cell.innerHTML = this.consts.tech_process[1].expandable_materials_cost;
                    } else if (j === 3) {
                        t_cell.innerHTML = this.consts.tech_process[2].expandable_materials_cost;
                    }
                } else if (i === 1) {
                    if (j === 0) {
                        t_cell.innerHTML = const_subheaders[i];
                    } else if (j === 1) {
                        t_cell.innerHTML = this.consts.tech_process[0].basic_cost;
                    } else if (j === 2) {
                        t_cell.innerHTML = this.consts.tech_process[1].basic_cost;
                    } else if (j === 3) {
                        t_cell.innerHTML = this.consts.tech_process[2].basic_cost;
                    }
                }
            }
        }

        container.appendChild(table_elem);

        let form_element = document.createElement("form");

        for (let i = 0; i < 6; i++) {
            let row_div = document.createElement("div");
            row_div.setAttribute("class", "form-group row");

            if (i < 5) {
                let label_elem = document.createElement("label");
                label_elem.setAttribute("for", ids[i]);
                label_elem.setAttribute("class", "col-sm-5 col-form-label");
                label_elem.innerText = labels[i];

                let sub_div = document.createElement("div");
                sub_div.classList.add("col-sm-7");

                let input_elem = document.createElement("input");
                input_elem.setAttribute("type", "number");
                input_elem.classList.add("form-control");
                input_elem.readOnly = true;
                input_elem.setAttribute("id", ids[i]);
                input_elem.min = "1";
                if (i === 0) {
                    input_elem.value = this.consts.profit_ratio;
                } else if (i === 1) {
                    input_elem.value = this.consts.machine_prepare_time_min;
                } else if (i === 2) {
                    input_elem.value = this.consts.programming_time;
                } else if (i === 3) {
                    input_elem.value = this.consts.material_prepare_cost;
                } else if (i === 4) {
                    input_elem.value = this.consts.programming_cost;
                }

                sub_div.appendChild(input_elem);
                row_div.appendChild(label_elem);
                row_div.appendChild(sub_div);
            } /*else {
                for (let j = 0; j < 2; j++) {
                    let btn = document.createElement("button");
                    btn.setAttribute("type", "button");
                    btn.setAttribute("class", "btn mb-2 mr-2");
                    btn.setAttribute("data-toggle", "tooltip");
                    btn.setAttribute("data-placement", "top");
                    btn.setAttribute("title", tooltips[j]);
                    if (j === 0) {
                        btn.classList.add("btn-primary");
                    } else {
                        btn.classList.add("btn-outline-danger");
                    }
                    btn.innerText = values[j];
                    row_div.classList.add("float-right");
                    row_div.appendChild(btn);
                }
            }
            */
            form_element.appendChild(row_div);
            container.appendChild(form_element);
        }

        this.const_form = container;
    }

    get_consts_form() {
        return this.const_form;
    }
}

function initialize() {
    loadJson(materialList, function (response) {
        let raw_array  = JSON.parse(response);
        calcMaterial = new CalcMetal(raw_array[Object.keys(raw_array)[0]]);
        matObj = new Material(calcMaterial.material);
        load_mat_flag = true;
    });
    loadJson(constants, function (response) {
        let raw_array  = JSON.parse(response);
        calcConsts = new CalcConst(raw_array[Object.keys(raw_array)[0]]);
        constObj = new Constants(calcConsts.consts);
        load_const_flag = true;
    });
    processSelector();
}

function processSelector() {
    let selected_process = document.getElementsByName("process");
    for (let i = 0; i < selected_process.length; i++) {
        if (selected_process[i].checked) {
            cur_tech_process = selected_process[i].value;
            if (flag === true) {
                refreshSelectors();
            }
        }
    }
}

function fileLoading() {
    flag = false;
    user_details = [];
    let selectedFile = document.getElementById('input').files;

    for (let i = 0; i < selectedFile.length; i++) {
        let objectURL = window.URL.createObjectURL(selectedFile[i]);
        loadSvg(objectURL, function (response) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(response, "image/svg+xml");

            let width = doc.rootElement.viewBox.baseVal.width;
            let height = doc.rootElement.viewBox.baseVal.height;
            let number_of_entries = doc.rootElement.getElementById("holes").childElementCount + 1;

            let body = doc.rootElement.getElementById("body");
            let pg_body = body.getElementsByTagName("polygon")[0].attributes.item(0).value;

            let body_points = pg_body.trim().split(" ");
            let body_area = getPolygonArea(body_points);
            let body_perimeter = getPolygonPerimeter(body_points);

            let holes = doc.rootElement.getElementById("holes");
            let total_holes_area = 0;
            let total_holes_perimeter = 0;
            for (let i = 0; i < holes.childElementCount; i++) {
                let pg_hole = holes.getElementsByTagName("polygon")[i].attributes.item(0).value;
                let hole_points = pg_hole.trim().split(" ");

                total_holes_area += getPolygonArea(hole_points);
                total_holes_perimeter += getPolygonPerimeter(hole_points);
            }

            let total_area = ((body_area - total_holes_area) / 1000000).toFixed(3);
            let total_perimeter = ((total_holes_perimeter + body_perimeter) / 1000).toFixed(2);

            let user_detail = new UserFile(selectedFile[i].name, width, height, number_of_entries, total_area, total_perimeter, objectURL);
            user_details.push(user_detail);

            if (user_details.length === selectedFile.length) {
                flag = true;
            }
        });
    }
    checkFlag();
}

function checkFlag() {
    if (flag === true) {
        fileProcessing();
    } else {
        window.setTimeout(checkFlag, 100);
    }
}

function fileProcessing() {
    let file_container = document.getElementById('load_result');
    file_container.classList.add("mt-3");
    file_container.innerHTML = "";

    for (let i = 0; i < user_details.length; i++) {
        let shadowed_container = document.createElement("div");
        shadowed_container.setAttribute("class", "border media position-relative rounded mb-3 bg-light");

        let image = document.createElement("img");
        image.classList.add("m-3");
        image.setAttribute("alt", user_details[i].file_name);
        image.width = 180;
        image.src = user_details[i].file_img;

        let media_body = document.createElement("div");
        media_body.setAttribute("class", "media-body m-2");

        let clearfix_div = document.createElement("div");
        clearfix_div.setAttribute("class", "bg-light clearfix");

        let title = document.createElement("h5");
        title.setAttribute("class", "float-left");

        let row_div = document.createElement("div");
        row_div.setAttribute("class", "row mr-2 mt-2");

        let column1 = document.createElement("div");
        column1.classList.add("col");

        let column2 = document.createElement("div");
        column2.classList.add("col");

        let list1 = document.createElement("ul");
        list1.setAttribute("id", "left_list");

        for (let j = 0; j < 6; j++) {
            let list_item = document.createElement("li");
            list_item.setAttribute("class", "d-flex justify-content-between align-items-center left-params");
            if (j === 0) {
                list_item.innerHTML = "Размер заготовки: <span>" + user_details[i].get_size() + " мм.</span>";
            }
            if (j === 1) {
                list_item.innerHTML = "Площадь:  <span>" + user_details[i].file_area + " кв.м.</span>";
            }
            if (j === 2) {
                list_item.innerHTML = "Длина реза: <span>" + user_details[i].file_cut_length + " м.</span>";
            }
            if (j === 3) {
                list_item.innerHTML = "Кол-во прожигов: <span>" + user_details[i].num_of_entries + "</span>";
            }
            if (j === 4) {
                list_item.innerHTML = "Общий вес остатков: ";
            }
            if (j === 5) {
                list_item.innerHTML = "Материал: ";
                list_item.appendChild(buildSelector());
                list_item.classList.add("mt-1");
            }
            list_item.setAttribute("id", "left" + j);
            list1.appendChild(list_item);
        }

        let list2 = document.createElement("ul");
        list2.setAttribute("id", "right_list");

        for (let i = 0; i < 6; i++) {
            let list_item = document.createElement("li");
            list_item.setAttribute("class", "d-flex justify-content-between align-items-center right-params");
            if (i === 0) {
                list_item.innerText = "Вес 1 шт.: ";
            }
            if (i === 1) {
                list_item.innerText = "Общий вес: ";
            }
            if (i === 2) {
                list_item.innerText = "Стоимость за шт: ";
            }
            if (i === 3) {
                list_item.innerText = "Общая стоимость: ";
            }
            if (i === 4) {
                list_item.innerText = "Стоимость остатков: ";
            }
            if (i === 5) {
                let amount = document.createElement('input');
                amount.type = "number";
                amount.min = "1";
                amount.value = "1";
                list_item.innerHTML = "Количество: ";
                list_item.appendChild(amount);
                list_item.classList.add("mt-1");
            }
            list_item.setAttribute("id", "right" + i);
            list2.appendChild(list_item);
        }

        title.innerText = user_details[i].file_name;
        clearfix_div.appendChild(title);

        column1.appendChild(list1);
        column2.appendChild(list2);
        row_div.appendChild(column1);
        row_div.appendChild(column2);
        media_body.appendChild(clearfix_div);
        media_body.appendChild(row_div);
        shadowed_container.appendChild(image);
        shadowed_container.appendChild(media_body);
        file_container.appendChild(shadowed_container);
    }
    document.getElementById("calc_this").style.visibility = "visible";
}

function buildSelector() {
    let sel = document.createElement("select");
    for (let i = 0; i < calcMaterial.ranged_array().length; i++) {
        let opt = document.createElement("option");
        opt.innerHTML = calcMaterial.material_name(i);
        sel.appendChild(opt);
    }
    return sel;
}

function refreshSelectors() {
    let res = document.getElementById("load_result");
    for (let i = 0; i < user_details.length; i++) {
        let right_elements =  res.children[i].getElementsByClassName("right-params");
        let left_elements =  res.children[i].getElementsByClassName("left-params");
        right_elements[0].innerHTML = "Вес 1 шт.: ";
        right_elements[1].innerHTML = "Общий вес: ";
        right_elements[2].innerHTML = "Стоимость за шт: ";
        right_elements[3].innerHTML = "Общая стоимость: ";
        right_elements[4].innerHTML = "Стоимость остатков: ";
        left_elements[4].innerHTML = "Общий вес остатков: ";
        left_elements[5].removeChild(left_elements[5].childNodes[0]);
        left_elements[5].innerHTML = "Материал: ";
        left_elements[5].appendChild(buildSelector());
    }
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

function loadSvg(filename, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("image/svg+xml");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(xobj.responseText);
        } else if (xobj.status !== 200) {
            console.log("Loading SVG error");
        }
    };
    xobj.send(null);
}

function calculation() {
    let res = document.getElementById("load_result");
    for (let i = 0; i < user_details.length; i++) {
        let left_elements =  res.children[i].getElementsByClassName("left-params");
        let right_elements =  res.children[i].getElementsByClassName("right-params");

        let amount_val = right_elements[right_elements.length - 1].children[0].value;
        let selected_steel = left_elements[left_elements.length - 1].children[0].selectedIndex;
        let thickness_val = calcMaterial.material_thickness(selected_steel);
        let density_val = calcMaterial.material_density(selected_steel);

        user_details[i].set_amount(amount_val);
        user_details[i].set_thickness(thickness_val);
        user_details[i].set_density(density_val);

        let total_cost = parseInt(formula(i, selected_steel));
        let single_cost = parseInt(total_cost / user_details[i].get_amount());
        let remains_cost = parseInt(calculate_remains(i, selected_steel));

        right_elements[0].innerHTML = "Вес 1 шт.: <span>" + parseFloat(user_details[i].single_weight()).toFixed(3) + " кг.</span>";
        right_elements[1].innerHTML = "Общий вес: <span>" + parseFloat(user_details[i].total_weight()).toFixed(3) + " кг.</span>";
        right_elements[2].innerHTML = "Стоимость за шт: <span class='badge badge-pill badge-primary'>" + single_cost + " сом</span>";
        right_elements[3].innerHTML = "Общая стоимость: <span class='badge badge-pill badge-primary'>" + total_cost + " сом</span>";
        right_elements[4].innerHTML = "Стоимость остатков: <span class='badge badge-pill badge-warning'>" + remains_cost + " сом</span>";
        left_elements[4].innerHTML = "Общий вес остатков: <span>" + parseFloat(user_details[i].remains_weight()).toFixed(3) + " кг.</span>"
    }
}

function getPolygonArea(points_array) {
    let arrOfX = [];
    let arrOfY = [];
    for (let j = 0; j < points_array.length; j++) {
        let temp = points_array[j].split(",");
        arrOfX.push(temp[0]);
        arrOfY.push(temp[1]);
    }
    return calcPolygonArea(arrOfX, arrOfY, points_array.length);
}

function getPolygonPerimeter(points_array) {
    let arrOfX = [];
    let arrOfY = [];
    for (let j = 0; j < points_array.length; j++) {
        let temp = points_array[j].split(",");
        arrOfX.push(temp[0]);
        arrOfY.push(temp[1]);
    }
    return calcPolygonPerimeter(arrOfX, arrOfY, points_array.length);
}

function calcPolygonArea(x_arr, y_arr, numPoints) {
    let area = 0;         // Accumulates area in the loop
    let j = numPoints - 1;  // The last vertex is the 'previous' one to the first

    for (let i = 0; i < numPoints; i++) {
        area = area + (parseFloat(x_arr[j]) + parseFloat(x_arr[i])) * (parseFloat(y_arr[j]) - parseFloat(y_arr[i]));
        j = i;  //j is previous vertex to i
    }
    return Math.round(Math.abs(area / 2));
}

function calcPolygonPerimeter(x_arr, y_arr, numPoints) {
    let perimeter = 0;
    let j = numPoints - 1;

    for (let i = 0; i < numPoints; i++) {
        if (i !== j) {
            perimeter = perimeter + ( Math.sqrt( ((parseFloat(x_arr[i]) - parseFloat(x_arr[i + 1])) * (parseFloat(x_arr[i]) - parseFloat(x_arr[i + 1]))) + ((parseFloat(y_arr[i]) - parseFloat(y_arr[i + 1])) * (parseFloat(y_arr[i]) - parseFloat(y_arr[i + 1]))) ));
        } else {
            perimeter += ( Math.sqrt( ((parseFloat(x_arr[i]) - parseFloat(x_arr[0])) * (parseFloat(x_arr[i]) - parseFloat(x_arr[0]))) + ((parseFloat(y_arr[i]) - parseFloat(y_arr[0])) * (parseFloat(y_arr[i]) - parseFloat(y_arr[0]))) ));
        }
    }
    return Math.round(perimeter);
}

function formula(index, selected_steel) {
    return user_details[index].get_amount() * (user_details[index].single_weight() * parseFloat(calcMaterial.material_cost_kg(selected_steel)) + user_details[index].get_cut_length() / parseFloat(calcMaterial.material_cut_speed(selected_steel)) * (parseFloat(calcConsts.cost_of_expandables()) + parseFloat(calcMaterial.material_gas_cost_per_hour(selected_steel))) + user_details[index].get_num_of_entries() * parseFloat(calcMaterial.material_cost_per_entry(selected_steel))) + parseFloat(calcConsts.cost_basic()) * parseFloat(calcConsts.profit()) * (user_details[index].get_cut_length() / parseFloat(calcMaterial.material_cut_speed(selected_steel)) * user_details[index].get_amount() + parseFloat(calcConsts.prepare_time())) + parseFloat(calcConsts.cost_of_programming()) + parseFloat(calcConsts.prepare_material_cost());
}

function calculate_remains(index, selected_steel) {
    return user_details[index].remains_weight() * parseFloat(calcMaterial.material_cost_kg(selected_steel));
}

class UserFile {
    constructor(name, width, height, entries, area, cut_length, image) {
        this.file_name = name;
        this.file_width = width;
        this.file_height = height;
        this.num_of_entries = entries;
        this.file_area = area;
        this.file_cut_length = cut_length;
        this.file_img = image;
    }

    set_amount(amount) {
        this.file_amount = amount;
    }
    set_thickness(thickness) {
        this.file_thickness = thickness;
    }
    set_density(density) {
        this.file_density = density;
    }

    get_area() {
        return parseFloat(this.file_area);
    }
    get_size() {
        return this.file_width + " x " + this.file_height;
    }
    get_amount() {
        return parseInt(this.file_amount);
    }
    get_num_of_entries() {
        return parseInt(this.num_of_entries);
    }
    get_cut_length() {
        return parseFloat(this.file_cut_length) / 1000;
    }

    remains_weight() {
        return ((parseFloat(this.file_width) * parseFloat(this.file_height)) / 1000000 - parseFloat(this.file_area)) * parseFloat(this.file_density) * (parseFloat(this.file_thickness) / 1000) * parseFloat(this.file_amount);
    }

    single_weight() {
        return (parseFloat(this.file_thickness) / 1000) * parseFloat(this.file_area) * parseFloat(this.file_density);
    }
    total_weight() {
        return this.single_weight() * parseFloat(this.file_amount);
    }
}

class CalcConst {
    constructor(consts_array) { this.consts = consts_array;}

    profit() { return this.consts.profit_ratio; }                           //коэф. жадности
    prepare_time() { return this.consts.machine_prepare_time; }             //время подготовки
    prepare_material_cost() { return this.consts.material_prepare_cost; }   //стоимость подготовки
    cost_of_programming() { return this.consts.programming_cost; }          //стоимость программирования
    time_of_programming() { return this.consts.programming_time; }          //время программирования
    cost_of_expandables() {
        for (let i = 0; i < this.consts.tech_process.length; i++) {
            if (this.consts.tech_process[i].process === cur_tech_process) {
                return this.consts.tech_process[i].expandable_materials_cost;
            }
        }
    }                                             //стоимость расходников
    cost_basic() {
        for (let i = 0; i < this.consts.tech_process.length; i++) {
            if (this.consts.tech_process[i].process === cur_tech_process) {
                return this.consts.tech_process[i].basic_cost;
            }
        }
    }                                                      //базовая стоимость
}

class CalcMetal {
    constructor(metal_array) {
        this.material = metal_array;
    }

    ranged_array() {
        if (cur_tech_process === "plasma") {
            return this.material.slice(0, 17);
        } else if (cur_tech_process === "laser") {
            return this.material.slice(0, 13);
        } else if (cur_tech_process === "gas") {
            return this.material.slice(16);
        }
    }

    material_id(index) { return this.ranged_array()[index].m_id; }
    material_name(index) {
        let prefix = this.material_id(index).toString().substring(0,2);
        if (prefix === steel_prefix[0]) {
            return steel_type[0] + " " + this.material_thickness(index) + " мм";
        } else if (prefix === steel_prefix[1]) {
            return steel_type[1] + " " + this.material_thickness(index) + " мм";
        }
    }
    material_density(index) {return this.ranged_array()[index].density; }       //плотность материала
    material_thickness(index) { return this.ranged_array()[index].thickness; }  //толщина материала
    material_cost_kg(index) { return this.ranged_array()[index].cost_per_kg; }  //стоимость за кг
    material_gas_cost_per_hour(index) {
        for (let i = 0; i < this.ranged_array()[index].tech_processes.length; i++) {
            if (this.ranged_array()[index].tech_processes[i].tp === cur_tech_process) {
                return this.ranged_array()[index].tech_processes[i].gas_cost_per_hour;
            }
        }
    }                                     //стоимость расхода газа за час
    material_cost_per_entry(index) {
        for (let i = 0; i < this.ranged_array()[index].tech_processes.length; i++) {
            if (this.ranged_array()[index].tech_processes[i].tp === cur_tech_process) {
                return this.ranged_array()[index].tech_processes[i].cost_per_entry;
            }
        }
    }                                        //стоимость прожига
    material_cut_speed(index) {
        for (let i = 0; i < this.ranged_array()[index].tech_processes.length; i++) {
            if (this.ranged_array()[index].tech_processes[i].tp === cur_tech_process) {
                return this.ranged_array()[index].tech_processes[i].cut_speed;
            }
        }
    }                                             //скорость реза
}



