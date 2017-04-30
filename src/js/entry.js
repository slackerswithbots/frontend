Vue.use(VueMaterial);

if(!bus){
    var bus = new Vue();
}

var listItem = Vue.component('vlistitem', {
    template: `
        <div class="item-wrapper">
            <md-card>
                <md-card-header>
                    <h4>Event Title</h4>
                </md-card-header>
                <md-card-content>
                    Your event description, url, and any images here
                </md-card-content>
            </md-card>
        </div>
    `,
    data: function() {
        return {
            parentObj: null,
        }
    },
    props: {
        item: Object,
    },
});

var list = Vue.component('vlist', {
    template:`
        <div class="list-wrapper">
            <md-card>
                <md-card-header class="md-theme-blue">
                    <h2>Search For Opportunities</h2>
                </md-card-header>
                <md-input-container>
                    <md-icon>search</md-icon>
                    <md-input type="text" placeholder="Just type..."></md-input>
                </md-input-container>
                <md-card-content>
                    <md-list v-if="items.length > 0">
                        <vlistitem v-for="item in items" :item="item"></vlistitem>
                    </md-list>
                    <p v-else>Looks there's nothing going on near you :/</p>
                </md-card-content>
            </md-card>
        </div>
    `,
    data: function() {
        return {
            parentObj: null,
        }
    },
    props: {
        items: Array,
    },
    watch: {
        items: function(newItems) {
            this.updateItems(newItems);
        }
    },
    mounted: function() {
        if (this.$parent._isMounted) {
            //do something
        }
    },
    methods: {
        updateItems: function(items) {
            console.log(items);
        }
    }
});

var map = Vue.component('vmap', {
    template:`
        <div class="map-wrapper">
            <md-card>
                <md-card-content>
                    <div id="v-map"></div>
                </md-card-content>
            </md-card>
        </div>
    `,
    data: function() {
        return {
            markers: null
        }
    },
    props: {
        items: {
            type: Array
        },
        zoom: Number,
        center: Array,
        url: String
    },
    watch: {
        items: function(newItems) {
            this.updateMap(newItems);
        }
    },
    methods: {
        updateMap: function(items) {
            console.log("I got these items");
            console.log(items);
            if (Array.isArray(items) && items.lenght > 0) {
                if (this.markers) {
                    this.map.removeLayer(this.markers);
                }
                this.markers = L.markerClusterGroup();
                items.forEach(function(item) {
                    var location = [item.location.lat, item.location.long];
                    var maker = L.marker(location);
                    marker.bindPopup("<p>Hello world</p>");
                });
                this.markers.addLayer(this.markers);
            }
        },
        calcDistance: function(lat, lng) {
            return (0.000621371192 * L.latLng(this.center[0], this.center[1]).distanceTo(L.latLng(lat, lng))).toFixed(1);
        }
    },
    mounted: function() {
        this.map = L.map("v-map", {
            center: this.center,
            zoom: this.zoom,
        });
        L.tileLayer(this.url).addTo(this.map);
        this.updateMap(this.items);
        if (this.markers) {
            this.map.fitBounds(this.markers.getBounds());
        }
        this.map.on('moveend', function() {
            bus.$emit("moveend", this.map.getCenter());
        }.bind(this));
        this.map.on("zoomend", function() {
            bus.$emit("zoomend", this.map.getZoom());
        }.bind(this));
        this.map.invalidateSize();
        //bus.$on("dataLoaded", this.updateMap);
    }
});

var driver = {
    data: function() {
        return {
            currentLocation: {},
            radius: 10,
            center: [],
            zoom: 13,
            url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
            items: [],
            hasLocation: false
        }
    },
    watch: {
        currentLocation: function(val) {
            this.fetchEvents(val);
        },
        zoom: function(newZoom) {
            console.log(newZoom);
        }
    },
    created: function() {
        //this.currentLocation = {latitude: 47.0, longitude:-122.0};
        //this.center = [this.currentLocation.latitude, this.currentLocation.longitude];
        this.getLocation();
        bus.$on("moveend", this.updateLocation);
        bus.$on("zoomend", this.updateZoom);
    },
    beforeDestroy: function() {
        bus.$off("moveend", this.updateLocation);
        bus.$off("zoomend", this.updateZoom);
    },
    methods: {
        getLocation: function() {
            if('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    this.currentLocation = position.coords;
                    this.center = [this.currentLocation.latitude, this.currentLocation.longitude];
                    this.hasLocation = true;
                }.bind(this));
            }
        },
        fetchEvents: function(location) {
            var _this = this;
            $.ajax({
                method: "GET",
       	        url: "http://volbot-engine.slackerswithbots.com/api/v1/events",
       	        dataType: 'json',
       	    }).then(function(data) {
                console.log(data);
       	        if (data.length > 0) {
       	            _this.items = data;
       	            bus.$emit("dataLoaded", data); // emit event when items are loaded
       	        }
       	        else {
       	            _this.items = [];
       	        }
       	    }).fail(function(data) {
       	        _this.items = []; // if request doesn't work load an empty array
       	        console.log(data);
       	    });
        },
        updateLocation: function(loc) {
            this.currentLocation = loc;
        },
        updateZoom: function(zoom) {
            this.zoom = zoom;
        }
    }
};

var main = new Vue({
    el: "#mount",
    template:`
        <div class="content">
            <md-layout>
                <md-whiteframe class="header">
                    <md-toolbar class="header-theme">
                        <span class="md-title">
                            <md-avatar class="md-large">
                                <img src="../img/bot.png"></img>
                            </md-avatar>
                        <h3 class="title">VolBot Volunteer Opportunities Near You</h3>
                        </span>
                    </md-toolbar>
                </md-whiteframe>
            </md-layout>
            <md-layout md-gutter>
                <md-layout md-flex="75">
                    <vmap v-if="hasLocation" :center="center" :zoom="zoom" :url="url" :items="items"></vmap>
                    <md-spinner v-else :md-size="150" md-indeterminate></md-spinner>
                </md-layout>
                <md-layout>
                    <vlist :items="items"></vlist>
                </md-layout>
            </md-layout>
        </div>
    `,
    mixins: [driver]
});
