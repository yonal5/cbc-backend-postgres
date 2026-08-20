import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to create a product"
        });
    }

    try {
        const productData = req.body;
        const product = await Product.create(productData);

        res.json({
            message: "Product created successfully",
            product
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to create product"
        });
    }
}

export async function getProducts(req, res) {
    try {
        const products = await Product.findAll();

        res.json(products);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to retrieve products"
        });
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to delete a product"
        });
    }

    try {
        const productID = req.params.productID;

        await Product.delete(productID);

        res.json({
            message: "Product deleted successfully"
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
}

export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to update a product"
        });
    }

    try {
        const productID = req.params.productID;
        const updatedData = req.body;

        await Product.update(productID, updatedData);

        res.json({
            message: "Product updated successfully"
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
}

export async function getProductId(req, res) {
    try {
        const productID = req.params.productID;
        const product = await Product.findOne(productID);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to retrieve product by ID"
        });
    }
}
