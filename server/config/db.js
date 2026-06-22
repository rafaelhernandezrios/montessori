import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI no está definido en .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ MongoDB conectado");
    return mongoose.connection;
  } catch (error) {
    console.error("\n❌ No se pudo conectar a MongoDB\n");
    if (uri.includes("localhost") || uri.includes("127.0.0.1")) {
      console.error("Tu MONGO_URI apunta a localhost pero MongoDB no está corriendo.");
      console.error("Opciones:");
      console.error("  1. Inicia MongoDB local: brew install mongodb-community && brew services start mongodb-community");
      console.error("  2. Usa MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas");
      console.error("     MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/montessori\n");
    } else {
      console.error("Revisa tu URI de Atlas:");
      console.error("  - Usuario y contraseña correctos");
      console.error("  - IP permitida en Network Access (0.0.0.0/0 para desarrollo)");
      console.error("  - Nombre de base de datos en la URI\n");
    }
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
