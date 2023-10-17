const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const app = express();

app.use(bodyParser.json());
app.use(fileUpload());

mongoose.connect('mongodb://localhost/ecommerce', { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Product = require('./models/product'); // Create a Product model (see Step 4).
const User = require('./models/user'); // Create a User model (see Step 5).



app.get('/', (req, res) => {
  res.send('Welcome to the e-commerce API!');
});

// Create a new product with an image upload
app.post('/products', (req, res) => {
    const product = new Product(req.body);
  
    if (req.files && req.files.image) {
      const image = req.files.image;
      const imagePath = 'images/' + image.name;
  
      image.mv(imagePath, (err) => {
        if (err) {
          return res.status(500).send(err);
        }
  
        product.image = imagePath;
  
        // Add category names to the product's categories array.
        product.categories = req.body.categories;
  
        product.save((err) => {
          if (err) return res.status(500).send(err);
          return res.status(201).json(product);
        });
      });
    } else {
      // If no image is provided
      // Add category names to the product's categories array.
      product.categories = req.body.categories;
  
      product.save((err) => {
        if (err) return res.status(500).send(err);
        return res.status(201).json(product);
      });
    }
  });
  
  
  // Retrieve all products
  app.get('/products', (req, res) => {
    Product.find((err, products) => {
      if (err) return res.status(500).send(err);
      return res.status(200).json(products);
    });
  });
  
  // Update a product
  app.put('/products/:id', (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, product) => {
      if (err) return res.status(500).send(err);
      return res.status(200).json(product);
    });
  });
  
  // Delete a product
  app.delete('/products/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id, (err, product) => {
      if (err) return res.status(500).send(err);
      return res.status(204).send('Product removed successfully');
    });
  });
  
  // User registration
app.post('/register', (req, res) => {
    const user = new User(req.body);
    user.save((err) => {
      if (err) return res.status(500).send(err);
      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
  
  // User login and generate a JWT token
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
      if (err) return res.status(500).send(err);
  
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed. User not found.' });
      }
  
      user.comparePassword(password, (err, isMatch) => {
        if (err) return res.status(500).send(err);
  
        if (isMatch) {
          const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
          return res.status(200).json({ message: 'Authentication successful', token });
        } else {
          return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
        }
      });
    });
  });

  const Category = require('./models/category');

// Create a new category
app.post('/categories', (req, res) => {
  const category = new Category(req.body);
  category.save((err) => {
    if (err) return res.status(500).send(err);
    return res.status(201).json(category);
  });
});

// Retrieve all categories
app.get('/categories', (req, res) => {
  Category.find((err, categories) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(categories);
  });
});

// Update a category
app.put('/categories/:id', (req, res) => {
  Category.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, category) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(category);
  });
});

// Delete a category
app.delete('/categories/:id', (req, res) => {
  Category.findByIdAndRemove(req.params.id, (err, category) => {
    if (err) return res.status(500).send(err);
    return res.status(204).send('Category removed successfully');
  });
});

app.get('/products/category/:categoryName', (req, res) => {
    const categoryName = req.params.categoryName;
    Product.find({ categories: categoryName }, (err, products) => {
      if (err) return res.status(500).send(err);
      return res.status(200).json(products);
    });
  });
  
  

// Define your product and user routes (CRUD operations and authentication) here.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
