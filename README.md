# Football Product Inventory API

An Express.js API for managing football products. Data is stored in memory and resets when the server restarts.

## How to run

1. Run `npm install`
2. Run `node server.js`
3. Open `http://localhost:3000/products`

## Product fields

Each product has an ID, name, category, price, and stock.

## API endpoints

| Method | URL | Description |
| --- | --- | --- |
| GET | /products | Get all products |
| GET | /products/:id | Get one product |
| POST | /products | Create a product |
| PATCH | /products/:id | Update a product |
| DELETE | /products/:id | Delete a product |

GET /products supports the optional filters `category`, `minPrice`, and `search`.
For example: `/products?category=shirt&minPrice=1000`

POST requires name, category, price, and stock in a JSON body. PATCH accepts only the fields you want to change. Invalid input returns 400, and a missing product returns 404.