class productos{
    constructor(id, nombre, variedad, precio, stock){
        this.id = id
        this.nombre = nombre
        this.variedad = variedad
        this.precio = precio
        this.stock = stock
    }
    vender(cantidad){
        this.stock -= cantidad
    }
    aplicarDescuento(aplicar){
        if(isNaN(aplicar) || aplicar < 0 || aplicar > 100){
            mostrarMensaje("El descuento debe estar entre 0 y 100")
        }
        const precioAnterior = this.precio
        const descuento = this.precio * aplicar / 100
        this.precio = this.precio - descuento
        const {nombre, variedad, precio} = this
        mostrarMensaje("Descuento aplicado a " + nombre + " (" + variedad + "). Precio anterior: $" + precioAnterior + " - Precio final: $" + precio, "exito")
    }
}
const panaderiaInicial = [
    new productos(1, "Pan", "Ciabatta", 1000, 50),
    new productos(2, "Galletitas", "Surtidas", 2000, 50),
    new productos(3, "Facturas", "Medialunas", 1500, 20),
    new productos(4, "Tortas", "Raspadas", 1000, 25),
    new productos(5, "Sandwiches", "Jamon y Queso", 2500, 20),
]
const panaderia = (JSON.parse(localStorage.getItem("panaderia")) ?? panaderiaInicial)
    .map(({id, nombre, variedad, precio, stock}) => new productos(id, nombre, variedad, precio, stock))
let carrito = JSON.parse(localStorage.getItem("carrito")) ?? []
const mensaje = document.getElementById("mensaje")
const selectProducto = document.getElementById("select-producto")
const inputCantidad = document.querySelector("#input-cantidad")
const inputDescuento = document.querySelector("#input-descuento")
const contenedorItems = document.getElementById("contenedor-items")
const contenedorCarrito = document.getElementById("contenedor-carrito")
const totalCarrito = document.querySelector("#total-carrito")
const botonesMenu = document.querySelectorAll(".btn-menu")
function guardarEstado(){
    localStorage.setItem("panaderia", JSON.stringify(panaderia))
    localStorage.setItem("carrito", JSON.stringify(carrito))
}
function mostrarMensaje(texto, tipo){
    mensaje.textContent = texto
    mensaje.className = "mensaje " + tipo
}
function armarMenu(){
    return panaderia.map(producto => `<option value="${producto.id}">${producto.id}. ${producto.nombre}</option>`).join("")
}
function productoSeleccionado(){
    return panaderia.find(producto => producto.id === parseInt(selectProducto.value))
}
const mostrarProductos = function(){
    const tarjetas = []
    panaderia.forEach(function({nombre, variedad, precio, stock}){
        tarjetas.push(`
            <article class="tarjeta">
                <h3>${nombre}</h3>
                <p class="variedad">${variedad}</p>
                <p class="precio">$${precio}</p>
                <p>${stock > 0 ? "Disponibles: " + stock : "Sin stock"}</p>
            </article>`)
    })
    contenedorItems.innerHTML = tarjetas.join("")
}
function agregarAlCarrito(){
    const elegido = productoSeleccionado()
    const {nombre, precio, stock} = elegido
    const cantidad = parseInt(inputCantidad.value)
      if(!(cantidad > 0 && cantidad <= stock)){
        mostrarMensaje(cantidad > stock ? "No hay suficiente stock. Solo quedan " + stock + " de " + nombre : "Ingresa una cantidad valida", "error")
    }
    if(cantidad > elegido.stock){
        mostrarMensaje("No hay suficiente stock. Solo quedan " + elegido.stock + " de " + elegido.nombre, "error")
    }
    elegido.vender(cantidad)
    const yaEnCarrito = carrito.some(compra => compra.producto === nombre)
    if(yaEnCarrito){
        const compra = carrito.find(compra => compra.producto === nombre)
        compra.cantidad = compra.cantidad + cantidad
        compra.subtotal = compra.subtotal + cantidad * precio
    }
    else{
        carrito.push({
            producto: nombre,
            cantidad: cantidad,
            subtotal: cantidad * precio})
    }
    mostrarProductos()
    verCarrito()
    mostrarMensaje("Agregado a tu carrito: " + cantidad + " de " + nombre, "exito")
}
function descuentoProductos(){
    const elegido = productoSeleccionado()
    const porcentaje = parseInt(inputDescuento.value)
    elegido.aplicarDescuento(porcentaje)
    mostrarProductos()
}
function quitarDelCarrito(nombre){
    const quitar = carrito.find(compra => compra.producto === nombre)
    if(!quitar){
        mostrarMensaje(nombre + " no esta en el carrito", "error")
    }
    const {producto, cantidad} = quitar
    carrito = carrito.filter(compra => compra !== quitar)
    const cambiarproducto = panaderia.find(producto => producto.nombre === nombre)
    cambiarproducto.stock += quitar.cantidad
    guardarEstado()
    mostrarProductos()
    verCarrito()
    mostrarMensaje("Se quito del carrito: " + quitar.cantidad + " de " + producto, "exito")
}
function vaciarCarrito(){
    if(carrito.length === 0){
        mostrarMensaje("El carrito esta vacio", "aviso")
    }
    carrito.forEach(function({producto, cantidad}){
          const cambiarproducto = panaderia.find(item => item.nombre === producto)
        cambiarproducto.stock += cantidad
    })
    carrito = []
    guardarEstado()
    localStorage.removeItem("carrito")
    mostrarProductos()
    verCarrito()
    mostrarMensaje("Carrito vaciado, el stock fue actualizado", "exito")
    }
    function verCarrito(){
    const total = carrito.reduce((suma, compra) => suma + compra.subtotal, 0)
    const lista = []
    carrito.forEach(function({producto, cantidad, subtotal}){
        lista.push(`
            <div class="item-carrito">
                <div>
                    <h4>${producto}</h4>
                    <p>Cantidad: ${cantidad} - Subtotal: $${subtotal}</p>
                </div>
                <button class="btn-quitar" data-producto="${producto}">Quitar</button>
            </div>`)
    })
        contenedorCarrito.innerHTML = carrito.length === 0 ? "<p class='vacio'>El carrito está vacío.</p>" : lista.join("")
    totalCarrito.textContent = carrito.length === 0 ? "" : "Total acumulado: $" + total
    mostrarMensaje(carrito.length === 0 ? "El carrito esta vacio" : "Total acumulado de tu carrito: $" + total, carrito.length === 0 ? "aviso" : "exito")
 
    const botonesQuitar = document.querySelectorAll(".btn-quitar")
    botonesQuitar.forEach(function(boton){
        boton.addEventListener("click", function(){
            quitarDelCarrito(boton.dataset.producto)
        })
    })
}
function ejecutarOpcion(opciones){
    switch(opciones){
        case 1:
            mostrarProductos()
            mostrarMensaje("Mostrando " + panaderia.length + " productos", "exito")
            break
        case 2:
            agregarAlCarrito()
            break
        case 3:
            descuentoProductos()
            break
        case 4:
            quitarDelCarrito(productoSeleccionado()?.nombre)
            break
        case 5:
            verCarrito()
            break
        case 6:
            vaciarCarrito()
            break
        default:
            mostrarMensaje("Opcion invalida, elija del 1 al 6", "error")
            break
    }
}
botonesMenu.forEach(function(boton){
    boton.addEventListener("click", function(){
    ejecutarOpcion(parseInt(boton.dataset.opcion))
    })
})
inputCantidad.addEventListener("keydown", function(evento){
    if(evento.key === "Enter"){
        ejecutarOpcion(2)
    }
})
selectProducto.innerHTML = armarMenu()
mostrarProductos()
verCarrito()