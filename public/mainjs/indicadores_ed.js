//agrega marcadores al mapa(map)

function addOvi() {
  markers = [];
  groupMakers.remove();
  var _i = 0;
  let content_popup = ``;
  //console.log(data_ovi_csv[0].latitud);
  //console.log("data_ovi_csv[j].length:", data_ovi_csv[0].latitud.length);
  for (var j = 0; j < data_ovi_csv.length; j++) {
    for (var i = 0; i < data_ovi_csv[j].latitud.length; i++) {
      if (
        !isNaN(data_ovi_csv[j].latitud[i]) &&
        !isNaN(data_ovi_csv[j].longitud[i])
      ) {
        content_popup = `
                  <div class="popup">
                  <div class="colonia"><strong> COLONIA ${data_ovi_csv[j].nom_col} </strong><br><hr></div>
                      <div class="coordenadas_title"><strong>COORDENADAS</strong> </div>
                      <div class="coordenadas">[${data_ovi_csv[j].latitud[i]},${data_ovi_csv[j].longitud[i]}] </div> 
                      <div class="cantidad_title"> <strong>CANTIDAD DE HUEVOS</strong></div>
                      <div class="cantidad">${data_ovi_csv[j].cantidad_huevos[i]}</div>
                  </div>
                  `;
        markers[_i] = L.marker(
          [data_ovi_csv[j].latitud[i], data_ovi_csv[j].longitud[i]],
          {
            color: "red",
            draggable: false,
            title: "" + data_ovi_csv[j].cantidad_huevos[i],
          }
        );
        markers[_i].bindPopup(content_popup);
        _i++; //index markers
      }
    }
    //}
  }
  groupMakers = L.layerGroup(markers);
  //groupMakers.addTo(map)
}
function verZona(gid) {
    const foundZona = zonaGeneral.find((elem) => elem.properties.gid == gid);
    //map.setView(new L.LatLng(zonaGeneral[0].geometry.coordinates[0][0][0][1], zonaGeneral[0].geometry.coordinates[0][0][0][0]));
    try {
      const centroZona = turf.centerOfMass(foundZona).geometry.coordinates;
      map.setView(new L.LatLng(centroZona[1], centroZona[0]));
    } catch (err) {
      map.setView(
        new L.LatLng(
          foundZona.geometry.coordinates[0][0][0][1],
          foundZona.geometry.coordinates[0][0][0][0]
        )
      );
    }
  }
function addZonaName(data) {
  var doc_ = "";
  for (var i = 0; i < data.length; i++) {
    doc_ +=
      '<tr><td id="td_color" style="background:' +
      data[i].color +
      ' ;text-shadow: 2px 0 black, -2px 0 black, 0 2px black, 0 -2px black, 1px 1px black, -1px -1px black, -1px 1px black, 1px -1px black;font-size: 18px;width: 2px;" >' +
      data[i].numero_ovitrampas +
      '</td><td style="text-align: initial"><button style="width: 100%;cursor:zoom-in;background: transparent;text-align: left;color: white;" onclick="verZona(' +
      "'" +
      data[i].gid +
      "'" +
      ')">' +
      data[i].colonia +
      "</button> </td><td>" +
      parseInt(data[i].suma) +
      "</td></tr>";
  }
  document.getElementById("zona_name").innerHTML =
    '<table style="width:100%"><thead><th>#Ovit</th><th>Colonia</th> <th>#Huevos</th></thead><tbody>' +
    doc_ +
    "<tbody></table>";
}
function createTablaDescriptivos(data) {
  //console.log("Estadisticos Descriptivos:", data);
  document.getElementById("decriptivo_table_body").innerHTML = "";
  var tr = "";
  let dh = [];
  for (var i = 0; i < data.length; i++) {
    tr += `<tr>
             <td>${data[i].gid}</td><td>${data[i].colonia}</td><td>${
      data[i].numero_ovitrampas
    }</td><td>${data[i].suma}</td>
             <td>${data[i].media.toFixed(2)}</td><td>${data[i].varianza.toFixed(
      2
    )}</td><td>${data[i].desviacionEstandar.toFixed(2)}</td>
             <td>${data[i].minimo}</td><td>${data[i].maximo}</td><td>${
      data[i].maximo - data[i].minimo
    }</td>
             <td><button onclick="calcularHistograma(${i})">Ver Histograma</button></td>
          </tr>`;
  }
  document.getElementById("decriptivo_table_body").innerHTML = tr;
}
function mostrarVentanaEstDesc() {
  document.getElementById("cont").style.filter = "blur(14px)";
  document.getElementById("ventanaEstDesc").style.display = "";
  disabled_touch_div_maps();
}

function closeTableDescri() {
  document.getElementById("cont").style.filter = "blur(0px)";
  document.getElementById("ventanaEstDesc").style.display = "none";
  enabled_touch_div_maps();
}
function colorRGB() {
  return (
    "rgb" +
    "(" +
    (Math.random() * 255).toFixed(0) +
    "," +
    (Math.random() * 255).toFixed(0) +
    "," +
    (Math.random() * 255).toFixed(0) +
    ")"
  );
}

function calcularEstadisticosDescriptivos(data) {
  const n = data.length;
  if (n === 0) return null; // Devolver null si la data está vacía

  let suma = 0,
    sumaCuadrados = 0,
    min = Infinity,
    max = -Infinity,
    cont_zeros = 0;

  for (let i = 0; i < n; i++) {
    const val = data[i];
    suma += val;
    sumaCuadrados += val * val;
    if (val < min) min = val;
    if (val > max) max = val;
    if (val === 0) cont_zeros++;
  }

  const media = suma / n;
  const varianza = sumaCuadrados / n - media * media;
  const desviacionEstandar = Math.sqrt(varianza);

  return {
    color: colorRGB(),
    zeros: cont_zeros,
    minimo: min,
    maximo: max,
    suma: suma,
    media: media,
    varianza: varianza,
    desviacionEstandar: desviacionEstandar,
    numero_ovitrampas: n,
  };
}
function crearBoxPlot(array_huevos, nombre_colonias) {
  let trace = [];
  for (let i = 0; i < array_huevos.length; i++) {
    trace.push({
      y: array_huevos[i],
      type: "box",
      name: nombre_colonias[i],
      boxpoints: "all", // Muestra todos los puntos
      jitter: 0.3, // Distribuye los puntos para evitar superposición
      pointpos: 0, // Posición de los puntos
      boxmean: true, //
    });
  }
  // Configurar el layout del gráfico
  const layout = {
    title: "Boxplot de Tres Conjuntos de Datos",
    yaxis: {
      title: "Valores",
    },
    showlegend: true,
  };

  // Crear el gráfico
  Plotly.newPlot("boxplot", trace, layout);
}
function closeHistograma() {
  document.getElementById("ventanaHistogramaDeFrecuencias").style.display =
    "none";
}
function calcularHistograma(index) {
  // Crear el trace para el histograma
  const trace = {
    x: data_ovi_csv[index].cantidad_huevos, // Datos para el eje X
    type: "histogram", // Tipo de gráfico
    name: "Cantidad de Huevos", // Nombre de la serie
    marker: {
      color: "rgba(100, 149, 237, 0.7)", // Color de las barras
      line: {
        color: "rgba(0, 0, 0, 0.5)", // Color del borde de las barras
        width: 1, // Ancho del borde
      },
    },
    xbins: {
      start: 0, // Inicio del primer bin
      end: 90, // Fin del último bin
      size: 10, // Tamaño de cada bin (intervalo de 10 unidades)
    },
  };

  // Configuración del layout
  const layout = {
    title: "Histograma de Cantidad de Huevos en Ovitrampas",
    xaxis: {
      title: {
        text: "Cantidad de Huevos",
        font: {
          size: 14,
          color: "black",
        },
      },
      range: [0, 90], // Rango del eje X
    },
    yaxis: {
      title: {
        text: "Frecuencia",
        font: {
          size: 14,
          color: "black",
        },
      },
    },
    bargap: 0.1, // Espacio entre barras
  };

  // Crear el gráfico
  Plotly.newPlot("histograma", [trace], layout);
  document.getElementById("ventanaHistogramaDeFrecuencias").style.display = "";
}

function reiniciarInformacionDeGraficas() {
  chart_promedio_huevos.data.labels = [];
  chart_promedio_huevos.data.datasets[0].data = [];
  //datos de porcentaje de ovitrampas positivas
  chart_porcentaje_ovi_positiva.data.labels = [];
  chart_porcentaje_ovi_positiva.data.datasets[0].data = [];
  //porcentaje de huevos por colonias
  porcentaje_por_colonia.data.labels = [];
  porcentaje_por_colonia.data.datasets[0].backgroundColor = [];
  porcentaje_por_colonia.data.datasets[0].data = [];
}
var data_ovi_max;
function generarEstdisticosDescriptivos() {
  data_ovi_max=0;
  reiniciarInformacionDeGraficas();
  //data_ovi_csv
  let estadisticos = [];
  let array_huevos = [];
  let nombre_colonias = [];
  let total_de_huevos = 0;
  let data_max = [];
  let gid_pop_nam_col = {
    gid: [], //gid de cada zona
    pop: [], //porcentages de ovitrampas positivas para cada zona
    nom_col: [], //nombre de las colonias
  };
  for (let i = 0; i < data_ovi_csv.length; i++) {
    
    total_de_huevos += data_ovi_csv[i].cantidad_huevos.reduce(
      (a, b) => a + b,
      0
    );
  }
  for (let i = 0; i < data_ovi_csv.length; i++) {
    estadisticos.push(
      calcularEstadisticosDescriptivos(data_ovi_csv[i].cantidad_huevos)
    );
    estadisticos[i]["colonia"] = data_ovi_csv[i].nom_col;
    estadisticos[i]["gid"] = data_ovi_csv[i].gid;

    data_max.push(estadisticos[i].maximo);

    array_huevos.push(data_ovi_csv[i].cantidad_huevos);
    nombre_colonias.push(data_ovi_csv[i].nom_col);

    //agregar datos de promedios de huevos a graficas
    chart_promedio_huevos.data.labels.push(data_ovi_csv[i].nom_col);
    chart_promedio_huevos.data.datasets[0].data.push(estadisticos[i].media);
    //datos de porcentaje de ovitrampas positivas
    chart_porcentaje_ovi_positiva.data.labels.push(data_ovi_csv[i].nom_col);

    chart_porcentaje_ovi_positiva.data.datasets[0].data.push(
      100 -
        (estadisticos[i].zeros * 100) / data_ovi_csv[i].cantidad_huevos.length
    );
    //porcentaje de huevos por colonias
    porcentaje_por_colonia.data.labels.push(data_ovi_csv[i].nom_col);
    porcentaje_por_colonia.data.datasets[0].backgroundColor.push(
      estadisticos[i].color
    );
    //console.log(data_ovi_csv[i].cantidad_huevos.reduce((a, b) => a + b, 0));
    porcentaje_por_colonia.data.datasets[0].data.push(
      ((estadisticos[i].suma * 100) / total_de_huevos).toFixed(1)
    );
    gid_pop_nam_col.gid.push(data_ovi_csv[i].gid);
    gid_pop_nam_col.pop.push(
      (
        100 -
        (estadisticos[i].zeros * 100) / data_ovi_csv[i].cantidad_huevos.length
      ).toFixed(1)
    );
    gid_pop_nam_col.nom_col.push(data_ovi_csv[i].nom_col);
  }
  data_ovi_max = Math.max(...data_max);

  //Actualizar datos de Chart.js
  chart_promedio_huevos.update();
  chart_porcentaje_ovi_positiva.update();
  porcentaje_por_colonia.update();

  createTablaDescriptivos(estadisticos);
  crearBoxPlot(array_huevos, nombre_colonias);
  //Agredar Datos a al Mapa
  addZonaName(estadisticos);
  addOvi();
  getZonas(gid_pop_nam_col.gid, gid_pop_nam_col, "type_csv");
}
