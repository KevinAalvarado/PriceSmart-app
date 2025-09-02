/*
    Campos:
        nombre
        descripcion
        precio
        stock
*/

import { Schema, model } from "mongoose";

const productsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxLength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: [10, 'La descripción debe tener al menos 10 caracteres'],
      maxLength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: 'El precio debe ser un número válido mayor o igual a 0'
      }
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          return Number.isInteger(value) && value >= 0;
        },
        message: 'El stock debe ser un número entero mayor o igual a 0'
      }
    },
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false,
    collection: 'products'
  }
);

// Índices para optimizar consultas
productsSchema.index({ name: 1 });
productsSchema.index({ price: 1 });
productsSchema.index({ createdAt: -1 });

// Método virtual para valor total del inventario
productsSchema.virtual('totalValue').get(function() {
  return this.price * this.stock;
});

// Método de instancia
productsSchema.methods.isAvailable = function() {
  return this.stock > 0;
};

// Método estático
productsSchema.statics.findAvailable = function() {
  return this.find({ stock: { $gt: 0 } });
};

// Middleware pre-save para normalización de datos
productsSchema.pre('save', function(next) {
  // Capitalizar nombre
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  
  // Redondear precio a 2 decimales
  if (this.price) {
    this.price = Math.round(this.price * 100) / 100;
  }
  
  next();
});

export default model("Products", productsSchema);