//libreria math.js
importScripts("math.min.js");
//modelos del semivariograma teorico
importScripts("modelosTeoricosSemivariograma.js");

function estimar(lat, long, nugget, sill_parcial, rango, x, y, z, mvt, m_s) {
  ////remplace//console.log("estimar:",variograma.nugget,variograma.sill_parcial,modelExp((Math.pow(Math.pow(lat - x[0], 2) + Math.pow(long - y[0], 2), 0.5)) * 100000,variograma.rango))

  let _Y = [];
  for (let i = 0; i < x.length; i++) {
    _Y[i] = [
      nugget +
        sill_parcial *
          modelExp(
            Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5) *
              100000,
            rango,
            m_s
          ),
    ];
    // console.log(_Y[i],"d:",Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5)* 100000,"c0",variograma.nugget,"c1:",variograma.sill_parcial,"a:",variograma.rango)
  }
  _Y[x.length] = [1];
  //calulor de los pesos y el parametro de lagrange
  let pesos = math.multiply(mvt, _Y);
  pesos = pesos.slice(0, x.length);
  return math.multiply(math.transpose(pesos), z)[0];
}
self.addEventListener("message", function (e) {
  console.time("VCtime");
  let variograma = e.data.semivariograma;
  let v_estimados = [];
  let cantidad_de_puntos_a_estimar = 130; // e.data.x.length
  let x = e.data.x.splice(0, cantidad_de_puntos_a_estimar);

  let y = e.data.y.splice(0, cantidad_de_puntos_a_estimar);

  let z = e.data.z.splice(0, cantidad_de_puntos_a_estimar);

  let n =
    x.length > cantidad_de_puntos_a_estimar
      ? cantidad_de_puntos_a_estimar
      : x.length;
  let ipn = parseInt(n / 10);
  for (let k = 0; k < n; k++) {
    let lat = x.slice();
    let lat_inter = lat.splice(k, 1)[0];
    let long = y.slice();
    let long_inter = long.splice(k, 1)[0];
    let zv = z.slice();
    zv.splice(k, 1);
    let nc = lat.length;
    let mvt = Array(nc + 1)
      .fill(1)
      .map(() => Array(nc + 1).fill(1));
    for (let i = 0; i < nc; i++) {
      zv[i] = [zv[i]];
      for (let j = i; j < nc; j++) {
        mvt[i][j] =
          variograma.nugget +
          variograma.sill_parcial *
            modelExp(
              Math.pow(
                Math.pow(lat[j] - lat[i], 2) + Math.pow(long[j] - long[i], 2),
                0.5
              ) * 100000,
              variograma.rango,
              variograma.modelo
            );
        mvt[j][i] = mvt[i][j];
      }
    }
    mvt[nc][nc] = 0;

    let matriz_variograma_teorico = math.inv(mvt);
    //cambio de nugget y sill_partial en Ajuste manual
    if (variograma.m === "ajusteManual") {
      v_estimados[k] = estimar(
        lat_inter,
        long_inter,
        variograma.nugget2,
        variograma.sill_parcial2,
        variograma.rango2,
        lat,
        long,
        zv,
        matriz_variograma_teorico,
        variograma.modelo
      )[0];
    } else {
      v_estimados[k] = estimar(
        lat_inter,
        long_inter,
        variograma.nugget,
        variograma.sill_parcial,
        variograma.rango,
        lat,
        long,
        zv,
        matriz_variograma_teorico,
        variograma.modelo
      )[0];
    }
    //fin de cambio para ajuste manual
    if (k % ipn == 0) {
      postMessage({ type: "progress", p: (k * 100) / n });
    }
  }
  console.time("errorTime"); 
  ///*
  let list_error = [];
  let ema = 0; //error medio absoluto
  let ecm = 0; //error cuadratico medio
  for (var i = 0; i < v_estimados.length; i++) {
    let error = z[i] - Math.abs(v_estimados[i]);
    list_error.push(error);
    ema += Math.abs(error);
    ecm += Math.pow(error, 2);
  }
  ema = ema / v_estimados.length;
  ecm = ecm / v_estimados.length;
  //
  console.timeEnd("errorTime");
  console.timeEnd("VCtime");
  postMessage({
    type: "result",
    ve: v_estimados,
    zv: z,
    error: list_error,
    error_medio_absoluto: ema,
    error_cuadratico_medio: ecm,
  });
});
