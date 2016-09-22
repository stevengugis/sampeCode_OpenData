function dsPieChart(t) {
    function e(t) {
        var e = 90 * (t.startAngle + t.endAngle) / Math.PI - 90
        return e > 90 ? e - 180 : e
    }

    function r() {
        d3.select(this).select("path").transition().duration(750).attr("d", B)
    }

    function a() {
        d3.select(this).select("path").transition().duration(750).attr("d", C)
    }

    function n(t, e) {
        updateBarChart(t.data.category, x(e), t.data.measure, t.data.month, t.data.features)
    }

    function o(t, e) {
        updateBarChart(c.category, "lightgrey", "1.00", "All", c.features)
    }
    for (var s = [], l = [], u = 0; 12 > u; u++) {
        var i = []
        s.push(i)
    }
    for (var u = 0; 12 > u; u++) t.forEach(function (t) {
        t.properties.month == u && s[u].push(t)
    })
    for (var u = 0; 12 > u; u++) l[u] = (s[u].length / t.length).toFixed(2)
    var h = [{
        category: "Jan",
        measure: l[0],
        month: months[0],
        features: s[0]
    }, {
        category: "Feb",
        measure: l[1],
        month: months[1],
        features: s[1]
    }, {
        category: "Mar",
        measure: l[2],
        month: months[2],
        features: s[2]
    }, {
        category: "Apr",
        measure: l[3],
        month: months[3],
        features: s[3]
    }, {
        category: "May",
        measure: l[4],
        month: months[4],
        features: s[4]
    }, {
        category: "Jun",
        measure: l[5],
        month: months[5],
        features: s[5]
    }, {
        category: "Jul",
        measure: l[6],
        month: months[6],
        features: s[6]
    }, {
        category: "Aug",
        measure: l[7],
        month: months[7],
        features: s[7]
    }, {
        category: "Sep",
        measure: l[8],
        month: months[8],
        features: s[8]
    }, {
        category: "Oct",
        measure: l[9],
        month: months[9],
        features: s[9]
    }, {
        category: "Nov",
        measure: l[10],
        month: months[10],
        features: s[10]
    }, {
        category: "Dec",
        measure: l[11],
        month: months[11],
        features: s[11]
    }],
        c = {
            category: "All",
            measure: 1,
            month: "All",
            features: t
        },
        d = ([{
            category: "Jan",
            measure: (s[0].length / t.length).toFixed(2)
        }, {
            category: "Feb",
            measure: (s[1].length / t.length).toFixed(2)
        }, {
            category: "Mar",
            measure: (s[2].length / t.length).toFixed(2)
        }, {
            category: "Apr",
            measure: (s[3].length / t.length).toFixed(2)
        }, {
            category: "May",
            measure: (s[4].length / t.length).toFixed(2)
        }, {
            category: "Jun",
            measure: (s[5].length / t.length).toFixed(2)
        }, {
            category: "Jul",
            measure: (s[6].length / t.length).toFixed(2)
        }, {
            category: "Aug",
            measure: (s[7].length / t.length).toFixed(2)
        }, {
            category: "Sep",
            measure: (s[8].length / t.length).toFixed(2)
        }, {
            category: "Oct",
            measure: (s[9].length / t.length).toFixed(2)
        }, {
            category: "Nov",
            measure: (s[10].length / t.length).toFixed(2)
        }, {
            category: "Dec",
            measure: (s[11].length / t.length).toFixed(2)
        }], 200),
        g = 200,
        m = Math.min(d, g) / 2,
        f = .999 * m,
        p = .5 * m,
        y = .45 * m,
        x = d3.scale.category20(),
        A = d3.select("#pieChart").append("svg:svg").data([h]).attr("width", d).attr("height", g).append("svg:g").attr("transform", "translate(" + m + "," + m + ")"),
        v = d3.svg.arc().outerRadius(m).innerRadius(f),
        C = d3.svg.arc().innerRadius(p).outerRadius(m),
        B = d3.svg.arc().innerRadius(y).outerRadius(m),
        F = d3.layout.pie().sort(null).value(function (t) {
            return t.measure
        }),
        b = A.selectAll("g.slice").data(F).enter().append("svg:g").attr("class", "slice").on("mouseover", r).on("mouseout", a).on("click", n)
    b.append("svg:path").attr("fill", function (t, e) {
        return x(e)
    }).attr("d", v).append("svg:title").text(function (t) {
        return t.data.month + ": " + formatAsPercentage(t.data.measure)
    }), d3.selectAll("g.slice").selectAll("path").transition().duration(750).delay(10).attr("d", C), b.filter(function (t) {
        return t.endAngle - t.startAngle > .2
    }).append("svg:text").attr("dy", ".35em").attr("text-anchor", "middle").attr("transform", function (t) {
        return "translate(" + C.centroid(t) + ")rotate(" + e(t) + ")"
    }).text(function (t) {
        return t.data.category
    }), A.append("svg:text").attr("dy", ".35em").attr("text-anchor", "middle").text(selectedYear).attr("class", "title").on("click", o)
}

function dsBarChart_init(t) {
    var e = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        r = []
    datasetBarChart = []
    for (var a = 0; a < offenseType.length; a++) {
        var n = offenseType[a],
            o = offenseType2[a],
            s = {}
        r = [], $.each(t, function (t, e) {
            e.properties.OFFENSE == n && r.push(e)
        }), s.group = "All", s.category = o, s.measure = r.length, datasetBarChart.push(s)
    }
    for (var l = 0; 12 > l; l++)
        for (var a = 0; a < offenseType.length; a++) {
            var n = offenseType[a],
                o = offenseType2[a],
                s = {}
            r = [], $.each(t, function (t, e) {
                e.properties.OFFENSE == n && e.properties.month == l && r.push(e)
            }), s.group = e[l], s.category = o, s.measure = r.length, datasetBarChart.push(s)
        }
    dsBarChart(datasetBarChart, t)
}

function datasetBarChosen(t) {
    var e = []
    for (x in datasetBarChart) datasetBarChart[x].group == t && e.push(datasetBarChart[x])
    return e
}

function dsBarChartBasics() {
    var t = {
        top: 30,
        right: 5,
        bottom: 15,
        left: 5
    },
        e = 580 - t.left - t.right,
        r = 180 - t.top - t.bottom,
        a = d3.scale.category20(),
        n = 1
    return {
        margin: t,
        width: e,
        height: r,
        colorBar: a,
        barPadding: n
    }
}

function dsBarChart(t, e) {
    var r = datasetBarChosen(group),
        a = dsBarChartBasics(),
        n = a.margin,
        o = a.width,
        s = a.height,
        l = (a.colorBar, a.barPadding),
        u = d3.scale.linear().domain([0, r.length]).range([0, o]),
        i = d3.scale.linear().domain([0, d3.max(r, function (t) {
            return t.measure
        })]).range([s, 0]),
        h = d3.select("#barChart").append("svg").attr("width", o + n.left + n.right).attr("height", s + n.top + n.bottom).attr("id", "barChartPlot"),
        c = h.append("g").attr("transform", "translate(" + n.left + "," + n.top + ")")
    c.selectAll("rect").data(r).enter().append("rect").attr("x", function (t, e) {
        return u(e)
    }).attr("width", o / r.length - l).attr("y", function (t) {
        return i(t.measure)
    }).attr("height", function (t) {
        return s - i(t.measure)
    }).attr("fill", "lightgrey"), c.selectAll("text").data(r).enter().append("text").text(function (t) {
        return formatAsInteger(d3.round(t.measure))
    }).attr("text-anchor", "middle").attr("x", function (t, e) {
        return e * (o / r.length) + (o / r.length - l) / 2
    }).attr("y", function (t) {
        return i(t.measure) - 5
    }).attr("class", "yAxis")
    var d = h.append("g").attr("transform", "translate(" + n.left + "," + (n.top + s) + ")")
    d.selectAll("text.xAxis").data(r).enter().append("text").text(function (t) {
        return t.category
    }).attr("text-anchor", "middle").attr("x", function (t, e) {
        return e * (o / r.length) + (o / r.length - l) / 2
    }).attr("y", 15).attr("class", "xAxis"), h.append("text").attr("x", (o + n.left + n.right) / 2).attr("y", 25).attr("class", "title").attr("text-anchor", "middle").text("Overall Crime Incidents " + selectedYear + ": " + e.length)
}

function updateBarChart(t, e, r, a, n) {
    var o = datasetBarChosen(t),
        s = dsBarChartBasics(),
        l = s.margin,
        u = s.width,
        i = s.height,
        h = (s.colorBar, s.barPadding),
        c = d3.scale.linear().domain([0, o.length]).range([0, u]),
        d = d3.scale.linear().domain([0, d3.max(o, function (t) {
            return t.measure
        })]).range([i, 0]),
        g = d3.select("#barChart svg"),
        m = d3.select("#barChartPlot").datum(o)
    m.selectAll("rect").data(o).transition().duration(750).attr("x", function (t, e) {
        return c(e)
    }).attr("width", u / o.length - h).attr("y", function (t) {
        return d(t.measure)
    }).attr("height", function (t) {
        return i - d(t.measure)
    }).attr("fill", e), m.selectAll("text.yAxis").data(o).transition().duration(750).attr("text-anchor", "middle").attr("x", function (t, e) {
        return e * (u / o.length) + (u / o.length - h) / 2
    }).attr("y", function (t) {
        return d(t.measure) - 5
    }).text(function (t) {
        return formatAsInteger(d3.round(t.measure))
    }).attr("class", "yAxis"), "All" != a ? g.selectAll("text.title").attr("x", (u + l.left + l.right) / 2).attr("y", 25).attr("class", "title").attr("text-anchor", "middle").text("Crime Incident in " + a + "  " + selectedYear + ": " + n.length + " (" + formatAsPercentage(r) + ")") : "All" == a && g.selectAll("text.title").attr("x", (u + l.left + l.right) / 2).attr("y", 25).attr("class", "title").attr("text-anchor", "middle").text("Overall Crime Incidents " + selectedYear + ": " + n.length)
}
var formatAsPercentage = d3.format("%"),
    formatAsInteger = d3.format(","),
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    selectedYear = "",
    group = "All",
    datasetBarChart = [],
    offenseType2 = ["Arson", "Assult", "Burglary", "Homeside", "Motor Theft", "Robbery", "Sex Abuse", "F/Auto", "Theft/Other"]