<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  let svgElement;

  // Solar position calculation functions
  function julianDay(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function solarPosition(lat, lng, date) {
    const jd = julianDay(date);
    const n = jd - 2451545.0;
    
    // Solar coordinates
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
    
    const R = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
    const obliquity = (23.439 - 0.0000004 * n) * Math.PI / 180;
    
    const alpha = Math.atan2(Math.cos(obliquity) * Math.sin(lambda), Math.cos(lambda));
    const delta = Math.asin(Math.sin(obliquity) * Math.sin(lambda));
    
    // Convert to local coordinates
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    
    // Greenwich Mean Sidereal Time
    const gmst = (280.46061837 + 360.98564736629 * n) % 360;
    const lst = (gmst + lng) * Math.PI / 180;
    
    const tau = lst - alpha;
    
    const elevation = Math.asin(Math.sin(latRad) * Math.sin(delta) + 
                                Math.cos(latRad) * Math.cos(delta) * Math.cos(tau));
    
    return elevation * 180 / Math.PI; // Convert to degrees
  }

  function calculateGoldenHourZones(date = new Date()) {
    const zones = [];
    const step = 2; // Grid resolution in degrees
    
    for (let lat = -85; lat <= 85; lat += step) {
      for (let lng = -180; lng < 180; lng += step) {
        const elevation = solarPosition(lat, lng, date);
        
        // Golden hour: sun elevation between -6° and 6°
        if (elevation >= -6 && elevation <= 6) {
          zones.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            properties: {
              elevation: elevation,
              intensity: Math.cos(elevation * Math.PI / 180) // Intensity based on elevation
            }
          });
        }
      }
    }
    
    return zones;
  }

  onMount(async () => {
    const width = 800;
    const height = 800;

    const projection = d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(svgElement)
      .attr('width', width)
      .attr('height', height);

    try {
      const world = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
      
      // Draw world map
      svg.selectAll('.country')
        .data(world.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('fill', '#ffffff')
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5);

      // Calculate and draw golden hour zones
      const goldenHourZones = calculateGoldenHourZones();
      
      svg.selectAll('.golden-hour')
        .data(goldenHourZones)
        .enter()
        .append('circle')
        .attr('class', 'golden-hour')
        .attr('cx', d => projection(d.geometry.coordinates)[0])
        .attr('cy', d => projection(d.geometry.coordinates)[1])
        .attr('r', 1.5)
        .attr('fill', d => {
          const intensity = d.properties.intensity;
          return d3.interpolateYlOrRd(intensity);
        })
        .attr('opacity', 0.7);

      // Add real-time update
      const updateGoldenHour = () => {
        const zones = calculateGoldenHourZones();
        
        svg.selectAll('.golden-hour')
          .data(zones)
          .join('circle')
          .attr('class', 'golden-hour')
          .attr('cx', d => projection(d.geometry.coordinates)[0])
          .attr('cy', d => projection(d.geometry.coordinates)[1])
          .attr('r', 1.5)
          .attr('fill', d => {
            const intensity = d.properties.intensity;
            return d3.interpolateYlOrRd(intensity);
          })
          .attr('opacity', 0.7);
      };

      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(20, ${height - 80})`);

      legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .text('Golden Hour Zones')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');

      legend.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .text('Sun elevation: -6° to +6°')
        .attr('font-size', '12px')
        .attr('fill', '#666');

      // Add current time display
      const timeDisplay = svg.append('text')
        .attr('class', 'time-display')
        .attr('x', width - 20)
        .attr('y', 30)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(`Updated: ${new Date().toLocaleTimeString()} UTC`);

      // Update every 5 minutes
      setInterval(() => {
        updateGoldenHour();
        timeDisplay.text(`Updated: ${new Date().toLocaleTimeString()} UTC`);
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error('Error loading world data:', error);
      
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .text('Error loading map data')
        .attr('fill', '#666');
    }
  });
</script>

<div id="map-container">
  <svg bind:this={svgElement}></svg>
</div>

<style>
  #map-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  svg {
    border: 1px solid #ddd;
    background-color: #e6f3ff;
  }
</style>