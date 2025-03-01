
function d(x, y) {
    return Math.sqrt(Math.pow(y[0] - x[0], 2) + Math.pow(y[1] - x[1], 2))*100000;
}
function numMax(array) {
    return array.reduce((max, val) => (val > max ? val : max), -Infinity);
}
function numMin(array) {
    return array.reduce((min, val) => (val < min ? val : min), Infinity);
}
function getVariograma(x, y, z) {
    let distancias = [];
    let semivarianzas = [];
    for (let i = 0; i < x.length; i++) {
        for (let j = i + 1; j < x.length; j++) {
            distancias.push(d([x[i], y[i]], [x[j], y[j]]));
            semivarianzas.push(Math.abs(z[j] - z[i]))
        }
    }
    const maximaDistancia = numMax(distancias)
    const minDistancia = numMin(distancias);
    const n_intervalos = 50;
    let pares = Array(n_intervalos).fill(0);
    let semi = Array(n_intervalos).fill(0);
    //aplicando la regla de 3 se encuentra el indice para cada intervalo
    //MaximaDistancia ===== >>  n_intervalos ={1,2,...,n}
    //distancia(x)    ===== >>  i E {1,2,...,n}
    //indice =(distancia(x)*n_intervalos)/MaximaDistancia;
    let indice = 0;
    for (let i = 0; i < distancias.length; i++) {
        indice = Math.floor((distancias[i] * n_intervalos) / maximaDistancia);
        if (indice < n_intervalos) {
            pares[indice] += 1;
            semi[indice] += semivarianzas[i];
        }
    }
    let data = { lags: [], semi: [], rango: maximaDistancia - minDistancia}
    for (let i = 0; i < n_intervalos; i++) {
        if (pares[i] > 0) {
            data.semi.push(0.5 * semi[i] / pares[i])
            data.lags.push(i * (maximaDistancia / n_intervalos))
        }
    }
    return data;
}
//return { rango: parseInt(rango), lags: lagsemi, semi: semiva }
self.addEventListener('message', function (e) {
    let inf_ovi = e.data.ovi;
    let x = []
    let y = []
    let z = []
    for (let i = 0; i < inf_ovi.latitud.length; i++) { 
        z.push(inf_ovi.cantidad_huevos[i]);
        x.push(parseFloat(inf_ovi.longitud[i]));
        y.push(parseFloat(inf_ovi.latitud[i]));
    }
    let variograma = getVariograma(x, y, z);
    postMessage({ variograma: variograma, x: x, y: y, z: z })
});