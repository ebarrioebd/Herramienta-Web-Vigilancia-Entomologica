//libreria math.js
//importScripts('math.min.js');
//modelos del semivariograma teorico
//importScripts('modelosTeoricosSemivariograma.js');
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
//minimos cuadrados ordinarios
function OrdinaryLeastsquares(X, Y, h, a, m_s) {
    //funcion exponencial 
    //genera valores del variogrma teorico del valor de Xs
    for (var i = 0; i < Y.length; i++) {
        X[i][1] = modelExp(h[i], a, m_s)
        //X[i][1] = 1.0 - Math.exp(-(1.0 / (1 / 3)) * h[i] / a); // 1.0 - Math.exp(-(1.0 / A) * lagsemi[i] /rango );
    }
    //se ajusta el variograma teorico
    var Xt = transpose(X) // math.transpose(X) 
    var XtX = multiply(Xt, X) //math.multiply(Xt, X) 
    var XtXinv = inv(XtX);
    var xinvxt = multiply(XtXinv, Xt)
    var ny = Y.length;
    var ya = Array(ny).fill().map(() => Array(ny).fill(0));
    for (var i = 0; i < ny; i++) {
        ya[i] = [Y[i]];
    }
    return multiply(xinvxt, ya);
}
self.addEventListener('message', function (e) {
    console.time("mcoTime")
    let Y = e.data[0].semi;
    let X = Array(Y.length).fill().map(() => Array(2).fill(1));
    //W0,W1 son los valores que minimizan el error (Y(h,W)-Y*(h))^2 y w0,w1 ajustan  Y(h,W) a los valores de Y*(h) 
    let W = OrdinaryLeastsquares(X, Y, e.data[0].lags, e.data[0].rango, e.data[1]);
    postMessage([W[0][0], W[1][0]])
});