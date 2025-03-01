//libreria math.js
importScripts('math.min.js');
//modelos del semivariograma teorico
importScripts('modelosTeoricosSemivariograma.js');

//minimos cuadrados ordinarios
function OrdinaryLeastsquares(X, Y, h, a, m_s) {
    //funcion exponencial 
    //genera valores del variogrma teorico del valor de Xs
    for (var i = 0; i < Y.length; i++) {
        X[i][1] = modelExp(h[i], a, m_s)
        //X[i][1] = 1.0 - Math.exp(-(1.0 / (1 / 3)) * h[i] / a); // 1.0 - Math.exp(-(1.0 / A) * lagsemi[i] /rango );
    } 
    //se ajusta el variograma teorico
    var Xt = math.transpose(X) // math.transpose(X) 
    var XtX = math.multiply(Xt, X) //math.multiply(Xt, X) 
    var XtXinv = math.inv(XtX); 
    var xinvxt = math.multiply(XtXinv, Xt)
    var ny = Y.length;
    var ya = Array(ny).fill().map(() => Array(ny).fill(0));
    for (var i = 0; i < ny; i++) {
        ya[i] = [Y[i]];
    } 
    return math.multiply(xinvxt, ya);
}
self.addEventListener('message', function (e) { 
    console.time("mcoTime")
    let Y = e.data[0].semi;
    let X = Array(Y.length).fill().map(() => Array(2).fill(1));
    //W0,W1 son los valores que minimizan el error (Y(h,W)-Y*(h))^2 y w0,w1 ajustan  Y(h,W) a los valores de Y*(h) 
    let W = OrdinaryLeastsquares(X, Y, e.data[0].lags, e.data[0].rango, e.data[1]);  
    postMessage([W[0][0], W[1][0]])
});