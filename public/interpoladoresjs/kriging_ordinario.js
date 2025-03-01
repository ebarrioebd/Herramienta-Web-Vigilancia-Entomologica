//libreria math.js
importScripts('math.min.js');
//modelos del semivariograma teorico
importScripts('modelosTeoricosSemivariograma.js');


function estimar(lat, long, variograma, x, y, z, mvt_inv, m_s) {
    ////remplace//console.log("estimar:",variograma.nugget,variograma.sill_parcial,modelExp((Math.pow(Math.pow(lat - x[0], 2) + Math.pow(long - y[0], 2), 0.5)) * 100000,variograma.rango))      

    let _Y = [];
    for (let i = 0; i < x.length; i++) {
        _Y[i] = [variograma.nugget + variograma.sill_parcial * modelExp((Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5)) * 100000, variograma.rango, m_s)]
        // console.log(_Y[i],"d:",Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5)* 100000,"c0",variograma.nugget,"c1:",variograma.sill_parcial,"a:",variograma.rango)   
    }
    _Y[x.length] = [1]
    //calulor de los pesos y el parametro de lagrange
    let pesos = math.multiply(mvt_inv, _Y)
    pesos = pesos.slice(0, x.length);
    return math.multiply(math.transpose(pesos), z)[0]
}

self.addEventListener('message', function (e) {
    let m_s = e.data.semivariograma.modelo // e.data.ms//modelo del semivariograma
    let x = e.data.x
    let y = e.data.y
    let z = e.data.z
    let puntos_i = e.data.pi
    let variograma = e.data.semivariograma;
    //crear Matriz de variograma Teorico
    let n = x.length;
    //conseguir la Matriz del Variograma Teorico de los puntos de muestra
    console.time("mvt")
    let mvt = Array(n + 1).fill(1).map(() => Array(n + 1).fill(1));

    for (let i = 0; i < n; i++) {
        z[i] = [z[i]]
        for (let j = i; j < n; j++) {
            mvt[i][j] = variograma.nugget + variograma.sill_parcial * modelExp(Math.sqrt(Math.pow(x[i] - x[j], 2) + Math.pow(y[i] - y[j], 2)) * 100000, variograma.rango, m_s)
            mvt[j][i] = mvt[i][j]
        }
    }
    console.timeEnd("mvt")
    mvt[n][n] = 0;

    //cambio de nugget y sill_partial en Ajuste manual
    if (variograma.m === "ajusteManual") {
        variograma.nugget = variograma.nugget2;
        variograma.sill_parcial = variograma.sill_parcial2;
        variograma.sill = variograma.sill2;
    }
    console.log(variograma)
    //fin de cambio para ajuste manual

    const progreso = 0;
    console.time("invM")
    //###let matriz_variograma_teorico = invM(mvt);
    //##console.log("invMVT1:",matriz_variograma_teorico);
    let matriz_variograma_teorico = math.inv(mvt)
    console.log("invMVT:",matriz_variograma_teorico);


    let zi = [], k = 0;
    console.time("estimar")
    let ipi = parseInt(puntos_i.length / 10)
    for (let i = 0; i < puntos_i.length; i++) {
        zi[k] = -1;
        if (puntos_i[i].length > 0) {
            zi[k] = estimar(puntos_i[i][0], puntos_i[i][1], variograma, x, y, z, matriz_variograma_teorico, m_s)[0];
        }
        // else {
        //   zi[k] = -1;
        //}
        if (i % ipi == 0) { self.postMessage({ type: "progress", p: (i * 100) / puntos_i.length }) }
        k++;
    } //findefor 
    console.timeEnd("estimar")
    self.postMessage({ type: "result", zi: zi, mvt: [] })

})