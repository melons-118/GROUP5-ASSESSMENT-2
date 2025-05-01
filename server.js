const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;
const DATA_FILE = path.join(__dirname, "products.json");

app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve frontend files

function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (err) {
    console.error("Error reading products:", err);
    return [];
  }
}

function saveProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
})

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
})
app.get("/products-page.html", (req, res) => {
  res.sendFile(path.join(__dirname, "products.html"));
})
app.get("/newProducts", (req, res) => {
  res.sendFile(path.join(__dirname, "newProducts.html"));
})

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
})

app.get("/products", (req, res) => {
  const products = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));
  res.json(products);
});

app.post("/products", (req, res) => {
  const products = readProducts();
  const newProduct = { id: Date.now(), ...req.body };

  if (!newProduct.name || !newProduct.category || typeof newProduct.quantity !== "number" || !newProduct.price) {
    return res.status(400).json({ error: "Invalid product format." });
  }

  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res)=>{
  const id =parseInt(req.params.id);
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);

  if (index == -1){
    return res.status(404).json({error: "Product not found"});
  }

  products[index] ={id, ...req.body};
  saveProducts(products);
  res.json(products[index]);
});

app.delete("/products/:id", (req, res) => {
  let products = readProducts();
  const id =parseInt(req.params.id);
  const originalLength = products.length; 
  products = products.filter(p => p.id !== id);

  if (products.length === originalLength) {
    return res.status(404).json({ error: "Product not found." });
  }
  saveProducts(products);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
