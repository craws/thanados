//prepare charts/plots and data
mysite_ids = site_ids;
if (site_ids.length > 20) {
    mysite_ids = [];
    $.each(site_ids, function (i, dataset) {
        if (i < 20) mysite_ids.push(site_ids[i]);
    })
}
;

setcharts();

beginArray = [];
$.each(sitelist, function (i, site, end) {
    beginArray.push(site.begin);
});
beginArray = [];
endArray = [];
$.each(sitelist, function (i, site) {
    beginArray.push(site.begin);
    endArray.push(site.end);
});
minbegin = Math.min(...beginArray);
maxbegin = Math.max(...beginArray);

minend = Math.min(...endArray);
maxend = Math.max(...endArray);


$('#filterBtn').on('click', function (e) {
    changeArrows();
});

function changeArrows() {
    var down = ($('#filterBtnArrow').hasClass("fa-chevron-down"));
    if (down) {
        $('#filterBtnArrow').removeClass('fa-chevron-down').addClass('fa-chevron-right');
    } else {
        $('#filterBtnArrow').removeClass('fa-chevron-right').addClass('fa-chevron-down');
    }
}


//set datatable
table = $('#sitelist').DataTable({
    data: filterList(sitelist),
    "pagingType": "numbers",
    "scrollX": true,
    'columnDefs': [
        {
            'targets': 0,
            'checkboxes': {
                'selectRow': true
            }
        },
        {
            orderable: false,
            targets: 0
        }],
    'select': {
        'style': 'multi'
    },
    'order': [[1, 'asc']],
    columns: [
        {
            data: "id"
        },
        {
            data: "name",
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                $(nTd).html("<div title='" + oData.description + "'>" + oData.name + "</div>");
            }
        },
        {
            data: 'type',
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
                $(nTd).html("<div title='" + oData.path + "'>" + oData.type + "</div> ");
                //create markers
            }
        },
        {data: 'begin'},
        {data: 'end'},
        {data: 'graves'}
    ],
});

$(function () {
    $("#slider-range").slider({
        range: true,
        min: minbegin,
        max: maxbegin,
        values: [minbegin, maxbegin],
        slide: function (event, ui) {
            var table = $('#sitelist').DataTable();
            $("#amount").val(ui.values[0] + " and " + ui.values[1]);
            $("#min").val(ui.values[0]);
            $("#max").val(ui.values[1]);
            table.draw();
        }
    });
    $("#amount").val($("#slider-range").slider("values", 0) +
        " and " + $("#slider-range").slider("values", 1));
});

$(function () {
    $("#slider-range2").slider({
        range: true,
        min: minend,
        max: maxend,
        values: [minend, maxend],
        slide: function (event, ui) {
            var table = $('#sitelist').DataTable();
            $("#amount2").val(ui.values[0] + " and " + ui.values[1]);
            $("#min1").val(ui.values[0]);
            $("#max1").val(ui.values[1]);
            table.draw();
        }
    });
    $("#amount2").val($("#slider-range2").slider("values", 0) +
        " and " + $("#slider-range2").slider("values", 1));
});

/* Custom filtering function which will search data in column four between two values */
$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var min = parseInt($('#min').val(), 10);
        var max = parseInt($('#max').val(), 10);
        var age = parseFloat(data[3]) || 0; // use data for the age column

        if ((isNaN(min) && isNaN(max)) ||
            (isNaN(min) && age <= max) ||
            (min <= age && isNaN(max)) ||
            (min <= age && age <= max)) {
            return true;
        }
        return false;
    }
);

$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        var min = parseInt($('#min1').val(), 10);
        var max = parseInt($('#max1').val(), 10);
        var age = parseFloat(data[4]) || 0; // use data for the age column

        if ((isNaN(min) && isNaN(max)) ||
            (isNaN(min) && age <= max) ||
            (min <= age && isNaN(max)) ||
            (min <= age && age <= max)) {
            return true;
        }
        return false;
    }
);

$('#submitBtn').on('click', function (e) {
    mysite_ids = [];
    var rows_selected = table.column(0).checkboxes.selected();

    // Iterate over all selected checkboxes
    $.each(rows_selected, function (index, rowId) {
        // Create a hidden element
        mysite_ids.push(rowId);
    });
    $('#collapseFilter').collapse();
    changeArrows();
    setTimeout(setcharts, 200);
});

function setcharts() {

//depth of graves: Data contains site and no of graves of a depth interval of 20cm
    mydepthdata = setChartData(depth_data, false, true, true);
    depthconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: mydepthdata,
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Depth in cm.'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau20'
                }
            }
        }
    };
    var ctx = document.getElementById('depth-chart').getContext('2d');
    if (typeof(depthchart) != 'undefined') depthchart.destroy();
    depthchart = new Chart(ctx, depthconfig);

// orientation of graves: Data contains site and no of graves of a orientation interval of 20°
    var myorientationdata = setChartData(orientation_data, false, true, false);
    var orientationconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: myorientationdata,
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Orientation in Degrees (360°)'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('orientation-chart').getContext('2d');
    if (typeof(orientationchart) != 'undefined') orientationchart.destroy();
    orientationchart = new Chart(ctx, orientationconfig)


// Azimuth of graves: Data contains site and no of graves of an Azimuth interval of 20°
    var myazimuthdata = setChartData(azimuth_data, false, true, false);
    var azimuthconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: myazimuthdata,
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Azimuth in Degrees (180°)'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('azimuth-chart').getContext('2d');
    if (typeof(azimuthchart) != 'undefined') azimuthchart.destroy();
    azimuthchart = new Chart(ctx, azimuthconfig)

//sex of individuals: Data contains site and no of skeletons with male, female or undefined sex
    var mysexdata = setChartData(sex_data, true, true, false, false);
    var sexconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: mysexdata,
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('sex-chart').getContext('2d');
    if (typeof(sexchart) != 'undefined') sexchart.destroy();
    sexchart = new Chart(ctx, sexconfig)

//types of graves: Data contains site and no of graves of a certain type
    gravetypesconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: setChartData(gravetypes, true, true, false, true),
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('gravetypes-chart').getContext('2d');
    if (typeof(gravetypeschart) != 'undefined') gravetypeschart.destroy();
    gravetypeschart = new Chart(ctx, gravetypesconfig)

//construction of graves: Data contains site and no of graves of a certain construction
    graveconstrconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: setChartData(graveconstr, true, true, false, true),
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('graveconstr-chart').getContext('2d');
    if (typeof(graveconstrchart) != 'undefined') graveconstrchart.destroy();
    graveconstrchart = new Chart(ctx, graveconstrconfig)

//type of finds: Data contains site and no of finds of a certain type
    findtypeschartconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: setChartData(finds_data, true, true, false, true),
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau20'
                }
            }
        }
    };
    var ctx = document.getElementById('findtypes-chart').getContext('2d');
    if (typeof(findtypeschart) != 'undefined') findtypeschart.destroy();
    findtypeschart = new Chart(ctx, findtypeschartconfig);

//construction of graves: Data contains site and no of graves of a certain construction
    burialtypesconfig = {
        // The type of chart we want to create
        type: 'bar',
        // The data for our dataset
        data: setChartData(burialtypes, true, true, false, true),
        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    }
                }]
            },
            plugins: {
                colorschemes: {
                    scheme: 'tableau.Tableau10'
                }
            }
        }
    };
    var ctx = document.getElementById('burialtypes-chart').getContext('2d');
    if (typeof(burialtypeschart) != 'undefined') burialtypeschart.destroy();
    burialtypeschart = new Chart(ctx, burialtypesconfig)

    var ageconfig = {
        type: 'violin',
        data: setage(age_data),
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'age'
                    }
                }]
            },
        }
    };
    var ctx = document.getElementById('age-chart').getContext('2d');
    if (typeof(agechart) != 'undefined') agechart.destroy();
    agechart = new Chart(ctx, ageconfig);

    $("#violin").click(function () {
        change('violin', 'agechart', 'age-chart', ageconfig);
    });

    $("#boxplot").click(function () {
        change('boxplot', 'agechart', 'age-chart', ageconfig);
    });

}

function setage(data) {
    agelabels = [];
    min_age = [];
    avg_age = [];
    max_age = [];
    $.each(data.age, function (i, dataset) {

        if (mysite_ids.includes(dataset.site_id)) {
            //mynewdata.datasets.push(dataset);
            agelabels.push(dataset.name);
            min_age.push(dataset.min);
            avg_age.push(dataset.avg);
            max_age.push(dataset.max);
        }
    })
    boxplotData = {
        // define label tree
        labels: agelabels,
        datasets: [{
            label: 'min',
            backgroundColor: 'rgba(225,87,89,0.5)',
            borderColor: 'red',
            borderWidth: 1,
            outlierColor: '#999999',
            padding: 10,
            itemRadius: 0,
            outlierColor: '#999999',
            data: min_age
        },
            {
                label: 'avg',
                backgroundColor: 'rgba(78,121,167,0.5)',
                borderColor: 'blue',
                borderWidth: 1,
                outlierColor: '#999999',
                padding: 10,
                itemRadius: 0,
                outlierColor: '#999999',
                data: avg_age
            },
            {
                label: 'max',
                backgroundColor: 'rgba(242,142,43,0.5)',
                borderColor: 'orange',
                borderWidth: 1,
                outlierColor: '#999999',
                padding: 10,
                itemRadius: 0,
                outlierColor: '#999999',
                data: max_age
            }]
    };
    return (boxplotData)
};


//change('violin', 'agechart', 'age-chart', ageconfig);

/*function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}*/

//changetype of chart
function change(newType, chartvar, canvasid, config) {
    //var chartvar = new Chart (ctx, config);
    var ctx = document.getElementById(canvasid).getContext("2d");

    // Remove the old chart and all its event handles
    if (eval.chartvar) {
        eval.chartvar.destroy();
    }

    // Chart.js modifies the object you pass in. Pass a copy of the object so we can use the original object later
    var temp = jQuery.extend(true, {}, config);
    temp.type = newType;
    eval.chartvar = new Chart(ctx, temp);
};

//remove trailing zeros from data with intervals after highest values of site with highest values
function removeZeros(data) {
    $.each(data.datasets, function (i, dataset) {
        arraylength = dataset.data.length;
        $.each(dataset.data, function (i, number) {
            if (number > 0)
                valueindex = (i + 1);
            if (i == (arraylength - 1))
                lastvalueindex = valueindex;
        })
        var newdata = (dataset.data.slice(0, valueindex));
        dataset.data = newdata;
        if (i == 0) {
            newvalueindex = lastvalueindex;
        } else {
            if (lastvalueindex > newvalueindex)
                newvalueindex = lastvalueindex
        }
    })
    data.labels = data.labels.slice(0, newvalueindex)
    return data;
}

function filtersites(data) {
    mynewdata = {
        "datasets": [],
        "labels": []
    };
    mynewdata.labels = data.labels;
    $.each(data.datasets, function (i, dataset) {

        if (mysite_ids.includes(dataset.site_id)) {
            mynewdata.datasets.push(dataset);
        }
    })

    return mynewdata;
}

//switch axes of data
function switchaxes(datatoswitch) {
    newdata = {
        "datasets": [],
        "labels": []
    };

    $.each(datatoswitch.datasets, function (i, dataset) {
        newdata.labels.push(dataset.label);

    });

    $.each(datatoswitch.labels, function (i, label) {
        data1 = {};
        data1.label = datatoswitch.labels[i];
        data1.data = [];
        index = i;
        $.each(datatoswitch.datasets, function (i, dataset) {
            data2 = dataset.data;
            $.each(data2, function (i, value) {
                if (index === i) {
                    data1.data.push(value);
                }
            })
        })
        newdata.datasets.push(data1);
    });
    return newdata;
}

//convert values of data to percentage
function getPercentage(datatoswitch) {
    $.each(datatoswitch.datasets, function (i, dataset) {
        sum = dataset.data.reduce(
            function (total, num) {
                return total + num
            }
            , 0);
        newArray = [];
        $.each(dataset.data, function (i, value) {
            var perValue = parseFloat(Math.round((value / sum * 100) * 100) / 100);
            newArray.push(perValue)
        });
        dataset.data = newArray;
    })
    return datatoswitch;
}

//prepare typedata as chartdata
function prepareTypedata(mytypedata) {
    typelabels = [];
    $.each(mytypedata.types, function (i, types) {
        typelabels.push(types.type)
    });
    typelabels = Array.from(new Set(typelabels));
    typedata = {
        'labels': typelabels,
        'datasets': []
    };
    datalabels = [];
    $.each(mytypedata.types, function (i, types) {
        datalabels.push(types.site)
    });
    datalabels = Array.from(new Set(datalabels));
    $.each(datalabels, function (i, label) {
        var typedatasets = {
            "data": [],
            "label": label
        };
        typedata.datasets.push(typedatasets);
    });
    $.each(typedata.datasets, function (i, dataset) {
        $.each(typedata.labels, function (i, label) {
            dataset.data.push(0)
        });
    });
    $.each(mytypedata.types, function (i, type) {
        mysite = type.site;
        mysiteid = type.site_id;
        mytype = type.type;
        mycount = type.count;
        $.each(typedata.labels, function (i, label) {
            if (mytype == label) {
                myindex = i;
                $.each(typedata.datasets, function (i, dataset) {
                    if (dataset.label == mysite) {
                        $.each(dataset.data, function (e, data) {
                            if (e == myindex) {
                                dataset.data[myindex] = mycount;
                                dataset.site_id = mysiteid;
                            }
                        });
                    }
                });
            }
        })
    });
    return typedata;
}

//change chart from absolute values to percentage
function updateChart(chart, data, percentageset) {
    chart.data = data;
    if (percentageset) {
        chart.options.scales.yAxes[0].scaleLabel.labelString = '%'
    } else {
        chart.options.scales.yAxes[0].scaleLabel.labelString = 'no.'
    }
    chart.update();
}

//set data
function setChartData(originalData, axesswitch, percentageset, zeroslice, preparetypes) {
    dataToWorkWith = JSON.parse(JSON.stringify(originalData));
    if (preparetypes) dataToWorkWith = prepareTypedata(dataToWorkWith);
    dataToWorkWith = filtersites(dataToWorkWith);
    if (zeroslice) dataToWorkWith = removeZeros(dataToWorkWith);
    if (percentageset) dataToWorkWith = getPercentage(dataToWorkWith);
    if (axesswitch) dataToWorkWith = switchaxes(dataToWorkWith);
    return dataToWorkWith;
}

//some css fixes for the window/container size
$(window).resize(function () {
    var windowheight = ($(window).height());
    $('#mycontent').css('max-height', windowheight - 56 + 'px');
});

$(document).ready(function () {
    var windowheight = ($(window).height());
    $('#mycontent').css('max-height', windowheight - 56 + 'px');
});

function filterList(data) {
    filterData = [];
    $.each(data, function (i, dataset) {
      if (dataset.graves > 0) filterData.push(dataset)
    });
    return filterData
}