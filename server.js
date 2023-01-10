const express = require ("express");
const app = express();

const fs = require ("fs");
const archivoProductos = "./productos.json";
const archivoCarritos = "./carritos.json";

const productosRouter = express.Router();
const carritosRouter = express.Router();

app.use(express.json());
app.use("/api/productos", productosRouter);
app.use("/api/carrito", carritosRouter);

const isAdmin = true;

const fechaYHora = () => {
    const date = new Date();
    const anio = date.getFullYear();
    const mes = date.getMonth() + 1;
    const dia = date.getDate();
    const hora = date.getHours();
    const min = date.getMinutes();
    const seg = date.getSeconds();
    return (`${dia}/${mes}/${anio} ${hora}:${min}:${seg}`);
}

app.get('*', function(req, res){
    res.json({"error": -2, "descripcion": `ruta ${req.url} metodo ${req.method} No implementados`});
});


productosRouter.get("/:id?", (req, res) => {        
    const id = req.params.id;
    fs.promises.readFile(archivoProductos, "utf-8")
    .then ((dataEnJSON) => {
        if(!id) {
            res.send(dataEnJSON);
        } else {
            const dataObject = JSON.parse(dataEnJSON);
            const productoPorId = dataObject.find((prod) => prod.id == id);
            productoPorId ? res.send(productoPorId) : res.send("Producto no encontrado");
        }
    })
})

productosRouter.post("/", (req, res) => {
    if (isAdmin) {
        fs.promises.readFile(archivoProductos, "utf-8")
        .then ((dataEnJSON) => {
            const dataObject = JSON.parse(dataEnJSON);
            const producto = {"id": dataObject.length + 1, "timestamp": fechaYHora(), ...req.body}  //Asignamos un id al nuevo producto igual a su posicion en el array + 1
            dataObject.push(producto);
            dataEnJSON = JSON.stringify(dataObject);
            fs.promises.writeFile(archivoProductos, dataEnJSON);
            res.send("Producto Agregado");
        })
    } else {
        res.send("ERROR 403: No Autorizado");
    }   
})

productosRouter.put("/:id", (req, res) => {
    if (isAdmin) {
        const id = req.params.id;
        fs.promises.readFile(archivoProductos, "utf-8")
        .then ((dataEnJSON) => {
            const dataObject = JSON.parse(dataEnJSON);
            const index = dataObject.findIndex((prod) => prod.id == id)
            if (index !== -1) {
                const producto = {"id": index + 1, ...req.body}     //Agregamos la id al producto modificado
                dataObject.splice(index, 1, producto)
                dataEnJSON = JSON.stringify(dataObject);
                fs.promises.writeFile(archivoProductos, dataEnJSON);
                res.send("Producto Modificado");
            }  else {
                res.send("Producto no encontrado");
            }  
        })
    } else {
        res.send("ERROR 403: No Autorizado");
    }   
})

productosRouter.delete("/:id", (req, res) => {
    if (isAdmin) {
        const id = req.params.id;
        fs.promises.readFile(archivoProductos, "utf-8")
        .then ((dataEnJSON) => {
            const dataObject = JSON.parse(dataEnJSON);
            const index = dataObject.findIndex((prod) => prod.id == id)
            if (index !== -1) {
                dataObject.splice(index, 1)
                dataObject.map((prod, ind) => {           
                    prod.id = ind + 1;
                    return prod;
                })   
                dataEnJSON = JSON.stringify(dataObject);
                fs.promises.writeFile(archivoProductos, dataEnJSON);
                res.send("Producto Eliminado");
            }  else {
                res.send("Producto no encontrado");
            }  
        })
    } else {
        res.send("ERROR 403: No Autorizado");
    }   
})

carritosRouter.post("/", (req, res) => {                            
    if (isAdmin) {
        fs.promises.readFile(archivoCarritos, "utf-8")
        .then ((dataEnJSON) => {
            const dataObject = JSON.parse(dataEnJSON);
            const carrito = {"id": dataObject.length + 1,           
                             "timestamp": fechaYHora(), 
                             "productos": []   
                            }  
            dataObject.push(carrito);
            dataEnJSON = JSON.stringify(dataObject);
            fs.promises.writeFile(archivoCarritos, dataEnJSON);
            res.send(`Carrito Creado. ID:${dataObject.length}`);
        })
    } else {
        res.send("ERROR 403: No Autorizado");
    }   
})

carritosRouter.delete("/:id", (req, res) => {
    const id = req.params.id;
    fs.promises.readFile(archivoCarritos, "utf-8")
    .then ((dataEnJSON) => {
        const dataObject = JSON.parse(dataEnJSON);
        const index = dataObject.findIndex((carr) => carr.id == id)
        if (index !== -1) {
            dataObject.splice(index, 1)
            dataObject.map((carr, ind) => {     
                carr.id = ind + 1;
                return carr;
            })   
            dataEnJSON = JSON.stringify(dataObject);
            fs.promises.writeFile(archivoCarritos, dataEnJSON);
            res.send("Carrito Eliminado");
        }  else {
            res.send("Carrito no encontrado");
        }  
    })
})

carritosRouter.post("/:id_carr/productos/:id_prod", (req, res) => {
    const id_carr = req.params.id_carr;
    const id_prod = req.params.id_prod;
    fs.promises.readFile(archivoProductos, "utf-8")
    .then ((dataEnJSON) => {
        const dataObject = JSON.parse(dataEnJSON);
        const productoPorId = dataObject.find((prod) => prod.id == id_prod);
        return productoPorId;
    })
    .then ((productoElegido) => {
        if (productoElegido) {
            fs.promises.readFile(archivoCarritos, "utf-8")
            .then((dataEnJSON) => {
                const dataObject = JSON.parse(dataEnJSON);
                const carritoPorId = dataObject.find((carr) => carr.id == id_carr);
                if (carritoPorId) {
                    carritoPorId.productos.push(productoElegido);
                    dataEnJSON = JSON.stringify(dataObject);
                    fs.promises.writeFile(archivoCarritos, dataEnJSON);
                    res.send("Producto agregado");
                } else {
                    res.send("Carrito no encontrado");
                }
            })
        } else {
            res.send("Producto no Encontrado");
        }   
    })
})

carritosRouter.get("/:id/productos", (req, res) => {
    const id = req.params.id;
    fs.promises.readFile(archivoCarritos, "utf-8")
    .then ((dataEnJSON) => {
        const dataObject = JSON.parse(dataEnJSON);
        const carritoElegido = dataObject.find((carrito) => carrito.id == id);
        if (carritoElegido) {
            const productosEnCarrito = JSON.stringify(carritoElegido.productos);
            res.send(productosEnCarrito);
        } else {
            res.send("Carrito no Encontrado, el Id no existe");
        }   
    })
})

carritosRouter.delete("/:id_carr/productos/:id_prod", (req, res) => {
    const id_carr = req.params.id_carr;
    const id_prod = req.params.id_prod;
    fs.promises.readFile(archivoCarritos, "utf-8")
    .then ((dataEnJSON) => {
        const dataObject = JSON.parse(dataEnJSON);
        const carritoElegido = dataObject.find((carrito) => carrito.id == id_carr);
        if (carritoElegido) {
            const productosEnCarrito = carritoElegido.productos;
            const index = productosEnCarrito.findIndex((producto) => producto.id == id_prod);
            if (index != -1) {
                productosEnCarrito.splice(index, 1);
                carritoElegido.productos = productosEnCarrito;
                dataEnJSON = JSON.stringify(dataObject);
                fs.promises.writeFile(archivoCarritos, dataEnJSON);
                res.send("Producto Eliminado");
            } else {
                res.send("Producto no Encontrado");
            }      
        } else {
            res.send("Carrito no Encontrado");
        }
    })
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server Corriendo en Puerto ${PORT}`);
})