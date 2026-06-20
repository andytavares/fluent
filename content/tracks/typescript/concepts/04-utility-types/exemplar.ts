export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export function createProduct(
  draft: Omit<Product, "id">,
  id: number,
): Product {
  return { id, ...draft };
}

export function updateProduct(
  product: Product,
  patch: Partial<Omit<Product, "id">>,
): Product {
  return { ...product, ...patch, id: product.id };
}

export function catalogEntry(
  product: Product,
): Pick<Product, "id" | "name" | "price"> {
  const { id, name, price } = product;
  return { id, name, price };
}
