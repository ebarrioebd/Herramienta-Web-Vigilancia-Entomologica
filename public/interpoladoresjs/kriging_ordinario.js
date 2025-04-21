//libreria math.js
// ko.js (Web Worker) - Versión liviana sin math.js

// ======================
// Funciones personalizadas
// ======================

// 1. Transpuesta de una matriz
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

function estimar(lat, long, variograma, x, y, z, mvt_inv, m_s) {
    ////remplace//console.log("estimar:",variograma.nugget,variograma.sill_parcial,modelExp((Math.pow(Math.pow(lat - x[0], 2) + Math.pow(long - y[0], 2), 0.5)) * 100000,variograma.rango))      

    let _Y = [];
    for (let i = 0; i < x.length; i++) {
        _Y[i] = [variograma.nugget + variograma.sill_parcial * modelExp((Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5)) * 100000, variograma.rango, m_s)]
        // console.log(_Y[i],"d:",Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5)* 100000,"c0",variograma.nugget,"c1:",variograma.sill_parcial,"a:",variograma.rango)   
    }
    _Y[x.length] = [1]
    //calulor de los pesos y el parametro de lagrange
    let pesos = multiply(mvt_inv, _Y)
    pesos = pesos.slice(0, x.length);
    return multiply(transpose(pesos), z)[0]
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
    let matriz_variograma_teorico = inv(mvt)


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