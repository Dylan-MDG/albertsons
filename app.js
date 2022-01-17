mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;

const selectFilters = [];
const checkboxFilters = [];

let geojsonData = {};
const filteredGeojson = {
    type: "FeatureCollection",
    features: [],
};

const map = new mapboxgl.Map({
    container: "map",
    style: config.style,
    center: config.center,
    zoom: config.zoom,
    transformRequest: transformRequest,
});

function flyToLocation(currentFeature) {
    map.flyTo({
        center: currentFeature,
        zoom: 7,
    });
};

function createPopup(currentFeature) {

    var description = `<h3 style="background-color: black; color: white;">` +
        currentFeature.properties["BANNER_NM"] +
        `</h3><h4><b>Hours of Operation: </b></h4>` +
        `</br><p>Sunday:&nbsp;</p>` +
        currentFeature.properties["SUNDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["SUNDAY_CLOSE_HR"] +
        `</br><p>Monday:&nbsp;</p>` +
        currentFeature.properties["MONDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["MONDAY_CLOSE_HR"] +
        `</br><p>Tuesday:&nbsp;</p>` +
        currentFeature.properties["TUESDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["TUESDAY_CLOSE_HR"] +
        `</br><p>Wendesday:&nbsp;</p>` +
        currentFeature.properties["WEDNESDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["WEDNESDAY_CLOSE_HR"] +
        `</br><p>Thursday:&nbsp;</p>` +
        currentFeature.properties["THURSDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["THURSDAY_CLOSE_HR"] +
        `</br><p>Friday:&nbsp;</p>` +
        currentFeature.properties["FRIDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["FRIDAY_CLOSE_HR"] +
        `</br><p>Saturday:&nbsp;</p>` +
        currentFeature.properties["SATURDAY_OPEN_HR"] +
        `<p>-</p>` +
        currentFeature.properties["SATURDAY_CLOSE_HR"];

    const popups = document.getElementsByClassName("mapboxgl-popup");
    /** Check if there is already a popup on the map and if so, remove it */
    if (popups[0]) popups[0].remove();
    new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(description)
        .addTo(map);
};

function buildLocationList() {

    const listing = listings.appendChild(document.createElement("div"));
    const link = listing.appendChild(document.createElement("button"));

    link.addEventListener("click", function() {
        createPopup(location);
    });
}


function buildDropDownList(title, listItems) {
    const filtersDiv = document.getElementById("filters");
    const mainDiv = document.createElement("div");
    const filterTitle = document.createElement("h3");
    filterTitle.innerText = title;
    filterTitle.classList.add("py12", "txt-bold");
    mainDiv.appendChild(filterTitle);

    const selectContainer = document.createElement("div");
    selectContainer.classList.add("select-container", "center");

    const dropDown = document.createElement("select");
    dropDown.classList.add("select", "filter-option");

    const selectArrow = document.createElement("div");
    selectArrow.classList.add("select-arrow");

    const firstOption = document.createElement("option");

    dropDown.appendChild(firstOption);
    selectContainer.appendChild(dropDown);
    selectContainer.appendChild(selectArrow);
    mainDiv.appendChild(selectContainer);

    for (let i = 0; i < listItems.length; i++) {
        const opt = listItems[i];
        const el1 = document.createElement("option");
        el1.textContent = opt;
        el1.value = opt;
        dropDown.appendChild(el1);
    }
    filtersDiv.appendChild(mainDiv);
};

function buildCheckbox(title, listItems) {
    const filtersDiv = document.getElementById("filters");
    const mainDiv = document.createElement("div");
    const filterTitle = document.createElement("div");
    const formatcontainer = document.createElement("div");
    filterTitle.classList.add("center", "flex-parent", "py12", "txt-bold");
    formatcontainer.classList.add(
        "center",
        "flex-parent",
        "flex-parent--column",
        "px3",
        "flex-parent--space-between-main"
    );
    const secondLine = document.createElement("div");
    secondLine.classList.add(
        "center",
        "flex-parent",
        "py12",
        "px3",
        "flex-parent--space-between-main"
    );
    filterTitle.innerText = title;
    mainDiv.appendChild(filterTitle);
    mainDiv.appendChild(formatcontainer);

    for (let i = 0; i < listItems.length; i++) {
        const container = document.createElement("label");

        container.classList.add("checkbox-container");

        const input = document.createElement("input");
        input.classList.add("px12", "filter-option");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", listItems[i]);
        input.setAttribute("value", listItems[i]);

        const checkboxDiv = document.createElement("div");
        const inputValue = document.createElement("p");
        inputValue.innerText = listItems[i];
        checkboxDiv.classList.add("checkbox", "mr6");
        checkboxDiv.appendChild(Assembly.createIcon("check"));

        container.appendChild(input);
        container.appendChild(checkboxDiv);
        container.appendChild(inputValue);

        formatcontainer.appendChild(container);
    }
    filtersDiv.appendChild(mainDiv);
};

function createFilterObject(filterSettings) {
    filterSettings.forEach(function(filter) {
        if (filter.type === "checkbox") {
            columnHeader = filter.columnHeader;
            listItems = filter.listItems;

            const keyValues = {};
            Object.assign(keyValues, { header: columnHeader, value: listItems });
            checkboxFilters.push(keyValues);
        }
        if (filter.type === "dropdown") {
            columnHeader = filter.columnHeader;
            listItems = filter.listItems;

            const keyValues = {};

            Object.assign(keyValues, { header: columnHeader, value: listItems });
            selectFilters.push(keyValues);
        }
    });
};

function applyFilters() {
    const filterForm = document.getElementById("filters");

    filterForm.addEventListener("change", function() {
        const filterOptionHTML = this.getElementsByClassName("filter-option");
        const filterOption = [].slice.call(filterOptionHTML);

        const geojSelectFilters = [];
        const geojCheckboxFilters = [];
        filteredFeatures = [];
        filteredGeojson.features = [];

        filterOption.forEach(function(filter) {
            if (filter.type === "checkbox" && filter.checked) {
                checkboxFilters.forEach(function(objs) {
                    Object.entries(objs).forEach(function([key, value]) {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojCheckboxFilters.push(geojFilter);
                        }
                    });
                });
            }
            if (filter.type === "select-one" && filter.value) {
                selectFilters.forEach(function(objs) {
                    Object.entries(objs).forEach(function([key, value]) {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojSelectFilters.push(geojFilter);
                        }
                    });
                });
            }
        });

        if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
            geojsonData.features.forEach(function(feature) {
                filteredGeojson.features.push(feature);
            });
        } else if (geojCheckboxFilters.length > 0) {
            geojCheckboxFilters.forEach(function(filter) {
                geojsonData.features.forEach(function(feature) {
                    if (feature.properties[filter[0]].includes(filter[1])) {
                        if (
                            filteredGeojson.features.filter(
                                (f) => f.properties.id === feature.properties.id
                            ).length === 0
                        ) {
                            filteredGeojson.features.push(feature);
                        }
                    }
                });
            });
            if (geojSelectFilters.length > 0) {
                const removeIds = [];
                filteredGeojson.features.forEach(function(feature) {
                    let selected = true;
                    geojSelectFilters.forEach(function(filter) {
                        if (
                            feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
                            selected === true
                        ) {
                            selected = false;
                            removeIds.push(feature.properties.id);
                        } else if (selected === false) {
                            removeIds.push(feature.properties.id);
                        }
                    });
                });
                removeIds.forEach(function(id) {
                    const idx = filteredGeojson.features.findIndex(
                        (f) => f.properties.id === id
                    );
                    filteredGeojson.features.splice(idx, 1);
                });
            }
        } else {
            geojsonData.features.forEach(function(feature) {
                let selected = true;
                geojSelectFilters.forEach(function(filter) {
                    if (!feature.properties[filter[0]].includes(filter[1]) &&
                        selected === true
                    ) {
                        selected = false;
                    }
                });
                if (
                    selected === true &&
                    filteredGeojson.features.filter(
                        (f) => f.properties.id === feature.properties.id
                    ).length === 0
                ) {
                    filteredGeojson.features.push(feature);
                }
            });
        }

        map.getSource("locationData").setData(filteredGeojson);
        buildLocationList(filteredGeojson);
    });
};

function filters(filterSettings) {
    filterSettings.forEach(function(filter) {
        if (filter.type === "checkbox") {
            buildCheckbox(filter.title, filter.listItems);
        } else if (filter.type === "dropdown") {
            buildDropDownList(filter.title, filter.listItems);
        }
    });
};

function removeFilters() {
    let input = document.getElementsByTagName("input");
    let select = document.getElementsByTagName("select");
    let selectOption = [].slice.call(select);
    let checkboxOption = [].slice.call(input);
    filteredGeojson.features = [];
    checkboxOption.forEach(function(checkbox) {
        if (checkbox.type == "checkbox" && checkbox.checked == true) {
            checkbox.checked = false;
        }
    });

    selectOption.forEach(function(option) {
        option.selectedIndex = 0;
    });

    map.getSource("locationData").setData(geojsonData);
    buildLocationList(geojsonData);
};

function removeFiltersButton() {
    const removeFilter = document.getElementById("removeFilters");
    removeFilter.addEventListener("click", function() {
        removeFilters();
    });
};

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();



const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: true, // Use the geocoder's default marker style
    zoom: 11,
});

function sortByDistance(selectedPoint) {
    const options = { units: "miles" };
    if (filteredGeojson.features.length > 0) {
        var data = filteredGeojson;
    } else {
        var data = geojsonData;
    }
    data.features.forEach(function(data) {
        Object.defineProperty(data.properties, "distance", {
            value: turf.distance(selectedPoint, data.geometry, options),
            writable: true,
            enumerable: true,
            configurable: true,
        });
    });

    data.features.sort(function(a, b) {
        if (a.properties.distance > b.properties.distance) {
            return 1;
        }
        if (a.properties.distance < b.properties.distance) {
            return -1;
        }
        return 0; // a must be equal to b
    });
    const listings = document.getElementById("listings");
    while (listings.firstChild) {
        listings.removeChild(listings.firstChild);
    }
    buildLocationList(data);
}

geocoder.on("result", function(ev) {
    const searchResult = ev.result.geometry;
    sortByDistance(searchResult);
});

var x = document.getElementById("features")

map.on("style.load", function() {
    x.style.visibility = "hidden";
    console.log("loaded");
    $(document).ready(function() {
        console.log("ready");
        $.ajax({
            type: "GET",
            url: config.CSV,
            dataType: "text",
            success: function(csvData) {
                makeGeoJSON(csvData);
            },
            error: function(request, status, error) {
                console.log(request);
                console.log(status);
                console.log(error);
            },
        });
    });

    function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(
            csvData, {
                latfield: "LATITUDE_DGR",
                lonfield: "LONGITUDE_DGR",
                delimiter: ",",
            },
            function(err, data) {
                data.features.forEach(function(data, i) {
                    data.properties.id = i;
                });

                geojsonData = data;
                // Add the the layer to the map
                map.addLayer({
                    id: "locationData",
                    type: "circle",
                    source: {
                        type: "geojson",
                        data: geojsonData,
                    },
                    paint: {
                        "circle-radius": 6,
                        "circle-color": [
                            'match', ['get', 'BANNER_NM'],
                            'SAFEWAY',
                            '#00ADBE',
                            'ACME',
                            '#F05538',
                            'STAR',
                            '#F5852F',
                            'ALBERTSONS',
                            '#FFC81B',
                            'MARKET STREET',
                            '#B3D238',
                            'UNITED',
                            '#0D53A5',
                            '#CCC'
                        ],
                        "circle-stroke-color": "white",
                        "circle-stroke-width": 1,
                        "circle-opacity": 0.7,
                    },
                });
            },
            'waterway-label'
        );


        map.on("click", "locationData", function(e) {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ["locationData"],
            });
            const clickedPoint = features[0].geometry.coordinates;

            sortByDistance(clickedPoint);
            createPopup(features[0]);
        });

        map.on("mouseenter", "locationData", function() {
            map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "locationData", function() {
            map.getCanvas().style.cursor = "default";
        });
        buildLocationList(geojsonData);

    }
});

var hoveredStateId = null;
var zoomThreshold = 5.2;
var minizoomi = 5.3;
var popup = new mapboxgl.Popup({
    closeButton: false
});


// Modal - popup for filtering results
const filterResults = document.getElementById("filterResults");
const exitButton = document.getElementById("exitButton");
const modal = document.getElementById("modal");

filterResults.addEventListener("click", () => {
    modal.classList.remove("hide-visually");
    modal.classList.add("z5");
});

exitButton.addEventListener("click", () => {
    modal.classList.add("hide-visually");
});

const title = document.getElementById("title");
title.innerText = config.title;
const description = document.getElementById("description");
description.innerText = config.description;

function transformRequest(url, resourceType) {
    var isMapboxRequest =
        url.slice(8, 22) === "api.mapbox.com" ||
        url.slice(10, 26) === "tiles.mapbox.com";
    return {
        url: isMapboxRequest ? url.replace("?", "?pluginName=finder&") : url,
    };
}