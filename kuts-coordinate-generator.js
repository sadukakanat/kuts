/**
 * KUTS Geodesic Coordinate Vector Mapping Engine (Layer 07)
 * Converts spherical latitudes and longitudes into normalized Cartesian 3D meshes.
 */

const KUTS_COORDINATES = {
    /**
     * Transforms standard geographic coordinates into Cartesian space vectors
     * @param {number} lat - Latitude degrees (-90 to 90)
     * @param {number} lng - Longitude degrees (-180 to 180)
     * @param {number} radius - Target sphere boundary radius (Default 20.1 matching Three.js globe)
     */
    mapGeographicToVector3(lat, lng, radius = 20.1) {
        // Convert degrees cleanly to radians
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        // Apply standard mathematical spherical conversion equations
        const x = -(radius * Math.sin(phi) * Math.sin(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);

        return {
            x: Math.round(x * 1000) / 1000,
            y: Math.round(y * 1000) / 1000,
            z: Math.round(z * 1000) / 1000
        };
    },

    /**
     * Generates an itemized cluster arrangement of core localized tracking hubs
     */
    getAnchorNodeCluster() {
        return [
            { name: "THRISSUR_ANCHOR_PRIME", lat: 10.5276, lng: 76.2144 }, // Core local facility reference point
            { name: "PALAKKAD_AGRO_HUB", lat: 10.7867, lng: 76.6548 },    // Regional facility footprint reference
            { name: "KOCHI_GATEWAY", lat: 9.9312, lng: 76.2673 }         // Regional supply path transit coordinate
        ];
    }
};