function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}
// 2. Multiplicación de matrices (A * B)
function multiply(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) throw new Error('Dimensiones incompatibles para multiplicación');

  const result = new Array(rowsA);
  for (let i = 0; i < rowsA; i++) {
      result[i] = new Array(colsB).fill(0);
      for (let j = 0; j < colsB; j++) {
          for (let k = 0; k < colsA; k++) {
              result[i][j] += A[i][k] * B[k][j];
          }
      }
  }
  return result;
}

// 3. Inversa de una matriz (usando eliminación gaussiana)
function inv(matrix) {
  const n = matrix.length;
  const identity = Array(n).fill().map((_, i) =>
      Array(n).fill().map((_, j) => (i === j ? 1 : 0))
  );

  const augmented = matrix.map((row, i) => [...row, ...identity[i]]);

  // Eliminación hacia adelante
  for (let i = 0; i < n; i++) {
      // Pivoteo parcial (para evitar división por cero)
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
          if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
              maxRow = j;
          }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Normalizar fila pivote
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) throw new Error('Matriz singular (no invertible)');

      for (let j = i; j < 2 * n; j++) {
          augmented[i][j] /= pivot;
      }

      // Eliminación en otras filas
      for (let k = 0; k < n; k++) {
          if (k !== i && Math.abs(augmented[k][i]) > 1e-10) {
              const factor = augmented[k][i];
              for (let j = i; j < 2 * n; j++) {
                  augmented[k][j] -= factor * augmented[i][j];
              }
          }
      }
  }

  // Extraer la inversa (parte derecha de la matriz aumentada)
  return augmented.map(row => row.slice(n));
}
//modelos del semivariograma teorico
//importScripts('modelosTeoricosSemivariograma.js');
function modelExp(h, a, m_s) {
  switch (m_s) {
      case "exp":
          return (1.0 - Math.exp(-3 * (h / a))) //exponecial
      case "gauss":
          return (1.0 - Math.exp(-3 * Math.pow(h / a, 2))) //gaussiano
      case "esf":
          return h > a ? 1 : ((3 / 2) * (h / a) - (1 / 2) * Math.pow(h / a, 3)) //esferico
  }
}
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
  let pesos = multiply(mvt, _Y);
  pesos = pesos.slice(0, x.length);
  return multiply(transpose(pesos), z)[0];
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

    let matriz_variograma_teorico = inv(mvt);
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
