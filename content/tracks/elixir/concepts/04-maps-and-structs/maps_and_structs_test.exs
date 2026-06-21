Code.require_file("exemplar.ex", __DIR__)

defmodule MapsAndStructsTest do
  defp run do
    apple = Inventory.new_item("Apple", 1.50, 100)
    banana = Inventory.new_item("Banana", 0.75, 200)

    results = [
      check("new_item returns Item struct", fn -> is_struct(apple, Item) end),
      check("new_item name", fn -> apple.name == "Apple" end),
      check("new_item price", fn -> apple.price == 1.50 end),
      check("new_item quantity", fn -> apple.quantity == 100 end),
      check("total_value apple", fn -> Inventory.total_value(apple) == 150.0 end),
      check("total_value banana", fn -> Inventory.total_value(banana) == 150.0 end),
      check("total_value zero qty", fn ->
        Inventory.total_value(Inventory.new_item("X", 5.0, 0)) == 0.0
      end),
      check("restock increases quantity", fn ->
        restocked = Inventory.restock(apple, 50)
        restocked.quantity == 150
      end),
      check("restock does not mutate original", fn ->
        _restocked = Inventory.restock(apple, 50)
        apple.quantity == 100
      end),
      check("restock preserves other fields", fn ->
        restocked = Inventory.restock(apple, 10)
        restocked.name == "Apple" and restocked.price == 1.50
      end),
      check("apply_discount 10%", fn ->
        discounted = Inventory.apply_discount(apple, 10)
        abs(discounted.price - 1.35) < 0.0001
      end),
      check("apply_discount 0%", fn ->
        Inventory.apply_discount(apple, 0).price == 1.50
      end),
      check("apply_discount does not mutate original", fn ->
        _d = Inventory.apply_discount(apple, 50)
        apple.price == 1.50
      end),
      check("find_by_name found", fn ->
        result = Inventory.find_by_name([apple, banana], "Banana")
        result != nil and result.name == "Banana"
      end),
      check("find_by_name not found", fn ->
        Inventory.find_by_name([apple, banana], "Orange") == nil
      end),
      check("find_by_name empty list", fn ->
        Inventory.find_by_name([], "Apple") == nil
      end)
    ]

    passed = Enum.count(results, & &1)
    failed = length(results) - passed
    IO.puts("\n#{passed} passed, #{failed} failed")
    if failed > 0, do: System.halt(1)
  end

  defp check(name, fun) do
    if fun.() do
      IO.puts("  PASS: #{name}")
      true
    else
      IO.puts("  FAIL: #{name}")
      false
    end
  rescue
    e ->
      IO.puts("  FAIL: #{name} — #{Exception.message(e)}")
      false
  end

  def main, do: run()
end

MapsAndStructsTest.main()
