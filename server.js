const express = require("express");
const app = express();

app.use(express.json());

// ข้อมูลสินค้าเก็บใน array
let products = [
  { id: 1, name: "Barcelona Home Shirt", category: "shirt", price: 2500, stock: 8 },
  { id: 2, name: "Football", category: "equipment", price: 900, stock: 12 }
];

let nextId = 3;

// ตรวจข้อมูลที่ส่งมาเพื่อสร้างหรือแก้สินค้า
function validateProduct(body, isPatch = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Body must be a JSON object";
  }

  const fields = Object.keys(body);
  const allowedFields = ["name", "category", "price", "stock"];

  if (fields.length === 0) {
    return "Body must contain at least one field";
  }

  const unknownField = fields.find(field => !allowedFields.includes(field));
  if (unknownField) {
    return `Unknown field: ${unknownField}`;
  }

  // POST ต้องส่งมาครบทุก field; PATCH ส่งเฉพาะที่ต้องการแก้ได้
  if (!isPatch) {
    const missingField = allowedFields.find(field => !fields.includes(field));
    if (missingField) {
      return `Missing required field: ${missingField}`;
    }
  }

  if ("name" in body &&
      (typeof body.name !== "string" || body.name.trim() === "")) {
    return "name must be non-empty text";
  }

  if ("category" in body &&
      (typeof body.category !== "string" || body.category.trim() === "")) {
    return "category must be non-empty text";
  }

  if ("price" in body &&
      (typeof body.price !== "number" ||
       !Number.isFinite(body.price) ||
       body.price < 0)) {
    return "price must be a number of 0 or more";
  }

  if ("stock" in body &&
      (!Number.isInteger(body.stock) || body.stock < 0)) {
    return "stock must be a whole number of 0 or more";
  }

  return null;
}

// ตรวจ ID ที่อยู่ใน URL เช่น /products/1
function validateId(req, res, next) {
  const id = Number(req.params.id);

  if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      error: "id must be a positive whole number"
    });
  }

  req.productId = id;
  next();
}

// GET /products : ดูสินค้าทั้งหมดและกรองสินค้า
app.get("/products", (req, res) => {
  const { category, minPrice, search } = req.query;
  const allowedQueries = ["category", "minPrice", "search"];

  const unknownQuery = Object.keys(req.query).find(
    key => !allowedQueries.includes(key)
  );

  if (unknownQuery) {
    return res.status(400).json({
      error: `Unknown filter: ${unknownQuery}`
    });
  }

  if (category !== undefined &&
      (typeof category !== "string" || category.trim() === "")) {
    return res.status(400).json({
      error: "category must be non-empty text"
    });
  }

  if (search !== undefined &&
      (typeof search !== "string" || search.trim() === "")) {
    return res.status(400).json({
      error: "search must be non-empty text"
    });
  }

  if (minPrice !== undefined &&
      (typeof minPrice !== "string" ||
       minPrice.trim() === "" ||
       !Number.isFinite(Number(minPrice)) ||
       Number(minPrice) < 0)) {
    return res.status(400).json({
      error: "minPrice must be a number of 0 or more"
    });
  }

  let result = products;

  if (category !== undefined) {
    result = result.filter(product =>
      product.category.toLowerCase() === category.trim().toLowerCase()
    );
  }

  if (minPrice !== undefined) {
    result = result.filter(product =>
      product.price >= Number(minPrice)
    );
  }

  if (search !== undefined) {
    result = result.filter(product =>
      product.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }

  res.json(result);
});

// GET /products/:id : ดูสินค้า 1 ชิ้น
app.get("/products/:id", validateId, (req, res) => {
  const product = products.find(item => item.id === req.productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
});

// POST /products : เพิ่มสินค้า
app.post("/products", (req, res) => {
  const error = validateProduct(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const product = {
    id: nextId++,
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    price: req.body.price,
    stock: req.body.stock
  };

  products.push(product);
  res.status(201).json(product);
});

// PATCH /products/:id : แก้ข้อมูลบางส่วน
app.patch("/products/:id", validateId, (req, res) => {
  const index = products.findIndex(item => item.id === req.productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const error = validateProduct(req.body, true);

  if (error) {
    return res.status(400).json({ error });
  }

  const updates = { ...req.body };

  if (updates.name !== undefined) {
    updates.name = updates.name.trim();
  }

  if (updates.category !== undefined) {
    updates.category = updates.category.trim();
  }

  products[index] = { ...products[index], ...updates };
  res.json(products[index]);
});

// DELETE /products/:id : ลบสินค้า
app.delete("/products/:id", validateId, (req, res) => {
  const index = products.findIndex(item => item.id === req.productId);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const [deletedProduct] = products.splice(index, 1);
  res.json({
    message: "Product deleted",
    product: deletedProduct
  });
});

// เปิด server
app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});