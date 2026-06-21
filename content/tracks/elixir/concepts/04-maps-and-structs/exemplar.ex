defmodule Item do
  defstruct name: "", price: 0.0, quantity: 0
end

defmodule Inventory do
  @doc "Creates a new Item struct."
  def new_item(name, price, quantity) do
    %Item{name: name, price: price, quantity: quantity}
  end

  @doc "Returns price * quantity."
  def total_value(%Item{price: price, quantity: quantity}) do
    price * quantity
  end

  @doc "Returns a new Item with quantity increased by amount."
  def restock(%Item{} = item, amount) do
    %{item | quantity: item.quantity + amount}
  end

  @doc "Returns a new Item with price reduced by percent%."
  def apply_discount(%Item{} = item, percent) do
    %{item | price: item.price * (1 - percent / 100)}
  end

  @doc "Returns the first Item with a matching name, or nil."
  def find_by_name(items, name) do
    Enum.find(items, fn %Item{name: n} -> n == name end)
  end
end

apple = Inventory.new_item("Apple", 1.50, 100)
IO.inspect(apple)
IO.inspect(Inventory.total_value(apple))
IO.inspect(Inventory.restock(apple, 50))
IO.inspect(Inventory.apply_discount(apple, 10))
