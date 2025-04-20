//remplace//console.log("mapacalor.js")

/*Prepara mapa de calor*/
var imgOpaci = "",
  imgKrig = "",
  imgIDW = "",
  imgZonaAlta = "";
var ovitrampas;

var positions = [];
var zonaCoord = [];
const colors_11=["#7c10ff","#5941ff","#206cfa","#0093f4","#00b7ec","#00d3e3","#00ead7","#00f9cb","#00ffbc","#5effab","#93f89a","#e7d074","#ffb05d","#ff8c48","#ff6332","#ff2e19","#ff0000"]
const coloresCalor = [
  "#0f99dd",
  "#35bbdd",
  "#68dca7",
  "#e3f46c",
  "#fcfd61",
  "#fecf4f",
  "#fea43d",
  "#fa4815",
  "#fa4815",
];
const colors = [
  "#0f99dd", // Azul claro (frío)
  "#35bbdd", // Azul verdoso
  "#68dca7", // Verde azulado
  "#e3f46c", // Amarillo verdoso
  "#fcfd61", // Amarillo brillante
  "#fecf4f", // Naranja claro
  "#fea43d", // Naranja medio
  "#fa4815", // Rojo anaranjado
  '#FF2400', // Rojo intenso (calor máximo)
];
//const colors = [ '#00FF90', '#00FF6C', '#00FF48', '#00FF24', '#00FF00', '#24FF00', '#48FF00', '#6CFF00', '#90FF00', '#B4FF00',  '#D8FF00', '#FFFF00', '#FFD800', '#FFB400', '#FF9000', '#FF6C00', '#FF4800', '#FF2400', '#FF0000' ];
function inv(params) {
  let a = new Array(params.length);
  for (var i = 0; i < params.length; i++) {
    a[i] = [params[i][1], params[i][0]];
  }
  return a;
}

function getMaxValor(z) {
  var d = [];
  for (var i = 0; i < z.length; i++) {
    d.push(z[i].cantidad_huevos);
  }
  return [0, Math.max.apply(null, d)];
  //return [Math.min.apply(null, d), Math.max.apply(null, d)]
}
function calcularCorrelacion(variableX, variableY) {
  var n = variableX.length;

  // Calcular sumatorias
  var sumX = 0;
  var sumY = 0;
  var sumXY = 0;
  var sumXX = 0;
  var sumYY = 0;
  for (var i = 0; i < n; i++) {
    var x = variableX[i];
    var y = variableY[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  // Calcular coeficiente de correlación de Pearson
  var numerador = n * sumXY - sumX * sumY;
  var denominador = Math.sqrt(
    (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)
  );
  var correlacion = numerador / denominador;

  return correlacion;
}
function getC_(v, maximo) {
  var z = v / maximo;
  if(v>maximo || v< 0){
    console.log(v)
  }
   if(typeof(z)==="number"){
    return colors[Math.floor((colors.length - 1) * z)];
   }
   else{
    return colors[0];
   }
  
}
///crea una imagen con A,B como sus dimenciones
//zi arrays de valores para cada cuadro dentro
//id del canvas
 

//cierra la ventana de interpolacion
function closeWCSVInter() {
  enabled_touch_div_maps();
  document.getElementById("interpolarCSV").style.top = "";
  document.getElementById("ventana_seleccionar_p").style.display = "none";
}

function ck() {
  mapCSVInter.removeLayer(imgOpaci);
  imgOpaci = imgKrig;
  document.getElementById("idw").checked = false;
  //document.getElementById("fbr").checked=false
  imgOpaci.addTo(mapCSVInter);
}

function cidw() {
  mapCSVInter.removeLayer(imgOpaci);
  imgOpaci = imgIDW;
  //document.getElementById("fbr").checked=false
  document.getElementById("kriging").checked = false;
  imgOpaci.addTo(mapCSVInter);
}

function updateOpacity(value) {
  imgOpaci.remove();
  imgOpaci = L.imageOverlay(returnImgae(), imageBounds, {
    opacity: value,
  }).addTo(mapCSVInter);
}

function inv(params) {
  let a = new Array(params.length);
  for (var i = 0; i < params.length; i++) {
    a[i] = [params[i][1], params[i][0]];
  }
  return a;
}

function addTablaIndicador() {
  var max = data_ovi_max; //getMaxValor(data);
  var v1 = 0;
  var v2 = "";
  var divRango =
    "<div class='titulo-indice'  style='color: black;font-family: revert;background: whitesmoke;'>Densidad de Mosquitos</div>";
  for (var i = 0; i < colors.length; i++) {
    v2 += "" + Math.round(v1) + "-";
    v1 += max / colors.length;
    v2 += Math.round(v1) + "";
    if (i == 0) {
      divRango +=
        "<div style='display:flex'><div  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10' >Muy Bajo " +
        v2 +
        "</div></div>";
    } else if (i == 2) {
      divRango +=
        " <div style='display:flex'><div class='col-md-2'  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10'>Bajo " +
        v2 +
        "</div></div>";
    } else if (i == 4) {
      divRango +=
        "<div style='display:flex'><div class='col-md-2'  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10'>Medio " +
        v2 +
        "</div></div>";
    } else if (i == 6) {
      divRango +=
        "<div style='display:flex'><div class='col-md-2'  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10'>Alto " +
        v2 +
        "</div></div>";
    } else if (i == 8) {
      divRango +=
        "<div style='display:flex'><div class='col-md-2'  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10'>Muy Alto " +
        v2 +
        "</div></div>";
    } else {
      divRango +=
        "<div style='display:flex'><div class='col-md-2'  id='rango' style='color:black;background:" +
        colors[i] +
        "'></div><div id='n_rango' class='col-md-10'></div></div>";
    }
    //divRango += "<div id='rango' style='color:black;background:" + colors[i] + "'>" + v2 + "</div>";
    v2 = "";
  }
  botonesControlInfo.onAdd = function () {
    // creación de los botones
    var botones = L.DomUtil.create("div", "class-css-botones div-disabled");
    //botones.style.width=22+"%"
    botones.innerHTML +=
      "<div class='row' style='background:white;width: 200px;'>" +
      divRango +
      "</div>";
    return botones;
  };
  botonesControlInfo.addTo(mapCSVInter);
}
//crea datos para chartbubble crearDatoSemivariograma(x,y,r)
function crearDataSemivariograma(x, y, r) {
  let dataArrBubble = [];
  dataArrBubble.push({ x: 0, y: 0, r: r });
  for (var i = 0; i < x.length; i++) {
    dataArrBubble.push({ x: x[i], y: y[i], r: r });
  }
  return dataArrBubble;
}
//funcion de error en el worker
function onError(e) {
  document.getElementById("imgLoading").style.display = "none";
  document.getElementById("interpolarCSV").style.display = "none";
  createVError(
    ["ERROR: Line ", e.lineno, " in ", e.filename, ": ", e.message].join("")
  );
  //alert(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''))
}
//variograma Exponencial Teorico
function modelExp(h, a, m_s) {
  switch (m_s) {
    case "exp":
      return 1.0 - Math.exp(-3 * (h / a)); //exponecial
    case "gauss":
      return 1.0 - Math.exp(-3 * Math.pow(h / a, 2)); //gaussiano
    case "esf":
      return h > a ? 1 : (3 / 2) * (h / a) - (1 / 2) * Math.pow(h / a, 3); //esferico
  }
}

//genera valores del variograma teorico que se ha ajustado
function dataVT(nugget, sillPartial, rango, model_semi) {
  var distRange =
    chartVariograma.data.datasets[0].data[
      chartVariograma.data.datasets[0].data.length - 1
    ].x;
  console.log("distRange::::", distRange,chartVariograma.data.datasets[0].data,rango)
  var x = []; //h
  var y = []; //variogramas teorico
  var cantP = 100;
  var aument = distRange / cantP;
  for (var i = 1; i < cantP + 1; i++) {
    y[i] = nugget + sillPartial * modelExp(i * aument, rango, model_semi); // vt(nugget, sillPartial, rango, i * aument,model_semi);
    x[i] = i * aument;
  }
  return [y, x];
}
//funcion crea puntos para la grafica del variograma Experimental
function createDP(x, y) {
  let points = [];
  for (let i = 0; i < x.length; i++) {
    points.push({ x: x[i], y: y[i], r: 3 });
  }
  return points;
}

function createDPX(x) {
  let Y = [];
  let X = [];
  for (let i = 0; i < x.length; i++) {
    Y[i] = x[i];
    X[i] = i;
  }
  return [X, Y];
}

var semivariograma;
var dat_semivariograma = {
  nugget: 0,
  sill_parcial: 0,
  sill: 0,
  rango: 0,
  m: "",
  modelo: "",
  mvt: [],
};
//ajuste mediante minimos cuadrados ordinario
function MCO(Auto) {
  dat_semivariograma.modelo = document.getElementById("select_model").value;
  const wk_mco = new Worker("/interpoladoresjs/mco.js");
  wk_mco.onerror = (event) => {
    alert("Error Al ajustar datos");
    wk_mco.terminate();
  };
  wk_mco.postMessage([semivariograma, dat_semivariograma.modelo]);
  wk_mco.onmessage = (e) => {
    let rango = semivariograma.rango;
    let nugget = e.data[0]; ////Math.round(e.data[0])
    let sill = e.data[0] + e.data[1]; //// Math.round(e.data[0] + e.data[1])
    let sill_parcial = e.data[1]; ////Math.round(e.data[1])
    document.getElementById("data_mco").innerHTML =
      "<p><strong>Nugget:</strong>   " +
      nugget +
      "<br><strong>Sill:</strong>   " +
      sill +
      "<br><strong>Rango:</strong>   " +
      rango +
      "<br><strong>Sill-parcial:</strong>   " +
      sill_parcial +
      "</p>";

    let [dataSemivaTeorico, xVT] = dataVT(
      nugget,
      sill_parcial,
      rango,
      dat_semivariograma.modelo
    ); 
    
    console.log(xVT)
    chartVariograma.data.labels = xVT;
    chartVariograma.data.datasets[1].data = dataSemivaTeorico;
    
    chartVariograma.update();

    dat_semivariograma.nugget = nugget;
    dat_semivariograma.sill_parcial = sill_parcial;
    dat_semivariograma.rango = rango;
    dat_semivariograma.sill = sill;
    dat_semivariograma.m = "MCO";
    wk_mco.terminate();
    if (Auto) {
      interpolar("kriging");
    }
    wk_mco.terminate();
  };
}

function ajusteManual() {
  dat_semivariograma.modelo = document.getElementById("select_model").value;
  let sill = parseFloat(document.getElementById("sill").value);
  let nugget = parseFloat(document.getElementById("nugget").value);
  let rango = parseFloat(document.getElementById("range").value);
   
  let [dataSemivaTeorico, xVT] = dataVT(
    nugget,
    sill - nugget,
    rango,
    dat_semivariograma.modelo
  );
  console.log(nugget,sill - nugget,rango,dat_semivariograma.modelo)
  console.log(dataSemivaTeorico,xVT)
  //Se actualiza las graficas del semivariograma
  chartVariograma.data.labels = xVT;
  chartVariograma.data.datasets[1].data = dataSemivaTeorico;
  
  chartVariograma.update();

  //Se actualizan los datos del semivariograma
  dat_semivariograma.nugget2 = nugget;
  dat_semivariograma.sill_parcial2 = sill - nugget;
  dat_semivariograma.rango2 = rango;
  dat_semivariograma.sill2 = sill;
  dat_semivariograma.m = "ajusteManual";
}
var x = [];
var y = [];
var z = [];

function crear_SemiVariograna_Experimental() {
  //Actualizar chart del modelo teorico
  chartVariograma.data.labels = [];
  chartVariograma.data.datasets[1].data = [];
  chartVariograma.update();
  //actualizar valores del semivariograma teorico
  dat_semivariograma.nugget = 0;
  dat_semivariograma.sill_parcial = 0;
  dat_semivariograma.rango = 0;
  dat_semivariograma.sill = 0;
  dat_semivariograma.m = "";
  //actualizar datos del semiVa en MCO
  document.getElementById("data_mco").innerHTML =
    "<p>Nugget:" + "<br>Sill:" + "<br>Rango:" + "<br>Sill-parcial:" + "</p>";
  //actualizar entradas del ajuste manual
  document.getElementById("sill").value = "";
  document.getElementById("nugget").value = "";
  document.getElementById("range").value = "";
  const wk_semiva = new Worker("/interpoladoresjs/variograma.js");
  wk_semiva.onerror = (event) => {
    console.log("Event.e", event);
    wk_semiva.terminate();
  };
  wk_semiva.postMessage({ ovi: ovitrampas });
  console.time("Tiempo del semivariograma:");
  wk_semiva.onmessage = (event) => {
    console.timeEnd("Tiempo del semivariograma:");
    let lags = event.data.variograma.lags;
    let semi = event.data.variograma.semi;
    var dataP = createDP(lags, semi);
    chartVariograma.data.datasets[0].data = dataP;
    chartVariograma.update();
    semivariograma = event.data.variograma;
    x = event.data.x;
    y = event.data.y;
    z = event.data.z;
    MCO(true);
    wk_semiva.terminate();
  };
}
//var zonaSelect;
//pi,B,A,cajaDelimitadora
var puntos_a_interpolar, A, B, caja;
var wk_kriging, wk_idw;
var metodo_aplicado = "";

function cancelar_interpolacion() {
  //document.getElementById("interpolarCSV").style.top = "";
  document.getElementById("divProgressInterpolar").style.display = "none";
  if (metodo_aplicado == "kriging") {
    wk_kriging.terminate();
  } else if (metodo_aplicado == "idw") {
    wk_idw.terminate();
  }
  console.log("Interpolacion Cancelada......");
}

function interpolar(metodo) {
  document.getElementById("tiempo_interpolacion").innerHTML="";
  enabled_interpolarCSV_div();
  document.getElementById("ventana_seleccionar_p").style.display = "none";
  //reinicia Porcentaje de interpolcaion en div ventana
  document.getElementById("porcentajeInterpolar").innerHTML = "";
  document.getElementById("progressInter").value = 0; //reinicira progreso

  document.getElementById("interpolarCSV").style.display = "";
  document.getElementById("interpolarCSV").style.top = 0 + "%";
  if (metodo === "kriging") {
    metodo_aplicado = metodo;
    if (dat_semivariograma.m !== "") {
      document.getElementById("divProgressInterpolar").style.display = "";
      //document.getElementById("imgLoading").style.display = "";
      document.getElementById("interpolarCSV").style.filter = "blur(0px)";
      document.getElementById("id_variograma").style.display = "none";
      //creamos el worker
      const inicio_time_ko=performance.now();
      wk_kriging = new Worker("/interpoladoresjs/kriging_ordinario.js");
      wk_kriging.onerror = (event) => {
        alert("Error");
        console.log(event);
        document.getElementById("imgLoading").style.display = "none";
        wk_kriging.terminate();
      };
      wk_kriging.postMessage({
        x: x,
        y: y,
        z: z,
        semivariograma: dat_semivariograma,
        pi: puntos_a_interpolar,
        ms: dat_semivariograma.modelo,
      });
      wk_kriging.onmessage = (event) => {
        if (event.data.type === "result") {
          dat_semivariograma.mvt = event.data.mvt;
          var zi = event.data.zi;
          if (B != zi.length / A) {
            B = zi.length / A;
          }
          let opacidad_img = 1;
          if (mapCSVInter.hasLayer(imgOpaci)) {
            mapCSVInter.removeLayer(imgOpaci);
          }
          if (mapCSVInter.hasLayer(imgZonaAlta)) {
            mapCSVInter.removeLayer(imgZonaAlta);
          }

          //DibujarSuperficieInterpolada(data_ovi_max, cantidad_de_cuadrados_por_ladao, zi, "canvasMapZonaAlta", "imgZonaAlta")
          imgZonaAlta = L.imageOverlay(
            DibujarSuperficieInterpolada(
              data_ovi_max,
              cantidad_de_cuadrados_por_ladao,
              zi,
              "canvasMapZonaAlta",
              "imgZonaAlta"
            ),
            [
              [caja[0][1], caja[0][0]],
              [caja[1][1], caja[1][0]],
            ],
            {
              opacity: 1,
            }
          );

          var imgk = L.imageOverlay(
            DibujarSuperficieInterpolada(
              data_ovi_max,
              cantidad_de_cuadrados_por_ladao,
              zi,
              "canvasMap",
              ""
            ),
            [
              [caja[0][1], caja[0][0]],
              [caja[1][1], caja[1][0]],
            ],
            {
              opacity: opacidad_img,
            }
          );
          imgOpaci = imgk;
          imgOpaci.addTo(mapCSVInter);
          addTablaIndicador();
          document.getElementById("divProgressInterpolar").style.display ="none";
          const final_time_ko=performance.now();
          document.getElementById("tiempo_interpolacion").innerHTML=`La interpolación tardó ${((final_time_ko-inicio_time_ko)/1000).toFixed(2)} segundos`
          wk_kriging.terminate();
          ////
        } else if (event.data.type == "progress") {
          document.getElementById("porcentajeInterpolar").innerHTML =
            parseInt(event.data.p) + 1 + "%";
          document.getElementById("progressInter").value =
            parseInt(event.data.p) + 1;
        }
       
      };
    } else {
      alert("Ajuste el semivariograma");
    }
  } else if (metodo === "idw") {
    metodo_aplicado = metodo;
    document.getElementById("divProgressInterpolar").style.display = "";
    //creamos el worker
    const inicio_time_idw= performance.now();
    wk_idw = new Worker("/interpoladoresjs/idw.js");

    wk_idw.onerror = (event) => {
      alert("Error");
      console.log(event);
      //document.getElementById("imgLoading").style.display = "none";
      document.getElementById("divProgressInterpolar").style.display = "none";
      wk_idw.terminate();
    };
    wk_idw.postMessage({
      ovi: ovitrampas,
      pi: puntos_a_interpolar,
      p: document.getElementById("valor_potencia_p").value,
    });
    wk_idw.onmessage = (event) => {
      if (event.data.type == "result") {
        var zi = event.data.zi;
        if (B != zi.length / A) {
          B = zi.length / A;
        }
        let opacidad_img = 1;
        if (mapCSVInter.hasLayer(imgOpaci)) {
          mapCSVInter.removeLayer(imgOpaci);
        }

        if (mapCSVInter.hasLayer(imgZonaAlta)) {
          mapCSVInter.removeLayer(imgZonaAlta);
        }
        imgZonaAlta = L.imageOverlay(
          DibujarSuperficieInterpolada(
            data_ovi_max,
            cantidad_de_cuadrados_por_ladao,
            zi,
            "canvasMapZonaAlta",
            "imgZonaAlta"
          ),
          [
            [caja[0][1], caja[0][0]],
            [caja[1][1], caja[1][0]],
          ],
          {
            opacity: 1,
          }
        );

        imgOpaci = L.imageOverlay(
          DibujarSuperficieInterpolada(
            data_ovi_max,
            cantidad_de_cuadrados_por_ladao,
            zi,
            "canvasMap",
            ""
          ),
          [
            [caja[0][1], caja[0][0]],
            [caja[1][1], caja[1][0]],
          ],
          {
            opacity: opacidad_img,
          }
        );
        imgOpaci.addTo(mapCSVInter);
        addTablaIndicador();
        document.getElementById("divProgressInterpolar").style.display = "none";
        const final_time_idw= performance.now(); 
          document.getElementById("tiempo_interpolacion").innerHTML=`La interpolación tardó ${((final_time_idw-inicio_time_idw)/1000).toFixed(2)} segundos`
        wk_idw.terminate();
      } else if (event.data.type == "progress") {
        document.getElementById("porcentajeInterpolar").innerHTML =
          parseInt(event.data.p) + 1 + "%";
        document.getElementById("progressInter").value =
          parseInt(event.data.p) + 1;
      }
    };
  }
}
function SZA() {
  mapCSVInter.removeLayer(imgOpaci);
  imgZonaAlta.addTo(mapCSVInter);
}

var cantidad_de_cuadrados_por_ladao;

var scope = new L.polyline([0, 0]);

function generarPI(zonaSelect, metodo) {
  mapCSVInter.removeLayer(scope);
  //genear puntos a interpolar
  cantidad_de_cuadrados_por_ladao = metodo == "idw" ? 200 : 200;
  let positions = [];
  //optiene los puntos de la zona  estimar.
  zonaSelect[0].geometry.coordinates[0][0].forEach(function (point) {
    positions.push([point[1], point[0]]);
  });
  //remueve la zona agreagada en mapcsv

  scope = new L.polyline(positions, {
    color: "blue",
  }).addTo(mapCSVInter);

  mapCSVInter.fitBounds(scope.getBounds());
  // Función para redimensionar el mapa
  function resizeMap() {
    mapCSVInter.invalidateSize(); // Notificar a Leaflet que el tamaño ha cambiado
    mapCSVInter.fitBounds(scope.getBounds()); // Ajustar el mapa a los bounds
  }

  // Escuchar el evento de redimensionamiento de la ventana
  resizeMap();
  //window.addEventListener("resize", resizeMap);
  puntos_a_interpolar = [];
  const aumentC = 0.0;
  //[[x1,y1],[x2,y2]]
  caja = crearCajaParaPuntos(positions); //[[Math.min(...x) - aumentC, Math.min(...y) - aumentC], [Math.max(...x) + aumentC, Math.max(...y) + aumentC]]//[[Math.min(...x) , Math.min(...y)], [Math.max(...x)  , Math.max(...y)]]//debe se un cuadrado perfecto
  caja = [
    [caja[0][0] - aumentC, caja[0][1] - aumentC],
    [caja[1][0] + aumentC, caja[1][1] + aumentC],
  ]; //Escalar Caja

  let dA = distance([caja[0][1], caja[0][0]], [caja[0][1], caja[1][0]]);
  let dB = distance([caja[0][1], caja[0][0]], [caja[1][1], caja[0][0]]);

  ///este codigo sirve para crear un cuadrado perfecto
  let dX = 0;
  let dABmax = 0;
  if (dA >= dB) {
    dX = dA - dB;
    caja = [
      [caja[0][0], caja[0][1]],
      [caja[1][0], caja[1][1] + dX],
    ];
    dABmax = distance([caja[0][0], caja[0][1]], [caja[0][0], caja[1][1]]);
    console.log("dA>=dB");
    console.log("caja:", caja);
    console.log("dABmax:", dABmax);
    console.log("dX:", dX);
  }
  if (dB >= dA) {
    dX = dB - dA;
    caja = [
      [caja[0][0], caja[0][1]],
      [caja[1][0] + dX, caja[1][1]],
    ];
    dABmax = distance([caja[0][0], caja[0][1]], [caja[1][0], caja[0][1]]);
    console.log("dB>=dA");
    console.log("caja:", caja);
    console.log("dABmax:", dABmax);
    console.log("dX:", dX);
  }
  //distancia o longitud del cuadrado o caja de su base
  const longitud_de_cuadrado = distance(
    [caja[0][0], caja[0][1]],
    [caja[1][0], caja[0][1]]
  ); //logitud de lado de la caja
  //define el tamano de cada cuadrado
  const tamCuadro = longitud_de_cuadrado / cantidad_de_cuadrados_por_ladao; // Math.ceil(dA / cantidad_de_cuadrados_por_ladao)
  //se generan los puntos a estimar apartir de una malla generada
  puntos_a_interpolar = getPuntosAestimar(
    caja,
    tamCuadro,
    cantidad_de_cuadrados_por_ladao,
    positions
  ); //parametros(cajaDelimitador,tamanoDeCadaCuadradito,CantidadDeCuadradosDeBase)
}

function crearXY(p, min, max) {
  min = 0; // min - (10 * min) / 100
  max = max + 0.3 * max; // max + (30 * max) / 100
  const x_rect = [];
  const y_rect = [];
  for (let i = parseInt(min); i < parseInt(max); i++) {
    x_rect.push(i);
    y_rect.push(i); // p[0] * (i) + p[1]
  }
  return [x_rect, y_rect];
}
var wk_vcross;

function cancelar_vc() {
  enabled_interpolarCSV_div();
  document.getElementById("validacioncruzada").style.display = "none";
  wk_vcross.terminate();
  console.log("Validación cruzada Cancelada.....");
}

function validacionCruzada(metodo_interpolador) {
  disabled_interpolarCSV_div();
  disabled_touch_div_maps();

  document.getElementById("ventana_seleccionar_p").style.display = "none"; //cerrar div de seleccionar paramatro p en IDW
  document.getElementById("divProgressVC").style.display = ""; //div que contiene a process bar
  var file_vc_path =
    metodo_interpolador == "kriging"
      ? "/interpoladoresjs/validacionCruzada.js"
      : "/interpoladoresjs/validacionCruzadaIDW.js";
  wk_vcross = new Worker(file_vc_path);
  if (
    ovitrampas.cantidad_huevos.length >= 500 &&
    metodo_interpolador == "kriging"
  ) {
    wk_vcross.terminate();
    alert("No es posible realizar la V.C con mas de 150 datos");
  } else {
    document.getElementById("validacioncruzada").style.top = 0 + "%";
    document.getElementById("validacioncruzada").style.display = "";
    wk_vcross.onerror = (event) => {
      alert("Error");
      console.log(event);
      wk_vcross.terminate();
    };
    var valor_potencia_p = document.getElementById("valor_potencia_p").value;
    var datos_vc =
      metodo_interpolador == "kriging"
        ? { x: x, y: y, z: z, semivariograma: dat_semivariograma }
        : { ovi: ovitrampas, p: valor_potencia_p };
    wk_vcross.postMessage(datos_vc);
    wk_vcross.onmessage = (e) => {
      if (e.data.type == "result") {
        let error = e.data.error;
        //let promedioError = promedio(error);
        let ve = e.data.ve;
        let zv = e.data.zv;
        let correlacioDeV = calcularCorrelacion(zv, ve);
        document.getElementById("errorpromedio").innerHTML = `
                                Error medio absoluto: ${e.data.error_medio_absoluto.toFixed(
                                  3
                                )} <br>
                                Error cuadratico medio:  ${e.data.error_cuadratico_medio.toFixed(
                                  3
                                )} <br>
                                `;
        document.getElementById("correlaciozv").innerHTML =
          "Correlación(VR,VE):" + correlacioDeV.toFixed(5);
        var dataP = createDP(zv, ve);
        let maxve = Math.max(...ve);
        let maxzv = Math.max(...zv);
        graf_vz.data.datasets[0].data = dataP;

        const max_xy = Math.max(maxzv, maxve);
        //--Editado :: graf_vz.data.datasets[1].data = xy_rect;
        graf_vz.data.datasets[1].data = [
          { x: 0, y: 0 },
          { x: max_xy + 10, y: max_xy + 10 },
        ];
        [chart_error.data.labels, chart_error.data.datasets[0].data] =
          createDPX(error);
        graf_vz.update();
        chart_error.update();
        var tableVC =
          "<tr><th>Valor Real(VR)</th> <th>Valor Estimado(VE)</th><th>Error</th></tr>";
        for (var i = 0; i < error.length; i++) {
          tableVC += `
            <tr>
                <td>${zv[i]}</td>
                <td>${ve[i].toFixed(3)}</td>
                <td>${error[i].toFixed(3)}</td>
            </tr>
         `;
        }
        document.getElementById("tableVC").innerHTML = tableVC;
        document.getElementById("divProgressVC").style.display = "none"; //cerrar div que contiene a process bar
        
        wk_vcross.terminate();
      }
      if (e.data.type == "progress") {
        document.getElementById("progressVC").value = parseInt(e.data.p);
      }
    };
  }
}

function crearMapaDeCalor(zonaV, m_i) {
  document.getElementById("muestra_button_v_interpolar").innerHTML = ""; //borra botones de ventana de interpolar
  //zonaSelect=zonaV
  generarPI(zonaV, m_i); //generar puntos a interpolar
  if (m_i == "kriging") {
    let button_view = `
        <button onclick="showVariograma()"><div class="button_vc"><img src="/images/graf.webp" id="icon_inter"> Ver Semivariograma </div></button>
        <button onclick="validacionCruzada('kriging')"><div class="button_vc"><img src="/images/graf.webp" id="icon_inter">Validación cruzada<div></button>
        <button onclick="ocultarIMG()" id="ocultarIMG"><div class="button_vc"><img src="/images/oculto.webp" id="icon_inter">Ocultar superficie</div></button>
        <button onclick="mostrarIMG()" id="mostrarIMG"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar superficie</div></button>
        <button onclick="dIMG()"><div class="button_vc"><img src="/images/salvar.webp" id="icon_inter">Descargar superficie</div></button>
        <button id="ocultarPuntos" onclick="ocultarPuntos()"><div class="button_vc"><img src="/images/oculto.webp" id="icon_inter">Ocultar Puntos</div></button>
        <button id="mostrarPuntos" onclick="mostrarPuntos()"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar Puntos</div></button>
        <button onclick="SZA()"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar Zonas Altas</div></button>`; //<button onclick="showError()"><img src="/images/ojo.webp" id="icon_inter">Mostrar Res. validacion cruzada</button>`
    document.getElementById("muestra_button_v_interpolar").innerHTML =
      button_view;
    //document.getElementById("interpolarCSV").style.filter = "blur(5px)";
    crear_SemiVariograna_Experimental();
  } else if (m_i == "idw") {
    let button_view = `<button onclick="ajustarP()"><div class="button_vc"> <img src="/images/graf.webp" id="icon_inter">Seleccionar parametro <strong>p</strong></div></button>
        <button  onclick="ocultarIMG()" id="ocultarIMG"><div class="button_vc"><img src="/images/oculto.webp" id="icon_inter">Ocultar superficie</div></button>
        <button onclick="mostrarIMG()" id="mostrarIMG"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar superficie</div></button>
        <button onclick="dIMG()"><div class="button_vc"><img src="/images/salvar.webp" id="icon_inter">Descargar superficie</div></button>
        <button id="ocultarPuntos" onclick="ocultarPuntos()"><div class="button_vc"><img src="/images/oculto.webp" id="icon_inter">Ocultar Puntos</div></button>
        <button id="mostrarPuntos" onclick="mostrarPuntos()"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar Puntos</div></button>
        <button onclick="SZA()"><div class="button_vc"><img src="/images/ojo.webp" id="icon_inter">Mostrar Zonas Altas</div></button>`;
    document.getElementById("muestra_button_v_interpolar").innerHTML =
      button_view;
    interpolar(m_i);
  }
}

function mapaCalor(nombre_colonia, gid, type_dat, metodo_interpolacion) {
  disabled_touch_div_maps();
  if (type_dat === "type_csv") {
    //si proviene de un csv y el id de zona pertenece a alguna zona del fileZonaAcapulco.json
    abrirCrearInterpolacion(
      nombre_colonia,
      gid,
      "type_csv",
      metodo_interpolacion
    );
  } else if (type_dat === "type_csv_no_zona") {
    //si proviene de un csv y el id no esta en filezonaaca.json
    abrirCrearInterpolacion(
      nombre_colonia,
      gid,
      "type_csv_no_zona",
      metodo_interpolacion
    );
  }
}
//ocular / mostrar puntos
function ocultarPuntos() {
  groupCircleCSV.remove();
}

function mostrarPuntos() {
  groupCircleCSV.addTo(mapCSVInter);
}
//ocular / mostrar Marcadores
function addMarcadores() {
  groupMakersCSV.addTo(mapCSVInter);
}

function ocultarMarcadores() {
  groupMakersCSV.remove();
}

//redireccionar a Ventana de Mapa de calor
function abrirCrearInterpolacion(nombre_colonia, gid, type_dat, m_i) {
  //nombre_colonia, gid, "type_csv", metodo_interpolacion
  //value
  //document.getElementById("interpolarCSV").style.display = "";
  document.getElementById("interpolarCSV").style.top = 0 + "%";
  document.getElementById("nomColInterp").innerHTML =
    "Colonia : " + nombre_colonia; //+paramsValue[0].zona;

  document
    .getElementById("agregar-marcadoresCSV")
    .addEventListener("click", function () {
      groupMakersCSV.addTo(mapCSVInter);
    });
  document
    .getElementById("remover-marcadoresCSV")
    .addEventListener("click", function () {
      groupMakersCSV.remove();
    });

  //elimina la imagen si esta en el mapa
  if (mapCSVInter.hasLayer(imgOpaci)) {
    mapCSVInter.removeLayer(imgOpaci);
  } //imgZonaAlta
  if (mapCSVInter.hasLayer(imgZonaAlta)) {
    mapCSVInter.removeLayer(imgZonaAlta);
  }

  //document.getElementById("imgLoading").style.display = ""; //muestra la imagen en mapCSVInter
  //groupCirclesCSV.remove()

  positions = [];
  ovitrampas = [];
  markersCSV = [];
  circlesCSV = [];

  var nombreColonia = "";
  for (var i = 0; i < data_ovi_csv.length; i++) {
    if (gid === data_ovi_csv[i].gid) {
      ovitrampas = data_ovi_csv[i];
      nombreColonia = data_ovi_csv[i].nom_col;
      break;
    }
  }
  console.log(ovitrampas);
  groupMakersCSV.remove(); //remueve
  groupCircleCSV.remove(); //remueve circulos de add
  let content_popupCSV = ``;
  for (var i = 0; i < ovitrampas.latitud.length; i++) {
    ///RADIO=(parseInt(ovitrampas[i].cantidad_huevos)*100)/(Est_Des_Data.data_max)
    content_popupCSV = `
        <div class="popup">
        <div class="colonia"><strong> COLONIA ${nombreColonia} </strong><br><hr></div>
            <div class="coordenadas_title"><strong>COORDENADAS</strong> </div>
            <div class="coordenadas">[${ovitrampas.latitud[i]},${ovitrampas.longitud[i]}] </div> 
            <div class="cantidad_title"> <strong>CANTIDAD DE HUEVOS</strong></div>
            <div class="cantidad">${ovitrampas.cantidad_huevos[i]}</div>
        </div>
        `;
    circlesCSV[i] = L.circle(
      [ovitrampas.latitud[i], ovitrampas.longitud[i]],
      (parseInt(ovitrampas.cantidad_huevos[i]) * 100) / data_ovi_max,
      {
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
        fillColor: getC(ovitrampas.cantidad_huevos[i], data_ovi_max),
        fill: true,
        color: "black",
      }
    );
    markersCSV[i] = L.marker([ovitrampas.latitud[i], ovitrampas.longitud[i]], {
      color: "red",
      draggable: false,
      title:
        "Ovitrampa" +
        (i + 1) +
        ": Cantidad de Huevos : " +
        ovitrampas.cantidad_huevos[i],
    });
    markersCSV[i].bindPopup(content_popupCSV);
  }
  groupCircleCSV = L.layerGroup(circlesCSV);
  //groupCircleCSV.addTo(mapCSVInter);
  groupMakersCSV = L.layerGroup(markersCSV);
  //groupMakersCSV.addTo(mapCSVInter);

  var zona;
  if (type_dat === "type_csv_no_zona") {
    zona = zonaGeneral; ///agrega las zonas al mapa
    for (var i = 0; i < zonaGeneral.length; i++) {
      if (zonaGeneral[i].properties.gid === gid) {
        zona = [zonaGeneral[i]];
        break;
      }
    }
    crearMapaDeCalor(zona, m_i);
  } else {
    fetch("/getZona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gid: [gid], //[paramsValue[0].zona_id]
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        zona = data.zona; ///agrega las zonas al mapa
        crearMapaDeCalor(zona, m_i);
      });
  }
}

//document.getElementById('mostrarIMG').addEventListener("click", function () {
//layerGroup.addTo(map);
function mostrarIMG() {
  imgZonaAlta.addTo(mapCSVInter);
  imgOpaci.addTo(mapCSVInter);
}
//})
//document.getElementById('ocultarIMG').addEventListener("click", function () {
//map.removeLayer(layerGroup)
function ocultarIMG() {
  mapCSVInter.removeLayer(imgZonaAlta);
  mapCSVInter.removeLayer(imgOpaci);
}
//});
//funcion para cerrar la ventana del semivariograma
function closeVariograma() {
  enabled_interpolarCSV_div();

  document.getElementById("interpolarCSV").style.filter = "blur(0px)";
  document.getElementById("id_variograma").style.display = "none";
}

function showVariograma() {
  disabled_interpolarCSV_div(); 
  document.getElementById("id_variograma").style.display = "";
  document.getElementById("interpolarCSV").style.filter = "blur(5px)";
}

function dIMG() {
  const canvas = document.querySelector("#canvasMap");
  let enlace = document.createElement("a");
  // El título
  let nameAleatorio = Math.floor(Math.random() * 100000).toString();
  enlace.download = "MAPA_" + nameAleatorio + ".PNG";
  // Convertir la imagen a Base64 y ponerlo en el enlace
  enlace.href = canvas.toDataURL("image/jpeg", 1);
  // Hacer click en él
  enlace.click();
}

function closeError() {
  enabled_interpolarCSV_div();
  document.getElementById("validacioncruzada").style.display = "none";
}

function showError() {
  document.getElementById("validacioncruzada").style.display = "";
}

function closeSelectP() {
  document.getElementById("ventana_seleccionar_p").style.display = "none";
}

function ajustarP() {
  document.getElementById("ventana_seleccionar_p").style.display = "";
}

//funcionde de simulacion de datos
function generarValidacionCruzada_test() {
  var tableVC =
    "<tr><th>Valor Real(VR)</th> <th>Valor Estimado(VE)</th><th>Error</th></tr>";
  for (var i = 0; i < 40; i++) {
    tableVC += `
    <tr>
    <td>${parseInt(Math.random() * 100)}</td>
    <td>${parseInt(Math.random() * 100)}</td>
    <td>${Math.random()}</td>
    </tr>
`;
  }
  document.getElementById("tableVC").innerHTML = tableVC;
}
