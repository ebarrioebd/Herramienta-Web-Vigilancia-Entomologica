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