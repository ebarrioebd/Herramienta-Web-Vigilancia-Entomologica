function distance(x, y) {//x=[,],y=[,]
    return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2));
}
function getC(v, maximo) {
    var z = v / maximo
    if (z < 0) { z = 0 } else if (z > 1) { z = 1 } else if (isNaN(z)) { z = 0 }
    return colors[Math.floor((colors.length - 1) * z)]
}
//ver punto dentro del poligono

function puntoDentroPoligono(punto, poligono) { 
    /**
     * Verifica si un punto esta dentro de un poligono.
     */
    let x = punto[0], y = punto[1];
    let dentro = false;
    for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
        let xi = poligono[i][0], yi = poligono[i][1];
        let xj = poligono[j][0], yj = poligono[j][1];
        let intersecta = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersecta) dentro = !dentro;
    }
    return dentro;
}
//generer puntos
function getPuntosAestimar(box, tc, cantC, poligono) {//generas puntos para interpolar, caja y tamano de cuadros son argumentos
    /**
     * los puntos seran generados de abajo hacia  arriba y de izq a derecha,
     * --------->0
     * --------->n-y+1
     * --------->n-y...
     * aumentando solo en y para bajar
     */ 
      
    
    let pi = [];//array de los puntos a interpolar
    const [x, y] = [box[0][0], box[0][1]] 
    const p0 = [x + tc / 2, y + tc / 2]; 
    let x0 = p0[0]
    let y0 = p0[1];
    let k = 0;
    for (let j = 0; j < cantC; j++) {
        for (let i = 0; i < cantC; i++) {
            if (puntoDentroPoligono([y0, x0], poligono)) {
                pi[k] = [x0, y0];
            } else {
                pi[k] = [];
            }
            x0 += tc;
            k++;
        }
        y0 += tc;
        x0 = p0[0];
    }
    return pi;
}
function idw(px, py, x, y, z) {
    let exp = 2
    let d = 0;
    let s1 = 0 // new Array();
    let s2 = 0 // new Array(); 
    for (let i = 0; i < x.length; i++) {
        d = distance([x[i], y[i]], [px, py])
        s1 += z[i] / Math.pow(d, exp);
        s2 += 1 / Math.pow(d, exp);
    } 
    return s1 / s2
}
function estimarPuntos(pi, x, y, z) {
    let p = []
    for (let i = 0; i < pi.length; i++) {
        if (pi[i].length > 0) {
            p[i] = idw(pi[i][0], pi[i][1], x, y, z);
        }
        else {
            p[i] = -1;
        }
    } 
    return p;

}
function DibujarSuperficieInterpolada(max,cantidad_cuadros, pi,id,imgOpcion) {
    var mayorDato = imgOpcion === "imgZonaAlta" ? 4 * (max / colors.length) : 0; 
    const canva = document.getElementById(id);
    canva.width = 1000;
    canva.height = 1000;
    let wc = canva.width;
    let hc = canva.height;
    let ctx = canva.getContext('2d')
    let x = 0, y = hc - hc / cantidad_cuadros; 
    let k = 0;
    const quit=0;
    for (let j = 0; j < cantidad_cuadros; j++) {
        for (let i = 0; i < cantidad_cuadros; i++) {
            if (pi[k] >= 0 && pi[k] >= mayorDato) {
                ctx.fillStyle = getC(pi[k], max);
                ctx.fillRect(x, y+quit, (wc / cantidad_cuadros), (hc / cantidad_cuadros));
                //ctx.strokeRect(x, y+quit, (wc / cantidad_cuadros), (hc / cantidad_cuadros));
                
            } 
            x += wc / cantidad_cuadros;
            k++;
        }
        y -= hc / cantidad_cuadros;
        x = 0;
    }
    return canva.toDataURL("image/png");
}

function getDataNumber(index,dat) {
    let arr = []
    for (let i = 0; i < dat.length; i++) {
        arr[i] = parseFloat(dat[i][index]);
    }
    return arr;
}
function crearCajaParaPuntos(puntos) {
    if (puntos.length === 0) {
        return null; // No hay puntos, devuelve null
    }

    // Inicializar los valores de las coordenadas mínimas y máximas
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    // Encontrar las coordenadas mínimas y máximas
    puntos.forEach(punto => {
        let x = punto[0];
        let y = punto[1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });

    // Crear la caja que encierra todos los puntos
    let caja = [[minY,minX], [maxY,maxX]];
    return caja;
}
function getPuntos(x, y) {
    let p = [];
    for (let i = 0; i < x.length; i++) {
        p[i] = [x[i], y[i]];
    }
    return p;
}