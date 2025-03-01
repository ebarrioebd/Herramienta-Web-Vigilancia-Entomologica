function Zi(centro, x, y, z, exp, maxDistance) {
  let d = 0;
  let s1 = 0; // new Array();
  let s2 = 0; // new Array();
  for (let i = 0; i < x.length; i++) {
    d = Math.sqrt(
      Math.pow(parseFloat(x[i]) - centro[0], 2) +
        Math.pow(parseFloat(y[i]) - centro[1], 2)
    ); //* 100000;

    s1 += z[i] / Math.pow(d, exp);
    s2 += 1 / Math.pow(d, exp);
  }

  return s1 / s2;
}

self.addEventListener("message", function (e) {
  console.time("t1");
  var x = [],
    y = [],
    z = [];
  var dataovi = e.data.ovi;
  for (var i = 0; i < dataovi.latitud.length; i++) {
    x[i] = dataovi.latitud[i];
    y[i] = dataovi.longitud[i];
    z[i] = dataovi.cantidad_huevos[i];
  }
  var p = e.data.p;
  let n = x.length;
  var ve = [];
  var vr = [];
  var err = [];
  for (var k = 0; k < n; k++) {
    let lat = x.slice();
    let lat_inter = lat.splice(k, 1)[0];
    let long = y.slice();
    let long_inter = long.splice(k, 1)[0];
    let zv = z.slice();
    zv.splice(k, 1);
    ve[k] = Zi([lat_inter, long_inter], lat, long, zv, p, 200);
    vr[k] = z[k];
    err[k] = ve[k] - vr[k];
    postMessage({ type: "progress", p: (k * 100) / n });
  }
  let list_error = [];
  let ema = 0; //error medio absoluto
  let ecm = 0; //error cuadratico medio
  for (var i = 0; i < ve.length; i++) {
    let error = z[i] - ve[i];
    list_error.push(error);
    ema += Math.abs(error);
    ecm += Math.pow(error, 2);
  }
  ema = ema / ve.length;
  ecm = ecm / ve.length;
  console.timeEnd("t1");
  postMessage({
    type: "result",
    ve: ve,
    zv: z,
    error: list_error,
    error_medio_absoluto: ema,
    error_cuadratico_medio: ecm,
  });
});
