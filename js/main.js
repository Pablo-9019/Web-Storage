const productos = [
    { id: 1, nombre: "notebook", marca: "Lenovo", precio: 10000, stock: 50 },
    { id: 2, nombre: "monitor", marca: "Samsung", precio: 20000, stock: 50 },
    { id: 3, nombre: "mouse", marca: "Razer", precio: 14000, stock: 12 },
    { id: 4, nombre: "gabinete", marca: "Corsair", precio: 12000, stock: 5 },
    { id: 5, nombre: "auriculares", marca: "Sony", precio: 15000, stock: 4 },
]

const todosproductos = document.getElementById("productos")
const carritocomprar = document.getElementById("lista")
const panel = document.querySelector(".carrito")
const buscar = document.getElementById("busqueda")
const totalCarrito = document.getElementById("total")

let carrito = []
const carritoGuardado = localStorage.getItem("carrito")

const productosGuardados = carritoGuardado !== null ? JSON.parse(carritoGuardado) : []

productosGuardados.forEach((productoGuardado) => {
    const producto = productos.find((item) => item.id === productoGuardado.id)
    if (producto !== undefined && productoGuardado.cantidad > 0) {
        const cantidadFinal = productoGuardado.cantidad > producto.stock
            ? producto.stock
            : productoGuardado.cantidad
        carrito.push({
            id: producto.id,
            cantidad: cantidadFinal
        })
    }
})

function buscarEnCarrito(id) {
    return carrito.find( (item) => {
        return item.id === id
    })
}

function agregarAlCarrito(id) {
    const producto = productos.find( (item) => {
        return item.id === id
    })
    const productoEnCarrito = buscarEnCarrito(id)

    if (productoEnCarrito !== undefined) {
        if (productoEnCarrito.cantidad < producto.stock) {
            productoEnCarrito.cantidad++
        }
    } else if (producto.stock > 0) {
        carrito.push({ id: producto.id, cantidad: 1 })
    }
    guardarCarrito()
}

function cambiarCantidad(id, cambio) {
    const producto = productos.find( (item) => {
        return item.id === id
    })
    const productoEnCarrito = buscarEnCarrito(id)
    if (productoEnCarrito === undefined) {
        return
    }
    productoEnCarrito.cantidad += cambio

    if (productoEnCarrito.cantidad <= 0) {
        eliminarDelCarrito(id)
        return
    }

    if (productoEnCarrito.cantidad > producto.stock) {
        productoEnCarrito.cantidad = producto.stock
    }
    guardarCarrito()
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter( (item) =>{
        return item.id !== id
    })
    guardarCarrito()
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito))
    actualizarCarrito()
}

function renderizarProductos() {
    todosproductos.innerHTML = ""
    productos.forEach( (producto) => {
        todosproductos.innerHTML +=
        `<article class="box">
        <h3 class="">${producto.nombre}</h3>
        <p> marca: ${producto.marca}</p>
        <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
        <p>Disponible: ${producto.stock}</p>
        <button type="button" class="btn" data-id="${producto.id}" ${producto.stock === 0 ? "disabled" : ""}>
        + Agregar al carrito</button></article>`
    })
    const botones = todosproductos.querySelectorAll(".btn")
    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            agregarAlCarrito(Number(boton.dataset.id))
        })
    })
}

function actualizarCarrito() {
    carritocomprar.innerHTML= ""
    let total = 0
    carrito.forEach( (item) => {
        const producto = productos.find( (productoCatalogo) => {
            return productoCatalogo.id === item.id
        })
        if(producto === undefined) {
            return
        }
        const elemento = document.createElement("li")
        elemento.innerHTML= `
        <div class="articulo-carrito">
        <span>${producto.nombre} - $${producto.precio}</span>
        <button type= "button" class= "btn-eliminar">Eliminar</button>
        </div>
        <div class = "controles-cantidad">
        <button type= "button" class= "btn-restar">-</button>
        <span>${item.cantidad}</span>
        <button type= "button" class="btn-sumar">+</button>
        </div>`
        elemento.querySelector(".btn-eliminar").addEventListener("click", ()=>{
            eliminarDelCarrito(producto.id)
        })
        elemento.querySelector(".btn-restar").addEventListener("click", ()=>{
            cambiarCantidad(producto.id, -1)
        })
        elemento.querySelector(".btn-sumar").addEventListener("click",()=>{
            if(item.cantidad >= producto.stock){
                return
            }
            cambiarCantidad(producto.id, 1)
        })
        carritocomprar.appendChild(elemento)
        total += producto.precio * item.cantidad
    })
    totalCarrito.textContent = `Total: $${total}`
}

function filtrarProductos() {
    const texto = buscar.value.toLocaleLowerCase()
    const tarjetas = todosproductos.querySelectorAll(".box")
    tarjetas.forEach( (tarjeta) => {
        const nombre = tarjeta.querySelector("h3").textContent.toLocaleLowerCase()
        tarjeta.classList.toggle("oculto", !nombre.includes(texto))
    })
}

document.getElementById("vaciar").addEventListener("click", () => {
    carrito = []
    guardarCarrito()
})

buscar.addEventListener("input", filtrarProductos)

renderizarProductos()
actualizarCarrito()