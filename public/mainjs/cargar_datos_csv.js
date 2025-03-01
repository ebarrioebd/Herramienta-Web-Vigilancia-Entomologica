/**
 * Prepara los datos antes de ser analizados
 */
function button_inactivo(valor, c) {
  var boton = document.getElementById("bsubmit");
  boton.disabled = valor;
  boton.style.background = c;
}
let data_ovi_csv = []; //guarda solo los datos del archivo que se selecciono 
/**
 * Prepara datos de un archivo .csv
 * Cargar datos desde Archivo csv
 */
//abre un div flotante para seleccionar el file.csv
function fileSelect() {
  document.getElementById("cont").style.filter = "blur(14px)";
  document.getElementById("filecsv").style.display = "";
  disabled_touch_div_maps();
  agregarDatosAtablaCSV(data_ovi_csv)
  seleccionDeZonasEnCSV(data_ovi_csv)

} //colors//rango
function closedivCSV() {
  document.getElementById("cont").style.filter = "blur(0px)";
  document.getElementById("filecsv").style.display = "none";
  enabled_touch_div_maps();
} 
//------------------------ nuevo ---------------------------//
function seleccionDeZonasEnCSV(datos) {
    console.log(datos);
    let selectZonaCSV = "";
    for (var i = 0; i < datos.length; i++) {
      selectZonaCSV += `
          <div class="row">
          <div  style=" padding-top: 4px;" >
              <input class="boxCSV" checked type="checkbox" value="${datos[i].gid}" id="">
          </div>
          <div  style=" width:100%;      margin-left: 10px; padding: 0">
          <select id="${datos[i].gid}-CSV" class="cCSV" onChange="ir_url(this)">
          <option >${datos[i].nom_col}</option> 
      </select>
      </div>
      </div>
      <br>
      `;
    }
    document.getElementById("selectCSV").innerHTML = selectZonaCSV;
    slectZonaCSV = "";
  }
function obtenerDatosSeleccionados() {
  //arr = arr.filter(item => item.id && idsPermitidos.includes(item.id));
  let idsPermitidos = [];
  $("input:checkbox.boxCSV").each(function () {
    if ($(this)[0].checked) {
      idsPermitidos.push($(this).val());
    }
  });
  console.log("idsPermitidos::", idsPermitidos);
  if (idsPermitidos.length > 0) {
    data_ovi_csv = data_ovi_csv.filter(
      (item) => item.gid && idsPermitidos.includes(item.gid)
    );
    console.log(data_ovi_csv);
    //se agregan solo los elementos que son seleccionados
    generarEstdisticosDescriptivos();
    closedivCSV();
  } else {
    alert("Seleccione una Colonia.");
  }
}
//mostrar datos del archivo de colonias(Acapulco)
function abrirColoniasInfo() {
  window.open(
    window.location.origin + "/info_colonias_acapulco_inegi_2010",
    "popup",
    "width=" +
      (screen.width - 300) +
      ", height=" +
      (screen.height - 100) +
      ", left=" +
      10 +
      ", top=" +
      10 +
      ""
  );
}

function agregarDatosAtablaCSV(datos) {
  let headers = [
    "Latitud",
    "Longitud",
    "gid",
    "Nombre de Colonia",
    "Cantidad de huevos",
  ];
  let tabla = `<table> 
                    <th>${headers[0]}</th>
                    <th>${headers[1]}</th>
                    <th>${headers[2]}</th>
                    <th>${headers[3]}</th>
                    <th>${headers[4]}</th>
            `;
  for (let i = 0; i < datos.length; i++) {
    for (let j = 0; j < datos[i].latitud.length; j++) {
      tabla += `<tr>
                    <td>${datos[i].latitud[j]}</td>
                    <td>${datos[i].longitud[j]}</td>
                    <td>${datos[i].gid}</td>
                    <td>${datos[i].nom_col}</td>
                    <td>${datos[i].cantidad_huevos[j]}</td>
                </tr>`;
    }
  }
  document.getElementById("csv_table").innerHTML = tabla + `<table>`;
}
document
  .getElementById("fileInputCSV")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        processCSV(text);
      };
      reader.readAsText(file);
    }
  });

function processCSV(csvText) {
  try{
  const lines = csvText.split("\n");
  const headers = lines[0].split(",").map((header) => header.trim()); // Guardar encabezados
  const data = lines.slice(1); // Ignorar la primera línea (encabezados)
  const groupedData = {};
  data.forEach((line) => {
    const values = line.split(",").map((value) => value.trim());
    if (values.length === headers.length) {
      const gid = values[2]; // Asumiendo que gid es el tercer campo
      if (!groupedData[gid]) {
        groupedData[gid] = {
          latitud: [],
          longitud: [],
          gid: "", //[],
          nom_col: "", // [],
          cantidad_huevos: [],
        };
      }
      groupedData[gid].latitud.push(parseFloat(values[0]));
      groupedData[gid].longitud.push(parseFloat(values[1]));
      groupedData[gid].gid = values[2]; //.push(values[2]);
      groupedData[gid].nom_col = values[3]; //.push(values[3])
      groupedData[gid].cantidad_huevos.push(parseInt(values[4]));
    }
  });
  data_ovi_csv = Object.values(groupedData); // Convertir a array de grupos
  console.log("Encabezados:", headers);
  console.log("Datos agrupados:", data_ovi_csv);
  //agregar Datos a la tabla para mostrar su contenido
  agregarDatosAtablaCSV(data_ovi_csv, headers);
  //obtiene nombre de las colonias para poder seleccionar las zonas a analizar
  seleccionDeZonasEnCSV(data_ovi_csv);
  document.getElementById("bCSV").innerHTML =
    "<strong style='font-size: inherit;color: #58ff00;'>" +
    document.getElementById("fileInputCSV").files[0].name +
    "</strong>";
  document.getElementById("fileInputCSV").value = "";
  }catch(err){
    alert("Error")
  }
}
