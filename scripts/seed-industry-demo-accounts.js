const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234!";

const INDUSTRY_DEMOS = [
  {
    id: "grocery_retail",
    industry: "Grocery & Retail",
    businessName: "Lanka Fresh Supermarket",
    code: "T2G-GROCERY",
    phone: "0771000001",
    email: "owner@lankafresh.lk",
    address: "128 Galle Road, Colombo 03",
    city: "Colombo",
    ownerLoginId: "OWN-GROCERY",
    ownerName: "Sunil Perera",
    ownerPhone: "0771110001",
    employeeLoginId: "EMP-GROCERY",
    employeeName: "Kasun Jayasuriya",
    employeePhone: "0771110002",
    branches: [
      { name: "Main Supermarket - Colombo 03", code: "BR-01", isDefault: true, address: "128 Galle Road, Colombo 03", phone: "0112341001" },
      { name: "Kandy City Branch", code: "BR-02", isDefault: false, address: "45 Dalada Veediya, Kandy", phone: "0812231002" },
    ],
    categories: [
      { name: "Beverages & Milk", color: "#0284c7" },
      { name: "Biscuits & Snacks", color: "#f59e0b" },
      { name: "Rice, Dhal & Grains", color: "#10b981" },
      { name: "Personal Care & Soap", color: "#8b5cf6" },
    ],
    products: [
      { name: "Keells Marie Biscuits 200g", category: "Biscuits & Snacks", costPrice: 150, sellingPrice: 200, unit: "pcs", barcode: "479200100101", sku: "GR-BIS-01", minStock: 20, stockBranch1: 120, stockBranch2: 60 },
      { name: "Highland Fresh Milk 1L", category: "Beverages & Milk", costPrice: 420, sellingPrice: 520, unit: "bottle", barcode: "479200100102", sku: "GR-MLK-01", minStock: 15, stockBranch1: 45, stockBranch2: 30 },
      { name: "White Sugar 1kg Pack", category: "Rice, Dhal & Grains", costPrice: 240, sellingPrice: 290, unit: "kg", barcode: "479200100103", sku: "GR-SUG-01", minStock: 30, stockBranch1: 200, stockBranch2: 100 },
      { name: "Mysore Red Dhal 500g", category: "Rice, Dhal & Grains", costPrice: 210, sellingPrice: 260, unit: "pack", barcode: "479200100104", sku: "GR-DHL-01", minStock: 25, stockBranch1: 150, stockBranch2: 80 },
      { name: "Sunlight Lemon Soap 100g", category: "Personal Care & Soap", costPrice: 110, sellingPrice: 145, unit: "pcs", barcode: "479200100105", sku: "GR-SOP-01", minStock: 20, stockBranch1: 180, stockBranch2: 90 },
      { name: "Dilmah Premium Ceylon Tea 100g", category: "Beverages & Milk", costPrice: 320, sellingPrice: 410, unit: "pack", barcode: "479200100106", sku: "GR-TEA-01", minStock: 15, stockBranch1: 85, stockBranch2: 40 },
    ],
    customer: { name: "Kamal Perera", phone: "0777123451", address: "Kollupitiya, Colombo" },
    supplier: { name: "Ceylon FMCG Distributors Ltd", phone: "0112345001", contactPerson: "Mohamed Rameez" },
    expenses: [
      { category: "Shop Rent", amount: 85000, description: "Monthly retail space rental" },
      { category: "Electricity / Commercial Refrigeration", amount: 42000, description: "Chiller and store electricity" },
    ],
  },
  {
    id: "restaurant_cafe",
    industry: "Restaurant & Cafe",
    businessName: "Kottu & Cafe House",
    code: "T2G-CAFE",
    phone: "0771000002",
    email: "owner@kottucafe.lk",
    address: "74 Duplication Road, Colombo 04",
    city: "Colombo",
    ownerLoginId: "OWN-CAFE",
    ownerName: "Nimal Fernando",
    ownerPhone: "0772220001",
    employeeLoginId: "EMP-CAFE",
    employeeName: "Dinesh Bandara",
    employeePhone: "0772220002",
    branches: [
      { name: "Central Kitchen - Colombo 04", code: "BR-01", isDefault: true, address: "74 Duplication Road, Colombo 04", phone: "0112551001" },
      { name: "Galle Beach Cafe", code: "BR-02", isDefault: false, address: "12 Light House St, Galle Fort", phone: "0912221002" },
    ],
    categories: [
      { name: "Kottu & Roti", color: "#ef4444" },
      { name: "Fried Rice & Noodles", color: "#f97316" },
      { name: "Fresh Juices & Shakes", color: "#06b6d4" },
      { name: "Hot Beverages (Tea/Coffee)", color: "#84cc16" },
    ],
    products: [
      { name: "Chicken Cheese Kottu (Full)", category: "Kottu & Roti", costPrice: 950, sellingPrice: 1450, unit: "portion", barcode: "479300100101", sku: "REST-KOT-01", minStock: 10, stockBranch1: 100, stockBranch2: 50 },
      { name: "Seafood Mixed Fried Rice Special", category: "Fried Rice & Noodles", costPrice: 1100, sellingPrice: 1650, unit: "plate", barcode: "479300100102", sku: "REST-RIC-01", minStock: 10, stockBranch1: 80, stockBranch2: 45 },
      { name: "Chicken Biryani Pot (With Egg & Roast)", category: "Fried Rice & Noodles", costPrice: 1200, sellingPrice: 1750, unit: "portion", barcode: "479300100103", sku: "REST-BIR-01", minStock: 5, stockBranch1: 40, stockBranch2: 25 },
      { name: "Ice Milo Dinosaur Cream", category: "Fresh Juices & Shakes", costPrice: 280, sellingPrice: 480, unit: "glass", barcode: "479300100104", sku: "REST-MILO-01", minStock: 15, stockBranch1: 75, stockBranch2: 50 },
      { name: "Ceylon Cardamom Milk Tea", category: "Hot Beverages (Tea/Coffee)", costPrice: 80, sellingPrice: 160, unit: "cup", barcode: "479300100105", sku: "REST-TEA-01", minStock: 20, stockBranch1: 150, stockBranch2: 100 },
      { name: "Avocado Honey Smoothie", category: "Fresh Juices & Shakes", costPrice: 320, sellingPrice: 550, unit: "glass", barcode: "479300100106", sku: "REST-JUC-01", minStock: 10, stockBranch1: 50, stockBranch2: 30 },
    ],
    customer: { name: "Thilina Alwis", phone: "0777123452", address: "Bambalapitiya, Colombo" },
    supplier: { name: "Lanka Wholesale Meat & Fresh Veggies", phone: "0112345002", contactPerson: "Sujith De Mel" },
    expenses: [
      { category: "LP Gas & Firewood", amount: 35000, description: "Kitchen commercial gas cylinders" },
      { category: "Restaurant Rent", amount: 110000, description: "Monthly restaurant lease" },
    ],
  },
  {
    id: "bakery_takeaway",
    industry: "Bakery & Takeaway",
    businessName: "Perera Bake House",
    code: "T2G-BAKERY",
    phone: "0771000003",
    email: "owner@pererabakery.lk",
    address: "210 Hill Street, Dehiwala",
    city: "Dehiwala",
    ownerLoginId: "OWN-BAKERY",
    ownerName: "Chamal Perera",
    ownerPhone: "0773330001",
    employeeLoginId: "EMP-BAKERY",
    employeeName: "Ruwan Silva",
    employeePhone: "0773330002",
    branches: [
      { name: "Main Bakery - Dehiwala", code: "BR-01", isDefault: true, address: "210 Hill Street, Dehiwala", phone: "0112711001" },
      { name: "Nugegoda Super Outlet", code: "BR-02", isDefault: false, address: "88 Stanley Thilakaratne Mw, Nugegoda", phone: "0112811002" },
    ],
    categories: [
      { name: "Short Eats & Buns", color: "#eab308" },
      { name: "Hot Pastries", color: "#f97316" },
      { name: "Cakes & Slices", color: "#ec4899" },
      { name: "Bread & Loaves", color: "#a855f7" },
    ],
    products: [
      { name: "Malu Paan (Spicy Fish Bun)", category: "Short Eats & Buns", costPrice: 65, sellingPrice: 120, unit: "pcs", barcode: "479400100101", sku: "BAKE-BUN-01", minStock: 20, stockBranch1: 110, stockBranch2: 70 },
      { name: "Chicken Sausage Puff Roll", category: "Hot Pastries", costPrice: 90, sellingPrice: 160, unit: "pcs", barcode: "479400100102", sku: "BAKE-ROL-01", minStock: 15, stockBranch1: 85, stockBranch2: 50 },
      { name: "Chocolate Fudge Gateau Slice", category: "Cakes & Slices", costPrice: 220, sellingPrice: 390, unit: "slice", barcode: "479400100103", sku: "BAKE-CAK-01", minStock: 10, stockBranch1: 45, stockBranch2: 30 },
      { name: "Fresh Woodfired Roast Bread", category: "Bread & Loaves", costPrice: 110, sellingPrice: 180, unit: "loaf", barcode: "479400100104", sku: "BAKE-BRD-01", minStock: 15, stockBranch1: 90, stockBranch2: 60 },
      { name: "Glazed Sugar Donut", category: "Short Eats & Buns", costPrice: 85, sellingPrice: 150, unit: "pcs", barcode: "479400100105", sku: "BAKE-DON-01", minStock: 15, stockBranch1: 60, stockBranch2: 40 },
      { name: "Chilled Cream Iced Coffee", category: "Short Eats & Buns", costPrice: 120, sellingPrice: 250, unit: "cup", barcode: "479400100106", sku: "BAKE-COF-01", minStock: 10, stockBranch1: 50, stockBranch2: 35 },
    ],
    customer: { name: "Anoma Jayawardena", phone: "0777123453", address: "Mount Lavinia" },
    supplier: { name: "Prima Flour & Bakery Supplies", phone: "0112345003", contactPerson: "Lalith Gamage" },
    expenses: [
      { category: "Flour, Butter, Sugar & Baking Ingredients", amount: 48000, description: "Weekly bulk baking raw ingredients" },
      { category: "Bakery Shop Rent", amount: 65000, description: "Monthly outlet rental" },
    ],
  },
  {
    id: "pharmacy",
    industry: "Pharmacy",
    businessName: "MediCare Wellness Pharmacy",
    code: "T2G-PHARM",
    phone: "0771000004",
    email: "owner@medicarepharm.lk",
    address: "310 High Level Road, Maharagama",
    city: "Maharagama",
    ownerLoginId: "OWN-PHARM",
    ownerName: "Dr. Anura Senanayake",
    ownerPhone: "0774440001",
    employeeLoginId: "EMP-PHARM",
    employeeName: "Sanduni Wickramasinghe",
    employeePhone: "0774440002",
    branches: [
      { name: "Dispensary - Maharagama", code: "BR-01", isDefault: true, address: "310 High Level Road, Maharagama", phone: "0112841001" },
      { name: "Negombo Town Branch", code: "BR-02", isDefault: false, address: "15 Main Street, Negombo", phone: "0312221002" },
    ],
    categories: [
      { name: "OTC & Pain Relief", color: "#10b981" },
      { name: "Prescription Drugs (Rx)", color: "#ef4444" },
      { name: "Vitamins & Supplements", color: "#f59e0b" },
      { name: "First Aid & Surgical", color: "#06b6d4" },
    ],
    products: [
      { name: "Paracetamol 500mg (10x Strips)", category: "OTC & Pain Relief", costPrice: 120, sellingPrice: 180, unit: "strip", barcode: "479500100101", sku: "PHARM-PCM-01", minStock: 50, stockBranch1: 250, stockBranch2: 120 },
      { name: "Panadol Actifast Rapid Relief", category: "OTC & Pain Relief", costPrice: 240, sellingPrice: 350, unit: "strip", barcode: "479500100102", sku: "PHARM-PAN-01", minStock: 30, stockBranch1: 180, stockBranch2: 90 },
      { name: "Amoxicillin 250mg Capsules (10s)", category: "Prescription Drugs (Rx)", costPrice: 380, sellingPrice: 550, unit: "strip", barcode: "479500100103", sku: "PHARM-AMX-01", minStock: 20, stockBranch1: 95, stockBranch2: 50 },
      { name: "Vitamin C 1000mg Effervescent (20s)", category: "Vitamins & Supplements", costPrice: 850, sellingPrice: 1250, unit: "pack", barcode: "479500100104", sku: "PHARM-VTC-01", minStock: 15, stockBranch1: 70, stockBranch2: 35 },
      { name: "Dettol Antiseptic Liquid 250ml", category: "First Aid & Surgical", costPrice: 480, sellingPrice: 680, unit: "bottle", barcode: "479500100105", sku: "PHARM-DET-01", minStock: 10, stockBranch1: 55, stockBranch2: 30 },
      { name: "Digital Fast Reading Thermometer", category: "First Aid & Surgical", costPrice: 650, sellingPrice: 1100, unit: "pcs", barcode: "479500100106", sku: "PHARM-THM-01", minStock: 10, stockBranch1: 35, stockBranch2: 20 },
    ],
    customer: { name: "Dr. Priyantha Kularatne", phone: "0777123454", address: "Nawala, Rajagiriya" },
    supplier: { name: "State Pharmaceuticals Corporation / Hemas Health", phone: "0112345004", contactPerson: "Gayan Karunaratne" },
    expenses: [
      { category: "Electricity / Air Conditioning & Cold Chain", amount: 38000, description: "24/7 Cold storage and dispensary AC" },
      { category: "Pharmacy Rent", amount: 80000, description: "Monthly commercial building rental" },
    ],
  },
  {
    id: "clothing_store",
    industry: "Clothing Store",
    businessName: "City Style Boutique",
    code: "T2G-FASHION",
    phone: "0771000005",
    email: "owner@citystyle.lk",
    address: "52 Ward Place, Colombo 07",
    city: "Colombo",
    ownerLoginId: "OWN-FASHION",
    ownerName: "Malini Wijesinghe",
    ownerPhone: "0775550001",
    employeeLoginId: "EMP-FASHION",
    employeeName: "Praveen Rathnayake",
    employeePhone: "0775550002",
    branches: [
      { name: "Flagship Boutique - Colombo 07", code: "BR-01", isDefault: true, address: "52 Ward Place, Colombo 07", phone: "0112691001" },
      { name: "Kandy City Center Branch", code: "BR-02", isDefault: false, address: "Level 2, KCC, Kandy", phone: "0812201002" },
    ],
    categories: [
      { name: "Men's Casual & Formal", color: "#3b82f6" },
      { name: "Women's Wear & Dresses", color: "#ec4899" },
      { name: "Bags & Belts", color: "#78716c" },
      { name: "Traditional & Sarees", color: "#e11d48" },
    ],
    products: [
      { name: "Men's Slim Fit Linen Shirt (Navy - L)", category: "Men's Casual & Formal", costPrice: 2200, sellingPrice: 3850, unit: "pcs", barcode: "479600100101", sku: "CLOTH-SHR-01", minStock: 10, stockBranch1: 40, stockBranch2: 25 },
      { name: "Women's Floral Summer Wrap Dress (M)", category: "Women's Wear & Dresses", costPrice: 2600, sellingPrice: 4500, unit: "pcs", barcode: "479600100102", sku: "CLOTH-DRS-01", minStock: 8, stockBranch1: 30, stockBranch2: 20 },
      { name: "Cotton Chino Trousers (32W Khaki)", category: "Men's Casual & Formal", costPrice: 2100, sellingPrice: 3600, unit: "pcs", barcode: "479600100103", sku: "CLOTH-CHN-01", minStock: 10, stockBranch1: 45, stockBranch2: 25 },
      { name: "Pure Silk Handloom Kandyan Saree", category: "Traditional & Sarees", costPrice: 7500, sellingPrice: 14500, unit: "pcs", barcode: "479600100104", sku: "CLOTH-SAR-01", minStock: 5, stockBranch1: 18, stockBranch2: 10 },
      { name: "Genuine Leather Casual Waist Belt", category: "Bags & Belts", costPrice: 950, sellingPrice: 1850, unit: "pcs", barcode: "479600100105", sku: "CLOTH-BLT-01", minStock: 10, stockBranch1: 35, stockBranch2: 20 },
    ],
    customer: { name: "Ishani Wickrama", phone: "0777123455", address: "Havelock Town, Colombo" },
    supplier: { name: "Lanka Apparel & Textiles Garments", phone: "0112345005", contactPerson: "Duminda Abeyrathne" },
    expenses: [
      { category: "Boutique Showroom Rent", amount: 125000, description: "Prime Colombo 07 retail showroom lease" },
      { category: "Electricity / Accent Lighting & AC", amount: 32000, description: "Showroom spot lighting and climate control" },
    ],
  },
  {
    id: "electronics_mobile",
    industry: "Electronics & Mobile",
    businessName: "iTech Mobile & Gadgets",
    code: "T2G-TECH",
    phone: "0771000006",
    email: "owner@itechmobile.lk",
    address: "Shop 14, Liberty Plaza, Colombo 03",
    city: "Colombo",
    ownerLoginId: "OWN-TECH",
    ownerName: "Sahan Gunasekara",
    ownerPhone: "0776660001",
    employeeLoginId: "EMP-TECH",
    employeeName: "Nuwan Kumara",
    employeePhone: "0776660002",
    branches: [
      { name: "Main Tech Store - Liberty Plaza", code: "BR-01", isDefault: true, address: "Shop 14, Liberty Plaza, Colombo 03", phone: "0112571001" },
      { name: "Majestic City Branch", code: "BR-02", isDefault: false, address: "Shop 42, 3rd Floor, MC, Colombo 04", phone: "0112591002" },
    ],
    categories: [
      { name: "Smartphones", color: "#6366f1" },
      { name: "Chargers & Cables", color: "#14b8a6" },
      { name: "Screen Protectors & Glass", color: "#f43f5e" },
      { name: "Power Banks", color: "#eab308" },
    ],
    products: [
      { name: "Apple iPhone 15 Pro 128GB Titanium", category: "Smartphones", costPrice: 310000, sellingPrice: 345000, unit: "unit", barcode: "479700100101", sku: "TECH-IPH-15P", minStock: 2, stockBranch1: 10, stockBranch2: 5 },
      { name: "Samsung 25W Type-C Super Fast Charger", category: "Chargers & Cables", costPrice: 2800, sellingPrice: 4500, unit: "pcs", barcode: "479700100102", sku: "TECH-CHG-25W", minStock: 10, stockBranch1: 60, stockBranch2: 35 },
      { name: "9D Curved Tempered Glass iPhone 14/15", category: "Screen Protectors & Glass", costPrice: 450, sellingPrice: 1200, unit: "pcs", barcode: "479700100103", sku: "TECH-GLS-9D", minStock: 25, stockBranch1: 140, stockBranch2: 80 },
      { name: "Joyroom 10000mAh Magnetic Power Bank", category: "Power Banks", costPrice: 4200, sellingPrice: 6800, unit: "pcs", barcode: "479700100104", sku: "TECH-PWR-10K", minStock: 8, stockBranch1: 35, stockBranch2: 20 },
      { name: "Anker Braided USB-C to Lightning Cable", category: "Chargers & Cables", costPrice: 1800, sellingPrice: 3200, unit: "pcs", barcode: "479700100105", sku: "TECH-CBL-ANK", minStock: 15, stockBranch1: 50, stockBranch2: 30 },
    ],
    customer: { name: "Buddhika Weerakkody", phone: "0777123456", address: "Wellawatte, Colombo" },
    supplier: { name: "Singer / Abans Tech Authorized Distributors", phone: "0112345006", contactPerson: "Heshan Jayasuriya" },
    expenses: [
      { category: "Shop Rent", amount: 95000, description: "Liberty Plaza monthly mall shop rent" },
      { category: "Courier & Shipping Costs", amount: 15000, description: "Islandwide delivery via Prompt Xpress" },
    ],
  },
  {
    id: "wholesale",
    industry: "Wholesale",
    businessName: "Lanka Wholesale Hardware",
    code: "T2G-WHOLESALE",
    phone: "0771000007",
    email: "owner@lankawholesale.lk",
    address: "88 Main Street, Pettah",
    city: "Colombo",
    ownerLoginId: "OWN-WHOLESALE",
    ownerName: "Ranjith Alwis",
    ownerPhone: "0777770001",
    employeeLoginId: "EMP-WHOLESALE",
    employeeName: "Kavinda Thilakarathne",
    employeePhone: "0777770002",
    branches: [
      { name: "Pettah Wholesale Yard", code: "BR-01", isDefault: true, address: "88 Main Street, Pettah, Colombo 11", phone: "0112441001" },
      { name: "Wattala Storage Depot", code: "BR-02", isDefault: false, address: "200 Negombo Road, Wattala", phone: "0112931002" },
    ],
    categories: [
      { name: "Building Materials & Cement", color: "#64748b" },
      { name: "Plumbing & PVC", color: "#0ea5e9" },
      { name: "Electrical & Lighting", color: "#eab308" },
      { name: "Fasteners & Hardware", color: "#d97706" },
    ],
    products: [
      { name: "Tokyo Super Portland Cement 50kg Bag", category: "Building Materials & Cement", costPrice: 2150, sellingPrice: 2450, unit: "bag", barcode: "479800100101", sku: "WHOLE-CEM-50", minStock: 50, stockBranch1: 450, stockBranch2: 250 },
      { name: "S-lon PVC Pressure Pipe 1-inch (Bundle of 10)", category: "Plumbing & PVC", costPrice: 5800, sellingPrice: 7200, unit: "bundle", barcode: "479800100102", sku: "WHOLE-PVC-01", minStock: 15, stockBranch1: 80, stockBranch2: 50 },
      { name: "Philips Essential LED Bulbs 9W (Carton of 50)", category: "Electrical & Lighting", costPrice: 18500, sellingPrice: 23500, unit: "box", barcode: "479800100103", sku: "WHOLE-LED-50", minStock: 10, stockBranch1: 50, stockBranch2: 30 },
      { name: "GI Galvanized Binding Wire (25kg Roll)", category: "Fasteners & Hardware", costPrice: 7200, sellingPrice: 9400, unit: "roll", barcode: "479800100104", sku: "WHOLE-WIR-25", minStock: 15, stockBranch1: 65, stockBranch2: 40 },
      { name: "Asian Paints Wall Putty (20kg Bag)", category: "Building Materials & Cement", costPrice: 1850, sellingPrice: 2350, unit: "bag", barcode: "479800100105", sku: "WHOLE-PUT-20", minStock: 25, stockBranch1: 120, stockBranch2: 80 },
    ],
    customer: { name: "Kandy Engineering & Constructions", phone: "0777123457", address: "Peradeniya Road, Kandy" },
    supplier: { name: "Tokyo Cement PLC & S-lon Manufacturing", phone: "0112345007", contactPerson: "Chathura Wickramasekara" },
    expenses: [
      { category: "Warehouse & Yard Rent", amount: 150000, description: "Monthly Pettah wholesale commercial yard rent" },
      { category: "Lorry Transport & Freight", amount: 45000, description: "Heavy bulk transport and fuel" },
    ],
  },
  {
    id: "salon_barber",
    industry: "Salon & Barber",
    businessName: "Crown & Blade Luxury Salon",
    code: "T2G-SALON",
    phone: "0771000008",
    email: "owner@crownblade.lk",
    address: "180 Galle Road, Bambalapitiya",
    city: "Colombo",
    ownerLoginId: "OWN-SALON",
    ownerName: "Ayesha De Silva",
    ownerPhone: "0778880001",
    employeeLoginId: "EMP-SALON",
    employeeName: "Roshan Mendis",
    employeePhone: "0778880002",
    branches: [
      { name: "Salon Main - Bambalapitiya", code: "BR-01", isDefault: true, address: "180 Galle Road, Bambalapitiya", phone: "0112581001" },
      { name: "Rajagiriya Spa Branch", code: "BR-02", isDefault: false, address: "44 Parliament Road, Rajagiriya", phone: "0112861002" },
    ],
    categories: [
      { name: "Hair Styling & Cuts", color: "#ec4899" },
      { name: "Facials & Skin Care", color: "#10b981" },
      { name: "Retail Shampoos & Oils", color: "#8b5cf6" },
    ],
    products: [
      { name: "Classic Executive Haircut & Beard Grooming", category: "Hair Styling & Cuts", costPrice: 0, sellingPrice: 1500, unit: "service", barcode: "479900100101", sku: "SAL-CUT-01", minStock: 0, stockBranch1: 0, stockBranch2: 0 },
      { name: "Keratin Deep Conditioning Hair Spa", category: "Hair Styling & Cuts", costPrice: 0, sellingPrice: 6500, unit: "session", barcode: "479900100102", sku: "SAL-SPA-01", minStock: 0, stockBranch1: 0, stockBranch2: 0 },
      { name: "Herbal Glow Deep Cleansing Facial", category: "Facials & Skin Care", costPrice: 0, sellingPrice: 4500, unit: "session", barcode: "479900100103", sku: "SAL-FAC-01", minStock: 0, stockBranch1: 0, stockBranch2: 0 },
      { name: "Pure Moroccan Argan Hair Serum 100ml", category: "Retail Shampoos & Oils", costPrice: 2400, sellingPrice: 4200, unit: "bottle", barcode: "479900100104", sku: "SAL-OIL-01", minStock: 8, stockBranch1: 40, stockBranch2: 25 },
      { name: "Organic Charcoal Purifying Face Scrub 100g", category: "Facials & Skin Care", costPrice: 850, sellingPrice: 1650, unit: "pcs", barcode: "479900100105", sku: "SAL-SCR-01", minStock: 10, stockBranch1: 45, stockBranch2: 30 },
    ],
    customer: { name: "Nadeeka Dharmadasa", phone: "0777123458", address: "Colombo 03" },
    supplier: { name: "L'Oreal & Professional Salon Cosmetics", phone: "0112345008", contactPerson: "Shalini Fonseka" },
    expenses: [
      { category: "Salon Premises Rent", amount: 90000, description: "Monthly salon studio rent" },
      { category: "Electricity / Air Conditioning & Blow Dryers", amount: 28000, description: "Saloon electricity bill" },
    ],
  },
];

async function seedIndustryDemoAccounts() {
  console.log("🚀 Starting Seeding of Industry Demo Test Accounts (Owner + Employee)...");

  // 1. Ensure Unlimited Subscription Plan exists
  const unlimitedPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "UNLIMITED" },
    update: {
      name: "All-in-One Unlimited",
      description: "Complete unrestricted access with unlimited products, staff, branches, and monthly invoices.",
      monthlyPriceLkr: 4999.0,
      yearlyPriceLkr: 49990.0,
      maxProducts: 999999,
      maxEmployees: 999999,
      maxBranches: 999999,
      maxMonthlyInvoices: 999999,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
    create: {
      name: "All-in-One Unlimited",
      code: "UNLIMITED",
      description: "Complete unrestricted access with unlimited products, staff, branches, and monthly invoices.",
      monthlyPriceLkr: 4999.0,
      yearlyPriceLkr: 49990.0,
      maxProducts: 999999,
      maxEmployees: 999999,
      maxBranches: 999999,
      maxMonthlyInvoices: 999999,
      hasAdvancedReports: true,
      hasBarcodePrinting: true,
      hasMultiBranch: true,
      hasWhatsAppAlerts: true,
    },
  });

  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const item of INDUSTRY_DEMOS) {
    console.log(`\n📦 Creating/Updating Industry: [${item.industry}] - ${item.businessName}...`);

    // A. Create or update Business
    const business = await prisma.business.upsert({
      where: { code: item.code },
      update: {
        name: item.businessName,
        businessType: item.industry,
        phone: item.phone,
        email: item.email,
        address: item.address,
        city: item.city,
        status: "ACTIVE",
        isOnboarded: true,
        onboardingStep: 4,
      },
      create: {
        name: item.businessName,
        code: item.code,
        businessType: item.industry,
        phone: item.phone,
        email: item.email,
        address: item.address,
        city: item.city,
        status: "ACTIVE",
        currency: "LKR",
        isOnboarded: true,
        onboardingStep: 4,
        receiptHeader: `${item.businessName}\n${item.address}\nTel: ${item.phone}`,
        receiptFooter: "Thank you for shopping with us! Please come again.",
      },
    });

    // B. Ensure Active Unlimited Subscription
    await prisma.subscription.upsert({
      where: { id: `sub-${item.code.toLowerCase()}` },
      update: {
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year validity
      },
      create: {
        id: `sub-${item.code.toLowerCase()}`,
        businessId: business.id,
        planId: unlimitedPlan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // C. Branches
    const createdBranches = [];
    for (const br of item.branches) {
      const branch = await prisma.branch.upsert({
        where: {
          businessId_code: {
            businessId: business.id,
            code: br.code,
          },
        },
        update: {
          name: br.name,
          address: br.address,
          phone: br.phone,
          isDefault: br.isDefault,
          isActive: true,
        },
        create: {
          businessId: business.id,
          code: br.code,
          name: br.name,
          address: br.address,
          phone: br.phone,
          isDefault: br.isDefault,
          isActive: true,
        },
      });
      createdBranches.push(branch);
    }

    const mainBranch = createdBranches.find((b) => b.isDefault) || createdBranches[0];
    const branch2 = createdBranches.find((b) => !b.isDefault) || createdBranches[1] || mainBranch;

    // D. Business Owner User
    const ownerUser = await prisma.user.upsert({
      where: { loginId: item.ownerLoginId },
      update: {
        name: item.ownerName,
        phone: item.ownerPhone,
        email: `${item.ownerLoginId.toLowerCase()}@lankapos.lk`,
        passwordHash: demoHash,
        isTemporaryPassword: false,
        isActive: true,
        platformRole: "USER",
      },
      create: {
        loginId: item.ownerLoginId,
        name: item.ownerName,
        phone: item.ownerPhone,
        email: `${item.ownerLoginId.toLowerCase()}@lankapos.lk`,
        passwordHash: demoHash,
        isTemporaryPassword: false,
        isActive: true,
        platformRole: "USER",
      },
    });

    // Link Owner to Business
    await prisma.userBusiness.upsert({
      where: {
        userId_businessId: {
          userId: ownerUser.id,
          businessId: business.id,
        },
      },
      update: {
        role: "BUSINESS_OWNER",
        isOwner: true,
      },
      create: {
        userId: ownerUser.id,
        businessId: business.id,
        role: "BUSINESS_OWNER",
        isOwner: true,
      },
    });

    // Link Owner to Main Branch
    await prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: ownerUser.id,
          branchId: mainBranch.id,
        },
      },
      update: {},
      create: {
        userId: ownerUser.id,
        branchId: mainBranch.id,
      },
    });

    // E. Employee / Staff User
    const empUser = await prisma.user.upsert({
      where: { loginId: item.employeeLoginId },
      update: {
        name: item.employeeName,
        phone: item.employeePhone,
        email: `${item.employeeLoginId.toLowerCase()}@lankapos.lk`,
        passwordHash: demoHash,
        isTemporaryPassword: false,
        isActive: true,
        platformRole: "USER",
      },
      create: {
        loginId: item.employeeLoginId,
        name: item.employeeName,
        phone: item.employeePhone,
        email: `${item.employeeLoginId.toLowerCase()}@lankapos.lk`,
        passwordHash: demoHash,
        isTemporaryPassword: false,
        isActive: true,
        platformRole: "USER",
      },
    });

    // Link Employee to Business
    await prisma.userBusiness.upsert({
      where: {
        userId_businessId: {
          userId: empUser.id,
          businessId: business.id,
        },
      },
      update: {
        role: "CASHIER",
        isOwner: false,
      },
      create: {
        userId: empUser.id,
        businessId: business.id,
        role: "CASHIER",
        isOwner: false,
      },
    });

    // Link Employee to Main Branch
    await prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: empUser.id,
          branchId: mainBranch.id,
        },
      },
      update: {},
      create: {
        userId: empUser.id,
        branchId: mainBranch.id,
      },
    });

    // F. Categories
    const categoryMap = {};
    for (const cat of item.categories) {
      const createdCat = await prisma.category.upsert({
        where: {
          businessId_name: {
            businessId: business.id,
            name: cat.name,
          },
        },
        update: {
          color: cat.color,
          isActive: true,
        },
        create: {
          businessId: business.id,
          name: cat.name,
          color: cat.color,
          isActive: true,
        },
      });
      categoryMap[cat.name] = createdCat.id;
    }

    // G. Supplier
    const supplier = await prisma.supplier.upsert({
      where: { id: `sup-${item.code.toLowerCase()}` },
      update: {
        name: item.supplier.name,
        phone: item.supplier.phone,
        contactPerson: item.supplier.contactPerson,
        branchId: mainBranch.id,
      },
      create: {
        id: `sup-${item.code.toLowerCase()}`,
        businessId: business.id,
        branchId: mainBranch.id,
        name: item.supplier.name,
        phone: item.supplier.phone,
        contactPerson: item.supplier.contactPerson,
      },
    });

    // H. Customer
    const customer = await prisma.customer.upsert({
      where: {
        businessId_phone: {
          businessId: business.id,
          phone: item.customer.phone,
        },
      },
      update: {
        name: item.customer.name,
        address: item.customer.address,
        branchId: mainBranch.id,
      },
      create: {
        businessId: business.id,
        branchId: mainBranch.id,
        name: item.customer.name,
        phone: item.customer.phone,
        address: item.customer.address,
      },
    });

    // I. Products & Inventory
    const createdProducts = [];
    for (const prod of item.products) {
      const categoryId = categoryMap[prod.category] || null;

      const product = await prisma.product.upsert({
        where: {
          businessId_barcode: {
            businessId: business.id,
            barcode: prod.barcode,
          },
        },
        update: {
          name: prod.name,
          costPrice: prod.costPrice,
          sellingPrice: prod.sellingPrice,
          unit: prod.unit,
          sku: prod.sku,
          minStockLevel: prod.minStock,
          categoryId,
          supplierId: supplier.id,
          isActive: true,
        },
        create: {
          businessId: business.id,
          name: prod.name,
          costPrice: prod.costPrice,
          sellingPrice: prod.sellingPrice,
          unit: prod.unit,
          barcode: prod.barcode,
          sku: prod.sku,
          minStockLevel: prod.minStock,
          categoryId,
          supplierId: supplier.id,
          isActive: true,
        },
      });
      createdProducts.push(product);

      // Stock for Main Branch
      await prisma.inventory.upsert({
        where: {
          branchId_productId: {
            branchId: mainBranch.id,
            productId: product.id,
          },
        },
        update: { quantity: prod.stockBranch1 },
        create: {
          branchId: mainBranch.id,
          productId: product.id,
          quantity: prod.stockBranch1,
        },
      });

      // Stock for Branch 2
      if (branch2 && branch2.id !== mainBranch.id) {
        await prisma.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: branch2.id,
              productId: product.id,
            },
          },
          update: { quantity: prod.stockBranch2 },
          create: {
            branchId: branch2.id,
            productId: product.id,
            quantity: prod.stockBranch2,
          },
        });
      }
    }

    // J. Sample Expenses
    for (const exp of item.expenses) {
      const existingExp = await prisma.expense.findFirst({
        where: {
          businessId: business.id,
          branchId: mainBranch.id,
          category: exp.category,
        },
      });

      if (!existingExp) {
        await prisma.expense.create({
          data: {
            businessId: business.id,
            branchId: mainBranch.id,
            category: exp.category,
            amount: exp.amount,
            description: exp.description,
            recordedById: ownerUser.id,
            expenseDate: new Date(),
          },
        });
      }
    }

    // K. Sample Completed Sale (so dashboard has real data)
    const existingSale = await prisma.sale.findFirst({
      where: {
        businessId: business.id,
        branchId: mainBranch.id,
      },
    });

    if (!existingSale && createdProducts.length >= 2) {
      const p1 = createdProducts[0];
      const p2 = createdProducts[1];
      const qty1 = 2;
      const qty2 = 1;
      const subtotal = p1.sellingPrice * qty1 + p2.sellingPrice * qty2;
      const totalCost = p1.costPrice * qty1 + p2.costPrice * qty2;
      const invoiceNumber = `INV-${item.code}-0001`;

      const sale = await prisma.sale.create({
        data: {
          businessId: business.id,
          branchId: mainBranch.id,
          cashierId: empUser.id,
          customerId: customer.id,
          invoiceNumber,
          subtotal,
          total: subtotal,
          totalCost,
          status: "COMPLETED",
          saleDate: new Date(),
          items: {
            create: [
              {
                productId: p1.id,
                productName: p1.name,
                quantity: qty1,
                unitPrice: p1.sellingPrice,
                unitCost: p1.costPrice,
                total: p1.sellingPrice * qty1,
              },
              {
                productId: p2.id,
                productName: p2.name,
                quantity: qty2,
                unitPrice: p2.sellingPrice,
                unitCost: p2.costPrice,
                total: p2.sellingPrice * qty2,
              },
            ],
          },
          payments: {
            create: [
              {
                method: "CASH",
                amount: subtotal,
                tenderedAmount: subtotal + 500,
                changeAmount: 500,
              },
            ],
          },
        },
      });

      // Update customer stats
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          totalSpent: subtotal,
          purchaseCount: 1,
        },
      });
    }

    console.log(`  ✓ Owner Account    : ${item.ownerLoginId} (Pass: ${DEMO_PASSWORD})`);
    console.log(`  ✓ Employee Account : ${item.employeeLoginId} (Pass: ${DEMO_PASSWORD})`);
    console.log(`  ✓ Products Added   : ${createdProducts.length}`);
    console.log(`  ✓ Branches Active  : ${createdBranches.length}`);
  }

  console.log("\n========================================================");
  console.log("🎉 ALL INDUSTRY DEMO ACCOUNTS SEEDED SUCCESSFULLY!");
  console.log("========================================================");
  console.log("All accounts password : Demo1234!");
  console.log("Super Admin Account   : ADMIN-0001 / AdminPassword@123");
  console.log("========================================================\n");
}

seedIndustryDemoAccounts()
  .catch((err) => {
    console.error("Error seeding industry demo accounts:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
