export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// createProduct combines a draft (no id) with an id to build a full Product.
export function createProduct(
  draft: Omit<Product, "id">,
  id: number,
): Product {
  // TODO
  return { id, ...draft };
}

// updateProduct applies patch fields to product, preserving the original id.
export function updateProduct(
  product: Product,
  patch: Partial<Omit<Product, "id">>,
): Product {
  // TODO
  return { ...product };
}

// catalogEntry returns only the id, name, and price fields.
export function catalogEntry(
  product: Product,
): Pick<Product, "id" | "name" | "price"> {
  // TODO
  return { id: 0, name: "", price: 0 };
}
