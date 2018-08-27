let baseUrl = 'http://dct-api-data.herokuapp.com'

let countHandle = document.getElementById('count');
let tableBodyHandle = document.getElementById('tableBody');
let ticketFormHandle = document.getElementById('ticketForm');

let nameHandle = document.getElementById('name');
let nameErrorHandle = document.getElementById('nameError')

let departmentHandle = document.getElementById('department');
let departmentErrorHandle = document.getElementById('departmentError')

let priorityHandle = document.getElementById('priority');
let priorityNames = document.getElementsByName('priority');
let priorityErrorHandle = document.getElementById('priorityError')

let messageHandle = document.getElementById('message');
let messageErrorHandle = document.getElementById('messageError')

let allHandle = document.getElementById('all');
let highHandle = document.getElementById('high');
let mediumHandle = document.getElementById('medium');
let lowHandle = document.getElementById('low');

let searchHandle = document.getElementById('search');

let popHandle = document.getElementById('pop');

let tickets;

let tr;

let progressHandle = document.getElementById('progress');
let containerHandle = document.getElementById('container');

let completeCount;
let highPersent;
let lowPersent;
let mediumPersent;


function buildProgress() {
    let percentage = (completeCount / tickets.length) * 100;
    progressHandle.setAttribute("style", `width: ${percentage}%`);
    progressHandle.innerHTML = percentage.toFixed(2)
}

function stats(ticketCode) {
    let tick = document.getElementById(ticketCode);
    let parent = tick.parentNode;
    if (tick.checked) {
        axios.put(`${baseUrl}/tickets/${ticketCode}?api_key=${key}`, { status: 'completed' })
            .then(response => {
                let ticket = response.data;
                parent.childNodes[1].innerHTML = ticket.status;
                completeCount++;
                buildProgress();
                buildChart();
                buildChart1();
            })
            .catch(err => {
                console.log(err);
            });
    }
    else {
        axios.put(`${baseUrl}/tickets/${ticketCode}?api_key=${key}`, { status: 'open' })
            .then(response => {
                let ticket = response.data;
                parent.childNodes[1].innerHTML = ticket.status;
                completeCount--;
                buildProgress();
                buildChart();
                buildChart1();
            })
            .catch(err => {
                console.log(err);
            });
    }

}
function filterTickets(priority) {
    tableBodyHandle.innerHTML = '';
    let count = 0;
    tickets.forEach(function (ticket) {
        if (ticket.priority === priority) {
            count++;
            buildRow(ticket);
        }
    });
    countHandle.innerHTML = count;
    popHandle.innerHTML = `In the table we have ${tickets.length} tickets. In that  ${countHandle.innerHTML} are ${priority} priorities `
}


searchHandle.addEventListener('keyup', function () {
    tableBodyHandle.innerHTML = '';
    let searchResults = tickets.filter((ticket) => {
        return ticket.ticket_code.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 || ticket.name.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 || ticket.department.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 || ticket.priority.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0 || ticket.message.toLowerCase().indexOf(searchHandle.value.toLowerCase()) >= 0;
    });
    searchResults.forEach((ticket) => {
        buildRow(ticket);
    })
    popHandle.innerHTML = ` In the table we have ${tickets.length} tickets .In that  ${searchResults.length} are ${searchHandle.value} tickets`
})


highHandle.addEventListener('click', function () {
    filterTickets('High');
}, false);

mediumHandle.addEventListener('click', function () {
    filterTickets('Medium');
}, false);

lowHandle.addEventListener('click', function () {
    filterTickets('Low');
}, false);

allHandle.addEventListener('click', function () {
    tableBodyHandle.innerHTML = '';
    tickets.forEach(function (ticket) {
        buildRow(ticket);
    });
    countHandle.innerHTML = tickets.length;
    popHandle.innerHTML = `Total tickets are ${tickets.length}`
}, false);

function buildRow(ticket) {
    let tr = document.createElement('tr');
    if (ticket.status === 'completed') {
        tr.innerHTML = `
        <td>${ticket.ticket_code}</td>
        <td>${ticket.name}</td>
        <td>${ticket.department}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.message}</td>     
        <td><input type="checkbox" id="${ticket.ticket_code}" checked="true" onclick="stats(this.id)"><span>${ticket.status}</span></td>`;
    } else {
        tr.innerHTML = `
        <td>${ticket.ticket_code}</td>
        <td>${ticket.name}</td>
        <td>${ticket.department}</td>
        <td>${ticket.priority}</td>
        <td>${ticket.message}</td>     
        <td><input type="checkbox" id="${ticket.ticket_code}" onclick="stats(this.id)"><span>${ticket.status}</span></td>`;
    }


    tableBodyHandle.appendChild(tr);
}
function getTickets() {
    axios.get(`${baseUrl}/tickets?api_key=${key}`)
        .then(function (response) {
            tickets = response.data;
            countHandle.innerHTML = tickets.length;
            tickets.forEach(function (ticket) {
                buildRow(ticket);
            })
            completeCount = tickets.filter(ele => ele.status === 'completed').length;
            highPersent = calculate('High');
            lowPersent = calculate('Low');
            mediumPersent = calculate('Medium');
            buildProgress();
            buildChart();
            buildChart1();
        })
        .catch(err => {
            console.log(err);
        });
}

function calculate(value) {
    let count = (tickets.filter(ele => ele.priority === value).length / tickets.length) * 100;
    return count;
}

function getPriorityValue() {
    for (let i = 0; i < priorityNames.length; i++) {
        if (priorityNames[i].checked) {
            return priorityNames[i].value;
        }
    }
}


let hasErrors = {
    name: true,
    department: true,
    message: true,
    priority: true
}
function validateName() {
    if (nameHandle.value === '') {
        nameErrorHandle.innerHTML = 'Name Cannot be blank';
        hasErrors.name = true
    } else {
        nameErrorHandle.innerHTML = ''
        hasErrors.name = false
    }
}
function validateDepartment() {
    if (departmentHandle.value === "") {
        departmentErrorHandle.innerHTML = "select option"
        hasErrors.department = true;
    } else {
        departmentErrorHandle.innerHTML = ''
        hasErrors.department = false;
    }
}
function validateMessage() {
    if (messageHandle.value === "") {
        messageErrorHandle.innerHTML = "message box should'nt be empty"
        hasErrors.message = true;
    } else {
        messageErrorHandle.innerHTML = '';
        hasErrors.message = false;
    }
}
function validatePriority() {
    for (let i = 0; i < priorityNames.length; i++) {
        if (priorityNames[i].checked === false) {
            priorityErrorHandle.innerHTML = 'select any priority button'
            hasErrors.priority = true;
        } else {
            priorityErrorHandle.innerHTML = '';
            hasErrors.priority = false;
            break;
        }
    }

}

ticketFormHandle.addEventListener('submit', function (e) {
    validateName();
    validateDepartment();
    validatePriority();
    validateMessage();
    if (Object.values(hasErrors).includes(true)) {
        e.preventDefault();
    } else {
    let formData = {
        name: nameHandle.value,
        department: departmentHandle.value,
        priority: getPriorityValue(),
        message: messageHandle.value
    }

    axios.post(`${baseUrl}/tickets?api_key=${key}`, formData)
        .then(function (response) {
            let ticket = response.data;
            getTickets();
            buildRow(ticket);
            countHandle.innerHTML = parseInt(countHandle.innerHTML) + 1;
            ticketFormHandle.reset();
        })
        .catch(function (err) {
            console.log(err);
        })
    }
}, false);

let myChart;

function buildChart() {
    myChart = Highcharts.chart('container', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'priority'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Priority',
            colorByPoint: true,
            data: [{
                name: 'High',
                y: highPersent,
            }, {
                name: 'Medium',
                y: mediumPersent,
            }, {
                name: 'Low',
                y: lowPersent,
            }]
        }]
    });
}
function buildChart1() {

    // Create the chart
    myChart1 = Highcharts.chart('container1', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Priority'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        "series": [
            {
                "name": "Priority",
                "colorByPoint": true,
                "data": [
                    {
                        "name": "High",
                        "y": highPersent,
                    },
                    {
                        "name": "edium",
                        "y": mediumPersent,
                    },
                    {
                        "name": "Low",
                        "y": lowPersent
                    }
                ]

            }
        ]

    })
}
window.addEventListener('load', function () {
    getTickets();
}, false)