var crimeDataURL = "http://opendata.dc.gov/datasets/35034fcb3b36499c84c94c069ab1a966_27.csv";
var wardJsonURL = "http://opendata.dc.gov/datasets/0ef47379cbae44e88267c01eaec2ff6e_31.geojson";
var psaJsonURL = "http://opendata.dc.gov/datasets/db24f3b7de994501aea97ce05a50547e_10.geojson";
var map = null,
    wardLyr = null,
    psaLyr = null,
    crimeMarkers=[],
    wards = [],
    data = [];

//var transitedItems = [];
var levels = 0;
var transitioning = false;
var isAdjusting = false;

var defaults = {
    margin: { top: 24, right: 0, bottom: 0, left: 0 },
    rootname: "TOP",
    format: ",d",
    title: "",
    width: 250,
    height: 300
};

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: '',
        shadowSize: [50, 64],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    }
});

var icon1 = new LeafIcon({ iconUrl: 'images/m2.png', iconSize: [56, 55], iconAnchor: [23, 22] }),
    icon2 = new LeafIcon({ iconUrl: 'images/m3.png', iconSize: [66, 65], iconAnchor: [33, 32] }),
    icon3 = new LeafIcon({ iconUrl: 'images/m4.png', iconSize: [78, 77], iconAnchor: [38, 37] }),
    icon4 = new LeafIcon({ iconUrl: 'images/m5.png', iconSize: [90, 89], iconAnchor: [45, 44] }),
    crimeIcon1 = new LeafIcon({ iconUrl: 'images/arson_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon2 = new LeafIcon({ iconUrl: 'images/adw_gun_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon3 = new LeafIcon({ iconUrl: 'images/burglary_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon4 = new LeafIcon({ iconUrl: 'images/homicide_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon5 = new LeafIcon({ iconUrl: 'images/stolen_auto_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon6 = new LeafIcon({ iconUrl: 'images/robbery_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon7 = new LeafIcon({ iconUrl: 'images/sex_abuse_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon8 = new LeafIcon({ iconUrl: 'images/theft_from_auto_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] }),
    crimeIcon9 = new LeafIcon({ iconUrl: 'images/theft_sym.gif', iconSize: [17, 16], iconAnchor: [8, 8] });

var createLabelIcon = function (labelClass, labelText) {
    return L.divIcon({
        className: labelClass,
        html: labelText
    });
}

jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
        var evt = new MouseEvent("click");
        e.dispatchEvent(evt);
    });
};

function resetSize() {
    var wd = $(window).width();
    
    if (wd > 975) {
        defaults.width = $(window).width() / 2 - 30;
        defaults.height = $(window).height();

        $("#map").css("width", defaults.width + 30);
        $("#map").css("height", defaults.height - defaults.margin.top);
    } else {
        defaults.width = $(window).width();
        defaults.height = $(window).height();

        $("#map").css("width", defaults.width);
        $("#map").css("height", defaults.height - defaults.margin.top);
    }

}

$(document).ready(function () {
    resetSize();

    map = L.map("map").setView([38.8929, -77.0252], 12);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
        maxZoom: 17,
        minZoom: 9
    }).addTo(map);

    $("#main").append('<div id="dialog" title="Crime Treemap Help"><ol><li>Challenge</li><p>Visualizing the big dataset on browser and interacting between the map and the chart.</p>' +
        '<li>Solution</li><p>Clustering the big dataset and setting the display scales at client side. </p><p>The demonstrated 36,496 crimes have been clustered into DC Wards and PSAs, the detailed crimes are shown in each PSA.</p><p>The treemap shows the components in each Ward or PSA. Clicking the map or the treemap can navigate through the crimes.</p>' +
        '<li>Data Source</li><p>Crime Index: http://opendata.dc.gov/datasets/35034fcb3b36499c84c94c069ab1a966_27.csv</p><p>Ward Boundary: http://opendata.dc.gov/datasets/0ef47379cbae44e88267c01eaec2ff6e_31.geojson</p><p>PSA Boundary: http://opendata.dc.gov/datasets/db24f3b7de994501aea97ce05a50547e_10.geojson</p>' +
        '<li>Technogies</li><p>Bootstrap, Leaflet, D3, JQuery</p>' +
        '<li>Known Issue</li><p>IE may not work well. The treemap may not back to the root in some situations.</p>' +
        '<li>Credit</li><p>The treemap referenced ganeshv\'s Worker @ http://bl.ocks.org/ganeshv/6a8e9ada3ab7f2d88022</p></ol></div>');

    $("#dialog").dialog({
        autoOpen: false, modal: true, show: "blind", hide: "blind", width: "80%"
    });
    
    
});

$(window).resize(function () {
    resetSize();
    crimeTreeMap();
});

window.addEventListener('message', function (e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

function wardStyle(feature) {
    return {
        weight: 3,
        opacity: 0.8,
        color: 'blue',
        fillOpacity: 0.1
    };
}

function getPsaFillColor(psaName) {
    var totalCounts = 0;
    $.each(wards, function (idx, ward) {
        if (ward.psas) {
            $.each(ward.psas, function (id, psa) {
                if (psa.name == psaName) {
                    totalCounts += psa.counts;
                }
            });
        }
    });
    
    if (totalCounts <= 100) return "#DAF7A6";
    else if (totalCounts > 100 && totalCounts <= 300) return "#FFC300";
    else if (totalCounts > 300 && totalCounts <= 500) return "#FF5733";
    else if (totalCounts > 500 && totalCounts <= 700) return "#C70039";
    else if (totalCounts > 700 && totalCounts <= 1000) return "#900C3F";
    else return "#581845";
    
}

function isZoomable(key) {
    key = key.substring(0, 3);
    if (key === "Tot" || key === "PSA" || key === "War") return true;
    else return false;
}

function generateCrimePopup(d) {
    return "<table><tr><td>OFFENSE</td><td>" + d.OFFENSE + "</td></tr><tr class='evenRow'><td>METHOD</td><td>" + d.METHOD + "</td></tr>" +
        "<tr><td>CCN</td><td>" + d.CCN + "</td></tr><tr class='evenRow'><td>REPORTDATETIME</td><td>" + d.REPORTDATETIME + "</td></tr>" +
        "<tr><td>SHIFT</td><td>" + d.SHIFT + "</td></tr><tr class='evenRow'><td>LASTMODIFIEDDATE</td><td>" + d.LASTMODIFIEDDATE + "</td></tr>" +
        "<tr><td>BLOCKSITEADDRESS</td><td>" + d.BLOCKSITEADDRESS + "</td></tr><tr class='evenRow'><td>WARD</td><td>" + d.WARD + "</td></tr>" +
        "<tr><td>ANC</td><td>" + d.ANC + "</td></tr><tr class='evenRow'><td>DISTRICT</td><td>" + d.DISTRICT + "</td></tr>" +
        "<tr><td>PSA</td><td>" + d.PSA + "</td></tr><tr class='evenRow'><td>NEIGHBORHOODCLUSTER</td><td>" + d.NEIGHBORHOODCLUSTER + "</td></tr>" +
        "<tr><td>BUSINESSIMPROVEMENTDISTRICT</td><td>" + d.BUSINESSIMPROVEMENTDISTRICT + "</td></tr><tr class='evenRow'><td>BLOCK_GROUP</td><td>" + d.BLOCK_GROUP + "</td></tr>" +
        "<tr><td>CENSUS_TRACT</td><td>" + d.CENSUS_TRACT + "</td></tr><tr class='evenRow'><td>VOTING_PRECINCT</td><td>" + d.VOTING_PRECINCT + "</td></tr>" +
        "<tr><td>START_DATE</td><td>" + d.START_DATE + "</td></tr><tr class='evenRow'><td>END_DATE</td><td>" + d.END_DATE + "</td></tr></table>";
}

function getWardIcon(counts) {
    if (counts <= 2000) return icon1;
    else if (counts > 2000 && counts <= 4000) return icon2;
    else if (counts > 4000 && counts <= 6000) return icon3;
    else return icon4;
}

function getCrimeIcon(offense) {
    switch(offense) {
        case "ARSON":
            return crimeIcon1;
        case "ASSAULT W/DANGEROUS WEAPON":
            return crimeIcon2;
        case "BURGLARY":
            return crimeIcon3;
        case "HOMICIDE":
            return crimeIcon4;
        case "MOTOR VEHICLE THEFT":
            return crimeIcon5;
        case "ROBBERY":
            return crimeIcon6;
        case "SEX ABUSE":
            return crimeIcon7;
        case "THEFT F/AUTO":
            return crimeIcon8;
        default://"THEFT/OTHER"
            return crimeIcon9;
    }
}

function toggleCrimeMarker(wardName, psaName, isVisible) {
    $.each(crimeMarkers, function (ii, dd) {
        if (map.hasLayer(dd)) map.removeLayer(dd);
    });

    if (! isVisible) return;

    $.each(data, function (indx, ward) {
        if (ward.key === wardName && ward.values) {
            $.each(ward.values, function (idx, psa) {
                if (psa.key === psaName) {
                    if (psa.values) {
                        $.each(psa.values, function (id, marker) {
                            if (marker.values) {
                                $.each(marker.values,function(i,d) {
                                    crimeMarkers.push( L.marker(new L.LatLng(d.Y, d.X), { icon: getCrimeIcon(d.OFFENSE), type: "crime" }).addTo(map).bindPopup(generateCrimePopup(d), { offset: new L.Point(2, 2) }));
                                });
                            }
                        });
                    }
                }
            });
        }
        
    });
}

function togglePsaMarker(wardName, isVisible) {
    $.each(wards, function (indx, ward) {
        if ((wardName==="DC" || ward.name===wardName) && ward.psas) {
            $.each(ward.psas, function(idx, psa) {
                if (psa.markers && psa.markers.length>0) {
                    $.each(psa.markers, function(id, marker) {
                        if (isVisible) {
                            if (!map.hasLayer(marker)) map.addLayer(marker);
                        } else {
                            if (map.hasLayer(marker)) map.removeLayer(marker);
                        }
                    });
                    
                }
                else if (psa.crimes && psa.crimes.length > 0) {
                    $.each(psa.crimes, function (id, marker) {
                        if (isVisible) {
                            if (!map.hasLayer(marker)) map.addLayer(marker);
                        } else {
                            if (map.hasLayer(marker)) map.removeLayer(marker);
                        }
                    });
                }
            });
        }
        else if (ward.psas) {
            $.each(ward.psas, function (idx, psa) {
                if (psa.markers && psa.markers.length > 0) {
                    $.each(psa.markers, function (id, marker) {
                        if (map.hasLayer(marker)) map.removeLayer(marker);
                    });

                }
                if (psa.crimes && psa.crimes.length > 0) {
                    $.each(psa.crimes, function (id, marker) {
                        if (map.hasLayer(marker)) map.removeLayer(marker);
                    });
                }
            });
        }
    });
}

function toggleWardMarker(wardName, isVisible) {
    $.each(wards, function (idx, ward) {
        if (ward.markers) {
            $.each(ward.markers, function(id, marker) {
                if (wardName==="DC" || marker.options.name === wardName + "_1" || marker.options.name === wardName + "_2") {
                    if (isVisible) {
                        if (!map.hasLayer(marker)) map.addLayer(marker);
                    }
                    else {
                        map.removeLayer(marker);
                        togglePsaMarker(wardName, true);
                    }
                } else {
                    if (!map.hasLayer(marker)) map.addLayer(marker);
                }
            });
        }
    });
}

function getZoomLevel() {
    var txt = $(".grandparent text").text();
    
    if (txt.indexOf("PSA") != -1) return "PSA";
    else if (txt.indexOf("Ward") != -1) return "Ward";
    else return "DC";
}

function getCurrentWard() {
    var txt = $(".grandparent text").text();
    var val = "";
    $.each(txt.split("/"), function(idx, item) {
        if (item.indexOf("Ward") != -1) {
            val = $.trim(item.substring(0, item.indexOf("(")));
            return false;
        }
    });

    return val;
}

function populateLeafValue(data) {
    if (data instanceof Array) {
        $.each(data, function (index, item) {
            //console.log(item);
            populateLeafValue(item);
        }
        );
    }
    else if (data.values) {
        $.each(data.values, function (index, item) {
            //console.log(item);
            populateLeafValue(item);
        }
        );
    }
    else {
        data.value = 1;
        data.key = data.OFFENSE;
    }
}

function crimeTreeMap() {
    d3.csv(crimeDataURL, function (err, res) {
        if (!err) {
            data = d3.nest()
                .key(function (d) { return "Ward " + d.WARD; })
                .key(function (d) { return "PSA " + d.PSA; })
                .key(function (d) { return d.OFFENSE; })
                .entries(res);

            populateLeafValue(data);

            main({ title: "DC Crime Index 2015" }, { key: "Total Crimes", values: data });
        }
    });
}

function main(o, data) {

    $("#crime-svg-div").remove();
    $("p.title").remove();

    var root,
        opts = $.extend(true, {}, defaults, o),
        formatNumber = d3.format(opts.format),
        rname = opts.rootname,
        margin = opts.margin,
        theight = 36 + 16;

    $('#chart').width(opts.width).height(opts.height);
    var width = opts.width - margin.left - margin.right,
        height = opts.height - margin.top - margin.bottom - theight;


    var color = d3.scale.category20c();

    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function (d, depth) { return depth ? null : d._children; })
        .sort(function (a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    var svg = d3.select("#chart").append("div")
                  .attr('id', 'crime-svg-div')
                  .style("width", width + margin.left + margin.right + "px")
                  .style("height", height + margin.bottom + margin.top + "px")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    if (opts.title) {
        $("#main").prepend("<p class='title'>" + opts.title + "<img style='float:right;padding-top:8px;padding-right:50px;cursor:pointer;' src='images/help.png' id='help' alt='help' onclick='$(\"#dialog\").dialog(\"open\");return false;'></p>");
    }
    if (data instanceof Array) {
        root = { key: rname, values: data };
    } else {
        root = data;
    }

    initialize(root);
    accumulate(root);
    layout(root);
    display(root);

    if (window.parent !== window) {
        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({ height: myheight }, '*');
    }

    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    function accumulate(d) {
        return (d._children = d.values)
            ? d.value = d.values.reduce(function (p, v) { return p + accumulate(v); }, 0)
            : d.value;
    }

    function layout(d) {
        if (d._children) {
            treemap.nodes({ _children: d._children });
            d._children.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
          .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d._children)
          .enter().append("g");

        g.filter(function (d) { return d._children; })
            .classed("children", true)
            .on("click", transition);

        var children = g.selectAll(".child")
            .data(function (d) { return d._children || [d]; })
          .enter().append("g");

        children.append("rect")
            .attr("class", "child")
            .call(rect)
          .append("title")
            .text(function (d) { return d.key + " (" + formatNumber(d.value) + ")"; });
        children.append("text")
            .attr("class", "ctext")
            .text(function (d) { return d.key; })
            .call(text2);

        g.append("rect")
            .attr("class", "parent")
            .call(rect);

        var t = g.append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em");

        t.append("tspan")
            .text(function (d) { return d.key; });
        t.append("tspan")
            .attr("dy", "1.0em")
            .text(function (d) { return formatNumber(d.value); });
        t.call(text);

        g.selectAll("rect")
            .style("fill", function (d) { return color(d.key); });

        //load ward lyr
        if (wardLyr == null) {
            $.getJSON(wardJsonURL, function (dt) {
                wardLyr = L.geoJson(dt, {
                    style: function (feature) {
                        return {
                            weight: 3,
                            opacity: 0.8,
                            color: 'blue',
                            fillOpacity: 0.1
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup("<b>"+feature.properties.NAME + "</b><br />" + "REP Name: " + feature.properties.REP_NAME + "<br />" + "REP Phone: " + feature.properties.REP_PHONE);
                        if (feature.geometry.type === 'Polygon') {
                            wards.push({ name: feature.properties.NAME, center: layer.getBounds().getCenter(), psas: [] });
                        }
                    }
                });

                wardLyr.addTo(map);
                if (wards.length > 0) addWardMarker(data);
            });
        };

        //load psa lyr
        if (psaLyr == null) {
            $.getJSON(psaJsonURL, function (dt) {
                psaLyr = L.geoJson(dt, {
                    style: function (feature) {
                        return {
                            weight: 1,
                            opacity: 0.8,
                            color: 'blue',
                            fillOpacity: 0.5,
                            fillColor: getPsaFillColor("PSA " + feature.properties.NAME)
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup("PSA " + feature.properties.NAME);
                        if (feature.geometry.type === 'Polygon') {
                            //psas.push({ name: feature.properties.NAME, center: layer.getBounds().getCenter() });
                            updateWard("PSA " + feature.properties.NAME, layer.getBounds().getCenter());
                        }
                    }
                });

                //psaLyr.addTo(map);
                //if (psaMarkers.length == 0 && wards.length > 0) 
                createPsaMarker();
                //console.log(wards);
            });
        };

        function transition(d) {
            if (isAdjusting) {
                transitioning = false;
            }

            if (transitioning || !d) return;

            if (!isZoomable(d.key)) return;

            if (!isAdjusting) {
                if (d.key.substring(0, 3) === "War") {
                    toggleWardMarker(d.key, false);
                    zoomMap(d.key, false);
                }
                else if (d.key.substring(0, 3) === "PSA") {
                    //togglePsaMarker(d.key, false);
                    toggleCrimeMarker(getCurrentWard(), d.key, true);
                    zoomMap(d.key, false);
                }
                else if (d.key.substring(0, 3) === "Tot") {
                     zoomMap(d.key, true);
                }
            }

            transitioning = true;
            
            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
            t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });

            if (isAdjusting) {
                isAdjusting = false;
                transitioning = false;
            }
        };

        function addWardMarker(data) {

            if (data.values) {
                $.each(data.values, function (idx, item) {
                    if (item.key.substring(0, 4) == "Ward" && item.values) {
                        $.each(wards, function (id, itm) {
                            if (itm.name === item.key) {
                                itm.counts = item.value;
                                if (item.values) {
                                    if (! itm.psas) itm.psas = [];
                                    $.each(item.values, function (i, im) {
                                        if (im.key.substring(0, 3) === "PSA") {
                                            itm.psas.push({name:im.key,counts:im.value});
                                        }
                                    });
                                }
                                return false;
                            }
                        });
                    }
                });

            };

            $.each(wards, function (idx, ward) {
                if (! ward.markers) ward.markers = [];
                ward.markers.push(L.marker(ward.center, { icon: getWardIcon(ward.counts), name: ward.name + "_1" }).addTo(map).on('click', function (e) {
                    zoomChart(ward.name);
                }));
                ward.markers.push(L.marker(new L.LatLng(ward.center.lat, ward.center.lng), { icon: createLabelIcon("whiteLabel", ward.counts), name: ward.name + "_2" }).addTo(map).on('click', function (e) {
                    zoomChart(ward.name);
                }));
            });
        };

        function createPsaMarker() {
            $.each(wards, function(idx, ward) {
                if (ward.psas) {
                    $.each(ward.psas, function(id, psa) {
                        if (psa.center) {
                            if (!psa.markers) psa.markers = [];
                            if (!psa.crimes) psa.crimes = [];
                            if (psa.counts >1 ) {
                                psa.markers.push(L.marker(new L.LatLng(psa.center.lat, psa.center.lng), { icon: createLabelIcon("yellowLabel", psa.name + "<br/> " + psa.counts), name: ward.name + "_" + psa.name, type: "marker" }).on('click', function (e) {
                                    zoomChartByPsa(ward.name, psa.name);
                                }));
                            }
                        }
                    });
                }
            });
        }

        function updateWard(psaName, psaCenterObj) {
            $.each(wards, function(idx, ward) {
                if (ward.psas) {
                    $.each(ward.psas, function(id, psa) {
                        if (psa.name === psaName) {
                            psa.center = psaCenterObj;
                        }
                    });
                }
            });
        }

        function zoomChartByPsa(wardName, psaName) {
            if (data instanceof Array) {
                $.each(data, function (index, item) {
                    if (item.key === wardName && item.values) {
                        $.each(item.values, function(idx, psa) {
                            if (psa.key === psaName) {
                                if (getZoomLevel() != "Ward") {
                                    isAdjusting = true;
                                    $(".grandparent").d3Click();
                                   
                                    var feiTimer = setTimeout(function() {
                                        transition(psa);
                                        clearTimeout(feiTimer);
                                    }, 300);
                                }
                                else transition(psa);

                                return false;
                            }
                        });
                    }
                });
            }
            else if (data.values) {
                $.each(data.values, function (index, item) {
                    if (item.key === wardName && item.values) {
                        $.each(item.values, function (idx, psa) {
                            if (psa.key === psaName) {
                                if (getZoomLevel() != "Ward") {
                                    isAdjusting = true;
                                    $(".grandparent").d3Click();

                                    var feiTimer = setTimeout(function () {
                                        transition(psa);
                                        clearTimeout(feiTimer);
                                    }, 300);
                                }
                                else transition(psa);

                                return false;
                            }
                        });
                    }
                });
            }
        }

        function zoomChart(wardName) {
            if (data instanceof Array) {
                $.each(data, function (index, item) {
                    if (item.key === wardName) {
                        if (getZoomLevel() != "DC") {
                            isAdjusting = true;
                            $(".grandparent").d3Click();

                            var feiTimer = setTimeout(function () {
                                transition(item);
                                clearTimeout(feiTimer);
                            }, 300);
                        }
                        else transition(item);
                        return false;
                    }
                });
            }
            else if (data.values) {
                $.each(data.values, function (index, item) {
                    if (item.key === wardName) {
                        if (getZoomLevel() != "DC") {
                            isAdjusting = true;
                            $(".grandparent").d3Click();
                            var feiTimer = setTimeout(function () {
                                transition(item);
                                clearTimeout(feiTimer);
                            }, 300);
                        } else {
                            transition(item);
                        }
                        return false;
                    }
                }
                );
            }
            else {
                if (data.key === wardName) {
                    transition(data);
                    return false;
                }
            }
        };

        function zoomMap(key, isZoomFull) {

            if (isZoomFull) {
                map.fitBounds(wardLyr.getBounds());
                toggleWardMarker("DC", true);
                togglePsaMarker("DC", false);
                toggleCrimeMarker("DC", "DC", false);
                if (map.hasLayer(psaLyr)) map.removeLayer(psaLyr);
            } else {
                if (key.substring(0, 3) === "War") {
                    wardLyr.eachLayer(function(layer) {
                        if (key === layer.feature.properties.NAME) {
                            map.fitBounds(layer.getBounds());
                            if (!map.hasLayer(psaLyr)) map.addLayer(psaLyr);
                            togglePsaMarker(key, true);
                            toggleCrimeMarker("DC","DC", false);
                            return;
                        }
                    });
                } else {
                    psaLyr.eachLayer(function (layer) {
                        if (key === "PSA "+layer.feature.properties.NAME) {
                            map.fitBounds(layer.getBounds());
                            return;
                        }
                    });
                }
            }
        };

        return g;
    }

    function text(text) {
        text.selectAll("tspan")
            .attr("x", function (d) { return x(d.x) + 6; });
        text.attr("x", function (d) { return x(d.x) + 6; })
            .attr("y", function (d) { return y(d.y) + 6; })
            .style("opacity", function (d) { try { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; } catch (e) { return 1; } });
        //.style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    }

    function text2(text) {
        //text.attr("x", function (d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
        text.attr("x", function (d) { try { return x(d.x + d.dx) - this.getComputedTextLength() - 6; } catch (e) { return x(d.x + d.dx) - 10 - 6; } })
            .attr("y", function (d) { return y(d.y + d.dy) - 6; })
            .style("opacity", function (d) { try { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; } catch (e) { return 1; } });
            //.style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    }

    function rect(rect) {
        rect.attr("x", function (d) { return x(d.x); }) 
            .attr("y", function (d) { return y(d.y); })
            .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
            : d.key + " (" + formatNumber(d.value) + ")";
    }
}

if (window.location.hash === "") {
    crimeTreeMap();
}