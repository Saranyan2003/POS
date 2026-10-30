import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to set CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

// Handle preflight CORS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/**
 * GET /api/v1/catalog
 * Public, paginated catalog API designed for external websites, e-commerce storefronts,
 * and mobile apps to display a business's live POS products.
 *
 * Query Parameters:
 * - businessCode (required if businessId not supplied, e.g. "T2G-BAKERY", "T2G-GROCERY")
 * - businessId (optional alternate identifier)
 * - page (integer >= 1, default: 1)
 * - limit (integer 1..100, default: 12)
 * - search (keyword search across name, SKU, barcode, description)
 * - category (category id or category name)
 * - inStockOnly (boolean: "true" | "false", default: false)
 * - sortBy ("name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest", default: "name_asc")
 * - branchCode (optional, filters inventory to a specific branch)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Business identification
    const businessCode = searchParams.get("businessCode")?.trim();
    const businessIdParam = searchParams.get("businessId")?.trim();

    if (!businessCode && !businessIdParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: 'businessCode' or 'businessId' must be provided.",
          example: "/api/v1/catalog?businessCode=T2G-BAKERY&page=1&limit=12",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Lookup business
    const business = await prisma.business.findFirst({
      where: {
        OR: [
          ...(businessCode ? [{ code: businessCode.toUpperCase() }, { id: businessCode }] : []),
          ...(businessIdParam ? [{ id: businessIdParam }, { code: businessIdParam.toUpperCase() }] : []),
        ],
        status: { in: ["ACTIVE", "TRIAL"] },
      },
      select: {
        id: true,
        name: true,
        code: true,
        businessType: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        currency: true,
        receiptHeader: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          success: false,
          error: `Business not found or inactive for code: ${businessCode || businessIdParam}`,
        },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Pagination params
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "12", 10);
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, 100) : 12;
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim() || "";
    const categoryFilter = searchParams.get("category")?.trim() || "";
    const inStockOnly = searchParams.get("inStockOnly") === "true" || searchParams.get("inStockOnly") === "1";
    const sortBy = searchParams.get("sortBy") || "name_asc";
    const branchCode = searchParams.get("branchCode")?.trim();

    // Resolve optional branch
    let targetBranchId: string | undefined = undefined;
    if (branchCode) {
      const branch = await prisma.branch.findFirst({
        where: { businessId: business.id, code: branchCode, isActive: true },
        select: { id: true },
      });
      if (branch) {
        targetBranchId = branch.id;
      }
    }

    // Determine category ID if provided by name
    let resolvedCategoryId: string | undefined = undefined;
    if (categoryFilter) {
      const cat = await prisma.category.findFirst({
        where: {
          businessId: business.id,
          OR: [
            { id: categoryFilter },
            { name: { equals: categoryFilter } },
          ],
        },
        select: { id: true },
      });
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    // Build Product Where Clause
    const whereClause: any = {
      businessId: business.id,
      isActive: true,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (resolvedCategoryId) {
      whereClause.categoryId = resolvedCategoryId;
    } else if (categoryFilter && !resolvedCategoryId) {
      // Specified category was not found
      return NextResponse.json(
        {
          success: true,
          business,
          pagination: {
            page,
            limit,
            totalProducts: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          },
          products: [],
          categories: [],
        },
        { headers: corsHeaders() }
      );
    }

    // Build Sorting
    let orderBy: any = { name: "asc" };
    switch (sortBy) {
      case "name_desc":
        orderBy = { name: "desc" };
        break;
      case "price_asc":
        orderBy = { sellingPrice: "asc" };
        break;
      case "price_desc":
        orderBy = { sellingPrice: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "name_asc":
      default:
        orderBy = { name: "asc" };
        break;
    }

    // Count Total Matching Products
    const totalProducts = await prisma.product.count({
      where: whereClause,
    });

    // Query Paginated Products
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true, color: true },
        },
        inventory: {
          where: targetBranchId ? { branchId: targetBranchId } : undefined,
          select: { branchId: true, quantity: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Format Products for Public Consumer/Website Consumption
    const formattedProducts = products
      .map((p) => {
        const totalStock = p.inventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
        const unitLower = (p.unit || "pcs").toLowerCase().trim();
        const isService = ["service", "session", "treatment", "hour", "job"].includes(unitLower);
        const isMadeToOrder = isService || ["portion", "plate", "cup", "glass"].includes(unitLower);
        const inStock = isService || isMadeToOrder || totalStock > 0;

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          description: p.description,
          category: p.category ? { id: p.category.id, name: p.category.name, color: p.category.color } : null,
          sellingPrice: p.sellingPrice,
          discountPrice: p.discountPrice,
          effectivePrice: p.discountPrice && p.discountPrice < p.sellingPrice ? p.discountPrice : p.sellingPrice,
          currency: business.currency || "LKR",
          unit: p.unit,
          imageUrl: p.imageUrl,
          inStock,
          stockQuantity: isService || isMadeToOrder ? null : Math.max(0, totalStock),
          isLowStock: isService || isMadeToOrder ? false : totalStock <= p.minStockLevel && totalStock > 0,
          isService,
          isMadeToOrder,
        };
      })
      .filter((p) => (inStockOnly ? p.inStock : true));

    // Calculate Pagination Metadata
    const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Fetch Available Categories for easy filter pill building on the external website
    const categories = await prisma.category.findMany({
      where: { businessId: business.id, isActive: true },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      {
        success: true,
        business,
        pagination: {
          page,
          limit,
          totalProducts,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
          itemsOnPage: formattedProducts.length,
        },
        filters: {
          search,
          category: categoryFilter || null,
          inStockOnly,
          sortBy,
        },
        categories,
        products: formattedProducts,
      },
      {
        headers: {
          ...corsHeaders(),
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: any) {
    console.error("Public catalog API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load catalog.",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
