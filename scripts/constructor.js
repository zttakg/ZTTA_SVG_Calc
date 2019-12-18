'use strict';

const svg_zoom = "100%";
const xmnls = "http://www.w3.org/2000/svg";

//#region Parameters of the figures

let rect1;
const default_rect = [300, 300, 150, 30, 30, 30, 10];
const form_rect_ids = ["figure_width", "figure_height", "is_central_hole", "is_side_holes", "is_rounded_corners", "radius_corner", "diameter_central", "diameter_side", "side_dx", "side_dy"];
const form_rect_labels = ["Ширина:", "Выстота:", "Отверстие в центре", "Отверстия по краям", "Скруглённые углы", "Радиус скругления углов:", "Диаметр центрального отверстия:", "Диаметр угловых отверстий", "Расстояние от края до центра углового отверстия по X:", "Расстояние от края до центра углового отверстия по Y:"];
const rect_container_ids = ["rect_w", "rect_h", "rect_checkboxes", "rect_rounded_corners", "rect_central_hole", "rect_side_holes_d", "rect_side_holes_dx", "rect_side_holes_dy"];

let circle1;
const default_circle = [300, 150, 30, 35, 6];
const form_circ_ids = ["figure_diameter", "is_central_hole", "is_side_holes", "diameter_central", "diameter_side", "side_dx", "side_amount"];
const form_circ_labels = ["Диаметр:", "Отверстие в центре", "Отверстия по кругу", "Диаметр центрального отверстия:", "Диаметр боковых отверстий:", "Расстояние от края до центра бокового отверстия:", "Кол-во боковых отверстий:"];
const circ_container_ids = ["circ_diam", "circ_checkboxes", "circ_central_hole", "circ_side_holes_d", "circ_side_holes_dx", "circ_side_holes_amount"];

let triangle1;
const default_triangle = [300, 300, 50, 60];
const form_tr_ids = ["figure_width", "figure_height", "is_truncated", "upper_corner", "lower_corner"];
const form_tr_labels = ["Ширина:", "Выстота:", "Срезанные углы", "Длина верхнего среза:", "Длина нижнего среза:"];
const tr_container_ids = ["tr_w", "tr_h", "tr_checkboxes", "tr_upper_truncate", "tr_lower_truncate"];

//#endregion

let figure_type = 0;
let builded_objects = [];
const tech_processes_list = ["plasma", "laser", "gas"];

function figureTypeChange() {
    document.getElementById("main_container").innerHTML = "";
    document.getElementById("params_container").innerHTML = "";

    let type_selector = document.getElementById("figure_type_selector");
    if (type_selector.selectedIndex === 0) {
        showDefaultRectangle();
    }
    if (type_selector.selectedIndex === 1) {
        showDefaultCircle();
    }
    if (type_selector.selectedIndex === 2) {
        showDefaultTriangle();
    }
    figure_type = type_selector.selectedIndex;
    refresh_selectors();
}

function showDefaultCircle() {
    let container = document.getElementById("main_container");
    circle1 = new Circle(default_circle[0]);
    circle1.build_dimensions();
    circle1.build_central_hole_fields();
    circle1.build_side_holes_fields();
    circle1.has_central_hole();
    circle1.has_side_holes();
    circle1.set_central_hole(default_circle[1]);
    circle1.set_side_holes(default_circle[2], default_circle[3], default_circle[4]);

    document.getElementById(form_circ_ids[0]).value = circle1.get_box_width();
    document.getElementById(form_circ_ids[1]).checked = true;
    document.getElementById(form_circ_ids[2]).checked = true;
    document.getElementById(form_circ_ids[3]).value = circle1.d1;
    document.getElementById(form_circ_ids[4]).value = circle1.d2;
    document.getElementById(form_circ_ids[5]).value = circle1.d2_dx;
    document.getElementById(form_circ_ids[6]).value = circle1.d2_num;

    let svg1 = circle1.build_circle_svg();
    container.appendChild(svg1);

    document.getElementById(form_circ_ids[1]).onchange = function () {circle1.central_hole_listener()};
    document.getElementById(form_circ_ids[2]).onchange = function () {circle1.side_holes_listener()};
    //document.getElementById(form_rect_ids[4]).onchange = function () {rect1.rounded_corners_listener()};
}

function showDefaultRectangle() {
    let container = document.getElementById("main_container");
    rect1 = new Rectangle(default_rect[0], default_rect[1]);
    rect1.build_dimensions();
    rect1.build_rounded_corners_fields();
    rect1.build_central_hole_fields();
    rect1.build_side_holes_fields();
    rect1.has_central_hole();
    rect1.has_side_holes();
    rect1.has_rounded_corners();
    rect1.set_central_hole(default_rect[2]);
    rect1.set_side_holes(default_rect[3], default_rect[4], default_rect[5]);
    rect1.set_rounded_corners(default_rect[6]);

    document.getElementById(form_rect_ids[0]).value = rect1.get_box_width();
    document.getElementById(form_rect_ids[1]).value = rect1.get_box_height();

    document.getElementById(form_rect_ids[2]).checked = true;
    document.getElementById(form_rect_ids[3]).checked = true;
    document.getElementById(form_rect_ids[4]).checked = true;
    document.getElementById(form_rect_ids[5]).value = rect1.corner_rad;
    document.getElementById(form_rect_ids[6]).value = rect1.d1;
    document.getElementById(form_rect_ids[7]).value = rect1.d2;
    document.getElementById(form_rect_ids[8]).value = rect1.d2_dx;
    document.getElementById(form_rect_ids[9]).value = rect1.d2_dy;

    let svg1 = rect1.build_rectangle_svg();
    container.appendChild(svg1);

    document.getElementById(form_rect_ids[2]).onchange = function () {rect1.central_hole_listener()};
    document.getElementById(form_rect_ids[3]).onchange = function () {rect1.side_holes_listener()};
    document.getElementById(form_rect_ids[4]).onchange = function () {rect1.rounded_corners_listener()};
}

function showDefaultTriangle() {
    let container = document.getElementById("main_container");
    triangle1 = new Triangle(default_triangle[0], default_triangle[1]);
    triangle1.build_dimensions();
    triangle1.build_truncate_fields();
    triangle1.has_truncated_corners();
    triangle1.set_upper_truncate(default_triangle[2]);
    triangle1.set_lower_truncate(default_triangle[3]);

    document.getElementById(form_tr_ids[0]).value = triangle1.box_width;
    document.getElementById(form_tr_ids[1]).value = triangle1.box_width;

    document.getElementById(form_tr_ids[2]).checked = true;
    document.getElementById(form_tr_ids[3]).value = triangle1.upper_truncate;
    document.getElementById(form_tr_ids[4]).value = triangle1.lower_truncate;

    let svg1 = triangle1.build_triangle_svg();
    container.appendChild(svg1);

    document.getElementById(form_tr_ids[2]).onchange = function () {triangle1.truncate_corners_listener()};
}

class Rectangle {
    constructor(width, height) {
        this.box_width = width;
        this.box_height = height;
        this.is_central_hole = false;
        this.is_side_holes = false;
        this.is_rounded_corners = false;
    }

    get_box_width() {
        return this.box_width;
    }

    get_box_height() {
        return this.box_height;
    }

    has_central_hole() {
        this.is_central_hole = true;
    }

    has_side_holes() {
        this.is_side_holes = true;
    }

    has_rounded_corners() {
        this.is_rounded_corners = true;
    }

    set_rounded_corners(radius) {
        this.corner_rad = radius;
    }

    set_central_hole(diameter) {
        this.d1 = diameter;
    }

    set_side_holes(diameter, delta_x, delta_y) {
        this.d2 = diameter;
        this.d2_dx = delta_x;
        this.d2_dy = delta_y;
    }

    build_rectangle_svg() {
        let svg_elem = document.createElementNS(xmnls, "svg");
        svg_elem.setAttributeNS(null, "id", "svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + this.box_width + " " + this.box_height);
        svg_elem.setAttributeNS(null, "width", svg_zoom);
        svg_elem.setAttributeNS(null, "height", svg_zoom);
        svg_elem.style.display = "block";

        let contour = document.createElementNS(xmnls, "g");
        contour.setAttributeNS(null, "id", "body");

        let holes = document.createElementNS(xmnls, "g");
        holes.setAttributeNS(null, "id", "holes");

        let corner_rad = 0;
        if (this.is_rounded_corners === true) {
            corner_rad = this.corner_rad;
        }

        let rect = document.createElementNS(xmnls, "rect");
        rect.setAttributeNS(null, "x", "0");
        rect.setAttributeNS(null, "y", "0");
        rect.setAttributeNS(null, "rx", corner_rad.toString());
        rect.setAttributeNS(null, "ry", corner_rad.toString());
        rect.setAttributeNS(null, "width", this.box_width);
        rect.setAttributeNS(null, "height", this.box_height);
        rect.setAttributeNS(null, "fill", "#999");
        rect.setAttributeNS(null, "id", "fig_contour");

        contour.appendChild(rect);

        if (this.is_central_hole === true) {
            let circ1 = document.createElementNS(xmnls, "circle");
            circ1.setAttributeNS(null, "cx",(this.box_width / 2).toString());
            circ1.setAttributeNS(null, "cy",(this.box_height / 2).toString());
            circ1.setAttributeNS(null, "r", (this.d1 / 2).toString());
            circ1.setAttributeNS(null, "fill", "#fff");
            circ1.setAttributeNS(null, "id", "ch");
            holes.appendChild(circ1);
        }

        if (this.is_side_holes === true) {
            let dx = parseFloat(this.d2_dx);
            let dy = parseFloat(this.d2_dy);
            let radius = parseFloat(this.d2) / 2;
            for (let i = 0; i < 4; i++) {
                if (i === 1) {
                    dx = this.box_width - dx;
                }
                if (i === 2) {
                    dy = this.box_width - dy;
                }
                if (i === 3) {
                    dx = this.box_height - dx;
                }
                let circ2 = document.createElementNS(xmnls, "circle");
                circ2.setAttributeNS(null, "cx", dx.toString());
                circ2.setAttributeNS(null, "cy", dy.toString());
                circ2.setAttributeNS(null, "r", radius.toString());
                circ2.setAttributeNS(null, "fill", "#fff");
                circ2.setAttributeNS(null, "id", "sh" + i);
                holes.appendChild(circ2);
            }
        }

        svg_elem.appendChild(contour);
        svg_elem.appendChild(holes);



        return svg_elem;
    }

    build_dimensions() {
        let container = document.getElementById("params_container");

        let width_field = this.form_group_builder(rect_container_ids[0], form_rect_ids[0], form_rect_labels[0], "number", ["form-group", "row"], ["form-control", "col-8", "mr-3"], ["col", "col-form-label"]);
        let height_field = this.form_group_builder(rect_container_ids[1], form_rect_ids[1], form_rect_labels[1], "number", ["form-group", "row"], ["form-control", "col-8", "mr-3"], ["col", "col-form-label"]);
        let options_field = this.checkbox_builder();

        width_field.onchange = rect1.width_change;
        height_field.onchange = rect1.height_change;

        container.appendChild(width_field);
        container.appendChild(height_field);
        container.appendChild(options_field);
    }

    build_central_hole_fields() {
        let container = document.getElementById("params_container");
        let diam_field  = this.form_group_builder(rect_container_ids[4], form_rect_ids[6], form_rect_labels[6], "number", ["form-group"], ["form-control"], null);
        diam_field.onchange = this.central_hole_change;
        container.appendChild(diam_field);
    }

    build_rounded_corners_fields() {
        let container = document.getElementById("params_container");
        let radius_field  = this.form_group_builder(rect_container_ids[3], form_rect_ids[5], form_rect_labels[5], "number", ["form-group"], ["form-control"], null);
        radius_field.onchange = this.radius_corner_change;
        container.appendChild(radius_field);
    }

    build_side_holes_fields() {
        let container = document.getElementById("params_container");
        let diameter_field  = this.form_group_builder(rect_container_ids[5], form_rect_ids[7], form_rect_labels[7], "number", ["form-group"], ["form-control"], null);
        let dx_field  = this.form_group_builder(rect_container_ids[6], form_rect_ids[8], form_rect_labels[8], "number", ["form-group"], ["form-control"], null);
        let dy_field  = this.form_group_builder(rect_container_ids[7], form_rect_ids[9], form_rect_labels[9], "number", ["form-group"], ["form-control"], null);
        diameter_field.onchange = this.side_holes_diam_change;
        dx_field.onchange = this.side_holes_dx_change;
        dy_field.onchange = this.side_holes_dy_change;
        container.appendChild(diameter_field);
        container.appendChild(dx_field);
        container.appendChild(dy_field);
    }

    checkbox_builder() {
        let form_item = document.createElement("form");
        form_item.setAttribute("id", rect_container_ids[2]);
        form_item.classList.add("form-inline");
        form_item.classList.add("mb-3");

        for (let i = 0; i < 3; i++) {
            let container = document.createElement("div");
            container.classList.add("custom-control");
            container.classList.add("custom-checkbox");
            container.classList.add("mr-2");

            let input_item = document.createElement("input");
            input_item.classList.add("custom-control-input");
            input_item.setAttribute("type", "checkbox");
            input_item.setAttribute("id", form_rect_ids[i + 2]);
            input_item.setAttribute("name", "checkbox" + i);

            let label_item = document.createElement("label");
            label_item.classList.add("custom-control-label");
            label_item.setAttribute("for", form_rect_ids[i + 2]);
            label_item.innerText = form_rect_labels[i + 2];

            container.appendChild(input_item);
            container.appendChild(label_item);
            form_item.appendChild(container);
        }

        return form_item;
    }

    form_group_builder(container_id, item_id, label_text, input_type, class_arr_div, class_arr_input, class_arr_label) {
        let container = document.createElement("div");
        container.setAttribute("id", container_id);
        for (let i = 0; i < class_arr_div.length; i++) {
            container.classList.add(class_arr_div[i]);
        }

        let label = document.createElement("label");
        label.setAttribute("for", item_id);
        label.innerText = label_text;
        if (Array.isArray(class_arr_label) && class_arr_label.length) {
            for (let i = 0; i < class_arr_label.length; i++) {
                label.classList.add(class_arr_label[i]);
            }
        }

        let input_item = document.createElement("input");
        for (let i = 0; i < class_arr_input.length; i++) {
            input_item.classList.add(class_arr_input[i]);
        }
        input_item.setAttribute("id", item_id);
        input_item.setAttribute("type", input_type);
        input_item.setAttribute("min", "2");
        container.appendChild(label);
        container.appendChild(input_item);
        return container;
    }

    central_hole_listener() {
        let checkbox = document.getElementById(form_rect_ids[2]);
        let container = document.getElementById(rect_container_ids[4]);
        let holes = document.getElementById("holes");

        if (checkbox.checked === true) {
            rect1.is_central_hole = true;
            container.style.display = "block";

            if (!document.getElementById("ch")) {
                let circ1 = document.createElementNS(xmnls, "circle");
                circ1.setAttributeNS(null, "cx",(rect1.box_width / 2).toString());
                circ1.setAttributeNS(null, "cy",(rect1.box_height / 2).toString());
                circ1.setAttributeNS(null, "r", (rect1.d1 / 2).toString());
                circ1.setAttributeNS(null, "fill", "#fff");
                circ1.setAttributeNS(null, "id", "ch");
                holes.appendChild(circ1);
            }

        } else {
            rect1.is_central_hole = false;
            container.style.display = "none";
            document.getElementById("ch").remove();
        }
    }

    side_holes_listener() {
        let checkbox = document.getElementById(form_rect_ids[3]);
        let container1 = document.getElementById(rect_container_ids[5]);
        let container2 = document.getElementById(rect_container_ids[6]);
        let container3 = document.getElementById(rect_container_ids[7]);
        let holes = document.getElementById("holes");

        if (checkbox.checked === true) {
            rect1.is_side_holes = true;
            container1.style.display = "block";
            container2.style.display = "block";
            container3.style.display = "block";

            let dx = rect1.d2_dx;
            let dy = rect1.d2_dy;
            for (let i = 0; i < 4; i++) {
                if (!document.getElementById("sh" + i)) {
                    if (i === 1) {
                        dx = rect1.box_width - dx;
                    }
                    if (i === 2) {
                        dy = rect1.box_width - dy;
                    }
                    if (i === 3) {
                        dx = rect1.box_height - dx;
                    }
                    let circ = document.createElementNS(xmnls, "circle");
                    circ.setAttributeNS(null, "cx", dx.toString());
                    circ.setAttributeNS(null, "cy", dy.toString());
                    circ.setAttributeNS(null, "r", (rect1.d2 / 2).toString());
                    circ.setAttributeNS(null, "fill", "#fff");
                    circ.setAttributeNS(null, "id", "sh" + i);
                    holes.appendChild(circ);
                }
            }

        } else {
            rect1.is_side_holes = false;
            container1.style.display = "none";
            container2.style.display = "none";
            container3.style.display = "none";

            for (let i = 0; i < 4; i++) {
                document.getElementById("sh" + i).remove();
            }
        }
    }

    rounded_corners_listener() {
        let checkbox = document.getElementById(form_rect_ids[4]);
        let container = document.getElementById(rect_container_ids[3]);
        let svg_contour = document.getElementById("body").children[0];

        if (checkbox.checked === true) {
            rect1.is_rounded_corners = true;
            container.style.display = "block";
            svg_contour.setAttribute("rx", document.getElementById(form_rect_ids[5]).value);
            svg_contour.setAttribute("ry", document.getElementById(form_rect_ids[5]).value);
        } else {
            rect1.is_rounded_corners = false;
            container.style.display = "none";
            svg_contour.setAttribute("rx", "0");
            svg_contour.setAttribute("ry", "0");
        }
    }

    central_hole_change() {
        rect1.d1 = document.getElementById(form_rect_ids[6]).value;
        document.getElementById("ch").setAttribute("r", (rect1.d1 / 2).toString());
    }

    side_holes_diam_change() {
        rect1.d2 = document.getElementById(form_rect_ids[7]).value;
        for (let i = 0; i < 4; i++) {
            document.getElementById("sh" + i).setAttribute("r", (rect1.d2 / 2).toString());
        }
    }

    side_holes_dx_change() {
        rect1.d2_dx = document.getElementById(form_rect_ids[8]).value;
        document.getElementById("sh0").setAttribute("cx", (rect1.d2_dx).toString());
        document.getElementById("sh3").setAttribute("cx", (rect1.d2_dx).toString());
        document.getElementById("sh1").setAttribute("cx", (parseFloat(rect1.box_width) - parseFloat(rect1.d2_dx)).toString());
        document.getElementById("sh2").setAttribute("cx", (parseFloat(rect1.box_width) - parseFloat(rect1.d2_dx)).toString());
    }

    side_holes_dy_change() {
        rect1.d2_dy = document.getElementById(form_rect_ids[9]).value;
        document.getElementById("sh0").setAttribute("cy", (rect1.d2_dy).toString());
        document.getElementById("sh1").setAttribute("cy", (rect1.d2_dy).toString());
        document.getElementById("sh2").setAttribute("cy", (parseFloat(rect1.box_height) - parseFloat(rect1.d2_dy)).toString());
        document.getElementById("sh3").setAttribute("cy", (parseFloat(rect1.box_height) - parseFloat(rect1.d2_dy)).toString());
    }

    radius_corner_change() {
        rect1.corner_rad = document.getElementById(form_rect_ids[5]).value;
        let svg_contour = document.getElementById("body").children[0];
        svg_contour.setAttribute("rx", rect1.corner_rad.toString());
        svg_contour.setAttribute("ry", rect1.corner_rad.toString());
    }

    width_change() {
        rect1.box_width = document.getElementById(form_rect_ids[0]).value;
        rect1.rebuild_svg();
    }

    height_change() {
        rect1.box_height = document.getElementById(form_rect_ids[1]).value;
        rect1.rebuild_svg();
    }

    rebuild_svg() {
        let svg_elem = document.getElementById("svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + rect1.box_width + " " + rect1.box_height);

        let contour = document.getElementById("fig_contour");
        contour.setAttributeNS(null, "width", rect1.box_width);
        contour.setAttributeNS(null, "height", rect1.box_height);
        if (rect1.is_rounded_corners === true) {
            contour.setAttributeNS(null, "rx", rect1.corner_rad.toString());
            contour.setAttributeNS(null, "ry", rect1.corner_rad.toString());
        }

        if (rect1.is_central_hole === true) {
            let central_hole = document.getElementById("ch");
            central_hole.setAttributeNS(null, "cx",(rect1.box_width / 2).toString());
            central_hole.setAttributeNS(null, "cy",(rect1.box_height / 2).toString());
            central_hole.setAttributeNS(null, "r", (rect1.d1 / 2).toString());
        }

        if (rect1.is_side_holes === true) {
            document.getElementById("sh0").setAttribute("cx", (rect1.d2_dx).toString());
            document.getElementById("sh3").setAttribute("cx", (rect1.d2_dx).toString());
            document.getElementById("sh1").setAttribute("cx", (parseFloat(rect1.box_width) - parseFloat(rect1.d2_dx)).toString());
            document.getElementById("sh2").setAttribute("cx", (parseFloat(rect1.box_width) - parseFloat(rect1.d2_dx)).toString());

            document.getElementById("sh0").setAttribute("cy", (rect1.d2_dy).toString());
            document.getElementById("sh1").setAttribute("cy", (rect1.d2_dy).toString());
            document.getElementById("sh2").setAttribute("cy", (parseFloat(rect1.box_height) - parseFloat(rect1.d2_dy)).toString());
            document.getElementById("sh3").setAttribute("cy", (parseFloat(rect1.box_height) - parseFloat(rect1.d2_dy)).toString());
        }
    }

    collect_fig_info() {
        let name = "rect_" + Date.now();
        let width = parseFloat(rect1.box_width);
        let height = parseFloat(rect1.box_height);
        let radius = parseFloat(rect1.corner_rad);
        let num_of_entries = 1;
        let perimeter = 0;
        let area = 0;
        let img = this.prepare_svg();

        if (rect1.is_rounded_corners === true) {
            if (radius >= (width / 2) || radius >= (height / 2)) {
                let max = Math.max(width, height);
                let min = Math.min(width, height);
                if (radius >= (max / 2)) {
                    perimeter = (width / 2 + height / 2) * Math.PI;
                    area = (width / 2) * (height / 2) * Math.PI;
                } else {
                    perimeter = (radius + min / 2) * Math.PI + 2 * (max - 2 * radius);
                    area = radius  * (min / 2) * Math.PI + min * (max - 2 * radius);
                }
            } else {
                perimeter = 2 * (width + height - 4 * radius + radius * Math.PI);
                area = width * height - 4 * radius * radius * (1 - Math.PI / 4);
            }
        } else {
            perimeter = (width + height) * 2;
            area = width * height;
        }
        if (rect1.is_central_hole === true) {
            perimeter += rect1.d1 * Math.PI;
            area -= (rect1.d1 / 2) * (rect1.d1 / 2) * Math.PI;
            num_of_entries += 1;
        }
        if (rect1.is_side_holes === true) {
            perimeter += rect1.d2 * Math.PI * 4;
            area -= (rect1.d2 / 2) * (rect1.d2 / 2) * Math.PI * 4;
            num_of_entries += 4;
        }

        return [name, width, height, num_of_entries, (perimeter / 1000).toFixed(2), (area / 1000000).toFixed(3), img];
    }

    prepare_svg() {
        let image = document.getElementById("svf_figure").cloneNode(true);
        image.removeAttribute("id");
        for (let i = 0; i < image.childElementCount; i++) {
            for (let j = 0; j < image.children[i].childElementCount; j++) {
                image.children[i].children[j].removeAttribute("id");
            }
        }
        image.setAttribute("xmlns", xmnls);
        image.setAttribute("version", "1.1");
        return image;
    }
}

class Circle {
    constructor(diameter) {
        this.fig_diameter = diameter;
        this.is_central_hole = false;
        this.is_side_holes = false;
    }

    get_box_width() {
        return this.fig_diameter;
    }

    get_box_height() {
        return this.fig_diameter;
    }

    has_central_hole() {
        this.is_central_hole = true;
    }

    has_side_holes() {
        this.is_side_holes = true;
    }

    set_central_hole(diameter) {
        this.d1 = diameter;
    }

    set_side_holes(diameter, delta_x, amount) {
        this.d2 = diameter;
        this.d2_dx = delta_x;
        this.d2_dy = this.fig_diameter / 2;
        this.d2_num = amount;
    }

    build_circle_svg() {
        let svg_elem = document.createElementNS(xmnls, "svg");
        svg_elem.setAttributeNS(null, "id", "svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + this.get_box_width() + " " + this.get_box_height());
        svg_elem.setAttributeNS(null, "width", svg_zoom);
        svg_elem.setAttributeNS(null, "height", svg_zoom);
        svg_elem.style.display = "block";

        let contour = document.createElementNS(xmnls, "g");
        contour.setAttributeNS(null, "id", "body");

        let holes = document.createElementNS(xmnls, "g");
        holes.setAttributeNS(null, "id", "holes");

        let circ = document.createElementNS(xmnls, "circle");
        circ.setAttributeNS(null, "cx",(this.get_box_width() / 2).toString());
        circ.setAttributeNS(null, "cy",(this.get_box_height() / 2).toString());
        circ.setAttributeNS(null, "r", (this.fig_diameter / 2).toString());
        circ.setAttributeNS(null, "fill", "#999");
        circ.setAttributeNS(null, "id", "fig_contour");
        contour.appendChild(circ);

        if (this.is_central_hole === true) {
            let circ1 = document.createElementNS(xmnls, "circle");
            circ1.setAttributeNS(null, "cx",(this.get_box_width() / 2).toString());
            circ1.setAttributeNS(null, "cy",(this.get_box_height() / 2).toString());
            circ1.setAttributeNS(null, "r", (this.d1 / 2).toString());
            circ1.setAttributeNS(null, "fill", "#fff");
            circ1.setAttributeNS(null, "id", "ch");
            holes.appendChild(circ1);
        }

        if (this.is_side_holes === true) {
            let x0 = this.get_box_width() / 2;
            let y0 = this.get_box_height() / 2;
            let angle = 360 / parseInt(this.d2_num);
            let x = this.d2_dx;
            let y = this.d2_dy;

            for (let i = 0; i < parseInt(this.d2_num); i++) {
                let circ2 = document.createElementNS(xmnls, "circle");
                circ2.setAttributeNS(null, "cx", x.toString());
                circ2.setAttributeNS(null, "cy", y.toString());
                circ2.setAttributeNS(null, "r", (this.d2 / 2).toString());
                circ2.setAttributeNS(null, "fill", "#fff");
                circ2.setAttributeNS(null, "id", "sh" + i);
                holes.appendChild(circ2);

                let temp = x;
                x = x0 + (x - x0) * Math.cos(angle * (Math.PI / 180)) - (y - y0) * Math.sin(angle * (Math.PI / 180));
                y = y0 + (y - y0) * Math.cos(angle * (Math.PI / 180)) + (temp - x0) * Math.sin(angle * (Math.PI / 180));
            }
        }

        svg_elem.appendChild(contour);
        svg_elem.appendChild(holes);


        return svg_elem;
    }

    build_dimensions() {
        let container = document.getElementById("params_container");

        let diam_field = this.form_group_builder(circ_container_ids[0], form_circ_ids[0], form_circ_labels[0], "number", ["form-group", "row"], ["form-control", "col-8", "mr-3"], ["col", "col-form-label"]);
        let options_field = this.checkbox_builder();

        diam_field.onchange = circle1.width_change;

        container.appendChild(diam_field);
        container.appendChild(options_field);
    }

    build_central_hole_fields() {
        let container = document.getElementById("params_container");
        let diam_field  = this.form_group_builder(circ_container_ids[2], form_circ_ids[3], form_circ_labels[3], "number", ["form-group"], ["form-control"], null);
        diam_field.onchange = this.central_hole_change;
        container.appendChild(diam_field);
    }

    build_side_holes_fields() {
        let container = document.getElementById("params_container");
        let diameter_field  = this.form_group_builder(circ_container_ids[3], form_circ_ids[4], form_circ_labels[4], "number", ["form-group"], ["form-control"], null);
        let dx_field  = this.form_group_builder(circ_container_ids[4], form_circ_ids[5], form_circ_labels[5], "number", ["form-group"], ["form-control"], null);
        let amount_field  = this.form_group_builder(circ_container_ids[5], form_circ_ids[6], form_circ_labels[6], "number", ["form-group"], ["form-control"], null);

        diameter_field.onchange = this.side_holes_diam_change;
        dx_field.onchange = this.side_holes_dx_change;
        amount_field.onchange = this.side_holes_amount_change;

        container.appendChild(diameter_field);
        container.appendChild(dx_field);
        container.appendChild(amount_field);
    }

    form_group_builder(container_id, item_id, label_text, input_type, class_arr_div, class_arr_input, class_arr_label) {
        let container = document.createElement("div");
        container.setAttribute("id", container_id);
        for (let i = 0; i < class_arr_div.length; i++) {
            container.classList.add(class_arr_div[i]);
        }

        let label = document.createElement("label");
        label.setAttribute("for", item_id);
        label.innerText = label_text;
        if (Array.isArray(class_arr_label) && class_arr_label.length) {
            for (let i = 0; i < class_arr_label.length; i++) {
                label.classList.add(class_arr_label[i]);
            }
        }

        let input_item = document.createElement("input");
        for (let i = 0; i < class_arr_input.length; i++) {
            input_item.classList.add(class_arr_input[i]);
        }
        input_item.setAttribute("id", item_id);
        input_item.setAttribute("type", input_type);
        input_item.setAttribute("min", "2");
        container.appendChild(label);
        container.appendChild(input_item);
        return container;
    }

    checkbox_builder() {
        let form_item = document.createElement("form");
        form_item.setAttribute("id", circ_container_ids[1]);
        form_item.classList.add("form-inline");
        form_item.classList.add("mb-3");

        for (let i = 0; i < 2; i++) {
            let container = document.createElement("div");
            container.classList.add("custom-control");
            container.classList.add("custom-checkbox");
            container.classList.add("mr-2");

            let input_item = document.createElement("input");
            input_item.classList.add("custom-control-input");
            input_item.setAttribute("type", "checkbox");
            input_item.setAttribute("id", form_circ_ids[i + 1]);
            input_item.setAttribute("name", "checkbox" + i);

            let label_item = document.createElement("label");
            label_item.classList.add("custom-control-label");
            label_item.setAttribute("for", form_circ_ids[i + 1]);
            label_item.innerText = form_circ_labels[i + 1];

            container.appendChild(input_item);
            container.appendChild(label_item);
            form_item.appendChild(container);
        }

        return form_item;
    }

    central_hole_listener() {
        let checkbox = document.getElementById(form_circ_ids[1]);
        let container = document.getElementById(circ_container_ids[2]);
        let holes = document.getElementById("holes");

        if (checkbox.checked === true) {
            circle1.is_central_hole = true;
            container.style.display = "block";

            if (!document.getElementById("ch")) {
                let circ1 = document.createElementNS(xmnls, "circle");
                circ1.setAttributeNS(null, "cx",(circle1.fig_diameter / 2).toString());
                circ1.setAttributeNS(null, "cy",(circle1.fig_diameter / 2).toString());
                circ1.setAttributeNS(null, "r", (circle1.d1 / 2).toString());
                circ1.setAttributeNS(null, "fill", "#fff");
                circ1.setAttributeNS(null, "id", "ch");
                holes.appendChild(circ1);
            }

        } else {
            circle1.is_central_hole = false;
            container.style.display = "none";
            document.getElementById("ch").remove();
        }
    }

    side_holes_listener() {
        let checkbox = document.getElementById(form_circ_ids[2]);
        let container1 = document.getElementById(circ_container_ids[3]);
        let container2 = document.getElementById(circ_container_ids[4]);
        let container3 = document.getElementById(circ_container_ids[5]);
        let holes = document.getElementById("holes");

        if (checkbox.checked === true) {
            circle1.is_side_holes = true;
            container1.style.display = "block";
            container2.style.display = "block";
            container3.style.display = "block";

            let x0 = circle1.fig_diameter / 2;
            let y0 = circle1.fig_diameter / 2;
            let angle = 360 / parseInt(circle1.d2_num);
            let x = circle1.d2_dx;
            let y = circle1.fig_diameter / 2;

            for (let i = 0; i < parseInt(circle1.d2_num); i++) {
                let circ2 = document.createElementNS(xmnls, "circle");
                circ2.setAttributeNS(null, "cx", x.toString());
                circ2.setAttributeNS(null, "cy", y.toString());
                circ2.setAttributeNS(null, "r", (circle1.d2 / 2).toString());
                circ2.setAttributeNS(null, "fill", "#fff");
                circ2.setAttributeNS(null, "id", "sh" + i);
                holes.appendChild(circ2);

                let temp = x;
                x = x0 + (x - x0) * Math.cos(angle * (Math.PI / 180)) - (y - y0) * Math.sin(angle * (Math.PI / 180));
                y = y0 + (y - y0) * Math.cos(angle * (Math.PI / 180)) + (temp - x0) * Math.sin(angle * (Math.PI / 180));
            }

        } else {
            circle1.is_side_holes = false;
            container1.style.display = "none";
            container2.style.display = "none";
            container3.style.display = "none";

            for (let i = 0; i < circle1.d2_num; i++) {
                document.getElementById("sh" + i).remove();
            }
        }
    }

    central_hole_change() {
        circle1.d1 = document.getElementById(form_circ_ids[3]).value;
        document.getElementById("ch").setAttribute("r", (circle1.d1 / 2).toString());
    }

    side_holes_diam_change() {
        circle1.d2 = document.getElementById(form_circ_ids[4]).value;
        for (let i = 0; i < circle1.d2_num; i++) {
            document.getElementById("sh" + i).setAttribute("r", (circle1.d2 / 2).toString());
        }
    }

    side_holes_dx_change() {
        circle1.d2_dx = document.getElementById(form_circ_ids[5]).value;

        let x0 = circle1.fig_diameter / 2;
        let y0 = circle1.fig_diameter / 2;
        let angle = 360 / parseInt(circle1.d2_num);
        let x = circle1.d2_dx;
        let y = circle1.fig_diameter / 2;

        for (let i = 0; i < parseInt(circle1.d2_num); i++) {
            let circ2 = document.getElementById("sh" + i);
            circ2.setAttributeNS(null, "cx", x.toString());
            circ2.setAttributeNS(null, "cy", y.toString());

            let temp = x;
            x = x0 + (x - x0) * Math.cos(angle * (Math.PI / 180)) - (y - y0) * Math.sin(angle * (Math.PI / 180));
            y = y0 + (y - y0) * Math.cos(angle * (Math.PI / 180)) + (temp - x0) * Math.sin(angle * (Math.PI / 180));
        }
    }

    side_holes_amount_change() {
        let old_value = circle1.d2_num;
        circle1.d2_num = document.getElementById(form_circ_ids[6]).value;

        let holes = document.getElementById("holes");

        for (let i = 0; i < old_value; i++) {
            document.getElementById("sh" + i).remove();
        }

        let x0 = circle1.fig_diameter / 2;
        let y0 = circle1.fig_diameter / 2;
        let angle = 360 / parseInt(circle1.d2_num);
        let x = circle1.d2_dx;
        let y = circle1.fig_diameter / 2;

        for (let i = 0; i < parseInt(circle1.d2_num); i++) {
            let circ2 = document.createElementNS(xmnls, "circle");
            circ2.setAttributeNS(null, "cx", x.toString());
            circ2.setAttributeNS(null, "cy", y.toString());
            circ2.setAttributeNS(null, "r", (circle1.d2 / 2).toString());
            circ2.setAttributeNS(null, "fill", "#fff");
            circ2.setAttributeNS(null, "id", "sh" + i);
            holes.appendChild(circ2);

            let temp = x;
            x = x0 + (x - x0) * Math.cos(angle * (Math.PI / 180)) - (y - y0) * Math.sin(angle * (Math.PI / 180));
            y = y0 + (y - y0) * Math.cos(angle * (Math.PI / 180)) + (temp - x0) * Math.sin(angle * (Math.PI / 180));
        }
    }

    width_change() {
        circle1.fig_diameter = document.getElementById(form_circ_ids[0]).value;
        circle1.rebuild_svg();
    }

    rebuild_svg() {
        let svg_elem = document.getElementById("svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + circle1.fig_diameter + " " + circle1.fig_diameter);

        let contour = document.getElementById("fig_contour");
        contour.setAttributeNS(null, "cx",(circle1.fig_diameter / 2).toString());
        contour.setAttributeNS(null, "cy",(circle1.fig_diameter / 2).toString());
        contour.setAttributeNS(null, "r", (circle1.fig_diameter / 2).toString());

        if (circle1.is_central_hole === true) {
            let central_hole = document.getElementById("ch");
            central_hole.setAttributeNS(null, "cx",(circle1.fig_diameter / 2).toString());
            central_hole.setAttributeNS(null, "cy",(circle1.fig_diameter / 2).toString());
            central_hole.setAttributeNS(null, "r", (circle1.d1 / 2).toString());
        }

        if (circle1.is_side_holes === true) {
            let x0 = circle1.fig_diameter / 2;
            let y0 = circle1.fig_diameter / 2;
            let angle = 360 / parseInt(circle1.d2_num);
            let x = circle1.d2_dx;
            let y = circle1.fig_diameter / 2;

            for (let i = 0; i < parseInt(circle1.d2_num); i++) {
                let circ2 = document.getElementById("sh" + i);
                circ2.setAttributeNS(null, "cx", x.toString());
                circ2.setAttributeNS(null, "cy", y.toString());

                let temp = x;
                x = x0 + (x - x0) * Math.cos(angle * (Math.PI / 180)) - (y - y0) * Math.sin(angle * (Math.PI / 180));
                y = y0 + (y - y0) * Math.cos(angle * (Math.PI / 180)) + (temp - x0) * Math.sin(angle * (Math.PI / 180));
            }
        }
    }

    collect_fig_info() {
        let name = "circ_" + Date.now();
        let width = parseFloat(circle1.fig_diameter);
        let height = parseFloat(circle1.fig_diameter);
        let num_of_entries = 1;
        let perimeter = width * Math.PI;
        let area = (width / 2) * (height / 2) * Math.PI;
        let img = this.prepare_svg();

        if (circle1.is_central_hole === true) {
            perimeter += parseFloat(circle1.d1) * Math.PI;
            area -= (parseFloat(circle1.d1) / 2) * (parseFloat(circle1.d1) / 2) * Math.PI;
            num_of_entries += 1;
        }
        if (circle1.is_side_holes === true) {
            perimeter += parseFloat(circle1.d2_num) * parseFloat(circle1.d2) * Math.PI;
            area -= parseFloat(circle1.d2_num) * (parseFloat(circle1.d2) / 2) * (parseFloat(circle1.d2) / 2) * Math.PI;
            num_of_entries += parseFloat(circle1.d2_num);
        }
        return [name, width, height, num_of_entries, (perimeter / 1000).toFixed(2), (area / 1000000).toFixed(3), img];
    }

    prepare_svg() {
        let image = document.getElementById("svf_figure").cloneNode(true);
        image.removeAttribute("id");
        for (let i = 0; i < image.childElementCount; i++) {
            for (let j = 0; j < image.children[i].childElementCount; j++) {
                image.children[i].children[j].removeAttribute("id");
            }
        }
        image.setAttribute("xmlns", xmnls);
        image.setAttribute("version", "1.1");
        return image;
    }
}

class Triangle {
    constructor(width, height) {
        this.box_width = width;
        this.box_height = height;
        this.is_truncated = false;
    }

    has_truncated_corners() {
        this.is_truncated = true;
    }

    set_upper_truncate(value) {
        this.upper_truncate = value;
    }

    set_lower_truncate(value) {
        this.lower_truncate = value;
    }

    build_triangle_svg() {
        let svg_elem = document.createElementNS(xmnls, "svg");
        svg_elem.setAttributeNS(null, "id", "svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + this.box_width + " " + this.box_height);
        svg_elem.setAttributeNS(null, "width", svg_zoom);
        svg_elem.setAttributeNS(null, "height", svg_zoom);
        svg_elem.style.display = "block";

        let contour = document.createElementNS(xmnls, "g");
        contour.setAttributeNS(null, "id", "body");

        let holes = document.createElementNS(xmnls, "g");
        holes.setAttributeNS(null, "id", "holes");

        let upper_corner = 0;
        let lower_corner = 0;
        if (this.is_truncated === true) {
            upper_corner = this.upper_truncate;
            lower_corner = this.lower_truncate;
        }

        let poly1 = document.createElementNS(xmnls, "polygon");

        let points = [];

        points.push(0 + "," + 0);
        points.push(upper_corner + "," + 0);
        points.push(this.box_width + "," + (parseFloat(this.box_height) - lower_corner));
        points.push(this.box_width + "," + this.box_height);
        points.push(0 + "," + this.box_height);

        let str = "";
        for (let i = 0; i < points.length; i++) {
            str += points[i] + " ";
        }

        poly1.setAttributeNS(null, "points", str);
        poly1.setAttributeNS(null, "fill", "#999");
        poly1.setAttributeNS(null, "id", "fig_contour");

        contour.appendChild(poly1);
        svg_elem.appendChild(contour);
        svg_elem.appendChild(holes);


        return svg_elem;
    }

    build_dimensions() {
        let container = document.getElementById("params_container");

        let width_field = this.form_group_builder(tr_container_ids[0], form_tr_ids[0], form_tr_labels[0], "number", ["form-group", "row"], ["form-control", "col-8", "mr-3"], ["col", "col-form-label"]);
        let height_field = this.form_group_builder(tr_container_ids[1], form_tr_ids[1], form_tr_labels[1], "number", ["form-group", "row"], ["form-control", "col-8", "mr-3"], ["col", "col-form-label"]);
        let options_field = this.checkbox_builder();

        width_field.onchange = triangle1.width_change;
        height_field.onchange = triangle1.height_change;

        container.appendChild(width_field);
        container.appendChild(height_field);
        container.appendChild(options_field);
    }

    form_group_builder(container_id, item_id, label_text, input_type, class_arr_div, class_arr_input, class_arr_label) {
        let container = document.createElement("div");
        container.setAttribute("id", container_id);
        for (let i = 0; i < class_arr_div.length; i++) {
            container.classList.add(class_arr_div[i]);
        }

        let label = document.createElement("label");
        label.setAttribute("for", item_id);
        label.innerText = label_text;
        if (Array.isArray(class_arr_label) && class_arr_label.length) {
            for (let i = 0; i < class_arr_label.length; i++) {
                label.classList.add(class_arr_label[i]);
            }
        }

        let input_item = document.createElement("input");
        for (let i = 0; i < class_arr_input.length; i++) {
            input_item.classList.add(class_arr_input[i]);
        }
        input_item.setAttribute("id", item_id);
        input_item.setAttribute("type", input_type);
        input_item.setAttribute("min", "5");
        container.appendChild(label);
        container.appendChild(input_item);
        return container;
    }

    checkbox_builder() {
        let form_item = document.createElement("form");
        form_item.setAttribute("id", tr_container_ids[2]);
        form_item.classList.add("form-inline");
        form_item.classList.add("mb-3");

        let container = document.createElement("div");
        container.classList.add("custom-control");
        container.classList.add("custom-checkbox");
        container.classList.add("mr-2");

        let input_item = document.createElement("input");
        input_item.classList.add("custom-control-input");
        input_item.setAttribute("type", "checkbox");
        input_item.setAttribute("id", form_tr_ids[2]);
        input_item.setAttribute("name", "checkbox0");

        let label_item = document.createElement("label");
        label_item.classList.add("custom-control-label");
        label_item.setAttribute("for", form_tr_ids[2]);
        label_item.innerText = form_tr_labels[2];

        container.appendChild(input_item);
        container.appendChild(label_item);
        form_item.appendChild(container);

        return form_item;
    }

    build_truncate_fields() {
        let container = document.getElementById("params_container");
        let upper_truncate_field  = this.form_group_builder(tr_container_ids[3], form_tr_ids[3], form_tr_labels[3], "number", ["form-group"], ["form-control"], null);
        let lower_truncate_field  = this.form_group_builder(tr_container_ids[4], form_tr_ids[4], form_tr_labels[4], "number", ["form-group"], ["form-control"], null);

        upper_truncate_field.onchange = this.upper_truncate_change;
        lower_truncate_field.onchange = this.lower_truncate_change;

        container.appendChild(upper_truncate_field);
        container.appendChild(lower_truncate_field);
    }

    truncate_corners_listener() {
        let checkbox = document.getElementById(form_tr_ids[2]);
        let container1 = document.getElementById(tr_container_ids[3]);
        let container2 = document.getElementById(tr_container_ids[4]);
        let contour = document.getElementById("fig_contour");

        if (checkbox.checked === true) {
            triangle1.is_truncated = true;
            container1.style.display = "block";
            container2.style.display = "block";

            let points = [];

            points.push(0 + "," + 0);
            points.push(triangle1.upper_truncate + "," + 0);
            points.push(triangle1.box_width + "," + (parseFloat(triangle1.box_height) - triangle1.lower_truncate));
            points.push(triangle1.box_width + "," + triangle1.box_height);
            points.push(0 + "," + triangle1.box_height);

            let str = "";
            for (let i = 0; i < points.length; i++) {
                str += points[i] + " ";
            }

            contour.setAttributeNS(null, "points", str);
        } else {
            triangle1.is_truncated = false;
            container1.style.display = "none";
            container2.style.display = "none";

            let points = [];

            points.push(0 + "," + 0);
            points.push(triangle1.box_width + "," + triangle1.box_height);
            points.push(0 + "," + triangle1.box_height);

            let str = "";
            for (let i = 0; i < points.length; i++) {
                str += points[i] + " ";
            }

            contour.setAttributeNS(null, "points", str);
        }
    }

    upper_truncate_change() {
        triangle1.upper_truncate = document.getElementById(form_tr_ids[3]).value;
        let contour = document.getElementById("fig_contour");

        let points = [];

        points.push(0 + "," + 0);
        points.push(triangle1.upper_truncate + "," + 0);
        points.push(triangle1.box_width + "," + (parseFloat(triangle1.box_height) - triangle1.lower_truncate));
        points.push(triangle1.box_width + "," + triangle1.box_height);
        points.push(0 + "," + triangle1.box_height);

        let str = "";
        for (let i = 0; i < points.length; i++) {
            str += points[i] + " ";
        }

        contour.setAttributeNS(null, "points", str);
    }

    lower_truncate_change() {
        triangle1.lower_truncate = document.getElementById(form_tr_ids[4]).value;
        let contour = document.getElementById("fig_contour");

        let points = [];

        points.push(0 + "," + 0);
        points.push(triangle1.upper_truncate + "," + 0);
        points.push(triangle1.box_width + "," + (parseFloat(triangle1.box_height) - triangle1.lower_truncate));
        points.push(triangle1.box_width + "," + triangle1.box_height);
        points.push(0 + "," + triangle1.box_height);

        let str = "";
        for (let i = 0; i < points.length; i++) {
            str += points[i] + " ";
        }

        contour.setAttributeNS(null, "points", str);
    }

    width_change() {
        triangle1.box_width = document.getElementById(form_tr_ids[0]).value;
        triangle1.rebuild_svg();
    }

    height_change() {
        triangle1.box_height = document.getElementById(form_tr_ids[1]).value;
        triangle1.rebuild_svg();
    }

    rebuild_svg() {
        let svg_elem = document.getElementById("svf_figure");
        svg_elem.setAttributeNS(null, "viewBox", "0 0 " + triangle1.box_width + " " + triangle1.box_height);

        let contour = document.getElementById("fig_contour");

        let points = [];
        if (this.is_truncated === true) {
            points.push(0 + "," + 0);
            points.push(triangle1.upper_truncate + "," + 0);
            points.push(triangle1.box_width + "," + (parseFloat(triangle1.box_height) - triangle1.lower_truncate));
            points.push(triangle1.box_width + "," + triangle1.box_height);
            points.push(0 + "," + triangle1.box_height);
        } else {
            points.push(0 + "," + 0);
            points.push(triangle1.box_width + "," + triangle1.box_height);
            points.push(0 + "," + triangle1.box_height);
        }
        let str = "";
        for (let i = 0; i < points.length; i++) {
            str += points[i] + " ";
        }
        contour.setAttributeNS(null, "points", str);
    }

    collect_fig_info() {
        let name = "tr_" + Date.now();
        let width = parseFloat(triangle1.box_width);
        let height = parseFloat(triangle1.box_height);
        let a = parseFloat(triangle1.upper_truncate);
        let b = parseFloat(triangle1.lower_truncate);
        let num_of_entries = 1;
        let perimeter;
        let area;
        let img = triangle1.prepare_svg();

        if (this.is_truncated === true) {
            let hyp = Math.sqrt((width - a)*(width - a) + (height - b)*(height - b));
            perimeter = width + height + a + b + hyp;
            area = width * height - (width - a) * (height - b) / 2;
        } else {
            let hyp = Math.sqrt((width * width) + (height * height));
            perimeter = height + width + hyp;
            area = width * height / 2;
        }
        return [name, width, height, num_of_entries, (perimeter / 1000).toFixed(2), (area / 1000000).toFixed(3), img];
    }

    prepare_svg() {
        let image = document.getElementById("svf_figure").cloneNode(true);
        image.removeAttribute("id");
        for (let i = 0; i < image.childElementCount; i++) {
            for (let j = 0; j < image.children[i].childElementCount; j++) {
                image.children[i].children[j].removeAttribute("id");
            }
        }
        image.setAttribute("xmlns", xmnls);
        image.setAttribute("version", "1.1");
        return image;
    }
}

class SvgObject {
    constructor(name, width, height, num_of_entries, area, perimeter, image) {
        this.obj_name = name;
        this.obj_width = width;
        this.obj_height = height;
        this.obj_entries = num_of_entries;
        this.obj_area = area;
        this.obj_cut_length = perimeter;
        this.obj_img = image;
    }

    set_obj_thickness(value) {
        this.obj_thickness = value;
    }

    set_obj_amount(value) {
        this.obj_amount = value;
    }

    set_obj_density(value) {
        this.obj_density = value;
    }

    get_obj_size() {
        return this.obj_width + " x " + this.obj_height;
    }
    get_obj_amount() {
        return parseInt(this.obj_amount);
    }
    get_obj_num_of_entries() {
        return parseInt(this.obj_entries);
    }
    get_obj_cut_length() {
        return parseFloat(this.obj_cut_length);
    }

    get_remains_weight() {
        return ((parseFloat(this.obj_width) * parseFloat(this.obj_height)) / 1000000 - parseFloat(this.obj_area)) * parseFloat(this.obj_density) * (parseFloat(this.obj_thickness) / 1000) * parseFloat(this.obj_amount);
    }

    get_single_weight() {
        return (parseFloat(this.obj_thickness) / 1000) * parseFloat(this.obj_area) * parseFloat(this.obj_density);
    }

    get_total_weight() {
        return this.get_single_weight() * parseFloat(this.obj_amount);
    }
}

function createObject() {
    let params = [];
    if (figure_type === 0) {
        params = rect1.collect_fig_info();
    } else if (figure_type === 1) {
        params = circle1.collect_fig_info();
    } else {
        params = triangle1.collect_fig_info();
    }

    builded_objects.push(new SvgObject(params[0], params[1], params[2], params[3], params[5], params[4], params[6]));
    //objProcessing();
    objectProcessing();
}

function objectProcessing() {
    let file_container = document.getElementById('constructor_results');
    file_container.classList.add("mt-3");
    file_container.classList.add("container-fluid");
    file_container.innerHTML = "";

    for (let i = 0; i < builded_objects.length; i++) {
        let top_level_container = document.createElement("div");
        top_level_container.classList.add("mb-2");

        let media_container = document.createElement("div");
        media_container.classList.add("row");
        media_container.classList.add("border");
        media_container.classList.add("position-relative");
        media_container.classList.add("media");
        media_container.classList.add("rounded");
        media_container.classList.add("bg-light");

        let column1 = document.createElement("div");
        column1.classList.add("col-sm-3");
        column1.classList.add("mt-2");
        column1.classList.add("mb-3");

        let sub_container1 = document.createElement("div");
        sub_container1.classList.add("container");

        let title = document.createElement("h5");
        title.classList.add("float-left");
        title.innerText = builded_objects[i].obj_name;

        sub_container1.appendChild(title);
        sub_container1.appendChild(builded_objects[i].obj_img);
        column1.appendChild(sub_container1);

        let column2 = document.createElement("div");
        column2.classList.add("col-sm");
        column2.classList.add("zm-1");

        let list1 = document.createElement("ul");
        list1.classList.add("pl-2");

        for (let j = 0; j < 6; j++) {
            let list_item = document.createElement("li");
            list_item.setAttribute("class", "d-flex justify-content-between align-items-center left-params");
            if (j === 0) {
                list_item.innerHTML = "Размер заготовки: <span>" + builded_objects[i].get_obj_size() + " мм.</span>";
            }
            if (j === 1) {
                list_item.innerHTML = "Площадь:  <span>" + builded_objects[i].obj_area + " кв.м.</span>";
            }
            if (j === 2) {
                list_item.innerHTML = "Длина реза: <span>" + builded_objects[i].obj_cut_length + " м.</span>";
            }
            if (j === 3) {
                list_item.innerHTML = "Кол-во прожигов: <span>" + builded_objects[i].obj_entries + "</span>";
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

        column2.appendChild(list1);

        let column3 = document.createElement("div");
        column3.classList.add("col-sm");
        column3.classList.add("zm-1");

        let list2 = document.createElement("ul");
        list2.classList.add("pl-2");

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
                amount.classList.add("ml-2");
                amount.setAttribute("style", "width: 30%");
                list_item.innerHTML = "Количество: ";
                list_item.appendChild(amount);
                list_item.classList.add("mt-1");
            }
            list_item.setAttribute("id", "right" + i);
            list2.appendChild(list_item);
        }

        column3.appendChild(list2);

        media_container.appendChild(column1);
        media_container.appendChild(column2);
        media_container.appendChild(column3);
        top_level_container.appendChild(media_container);
        file_container.appendChild(top_level_container);
    }

    document.getElementById("calc_panel").style.visibility = "visible";
    process_selector();
}

function objProcessing() {
    let file_container = document.getElementById('constructor_results');
    file_container.classList.add("mt-3");
    file_container.innerHTML = "";

    for (let i = 0; i < builded_objects.length; i++) {
        let shadowed_container = document.createElement("div");
        shadowed_container.setAttribute("class", "border media position-relative rounded mb-3 bg-light");

        let image = document.createElement("div");
        image.classList.add("m-3");
        image.setAttribute("style", "width: 180px");
        image.appendChild(builded_objects[i].obj_img);

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
                list_item.innerHTML = "Размер заготовки: <span>" + builded_objects[i].get_obj_size() + " мм.</span>";
            }
            if (j === 1) {
                list_item.innerHTML = "Площадь:  <span>" + builded_objects[i].obj_area + " кв.м.</span>";
            }
            if (j === 2) {
                list_item.innerHTML = "Длина реза: <span>" + builded_objects[i].obj_cut_length + " м.</span>";
            }
            if (j === 3) {
                list_item.innerHTML = "Кол-во прожигов: <span>" + builded_objects[i].obj_entries + "</span>";
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
                amount.classList.add("ml-2");
                amount.setAttribute("style", "width: 30%");
                list_item.innerHTML = "Количество: ";
                list_item.appendChild(amount);
                list_item.classList.add("mt-1");
            }
            list_item.setAttribute("id", "right" + i);
            list2.appendChild(list_item);
        }

        title.innerText = builded_objects[i].obj_name;
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
    document.getElementById("calc_panel").style.visibility = "visible";
    process_selector();
}

function clearObjects() {
    document.getElementById('constructor_results').innerHTML = "";
    builded_objects = [];
    document.getElementById("calc_panel").style.visibility = "collapse";
}

function calculate_svg() {
    let res = document.getElementById("constructor_results");
    for (let i = 0; i < builded_objects.length; i++) {
        let left_elements =  res.children[i].getElementsByClassName("left-params");
        let right_elements =  res.children[i].getElementsByClassName("right-params");

        let amount_val = right_elements[right_elements.length - 1].children[0].value;
        let selected_steel = left_elements[left_elements.length - 1].children[0].selectedIndex;
        let thickness_val = calcMaterial.material_thickness(selected_steel);
        let density_val = calcMaterial.material_density(selected_steel);

        builded_objects[i].set_obj_amount(amount_val);
        builded_objects[i].set_obj_thickness(thickness_val);
        builded_objects[i].set_obj_density(density_val);

        let total_cost = parseInt(calc_formula(i, selected_steel));
        let single_cost = parseInt(total_cost / builded_objects[i].get_obj_amount());
        let remains_cost = parseInt(calculate_obj_remains(i, selected_steel));

        right_elements[0].innerHTML = "Вес 1 шт.: <span>" + parseFloat(builded_objects[i].get_single_weight()).toFixed(3) + " кг.</span>";
        right_elements[1].innerHTML = "Общий вес: <span>" + parseFloat(builded_objects[i].get_total_weight()).toFixed(3) + " кг.</span>";
        right_elements[2].innerHTML = "Стоимость за шт: <span class='badge badge-pill badge-primary'>" + single_cost + " сом</span>";
        right_elements[3].innerHTML = "Общая стоимость: <span class='badge badge-pill badge-primary'>" + total_cost + " сом</span>";
        right_elements[4].innerHTML = "Стоимость остатков: <span class='badge badge-pill badge-warning'>" + remains_cost + " сом</span>";
        left_elements[4].innerHTML = "Общий вес остатков: <span>" + parseFloat(builded_objects[i].get_remains_weight()).toFixed(3) + " кг.</span>"
    }
}

function calc_formula(index, selected_steel) {
    return builded_objects[index].get_obj_amount() * (builded_objects[index].get_single_weight() * parseFloat(calcMaterial.material_cost_kg(selected_steel)) + builded_objects[index].get_obj_cut_length() / parseFloat(calcMaterial.material_cut_speed(selected_steel)) * (parseFloat(calcConsts.cost_of_expandables()) + parseFloat(calcMaterial.material_gas_cost_per_hour(selected_steel))) + builded_objects[index].get_obj_num_of_entries() * parseFloat(calcMaterial.material_cost_per_entry(selected_steel))) + parseFloat(calcConsts.cost_basic()) * parseFloat(calcConsts.profit()) * (builded_objects[index].get_obj_cut_length() / parseFloat(calcMaterial.material_cut_speed(selected_steel)) * builded_objects[index].get_obj_amount() + parseFloat(calcConsts.prepare_time())) + parseFloat(calcConsts.cost_of_programming()) + parseFloat(calcConsts.prepare_material_cost());
}

function calculate_obj_remains(index, selected_steel) {
    return builded_objects[index].get_remains_weight() * parseFloat(calcMaterial.material_cost_kg(selected_steel));
}

function process_selector() {
    let selected_process = document.getElementById("tech_proc_selector");
    cur_tech_process = tech_processes_list[selected_process.selectedIndex];
    refresh_selectors();
}

function refresh_selectors() {
    let res = document.getElementById("constructor_results");
    for (let i = 0; i < builded_objects.length; i++) {
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





















