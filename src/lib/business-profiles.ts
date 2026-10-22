export interface UnitOption {
  value: string;
  label: string;
  desc: string;
}

export interface StockModeOption {
  key: "made_to_order" | "track_stock";
  label: string;
  desc: string;
  iconName: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  badge: string;
  iconName: string;
  productTerm: string;
  productTermPlural: string;
  catalogTitle: string;
  catalogSubtitle: string;
  posTitle: string;
  posSearchPlaceholder: string;
  catalogSearchPlaceholder: string;
  inventorySearchPlaceholder: string;
  addItemButtonLabel: string;
  addItemModalTitle: string;
  addItemModalSubtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  secondaryLabel: string;
  secondaryPlaceholder: string;
  costPriceLabel: string;
  costPricePlaceholder: string;
  costPriceHelpText: string;
  sellingPriceLabel: string;
  sellingPricePlaceholder: string;
  sellingPriceHelpText: string;
  units: UnitOption[];
  defaultUnit: string;
  hasMadeToOrder: boolean;
  defaultStockMode: "made_to_order" | "track_stock";
  stockModeOptions: StockModeOption[];
  topSellingTitle: string;
  suggestedCategories: string[];
  suggestedExpenseCategories: string[];
}

export function isServiceUnit(unit?: string | null): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return u === "service" || u === "session" || u === "treatment" || u === "hour" || u === "job";
}

export function isMadeToOrderUnit(unit?: string | null): boolean {
  if (!unit) return false;
  const u = unit.toLowerCase().trim();
  return isServiceUnit(u) || u === "portion" || u === "plate" || u === "cup" || u === "glass";
}

export function isServiceProduct(product: { unit?: string | null }): boolean {
  return isServiceUnit(product?.unit);
}

export function isMadeToOrderProduct(product: { unit?: string | null }): boolean {
  return isMadeToOrderUnit(product?.unit);
}

export const BUSINESS_PROFILES: Record<string, BusinessProfile> = {
  "Electronics & Mobile": {
    id: "electronics_mobile",
    name: "Electronics & Mobile",
    badge: "Mobile & Tech Mode",
    iconName: "Smartphone",
    productTerm: "Device / Accessory",
    productTermPlural: "Devices & Accessories",
    catalogTitle: "Devices & Accessories Catalog",
    catalogSubtitle: "Manage phones, gadgets, chargers, screen guards, repair parts, and prices.",
    posTitle: "Electronics & Mobile POS",
    posSearchPlaceholder: "Search by phone model, IMEI, barcode, accessory name...",
    catalogSearchPlaceholder: "Search devices, accessories, IMEI, barcode, brand...",
    inventorySearchPlaceholder: "Search stock by model name, IMEI, barcode, or SKU...",
    addItemButtonLabel: "Add Device / Accessory",
    addItemModalTitle: "Add New Device or Tech Accessory",
    addItemModalSubtitle: "Enter item details, IMEI / barcode, and warranty specifications.",
    nameLabel: "Device / Model Name *",
    namePlaceholder: "e.g. iPhone 15 Pro 128GB, Samsung 25W Fast Charger, 9D Tempered Glass iPhone 14, Joyroom 10000mAh Power Bank",
    identifierLabel: "IMEI / Serial / Barcode",
    identifierPlaceholder: "e.g. 356789123456789 or 479123456789",
    secondaryLabel: "Brand & Warranty",
    secondaryPlaceholder: "e.g. Apple - 1 Year Singer Warranty",
    costPriceLabel: "Unit Cost (Buying Price LKR)",
    costPricePlaceholder: "e.g. 2800.00",
    costPriceHelpText: "What you pay to supplier per unit",
    sellingPriceLabel: "Selling Price (Retail LKR) *",
    sellingPricePlaceholder: "e.g. 4500.00",
    sellingPriceHelpText: "What customer pays at POS",
    units: [
      { value: "pcs", label: "pcs (Pieces)", desc: "e.g. Chargers, Back covers" },
      { value: "unit", label: "unit (Single Unit)", desc: "e.g. Smartphones, Tablets" },
      { value: "box", label: "box (Boxed Pack)", desc: "e.g. Bulk Cable Boxes" },
      { value: "set", label: "set (Combo Set)", desc: "e.g. Charger + Cable Set" },
      { value: "pack", label: "pack (Multi-pack)", desc: "e.g. 10x Screen Guards" },
      { value: "device", label: "device (Equipment)", desc: "e.g. Routers, Speakers" },
    ],
    defaultUnit: "pcs",
    hasMadeToOrder: false,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Track Physical Inventory",
        desc: "Strict count per device / serial / piece with low-stock alerts",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Selling Devices & Tech Accessories",
    suggestedCategories: [
      "Smartphones",
      "Phone Cases & Covers",
      "Screen Protectors & Glass",
      "Chargers & Cables",
      "Headphones & Earbuds",
      "Power Banks",
      "Repair Services & Spares",
    ],
    suggestedExpenseCategories: [
      "Shop Rent",
      "Electricity / CEB",
      "Staff Wages / Technician Commission",
      "Internet & Phone Lines",
      "Courier & Shipping Costs",
      "Repair Tools & Soldering Consumables",
      "Marketing & Social Media Ads",
      "Other Overhead",
    ],
  },

  "Grocery & Retail": {
    id: "grocery_retail",
    name: "Grocery & Retail",
    badge: "Grocery & Retail Mode",
    iconName: "ShoppingBag",
    productTerm: "Product",
    productTermPlural: "Products",
    catalogTitle: "Products & Goods Catalog",
    catalogSubtitle: "Manage grocery inventory, weights, barcodes, and retail pricing.",
    posTitle: "Retail Supermarket POS",
    posSearchPlaceholder: "Scan barcode or search grocery items by name...",
    catalogSearchPlaceholder: "Search grocery items, barcodes, pack sizes, prices...",
    inventorySearchPlaceholder: "Search stock by item name, barcode, or SKU...",
    addItemButtonLabel: "Add Grocery Product",
    addItemModalTitle: "Add New Grocery Product",
    addItemModalSubtitle: "Enter item name, retail price, barcode, and pack weight.",
    nameLabel: "Product / Item Name *",
    namePlaceholder: "e.g. White Sugar 1kg, Keells Marie Biscuits 200g, Highland Fresh Milk 1L, Red Dhal 500g, Sunlight Soap 100g",
    identifierLabel: "Barcode / EAN-13 / SKU",
    identifierPlaceholder: "e.g. 4792022001122",
    secondaryLabel: "Brand / Pack Size",
    secondaryPlaceholder: "e.g. Keells / 200g pack",
    costPriceLabel: "Unit Cost (Buying Price LKR)",
    costPricePlaceholder: "e.g. 150.00",
    costPriceHelpText: "Wholesale invoice price from supplier",
    sellingPriceLabel: "Selling Price (Retail LKR) *",
    sellingPricePlaceholder: "e.g. 200.00",
    sellingPriceHelpText: "Retail shelf price for consumers",
    units: [
      { value: "pcs", label: "pcs (Pieces)", desc: "e.g. Soap, Biscuits, Packets" },
      { value: "kg", label: "kg (Kilograms)", desc: "e.g. Rice, Sugar, Vegetables" },
      { value: "g", label: "g (Grams)", desc: "e.g. Spices, Loose items" },
      { value: "pack", label: "pack (Packets)", desc: "e.g. Noodles, Milk Powder" },
      { value: "bottle", label: "bottle (Bottles)", desc: "e.g. Soft Drinks, Oils" },
      { value: "can", label: "can (Cans / Tins)", desc: "e.g. Mackerel, Tuna" },
      { value: "box", label: "box (Cartons)", desc: "e.g. Bulk Boxes" },
      { value: "bundle", label: "bundle (Bundles)", desc: "e.g. Greens, Cinnamon" },
      { value: "litre", label: "litre (Liquid Litres)", desc: "e.g. Fresh Milk, Juices" },
    ],
    defaultUnit: "pcs",
    hasMadeToOrder: false,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Track Stock Quantity",
        desc: "Real-time stock deduction on barcode scan with reorder warnings",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Selling Groceries & Provisions",
    suggestedCategories: [
      "Beverages & Milk",
      "Biscuits & Snacks",
      "Rice, Dhal & Grains",
      "Spices & Seasonings",
      "Household & Cleaning",
      "Personal Care & Soap",
    ],
    suggestedExpenseCategories: [
      "Shop Rent",
      "Electricity / Commercial Refrigeration",
      "Staff Wages",
      "Transport & Lorry Delivery",
      "Damaged & Expired Spoilage",
      "Packaging Bags & Rolls",
      "Maintenance & Pest Control",
      "Other Overhead",
    ],
  },

  Pharmacy: {
    id: "pharmacy",
    name: "Pharmacy",
    badge: "Pharmacy & Healthcare Mode",
    iconName: "Cross",
    productTerm: "Medicine / Item",
    productTermPlural: "Medicines & Health Items",
    catalogTitle: "Medicines & Healthcare Catalog",
    catalogSubtitle: "Manage prescription drugs, OTC formulations, dosages, batches, and prices.",
    posTitle: "Pharmacy Dispensary POS",
    posSearchPlaceholder: "Search medicine by brand name, generic formulation, batch...",
    catalogSearchPlaceholder: "Search medicines, generic names, dosages, barcodes...",
    inventorySearchPlaceholder: "Search dispensary stock by medicine, batch, or generic...",
    addItemButtonLabel: "Add Medicine / Drug",
    addItemModalTitle: "Add New Medicine or Healthcare Product",
    addItemModalSubtitle: "Enter brand name, generic formulation, dosage, and dispense unit.",
    nameLabel: "Medicine / Brand Name *",
    namePlaceholder: "e.g. Paracetamol 500mg, Panadol Actifast, Amoxicillin 250mg, Vitamin C 1000mg Effervescent, Dettol Antiseptic 250ml",
    identifierLabel: "Batch No. / Barcode / SKU",
    identifierPlaceholder: "e.g. BATCH-2026A or 479100200300",
    secondaryLabel: "Generic Name & Dosage",
    secondaryPlaceholder: "e.g. Acetaminophen / Paracetamol B.P. 500mg",
    costPriceLabel: "Unit Cost (Buying Price LKR)",
    costPricePlaceholder: "e.g. 120.00",
    costPriceHelpText: "Distributor purchase cost per strip/bottle",
    sellingPriceLabel: "Selling Price (Retail LKR) *",
    sellingPricePlaceholder: "e.g. 180.00",
    sellingPriceHelpText: "Dispensing price to patient",
    units: [
      { value: "strip", label: "strip (Tablet Strips)", desc: "e.g. 10x Tablets per strip" },
      { value: "tablet", label: "tablet (Individual Tablets)", desc: "e.g. Loose tablet dispensing" },
      { value: "bottle", label: "bottle (Syrup / Liquid Bottles)", desc: "e.g. Cough Syrups, Tonics" },
      { value: "box", label: "box (Packaged Boxes)", desc: "e.g. Full medicine box" },
      { value: "tube", label: "tube (Creams & Ointments)", desc: "e.g. Antiseptic creams" },
      { value: "pack", label: "pack (Sachets / Packs)", desc: "e.g. ORS, Effervescent" },
      { value: "vial", label: "vial (Vials & Ampoules)", desc: "e.g. Injections, Eye drops" },
      { value: "pcs", label: "pcs (Devices & Sundries)", desc: "e.g. Bandages, Thermometers" },
    ],
    defaultUnit: "strip",
    hasMadeToOrder: false,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Track Dispensary Inventory",
        desc: "Precise count tracking per strip/bottle with minimum safety level alerts",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Dispensed Medicines & Health Products",
    suggestedCategories: [
      "Prescription Drugs (Rx)",
      "OTC & Pain Relief",
      "Antibiotics & Cold/Flu",
      "Vitamins & Supplements",
      "First Aid & Surgical",
      "Baby & Mother Care",
    ],
    suggestedExpenseCategories: [
      "Pharmacy Rent",
      "Electricity / Air Conditioning & Cold Chain",
      "Pharmacist & Staff Wages",
      "Drug Authority / NMRA Licenses",
      "Packaging Envelopes & Bottles",
      "Disposal of Expired Drugs",
      "Maintenance",
      "Other Overhead",
    ],
  },

  "Clothing Store": {
    id: "clothing_store",
    name: "Clothing Store",
    badge: "Fashion & Apparel Mode",
    iconName: "Shirt",
    productTerm: "Garment / Apparel",
    productTermPlural: "Garments & Apparel",
    catalogTitle: "Apparel & Fashion Catalog",
    catalogSubtitle: "Manage clothing lines, sizes, styles, fabric codes, and boutique pricing.",
    posTitle: "Fashion Boutique POS",
    posSearchPlaceholder: "Scan garment tag or search by style code, color, size...",
    catalogSearchPlaceholder: "Search apparel by name, style code, size (S/M/L), color...",
    inventorySearchPlaceholder: "Search garment stock by style, barcode, or size...",
    addItemButtonLabel: "Add Apparel / Item",
    addItemModalTitle: "Add New Garment or Fashion Item",
    addItemModalSubtitle: "Enter garment name, style code, size variant, and boutique price.",
    nameLabel: "Garment / Outfit Name *",
    namePlaceholder: "e.g. Men's Slim Fit Linen Shirt (Navy - L), Women's Floral Wrap Dress (M), Cotton Chino Pants (32W), Pure Silk Saree",
    identifierLabel: "Barcode / Style Code / SKU",
    identifierPlaceholder: "e.g. LIN-SHIRT-NAV-L or 479555123",
    secondaryLabel: "Size, Color & Material",
    secondaryPlaceholder: "e.g. Size: Large | Color: Navy Blue | 100% Linen",
    costPriceLabel: "Unit Cost (Buying Price LKR)",
    costPricePlaceholder: "e.g. 2200.00",
    costPriceHelpText: "Factory wholesale cost per garment",
    sellingPriceLabel: "Selling Price (Boutique LKR) *",
    sellingPricePlaceholder: "e.g. 3850.00",
    sellingPriceHelpText: "Retail boutique price tag",
    units: [
      { value: "pcs", label: "pcs (Pieces / Garments)", desc: "e.g. Shirts, Dresses, Pants" },
      { value: "pair", label: "pair (Pairs)", desc: "e.g. Shoes, Socks, Gloves" },
      { value: "set", label: "set (Matching Sets)", desc: "e.g. Suit Sets, Pajama Sets" },
      { value: "pack", label: "pack (Multi-packs)", desc: "e.g. 3-Pack T-Shirts, Innerwear" },
    ],
    defaultUnit: "pcs",
    hasMadeToOrder: false,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Track Boutique Stock",
        desc: "Track exact quantities per size and color style",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Selling Outfits & Fashion Lines",
    suggestedCategories: [
      "Men's Casual & Formal",
      "Women's Wear & Dresses",
      "Kids & Baby Wear",
      "Footwear & Shoes",
      "Bags & Belts",
      "Traditional & Sarees",
    ],
    suggestedExpenseCategories: [
      "Boutique Showroom Rent",
      "Electricity / Accent Lighting & AC",
      "Sales Staff Wages & Commissions",
      "Hangers, Tags & Premium Bags",
      "Tailoring & Alteration Expenses",
      "Social Media & Fashion Photo Shoots",
      "Maintenance",
      "Other Overhead",
    ],
  },

  "Restaurant & Cafe": {
    id: "restaurant_cafe",
    name: "Restaurant & Cafe",
    badge: "Restaurant & Kitchen Mode",
    iconName: "Utensils",
    productTerm: "Dish / Beverage",
    productTermPlural: "Dishes & Beverages",
    catalogTitle: "Food & Beverage Menu Catalog",
    catalogSubtitle: "Manage dishes, portions, kitchen stations, fresh beverages, and menu prices.",
    posTitle: "Restaurant POS Terminal",
    posSearchPlaceholder: "Search dishes, kottu, rice, juices, short codes...",
    catalogSearchPlaceholder: "Search menu dishes, ingredients, portions, prices...",
    inventorySearchPlaceholder: "Search dishes, beverages, and batch counts...",
    addItemButtonLabel: "Add Menu Item",
    addItemModalTitle: "Add New Menu Item / Dish",
    addItemModalSubtitle: "Enter dish name, portion price, recipe cost, and kitchen preparation mode.",
    nameLabel: "Dish / Beverage Name *",
    namePlaceholder: "e.g. Chicken Cheese Kottu, Seafood Fried Rice, Ice Milo Dinosaur, Avocado Juice, Chicken Biryani",
    identifierLabel: "Item Code / Short Code",
    identifierPlaceholder: "e.g. KOT-01 or RICE-CHKN",
    secondaryLabel: "Kitchen Station / Recipe Notes",
    secondaryPlaceholder: "e.g. Kottu Counter / Extra Cheese & Gravy",
    costPriceLabel: "Estimated Recipe Cost (LKR)",
    costPricePlaceholder: "e.g. 950.00",
    costPriceHelpText: "Estimated ingredient food cost (or leave 0.00)",
    sellingPriceLabel: "Menu Price (Retail LKR) *",
    sellingPricePlaceholder: "e.g. 1450.00",
    sellingPriceHelpText: "Portion price on diner bill",
    units: [
      { value: "portion", label: "portion (Portions)", desc: "e.g. Kottu, Biryani, Curries" },
      { value: "plate", label: "plate (Plates)", desc: "e.g. Fried Rice, Noodles" },
      { value: "cup", label: "cup (Hot Cups)", desc: "e.g. Milk Tea, Coffee, Espresso" },
      { value: "glass", label: "glass (Cold Glasses)", desc: "e.g. Fresh Juices, Milkshakes" },
      { value: "slice", label: "slice (Slices)", desc: "e.g. Pizzas, Desserts" },
      { value: "pcs", label: "pcs (Pieces)", desc: "e.g. Drumsticks, Cutlets, Buns" },
      { value: "pot", label: "pot (Pots / Pots of Tea)", desc: "e.g. Tea for Two" },
      { value: "bottle", label: "bottle (Bottled Beverages)", desc: "e.g. Soft drinks, Mineral Water" },
      { value: "pack", label: "pack (Lunch Packets)", desc: "e.g. Rice & Curry Packets" },
    ],
    defaultUnit: "portion",
    hasMadeToOrder: true,
    defaultStockMode: "made_to_order",
    stockModeOptions: [
      {
        key: "made_to_order",
        label: "Fresh / Made-to-Order",
        desc: "Always available on POS (unlimited fresh kitchen preparation)",
        iconName: "Flame",
      },
      {
        key: "track_stock",
        label: "Daily Batch Count",
        desc: "Fixed count prepared per shift (e.g. 30 Biryani packets, 24 Drinks)",
        iconName: "Clock",
      },
    ],
    topSellingTitle: "Top Selling Dishes & Beverages",
    suggestedCategories: [
      "Kottu & Roti",
      "Fried Rice & Noodles",
      "Biryani & Curries",
      "Fresh Juices & Shakes",
      "Hot Beverages (Tea/Coffee)",
      "Short Eats & Bites",
    ],
    suggestedExpenseCategories: [
      "Restaurant Rent",
      "LP Gas & Firewood",
      "Electricity & Refrigeration",
      "Kitchen Chef & Waiter Wages",
      "Daily Market Purchases (Veg/Meat/Fish)",
      "Takeaway Boxes & Wrapping Paper",
      "Cleaning & Kitchen Sanitization",
      "Other Overhead",
    ],
  },

  "Bakery & Takeaway": {
    id: "bakery_takeaway",
    name: "Bakery & Takeaway",
    badge: "Bakery & Pastry Mode",
    iconName: "Croissant",
    productTerm: "Bakery / Cake Item",
    productTermPlural: "Bakery & Pastry Items",
    catalogTitle: "Bakery & Pastry Catalog",
    catalogSubtitle: "Manage breads, buns, cakes, short eats, sweet treats, and daily baking batches.",
    posTitle: "Bakery Front Counter POS",
    posSearchPlaceholder: "Search buns, breads, cakes, pastry items...",
    catalogSearchPlaceholder: "Search bakery items, cake slices, buns, prices...",
    inventorySearchPlaceholder: "Search bakery trays and daily baked stock...",
    addItemButtonLabel: "Add Bakery Item",
    addItemModalTitle: "Add New Bakery or Pastry Item",
    addItemModalSubtitle: "Enter item name, selling price, and daily batch availability.",
    nameLabel: "Bakery Item Name *",
    namePlaceholder: "e.g. Fish Bun (Malu Paan), Egg Roti, Chocolate Fudge Cake Slice, Roast Bread, Vegetable Roll, Ribbon Cake 1kg",
    identifierLabel: "Display Code / Tray No.",
    identifierPlaceholder: "e.g. BUN-01 or CAKE-FUDGE",
    secondaryLabel: "Tray Batch / Flavor",
    secondaryPlaceholder: "e.g. Morning 7 AM Bake / Chocolate",
    costPriceLabel: "Recipe / Baking Cost (LKR)",
    costPricePlaceholder: "e.g. 65.00",
    costPriceHelpText: "Flour, butter, filling cost per piece (optional)",
    sellingPriceLabel: "Selling Price (Retail LKR) *",
    sellingPricePlaceholder: "e.g. 120.00",
    sellingPriceHelpText: "Counter price for customers",
    units: [
      { value: "pcs", label: "pcs (Pieces / Buns)", desc: "e.g. Fish Buns, Rolls, Pastries" },
      { value: "slice", label: "slice (Cake Slices)", desc: "e.g. Gateaux, Fudge Slices" },
      { value: "loaf", label: "loaf (Bread Loaves)", desc: "e.g. Roast Bread, Sandwich Bread" },
      { value: "kg", label: "kg (Whole Cakes)", desc: "e.g. Birthday Cakes by weight" },
      { value: "box", label: "box (Box of Sweets)", desc: "e.g. 6-Pack Donuts, Assorted Box" },
      { value: "pack", label: "pack (Cookie Packs)", desc: "e.g. Rusks, Butter Cookies" },
      { value: "cup", label: "cup (Hot Drinks)", desc: "e.g. Tea, Coffee" },
    ],
    defaultUnit: "pcs",
    hasMadeToOrder: true,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Daily Batch Count",
        desc: "Count baked fresh each morning / evening shift",
        iconName: "Clock",
      },
      {
        key: "made_to_order",
        label: "Fresh / Continuous Baking",
        desc: "Always available (e.g. Made-to-order tea, continuous buns)",
        iconName: "Flame",
      },
    ],
    topSellingTitle: "Top Selling Pastries & Bakes",
    suggestedCategories: [
      "Short Eats & Buns",
      "Bread & Loaves",
      "Cakes & Slices",
      "Cookies & Sweets",
      "Hot Pastries",
      "Beverages",
    ],
    suggestedExpenseCategories: [
      "Bakery Shop Rent",
      "Flour, Butter, Sugar & Baking Ingredients",
      "Bakery Oven Electricity / Gas / Firewood",
      "Baker & Counter Staff Wages",
      "Cake Boxes, Paper Bags & Serviettes",
      "Transport & Delivery",
      "Maintenance",
      "Other Overhead",
    ],
  },

  "Salon & Barber": {
    id: "salon_barber",
    name: "Salon & Barber",
    badge: "Salon & Spa Mode",
    iconName: "Scissors",
    productTerm: "Service / Product",
    productTermPlural: "Services & Beauty Products",
    catalogTitle: "Services & Treatment Menu",
    catalogSubtitle: "Manage haircuts, grooming, treatments, spa packages, retail hair oils, and pricing.",
    posTitle: "Salon Front Desk POS",
    posSearchPlaceholder: "Search salon services, haircuts, treatments, hair products...",
    catalogSearchPlaceholder: "Search services, stylists, treatments, beauty products...",
    inventorySearchPlaceholder: "Search salon retail products and consumable stock...",
    addItemButtonLabel: "Add Service / Product",
    addItemModalTitle: "Add New Salon Service or Retail Product",
    addItemModalSubtitle: "Set service charge, duration, or retail product buying cost and stock.",
    nameLabel: "Service / Treatment / Product Name *",
    namePlaceholder: "e.g. Classic Haircut & Beard Trim, Keratin Hair Treatment, Deep Cleansing Facial, Moroccan Argan Oil 100ml",
    identifierLabel: "Service Code / Barcode",
    identifierPlaceholder: "e.g. CUT-MEN or 4799001122",
    secondaryLabel: "Duration & Specialist",
    secondaryPlaceholder: "e.g. 45 Mins | Senior Hair Stylist",
    costPriceLabel: "Consumables / Materials Cost (LKR)",
    costPricePlaceholder: "e.g. 0.00 or 250.00",
    costPriceHelpText: "Optional cost of hair dye / facial pack (or 0.00 for labor services)",
    sellingPriceLabel: "Service Charge / Retail Price (LKR) *",
    sellingPricePlaceholder: "e.g. 1500.00",
    sellingPriceHelpText: "Amount billed to customer at front desk",
    units: [
      { value: "service", label: "service (Single Service)", desc: "e.g. Haircut, Beard Trim (No Physical Stock)" },
      { value: "session", label: "session (Treatment Session)", desc: "e.g. Keratin, Facial Session (No Physical Stock)" },
      { value: "treatment", label: "treatment (Full Treatment)", desc: "e.g. Bridal Dressing, Spa (No Physical Stock)" },
      { value: "pcs", label: "pcs (Retail Product)", desc: "e.g. Shampoos, Styling Gels (Track Physical Stock)" },
      { value: "bottle", label: "bottle (Hair Oils & Tonics)", desc: "e.g. Argan Oil 100ml (Track Physical Stock)" },
      { value: "pack", label: "pack (Treatment Kits)", desc: "e.g. Color Kit (Track Physical Stock)" },
    ],
    defaultUnit: "service",
    hasMadeToOrder: true,
    defaultStockMode: "made_to_order",
    stockModeOptions: [
      {
        key: "made_to_order",
        label: "Unlimited Service Booking",
        desc: "Services performed on demand (always available on POS, no physical stock count)",
        iconName: "Flame",
      },
      {
        key: "track_stock",
        label: "Track Retail Product Stock",
        desc: "Track physical bottles/jars of retail shampoos and cosmetics",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Booked Services & Beauty Products",
    suggestedCategories: [
      "Hair Styling & Cuts",
      "Beard & Shaving",
      "Facials & Skin Care",
      "Spa & Massages",
      "Bridal & Make-up",
      "Retail Shampoos & Oils",
    ],
    suggestedExpenseCategories: [
      "Salon Premises Rent",
      "Electricity / Air Conditioning & Blow Dryers",
      "Stylist Wages & Service Commissions",
      "Salon Cosmetics, Hair Dyes & Bleaches",
      "Towel Laundry & Sanitization",
      "Water Supply & Geyser Heating",
      "Maintenance",
      "Other Overhead",
    ],
  },

  Wholesale: {
    id: "wholesale",
    name: "Wholesale",
    badge: "Wholesale & Hardware Mode",
    iconName: "Truck",
    productTerm: "Wholesale Product",
    productTermPlural: "Wholesale Products",
    catalogTitle: "Wholesale Inventory Catalog",
    catalogSubtitle: "Manage bulk lines, carton quantities, trade pricing, and wholesale stock.",
    posTitle: "Wholesale Billing Terminal",
    posSearchPlaceholder: "Search wholesale products, part numbers, cartons, bundles...",
    catalogSearchPlaceholder: "Search wholesale lines, part numbers, bundles, lot prices...",
    inventorySearchPlaceholder: "Search wholesale warehouse stock by part no, brand, carton...",
    addItemButtonLabel: "Add Wholesale Product",
    addItemModalTitle: "Add New Wholesale Product",
    addItemModalSubtitle: "Enter item name, bulk lot price, carton size, and minimum order qty.",
    nameLabel: "Product / Line Name *",
    namePlaceholder: "e.g. Tokyo Super Cement 50kg Bag, PVC Pipes 1 inch (Bundle of 10), LED Bulbs 9W (Carton of 50), GI Binding Wire Roll",
    identifierLabel: "Part No. / Item Code / Barcode",
    identifierPlaceholder: "e.g. TOKYO-CEM-50 or 4793332211",
    secondaryLabel: "Carton Qty / Minimum Lot",
    secondaryPlaceholder: "e.g. 50 units per carton | Min order 5 cartons",
    costPriceLabel: "Wholesale Purchase Cost (LKR)",
    costPricePlaceholder: "e.g. 2150.00",
    costPriceHelpText: "Factory / manufacturer purchase price",
    sellingPriceLabel: "Bulk Trade Price (LKR) *",
    sellingPricePlaceholder: "e.g. 2450.00",
    sellingPriceHelpText: "Wholesale distributor selling price",
    units: [
      { value: "box", label: "box (Cartons / Boxes)", desc: "e.g. Carton of 50 Bulbs, 100 Sockets" },
      { value: "bundle", label: "bundle (Bundles)", desc: "e.g. Bundle of 10 PVC Pipes" },
      { value: "bag", label: "bag (Heavy Sacks / Bags)", desc: "e.g. 50kg Cement, 25kg Fertilizer" },
      { value: "pcs", label: "pcs (Individual Units)", desc: "e.g. Drill Machines, Motors" },
      { value: "kg", label: "kg (Kilograms)", desc: "e.g. Bulk Nails, Screws" },
      { value: "tonne", label: "tonne (Metric Tonnes)", desc: "e.g. Steel Rebars, Sand" },
      { value: "metre", label: "metre (Metres / Length)", desc: "e.g. Electrical Wire, Cables" },
      { value: "roll", label: "roll (Full Rolls)", desc: "e.g. Roofing Felt, Wire Mesh" },
      { value: "drum", label: "drum (Barrels / Drums)", desc: "e.g. Thinner, Oil Drums" },
      { value: "pack", label: "pack (Commercial Packs)", desc: "e.g. Fastener Packs" },
    ],
    defaultUnit: "box",
    hasMadeToOrder: false,
    defaultStockMode: "track_stock",
    stockModeOptions: [
      {
        key: "track_stock",
        label: "Track Warehouse Bulk Stock",
        desc: "Real-time warehouse count tracking with minimum wholesale lot alerts",
        iconName: "Boxes",
      },
    ],
    topSellingTitle: "Top Moving Wholesale Lines",
    suggestedCategories: [
      "Building Materials & Cement",
      "Electrical & Lighting",
      "Plumbing & PVC",
      "Paints & Solvents",
      "Fasteners & Hardware",
      "Packaging Materials",
    ],
    suggestedExpenseCategories: [
      "Warehouse & Yard Rent",
      "Lorry Transport & Freight",
      "Loading / Unloading Coolie Wages",
      "Warehouse Staff Wages",
      "Forklift & Vehicle Diesel / Fuel",
      "Electricity / 3-Phase Commercial",
      "Maintenance & Insurance",
      "Other Overhead",
    ],
  },
};

/**
 * Returns the matched BusinessProfile for any given business type string.
 * Gracefully matches fuzzy names (e.g. "Mobile Shop" -> "Electronics & Mobile", "Cafe" -> "Restaurant & Cafe").
 */
export function getBusinessProfile(businessType?: string | null): BusinessProfile {
  if (!businessType) {
    return BUSINESS_PROFILES["Grocery & Retail"];
  }

  // Exact match
  if (BUSINESS_PROFILES[businessType]) {
    return BUSINESS_PROFILES[businessType];
  }

  const lower = businessType.toLowerCase().trim();

  if (
    lower.includes("mobile") ||
    lower.includes("phone") ||
    lower.includes("electronic") ||
    lower.includes("tech") ||
    lower.includes("computer") ||
    lower.includes("gadget")
  ) {
    return BUSINESS_PROFILES["Electronics & Mobile"];
  }

  if (
    lower.includes("pharmacy") ||
    lower.includes("chemist") ||
    lower.includes("medical") ||
    lower.includes("drug") ||
    lower.includes("health")
  ) {
    return BUSINESS_PROFILES["Pharmacy"];
  }

  if (
    lower.includes("cloth") ||
    lower.includes("fashion") ||
    lower.includes("boutique") ||
    lower.includes("apparel") ||
    lower.includes("garment") ||
    lower.includes("textile") ||
    lower.includes("shoe")
  ) {
    return BUSINESS_PROFILES["Clothing Store"];
  }

  if (
    lower.includes("restaurant") ||
    lower.includes("cafe") ||
    lower.includes("kottu") ||
    lower.includes("dining") ||
    lower.includes("cool bar") ||
    lower.includes("juice") ||
    lower.includes("food")
  ) {
    return BUSINESS_PROFILES["Restaurant & Cafe"];
  }

  if (
    lower.includes("bakery") ||
    lower.includes("bake") ||
    lower.includes("pastry") ||
    lower.includes("cake") ||
    lower.includes("sweet")
  ) {
    return BUSINESS_PROFILES["Bakery & Takeaway"];
  }

  if (
    lower.includes("salon") ||
    lower.includes("barber") ||
    lower.includes("spa") ||
    lower.includes("beauty") ||
    lower.includes("hair")
  ) {
    return BUSINESS_PROFILES["Salon & Barber"];
  }

  if (
    lower.includes("wholesale") ||
    lower.includes("hardware") ||
    lower.includes("distributor") ||
    lower.includes("bulk")
  ) {
    return BUSINESS_PROFILES["Wholesale"];
  }

  // Fallback to Grocery & Retail
  return BUSINESS_PROFILES["Grocery & Retail"];
}
