import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    images: [String],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;

/*
{
  "name": "Example Product",
  "slug": "example-product",
  "image": "example-product.jpg",
  "images": ["image1.jpg", "image2.jpg", "image3.jpg"],
  "brand": "Example Brand",
  "category": "Example Category",
  "description": "This is an example product description.",
  "price": 49.99,
  "countInStock": 100,
  "rating": 4.5,
  "numReviews": 10,
  "reviews": [
    {
      "name": "User1",
      "comment": "Great product!",
      "rating": 5,
      "createdAt": "2023-11-01T08:00:00Z",
      "updatedAt": "2023-11-01T08:05:00Z"
    },
    {
      "name": "User2",
      "comment": "Good product but could be better.",
      "rating": 4,
      "createdAt": "2023-10-25T14:30:00Z",
      "updatedAt": "2023-10-25T14:35:00Z"
    }
  ],
  "createdAt": "2023-11-10T10:00:00Z",
  "updatedAt": "2023-11-12T15:20:00Z"
}
*/