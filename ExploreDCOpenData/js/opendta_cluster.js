function filterBy(e) {
    popup.remove()
    monthLabel.textContent = months[e]
}

function getDataset() {
    var e = Object.keys(localStorage),
        o = localStorage.getItem("New Layer Name")
    if ("" != o && -1 != ("" + o).toUpperCase().indexOf("CRIME")) {
        $.each(e, function (e, o) { })
        var t = localStorage.getItem(o),
            r = JSON.parse(t)
        $("#download").text(o), geojson_url = r.geojsonurl
    }
}

function funcA() {
    $("#downdiv").css("display", "block"), $("#download").text("Downloading crime data..."), $.getJSON(geojson_url + whereClause, function (e) {
        if (e && e.features) {
            downloadedData = e, console.log("geojson data downloaded"), $("#downdiv").show(), $("#downdiv").css("display", "block")
            var o = localStorage.getItem("New Layer Name")
            $("#download").text(o), $("#month").show(), $("#slider").show()
            var t = document.getElementById("slider")
            t.value = 0, e.features = e.features.map(function (e) {
                var o = Date.parse(e.properties.REPORTDATETIME)
                return e.properties.month = new Date(o).getMonth(), e
            })
            var r = {},
                a = []
            $.each(e.features, function (e, o) {
                0 == o.properties.month && a.push(o)
            }), r.features = a, r.type = "FeatureCollection", addCluster(r), curMonth = 0, filterBy(0), document.getElementById("slider").addEventListener("input", function (e) {
                var o = parseInt(e.target.value, 10)
                setMonth(o), filterBy(o), resetSource(o), addLegend(o)
            }), map.on("mousemove", function (e) {
                var o = map.queryRenderedFeatures(e.point, {
                    layers: layerIDs
                })
                map.getCanvas().style.cursor = o.length ? "pointer" : ""
            }), map.on("click", function (e) {
                var o = map.queryRenderedFeatures(e.point, {
                    layers: layerIDs
                })
                if (popup.remove(), !o.length) return void popup.remove()
                if (1 == o.length && !o[0].properties.point_count) {
                    var t = o[0],
                        r = "Time: " + t.properties.REPORTDATETIME + "<br>Crime: " + t.properties.OFFENSE + "<br>Location: " + t.properties.BLOCKSITEADDRESS,
                        a = t.geometry.coordinates,
                        n = new mapboxgl.LngLat(a[0], a[1]),
                        s = n.wrap()
                    popup.setLngLat(s).setHTML(r).addTo(map)
                }
            })
        } else console.log("data is not downloaded")
    }), setTimeout(function () {
        start = +new Date, $.getJSON(geojson_url, function (e) {
            if (e) {
                console.log("whole geojson data downloaded"), $("#downdiv").css("display", "block"), $("#month").show(), $("#slider").show()
                var o = document.getElementById("slider")
                o.value = 0, e.features = e.features.map(function (e) {
                    var o = Date.parse(e.properties.REPORTDATETIME)
                    return e.properties.month = new Date(o).getMonth(), e
                }), end = +new Date
                var t = end - start
                console.log("downlaod whole data cost " + t / 1e3 + " secons"), downloadedData = e, reLoadLayer(0), addLegend(0)
            }
        })
    }, 1e3), map.on("zoom", function () {
        var e = map.getZoom()
        console.log("zoom = " + e), e > 14 ? (map.getLayer("non-cluster-markers") && map.removeLayer("non-cluster-markers"), removeMarkers(markerCollection), addMarkers(downloadedData)) : removeMarkers(markerCollection)
    })
}

function resetSource(e) {
    if (e != curMonth) {
        curMonth = e
        var o = map.getZoom()
        if (console.log("in month of " + e + ", zoom = " + o), o > 14) removeMarkers(markerCollection), addMarkers(downloadedData)
        else {
            removeMarkers(markerCollection), map.getSource("crimes") && map.removeSource("crimes"), map.getLayer("non-cluster-markers") && map.removeLayer("non-cluster-markers")
            var t = {},
                r = []
            $.each(downloadedData.features, function (o, t) {
                t.properties.month == e && r.push(t)
            }), t.features = r, t.type = "FeatureCollection", addCluster(t)
        }
    }
}

function addMarkers(e) {
    var o = []
    $.each(e.features, function (e, t) {
        t.properties.month == curMonth && o.push(t)
    }), console.log("in addMarkers, curMontg = " + curMonth + ", downloaded data length = " + e.features.length + ", selectedData length = " + o.length), o.forEach(function (e) {
        var o = e.properties.OFFENSE,
            t = getOffenceMarker(o)
        $(t).attr("data-latlon", e.geometry.coordinates), t["data-properties"] = e.properties, markerCollection.push(t), new mapboxgl.Marker(t).setLngLat(e.geometry.coordinates).addTo(map)
    }), $(".marker").click(function (e) {
        e.stopPropagation(), popup.remove()
        var o = "Crime: " + this["data-properties"].OFFENSE + "<br>Time: " + this["data-properties"].REPORTDATETIME + "<br>Location: " + this["data-properties"].BLOCKSITEADDRESS,
            t = $(this).attr("data-latlon").split(","),
            t = $(this).attr("data-latlon").split(",")
        t = [+t[0], +t[1]], popup.setLngLat(t).setHTML(o).addTo(map)
    })
}

function removeMarkers(e) {
    e.length > 0 && e.forEach(function (e) {
        e.remove()
    })
}

function getOffenceMarker(e) {
    var o = getIconUrl(e),
        t = document.createElement("div")
    return t.className = "marker", t.style.backgroundImage = o, t.style.width = "12px", t.style.height = "10px", t
}

function getIconUrl(e) {
    var o = ""
    switch (e) {
        case "ARSON":
            o = ARSOnIcon
            break
        case "ASSAULT W/DANGEROUS WEAPON":
            o = ASSAULTIcon
            break
        case "BURGLARY":
            o = BURGLARYIcon
            break
        case "HOMICIDE":
            o = HOMICIDEIcon
            break
        case "MOTOR VEHICLE THEFT":
            o = MOTORIcon
            break
        case "ROBBERY":
            o = ROBBERYIcon
            break
        case "SEX ABUSE":
            o = SEXABUSEIcon
            break
        case "THEFT F/AUTO":
            o = THEFTAUTOIcon
            break
        case "THEFT/OTHER":
            o = THEFTOTHERIcon
            break
        default:
            o = ""
    }
    return o
}

function addCluster(e) {
    map.addSource("crimes", {
        type: "geojson",
        cluster: !0,
        clusterMaxZoom: 13,
        clusterRadius: 100,
        data: e
    })
    var o = "non-cluster-markers"
    layerIDs.push(o), map.addLayer({
        id: o,
        type: "circle",
        source: "crimes",
        paint: {
            "circle-color": "red",
            "circle-opacity": .75,
            "circle-radius": 5
        }
    })
    var t = [
        [250, "#90d49a", 25],
        [100, "#f28cb1", 21],
        [20, "#f1f075", 18],
        [0, "#51bbd6", 15]
    ]
    t.forEach(function (e, o) {
        map.addLayer({
            id: "cluster-" + o,
            type: "circle",
            source: "crimes",
            paint: {
                "circle-color": e[1],
                "circle-radius": e[2]
            },
            filter: 0 == o ? [">=", "point_count", e[0]] : ["all", [">=", "point_count", e[0]],
                ["<", "point_count", t[o - 1][0]]
            ]
        })
    }), map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "crimes",
        layout: {
            "text-field": "{point_count}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    })
}

function reLoadLayer(e) {
    map.getSource("crimes") && map.removeSource("crimes"), map.getLayer("non-cluster-markers") && map.removeLayer("non-cluster-markers")
    var o = {},
        t = []
    $.each(downloadedData.features, function (o, r) {
        r.properties.month == e && t.push(r)
    }), o.features = t, o.type = "FeatureCollection", addCluster(o), console.log("layer reloaded")
}

function setMonth(e) {
    curMonth == e ? curMonth = e : newMonth = e
}

function addLegend(e) {
    for (var o = document.getElementById("legendDiv") ; o.firstChild;) o.removeChild(o.firstChild)
    var t = document.createElement("div")
    t.id = "legend"
    var r = []
    $.each(downloadedData.features, function (o, t) {
        t.properties.month == e && r.push(t)
    })
    var a = document.createElement("div")
    a.setAttribute("id", "titleDiv")
    var n = "<p>Crimes in " + months[e] + " Total: " + r.length + "</p>"
    n = n.fontsize(3), a.innerHTML = n, t.appendChild(a)
    for (var s = 0; s < offenseType.length; s++) {
        var c = document.createElement("div"),
            r = [],
            i = offenseType[s]
        $.each(downloadedData.features, function (o, t) {
            t.properties.OFFENSE == i && t.properties.month == e && r.push(t)
        }), c.innerHTML = "<div class='img-sd' style='background-image:" + getIconUrl(i) + "'></div>" + offenseType[s] + " " + r.length, t.appendChild(c)
    }
    o.appendChild(t)
}
var geojson_url = "",
    daraSource_url = "http://opendata.dc.gov/datasets/35034fcb3b36499c84c94c069ab1a966_27",
    instruction = "Description: Search crime data in search bar, move slide bar to see the crime incidents in different months, click incident point to check details",
    whereClause = "?where=OFFENSE+%3D%27ROBBERY%27",
    layerIDs = []
$("#title").text("DC Crime Incidents Viewer"), $("#subtitle3").text(instruction), mapboxgl.accessToken = "pk.eyJ1IjoieXVuamllIiwiYSI6ImNpZnd0ZjZkczNjNHd0Mm0xcGRoc21nY28ifQ.8lFXo9aC9PfoKQF9ywWW-g"
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v8",
    center: [-77.034084142948, 38.909671288923],
    zoom: 12
}),
    popup = new mapboxgl.Popup({
        closeOnClick: !1,
        closeButton: !1
    }),
    monthLabel = document.getElementById("month"),
    curMonth, newMonth, monCount = 0,
    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    offenseType = ["ARSON", "ASSAULT W/DANGEROUS WEAPON", "BURGLARY", "HOMICIDE", "MOTOR VEHICLE THEFT", "ROBBERY", "SEX ABUSE", "THEFT F/AUTO", "THEFT/OTHER"],
    ARSOnIcon = "url(images/arson_sym.gif)",
    ASSAULTIcon = "url(images/adw_gun_sym.gif)",
    BURGLARYIcon = "url(images/burglary_sym.gif)",
    HOMICIDEIcon = "url(images/homicide_sym.gif)",
    MOTORIcon = "url(images/stolen_auto_sym.gif)",
    ROBBERYIcon = "url(images/robbery_sym.gif)",
    SEXABUSEIcon = "url(images/sex_abuse_sym.gif)",
    THEFTAUTOIcon = "url(images/theft_from_auto_sym.gif)",
    THEFTOTHERIcon = "url(images/theft_sym.gif)",
    downloadedData = {},
    markerCollection = []
map.on("load", function () { }), $(window).bind("load", function () { })