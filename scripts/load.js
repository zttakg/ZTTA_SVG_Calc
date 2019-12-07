'use strict';

let constants = Symbol("consts");
constants = "assets/constants.json";

let materialList = Symbol("mats");
materialList = "assets/materials.json";

const steel_prefix = ["CR", "HR"];
const steel_type = ["Сталь х/к", "Сталь г/к"];

let user_details = [];
let cur_tech_process = "plasma";

let calcConsts;
let calcMaterial;

let flag = false;

function isFileAPISupported() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
    } else {
        console.log('The File APIs are not fully supported in this browser.');
        return false;
    }
}

function initialize() {
    loadJson(materialList, function (response) {
        let raw_array  = JSON.parse(response);
        calcMaterial = new CalcMetal(raw_array[Object.keys(raw_array)[0]]);
    });
    loadJson(constants, function (response) {
        let raw_array  = JSON.parse(response);
        calcConsts = new CalcConst(raw_array[Object.keys(raw_array)[0]]);
    });
    processSelector();
}

function processSelector() {
    let selected_process = document.getElementsByName("process");
    for (let i = 0; i < selected_process.length; i++) {
        if (selected_process[i].checked) {
            cur_tech_process = selected_process[i].value;
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

        for (let j = 0; j < 5; j++) {
            let list_item = document.createElement("li");
            list_item.setAttribute("class", "d-flex justify-content-between align-items-center");
            if (j === 0) {
                list_item.innerHTML = "Размер заготовки: <span><b>" + user_details[i].get_size() + " мм.</b></span>";
            }
            if (j === 1) {
                list_item.innerHTML = "Площадь:  <span><b>" + user_details[i].file_area + " кв.м.</b></span>";
            }
            if (j === 2) {
                list_item.innerHTML = "Длина реза: <span><b>" + user_details[i].file_cut_length + " м.</b></span>";
            }
            if (j === 3) {
                list_item.innerHTML = "Кол-во прожигов: <span><b>" + user_details[i].num_of_entries + "</b></span>";
            }
            if (j === 4) {
                list_item.innerHTML = "Материал: ";
                list_item.appendChild(buildSelector());
            }
            list1.appendChild(list_item);
        }

        let list2 = document.createElement("ul");

        for (let i = 0; i < 5; i++) {
            let list_item = document.createElement("li");
            list_item.setAttribute("class", "d-flex justify-content-between align-items-center");
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
                let amount = document.createElement('input');
                amount.type = "number";
                amount.min = "1";
                amount.value = "1";
                list_item.innerHTML = "Количество: ";
                list_item.appendChild(amount);
            }
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
    for (let i = 0; i < res.childElementCount; i++) {
        if (res.children[i].classList.contains("item-container")) {
            let fileName = res.children[i].getElementsByClassName("item-name")[0].innerText;
            let selected_steel = res.children[i].getElementsByTagName("select")[0].selectedIndex;
            let steel_thickness = calcMaterial.material_thickness(selected_steel);
            let steel_density = calcMaterial.material_density(selected_steel);
            let amount = res.children[i].getElementsByTagName("input")[0].value;
            for (let f = 0; f < user_details.length; f++) {
                if (user_details[f].file_name === fileName) {
                    user_details[f].set_amount(amount);
                    user_details[f].set_density(steel_density);
                    user_details[f].set_thickness(steel_thickness);
                }
            }
            //console.log("Цена за прожиг: " + calcMaterial.material_cost_per_entry(selected_steel));
            console.log(formula(i, selected_steel));
        }
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

    remains_area() {
        return (parseFloat(this.file_width) * parseFloat(this.file_height)) / 1000000 - parseFloat(this.file_area);
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
























