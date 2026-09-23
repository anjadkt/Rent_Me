
import { connectDatabase } from "./config/db.js";
import { Vehicle } from "./models/vehicle.model.js";
import { VehicleCategory, VehicleStatus } from "./types/vehicle.types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const vehicles = [
  {
    name: "Royal Enfield Classic 350",
    category: VehicleCategory.BIKE,
    brand: "Royal Enfield",
    modelName: "Classic 350",
    registrationNumber: "MH12AB1234",
    description: "A classic cruiser bike perfect for long rides and scenic routes.",
    images: [
      { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop", publicId: "re_350_1" },
      { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop", publicId: "re_350_2" },
      { url: "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800&auto=format&fit=crop", publicId: "re_350_3" }
    ],
    pricePerDay: 1500,
    securityDeposit: 5000,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      maxSpeed: 130,
      color: "Matte Black",
    }
  },
  {
    name: "Ather 450X",
    category: VehicleCategory.EV_BIKE,
    brand: "Ather",
    modelName: "450X",
    registrationNumber: "MH12XY9876",
    description: "Premium electric scooter with smart features and incredible acceleration.",
    images: [
      { url: "https://images.unsplash.com/photo-1621644788107-1c6f376269b5?w=800&auto=format&fit=crop", publicId: "ather_450x_1" },
      { url: "https://images.unsplash.com/photo-1621644791552-32b0d3a5ce1e?w=800&auto=format&fit=crop", publicId: "ather_450x_2" }
    ],
    pricePerDay: 800,
    securityDeposit: 3000,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      batteryCapacity: "2.9 kWh",
      range: 85,
      maxSpeed: 80,
      color: "Space Grey",
    }
  },
  {
    name: "Hero Sprint Pro",
    category: VehicleCategory.CYCLE,
    brand: "Hero",
    modelName: "Sprint Pro",
    registrationNumber: "CYC001",
    description: "High performance geared mountain bicycle for off-road trails.",
    images: [{ url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop", publicId: "hero_sprint" }],
    pricePerDay: 250,
    securityDeposit: 500,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      gears: 21,
      color: "Neon Blue",
    }
  },
  {
    name: "Honda Activa 6G",
    category: VehicleCategory.BIKE,
    brand: "Honda",
    modelName: "Activa 6G",
    registrationNumber: "MH14CD5678",
    description: "Reliable city commuter scooter with great fuel efficiency.",
    images: [{ url: "https://images.unsplash.com/photo-1596706935933-4df45e9f1a23?w=800&auto=format&fit=crop", publicId: "activa_6g" }],
    pricePerDay: 500,
    securityDeposit: 2000,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      maxSpeed: 85,
      color: "Pearl White",
    }
  },
  {
    name: "KTM Duke 390",
    category: VehicleCategory.BIKE,
    brand: "KTM",
    modelName: "Duke 390",
    registrationNumber: "MH12XY1111",
    description: "High performance naked sports bike for the thrill seekers.",
    images: [{ url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop", publicId: "ktm_duke" }],
    pricePerDay: 2500,
    securityDeposit: 10000,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      maxSpeed: 167,
      color: "Orange",
    }
  },
  {
    name: "TVS iQube",
    category: VehicleCategory.EV_BIKE,
    brand: "TVS",
    modelName: "iQube",
    registrationNumber: "MH12EV4444",
    description: "Comfortable family electric scooter with silent operation.",
    images: [{ url: "https://images.unsplash.com/photo-1516017100030-975001ff8002?w=800&auto=format&fit=crop", publicId: "tvs_iqube" }],
    pricePerDay: 600,
    securityDeposit: 2000,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      batteryCapacity: "2.25 kWh",
      range: 75,
      color: "Cyan",
    }
  },
  {
    name: "Firefox Cyclone",
    category: VehicleCategory.CYCLE,
    brand: "Firefox",
    modelName: "Cyclone",
    registrationNumber: "CYC002",
    description: "Urban hybrid cycle suitable for fitness and commuting.",
    images: [{ url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop", publicId: "firefox_cycle" }],
    pricePerDay: 200,
    securityDeposit: 500,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      gears: 7,
      color: "Silver",
    }
  },
  {
    name: "Ola S1 Pro",
    category: VehicleCategory.EV_BIKE,
    brand: "Ola",
    modelName: "S1 Pro",
    registrationNumber: "MH14EV9999",
    description: "Feature-packed electric scooter with massive range.",
    images: [{ url: "https://images.unsplash.com/photo-1598555239564-968b5ce2d561?w=800&auto=format&fit=crop", publicId: "ola_s1" }],
    pricePerDay: 700,
    securityDeposit: 2500,
    status: VehicleStatus.AVAILABLE,
    isActive: true,
    specifications: {
      batteryCapacity: "4.0 kWh",
      range: 135,
      maxSpeed: 115,
      color: "Midnight Blue",
    }
  }
];

import { User } from "./models/user.model.js";
import { UserRole } from "./types/auth.types.js";

const seedDB = async () => {
  try {
    await connectDatabase();
    
    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log("Existing vehicles deleted.");
    
    // Insert new vehicles
    await Vehicle.insertMany(vehicles);
    console.log("Database seeded successfully with 4 vehicles!");
    
    // Seed Admin User
    await User.deleteMany({ role: UserRole.ADMIN });
    console.log("Existing admin users deleted.");

    const adminUser = {
      name: "RentRide Admin",
      email: "admin@rentride.com",
      role: UserRole.ADMIN,
    };
    await User.create(adminUser);
    console.log(`Admin user created successfully: ${adminUser.email}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
