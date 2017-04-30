Vue.use(VueMaterial);

if(!bus){
    var bus = new Vue();
}

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
            if (Array.isArray(items) && items.lenght > 0) {
                if (this.markers) {
                    this.map.removeLayer(this.markers);
                }
                this.markers = L.markerClusterGroup();
                items.forEach(function(item) {
                    var location = [item.lat, item.long];
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
            items: []
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
        this.currentLocation = {latitude: 47.0, longitude:-122.0};
        this.center = [this.currentLocation.latitude, this.currentLocation.longitude];
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
            if('gelocation' in navigator) {
                navigator.geoLocation.getCurrentPosition(function(position) {
                    this.currentLocation = position.coords;
                    this.center - [this.currentLocation.latitude, this.currentLocation.longitude];
                }.bind(this));
            }
        },
        fetchEvents: function(location) {
            console.log(location);
        },
        updateLocation: function(loc) {
            console.log(loc);
        },
        updateZoom: function(zoom) {
            console.log(zoom);
        }
    }
};

var main = new Vue({
    el: "#mount",
    template:`
        <div class="content">
            <md-layout md-gutter>
                <md-layout md-flex="75">
                    <vmap :center="center" :zoom="zoom" :url="url" :items="items"></vmap>    
                </md-layout>
                <md-layout>
                    <md-card>
                        <md-card-content>
                            <md-list>
                                <md-list-item>
                                    <md-icon>send</md-icon> <span>Sent Mail</span>
                                </md-list-item>
                            </md-list>
                        </md-card-content>
                    </md-card>
                </md-layout>
            </md-layout>
        </div>
    `,
    mixins: [driver]       
});
