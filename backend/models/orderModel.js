import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      location: {
        lat: Number,
        lng: Number,
        address: String,
        name: String,
        vicinity: String,
        googleAddressId: String,
      },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;


/*{
  "orderItems": [
    {
      "slug": "item-1",
      "name": "Product 1",
      "quantity": 2,
      "image": "product1.jpg",
      "price": 25,
      "product": "ObjectId_1"
    },
    {
      "slug": "item-2",
      "name": "Product 2",
      "quantity": 1,
      "image": "product2.jpg",
      "price": 30,
      "product": "ObjectId_2"
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "Anytown",
    "postalCode": "12345",
    "country": "Country Name",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Main St",
      "name": "Location Name",
      "vicinity": "Nearby Area",
      "googleAddressId": "Google_Address_ID"
    }
  },
  "paymentMethod": "Credit Card",
  "paymentResult": {
    "id": "payment_id_123",
    "status": "paid",
    "update_time": "2023-11-14T12:00:00Z",
    "email_address": "example@example.com"
  },
  "itemsPrice": 85,
  "shippingPrice": 10,
  "taxPrice": 5,
  "totalPrice": 100,
  "user": "UserId_123",
  "isPaid": true,
  "paidAt": "2023-11-14T12:30:00Z",
  "isDelivered": false,
  "deliveredAt": null
}
*/