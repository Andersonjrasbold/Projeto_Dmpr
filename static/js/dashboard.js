google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Mês', 'Vendas'],
        ['Jan', 1000],
        ['Fev', 1170],
        ['Mar', 660],
        ['Abr', 1030]
    ]);

    var options = {
        title: 'Vendas Mensais',
        curveType: 'function',
        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}
