const table = document.getElementById("toSortTable");
const input = document.getElementById("searchBar");

function sortTable(col, type, offset) {
    let rows, switching, i, x, y, dateX, dateY, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].children[col];
            y = rows[i + 1].children[col];
            if (type == "date") {
                dateX = x.innerHTML.trim().substring(6, 10) + "-" + x.innerHTML.trim().substring(3, 5) + "-" + x.innerHTML.trim().substring(0, 2);
                dateY = y.innerHTML.trim().substring(6, 10) + "-" + y.innerHTML.trim().substring(3, 5) + "-" + y.innerHTML.trim().substring(0, 2);
            } else if (type == "number") {
                if (offset === 0) {
                    x = Number(x.innerHTML);
                    y = Number(y.innerHTML);
                } else {
                    x = Number(x.innerHTML.trim().substring(0, x.innerHTML.trim().length - offset - 1));
                    y = Number(y.innerHTML.trim().substring(0, y.innerHTML.trim().length - offset - 1));
                }
            }
            if (dir == "asc") {
                if (type == "date") {
                    if (dateX > dateY) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (type == "number") {
                    if (x > y) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else if (dir == "desc") {
                if (type == "date") {
                    if (dateX < dateY) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (type == "number") {
                    if (x < y) {
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    let symbol = document.getElementById(`col${col}`);
    if (symbol.classList.contains("fa-sort-down") && dir == "asc") {
        symbol.classList.replace("fa-sort-down", "fa-sort-up");
    } else if (symbol.classList.contains("fa-sort-up") && dir == "desc") {
        symbol.classList.replace("fa-sort-up", "fa-sort-down");
    }
}

function filter(col) {
    let filter, tr, td, i, txtValue;
    filter = input.value.toUpperCase();
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[col];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function dropdown(element) {
    element.children[1].classList.toggle("show");
}

function fixedFilter(col, value) {
    let tr, td, i, txtValue;
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[col];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(value.toUpperCase()) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function reset() {
    // making all rows visible
    let i;
    let tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        tr[i].style.display = "";
    }

    // sorting rows based on S.No.
    let rows, switching, x, y, shouldSwitch;
    i = 0;
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].children[0];
            y = rows[i + 1].children[0];
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

    // set proper icons against headings
    const colIcons = document.getElementsByClassName("colIcon");
    for (i = 0; i < colIcons.length; i++) {
        if (colIcons[i].classList.contains('fa-sort-up')) {
            colIcons[i].classList.replace('fa-sort-up', 'fa-sort-down');
        }
    }
}