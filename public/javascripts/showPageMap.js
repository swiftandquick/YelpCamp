// Set the token equals mapToken, which is from the script that's run before this one.  
mapboxgl.accessToken = mapToken;

// Use the script to generate a map.  
const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio.  
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    // center is the starting position in [longitude, latitude].
    // Set the center of the map to the coordinates of the Campground object.  
    center: campground.geometry.coordinates,
    // zoom is how far zoom out it is at the start, the lower the number is, the farther it zooms out.  
    zoom: 8
});

// Add navigation control.  
map.addControl(new mapboxgl.NavigationControl());

// Add a marker to the map to the center to the coordinates of the Campground object.  
// Set the popup equal to the campground's title.  
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .addTo(map);

// Set the popup equal to the campground's title.  
const popup = new mapboxgl.Popup({ closeOnClick: false, offset: 25 })
    .setLngLat(campground.geometry.coordinates)
    .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
    .addTo(map);