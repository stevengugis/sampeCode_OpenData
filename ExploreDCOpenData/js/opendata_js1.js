function getGeoJsonData(e) {
    function t(e) {
        $.get(pageArray[e], function (e) {
            for (var t = 0; t < e.metadata.stats.count; t++) {
                var a = {}
                tmpCount++, a.value = e.data[t].item_name, -1 != ("" + a.value).indexOf("Crime Incidents") && (a.id = e.data[t].id, a.geojsonurl = "http://opendata.dc.gov/datasets/" + e.data[t].id + ".geojson", a.csvurl = "http://opendata.dc.gov/datasets/" + e.data[t].id + ".csv", datasetArray.push(a))
            }
        })
    }
    for (var a = 1; e >= a; a++) pageArray.push(url2 + a + url3)
    for (var a = 0; a < pageArray.length; a++) t(a)
}

function loadToMap() {
    getDataset(), "" != geojson_url && (funcA(), createDashboard(selectedObj))
}

function createDashboard(e) {
    selectedYear = e.name.slice(-4), $.getJSON(e.geojsonurl, function (e) {
        e && (console.log("whole geojson data downloaded"), e.features = e.features.map(function (e) {
            var t = Date.parse(e.properties.REPORTDATETIME)
            return e.properties.month = new Date(t).getMonth(), e
        }), downloadedData = e, $("#pieChart").css("display", "block"), $("#barChart").css("display", "block"), $("#pieChart").empty(), $("#barChart").empty(), dsPieChart(downloadedData.features), dsBarChart_init(downloadedData.features))
    })
}
var url = "http://opendata.dc.gov/datasets?q=*&page=3&sort_by=updated_at",
    url2 = "http://opendata.dc.gov/datasets?q=*&page=",
    url3 = "&sort_by=updated_at",
    page_count = 0,
    pageArray = [],
    datasetArray = [],
    tmpCount = 0,
    selectedObj = {}
localStorage.setItem("New Layer Name", ""), $(document).ready(function () {
    var e = "http://opendata.dc.gov/datasets"
    $("#geoJsonUrl").val(""), $.get(e, function (e) {
        var t = e.metadata.stats.total_count
        page_count = Math.ceil(t / e.metadata.stats.count), getGeoJsonData(page_count)
    })
}), $(function () {
    $("#geoJsonUrl").autocomplete({
        source: function (e, t) {
            var a = RegExp($.ui.autocomplete.escapeRegex(e.term), "i"),
                o = $.grep(datasetArray, function (e) {
                    var t = e.value,
                        o = e.id,
                        r = e.geojsonurl
                    return a.test(t) || a.test(r) || a.test(o)
                })
            t(o)
        },
        select: function (e, t) {
            selectedObj.name = t.item.value, selectedObj.geojsonurl = t.item.geojsonurl, selectedObj.csvurl = t.item.csvurl
        }
    })
}), $("#btnAdd").click(function () {
    localStorage.setItem(selectedObj.name, JSON.stringify(selectedObj)), localStorage.setItem("New Layer Name", selectedObj.name), console.log("New Layer Name: " + selectedObj.name), loadToMap()
})