<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let N = 8000000000; // Population size
  export let s = 200;        // Number of items in set S
  export let k = 1;          // Sample size
  
  let chartContainer;
  let svg;
  let margin = { top: 20, right: 30, bottom: 40, left: 70 };
  let width = 600 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;
  let isCalculating = false;
  let calculationProgress = 0;
  
  // Hypergeometric probability calculation
  function calculateProbability(N, s, k) {
    if (k > N) return 0;
    if (k > N - s) return 1;
    
    // Calculate log(P(X = 0)) = log(C(N-s, k)) - log(C(N, k))
    const logProbZero = logBinomialCoeff(N - s, k) - logBinomialCoeff(N, k);
    
    // P(X = 0) = exp(logProbZero)
    const probZero = Math.exp(logProbZero);
    
    // P(X >= 1) = 1 - P(X = 0)
    return 1 - probZero;
  }

  function logBinomialCoeff(n, k) {
    if (k > n || k < 0) return -Infinity;
    if (k === 0 || k === n) return 0;
    
    let result = 0;
    for (let i = 0; i < k; i++) {
      result += Math.log(n - i) - Math.log(i + 1);
    }
    return result; // Return the log value, don't exponentiate
  }
  
  // Generate data points
  async function generateData() {
    const data = [];
    calculationProgress = 0;
    
    // For small k values, use linear spacing; for large k, use logarithmic
    const numPoints = Math.min(k + 1, 40); // Target number of points
    
    if (k <= 10) {
      // For small k, use all integer values from 1 to k
      for (let i = 1; i <= k; i++) {
        data.push({
          k: i,
          probability: calculateProbability(N, s, i)
        });
        calculationProgress = (i / k) * 100;
        // Yield control for very small delays to allow UI updates
        if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 1));
      }
    } else {
      // For larger k, use logarithmic spacing
      for (let i = 0; i < numPoints; i++) {
        let kValue;
        if (i === 0) {
          kValue = 1; // Start at 1 instead of 0
        } else if (i === numPoints - 1) {
          kValue = k;
        } else {
          // Logarithmic interpolation from 1 to k
          const ratio = i / (numPoints - 1);
          kValue = Math.round(Math.pow(k, ratio));
        }
        
        // Avoid duplicates
        if (data.length === 0 || data[data.length - 1].k !== kValue) {
          data.push({
            k: kValue,
            probability: calculateProbability(N, s, kValue)
          });
        }
        
        calculationProgress = ((i + 1) / numPoints) * 100;
        // Yield control periodically to allow UI updates
        if (i % 2 === 0) await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    return data;
  }
  
  // Redraw method for tweaking numerical calculations
  async function redrawChart() {
    if (!svg) return;
    
    isCalculating = true;
    const data = await generateData();
    isCalculating = false;
    
    // Clear previous chart
    svg.selectAll("*").remove();
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([1, d3.max(data, d => d.k)])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.probability)])
      .range([height, 0]);
    
    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.k))
      .y(d => yScale(d.probability))
      .curve(d3.curveMonotoneX);
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => {
        if (d >= 1000000) {
          const exponent = Math.floor(Math.log10(d));
          const mantissa = d / Math.pow(10, exponent);
          const superscript = exponent.toString().replace(/0/g, '⁰').replace(/1/g, '¹').replace(/2/g, '²').replace(/3/g, '³').replace(/4/g, '⁴').replace(/5/g, '⁵').replace(/6/g, '⁶').replace(/7/g, '⁷').replace(/8/g, '⁸').replace(/9/g, '⁹');
          if (mantissa === 1) {
            return `10${superscript}`;
          } else {
            return `${mantissa.toFixed(1)}×10${superscript}`;
          }
        } else {
          return d3.format(",")(d);
        }
      }));
    
    svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => {
        const percentage = d * 100;
        if (percentage < 0.1) {
          return d3.format(".1e")(percentage) + "%";
        } else {
          return d3.format(".1f")(percentage) + "%";
        }
      }));
    
    // Add axis labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Probability");
    
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom})`)
      .style("text-anchor", "middle")
      .text("Sample Size (k)");
    
    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add dots
    if (k === 1){
      svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.k))
        .attr("cy", d => yScale(d.probability))
        .attr("r", 3)
        .attr("fill", "steelblue");
    }
  }
  
  onMount(async () => {
    // Create SVG
    svg = d3.select(chartContainer)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    await redrawChart();
  });
  
  // Reactive redraw when parameters change
  $: if (svg && N > 0 && s >= 0 && s <= N && k >= 1 && k <= N) {
    redrawChart();
  }
</script>

<div class="hypergeometric-chart">  
  <div class="stats shadow mb-4">
    <div class="stat">
      <div class="stat-title">Chance for {(k).toLocaleString()} presses</div>
      <div class="stat-value text-primary">{(calculateProbability(N, s, k) * 100).toFixed(2)}%</div>
      <div class="stat-desc">Probability of killing someone you care about</div>
    </div>
    <div class="stat">
      <div class="stat-title">Amount of money for {(k).toLocaleString()} presses</div>
      <div class="stat-value text-primary">${(k * 100000).toLocaleString()}</div>
      <div class="stat-desc">Earnings</div>
    </div>
  </div>

  <div class="controls mb-4 space-y-4">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Total population (N)</span>
      </label>
      <input type="text" bind:value={N} class="input input-bordered" disabled>
    </div>
    
    <div class="form-control">
      <label class="label">
        <span class="label-text">People you care about (s)</span>
      </label>
      <div class="relative">
        <input type="number" bind:value={s} min="0" max={N} class="input input-bordered w-full pr-48 no-spinners relative z-0">
        <div class="absolute inset-y-0 right-1 flex items-center z-10">
          <div class="flex">
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.max(0, s - 100)}>-100</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.max(0, s - 10)}>-10</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.max(0, s - 1)}>-1</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.min(N, s + 1)}>+1</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.min(N, s + 10)}>+10</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => s = Math.min(N, s + 100)}>+100</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-control">
      <label class="label">
        <span class="label-text">Presses (k)</span>
      </label>
      <div class="relative">
        <input type="number" bind:value={k} min="1" max={Math.min(10000000, N)} class="input input-bordered w-full pr-48 no-spinners relative z-0">
        <div class="absolute inset-y-0 right-1 flex items-center z-10">
          <div class="flex">
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.max(1, k - 100)}>-100</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.max(1, k - 10)}>-10</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.max(1, k - 1)}>-1</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.min(Math.min(10000000, N), k + 1)}>+1</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.min(Math.min(10000000, N), k + 10)}>+10</button>
            <button class="btn btn-xs px-1 rounded-none border-0 bg-base-200 hover:bg-base-300 h-8" on:click={() => k = Math.min(Math.min(10000000, N), k + 100)}>+100</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="relative">
    {#if isCalculating}
      <progress class="progress progress-primary w-full h-1 absolute top-0 z-10" value={calculationProgress} max="100"></progress>
    {/if}
    
    <div bind:this={chartContainer} class="chart-container" class:opacity-50={isCalculating}></div>
  </div>
</div>

<style>
  .hypergeometric-chart {
    font-family: var(--font-source-sans-3, sans-serif);
    color: #374151;
    width: 640px;
  }
  
  @media (prefers-color-scheme: dark) {
    .hypergeometric-chart {
      color: #d1d5db;
    }
  }
  
  .chart-container {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px;
  }
  
  @media (prefers-color-scheme: dark) {
    .chart-container {
      background: #1f2937;
      border-color: #374151;
    }
  }
  
  .no-spinners::-webkit-outer-spin-button,
  .no-spinners::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .no-spinners[type=number] {
    -moz-appearance: textfield;
  }
  
  label {
    color: #374151;
  }
  
  @media (prefers-color-scheme: dark) {
    label {
      color: #d1d5db;
    }
  }
</style>