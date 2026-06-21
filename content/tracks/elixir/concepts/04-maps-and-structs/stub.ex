defmodule Item do
  defstruct name: "", price: 0.0, quantity: 0
end

defmodule Inventory do
  @doc "Creates a new Item struct."
  def new_item(name, price, quantity) do
    # TODO
    %Item{}
  end

  @doc "Returns price * quantity."
  def total_value(item) do
    # TODO
    0.0
  end

  @doc "Returns a new Item with quantity increased by amount."
  def restock(item, amount) do
    # TODO
    item
  end

  @doc "Returns a new Item with price reduced by percent%."
  def apply_discount(item, percent) do
    # TODO
    item
  end

  @doc "Returns the first Item with a matching name, or nil."
  def find_by_name(items, name) do
    # TODO
    nil
  end
end

apple = Inventory.new_item("Apple", 1.50, 100)
IO.inspect(apple)
IO.inspect(Inventory.total_value(apple))
IO.inspect(Inventory.restock(apple, 50))
IO.inspect(Inventory.apply_discount(apple, 10))
