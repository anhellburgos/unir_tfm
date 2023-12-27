d3.json('osos.geojson').then(function(data) {
    const counts = {};
    data.features.forEach(feature => counts[feature.properties.stateProvi] = (counts[feature.properties.stateProvi] || 0) + 1);

    const processedData = Object.keys(counts).map(state => ({ state, count: counts[state] })).sort((a, b) => b.count - a.count);

    const svgWidth = 600;
    const svgHeight = 400;
    const margin = { top: 40, right: 30, bottom: 70, left: 150 }; // Aumenta el margen izquierdo
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const svg = d3.select('#barChart').append('svg').attr('width', svgWidth).attr('height', svgHeight);
    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleBand().range([0, chartHeight]).domain(processedData.map(d => d.state)).padding(0.3);
    const xScale = d3.scaleLinear().range([0, chartWidth]).domain([0, d3.max(processedData, d => d.count)]);

    chart.selectAll('.bar').data(processedData).enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.state))
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .on('mouseover', function() { d3.select(this).attr('fill', 'orange'); })
      .on('mouseout', function() { d3.select(this).attr('fill', 'steelblue'); });

    chart.selectAll('.bar-label').data(processedData).enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.count) + 5)
      .attr('y', d => yScale(d.state) + yScale.bandwidth() / 2 + 5)
      .text(d => d.count)
      .attr('text-anchor', 'start');

    chart.append('g').attr('class', 'axis').call(d3.axisLeft(yScale));

    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', svgWidth / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .text('Cantidad de Avistamientos por Provincia');
  });
