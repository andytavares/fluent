defprotocol Serializable do
  @doc "Returns a string representation."
  def serialize(value)

  @doc "Returns the byte size of the serialized form."
  def byte_size(value)
end

defimpl Serializable, for: Integer do
  def serialize(n), do: "int:#{n}"
  def byte_size(n), do: byte_size(serialize(n))
end

defimpl Serializable, for: Float do
  def serialize(n) do
    formatted = :erlang.float_to_binary(n, decimals: 2)
    "float:#{formatted}"
  end

  def byte_size(n), do: byte_size(serialize(n))
end

defimpl Serializable, for: BitString do
  def serialize(s), do: "str:#{s}"
  def byte_size(s), do: byte_size(serialize(s))
end

defimpl Serializable, for: List do
  def serialize(list) do
    items = list |> Enum.map(&Serializable.serialize/1) |> Enum.join(",")
    "list:[#{items}]"
  end

  def byte_size(list), do: byte_size(serialize(list))
end

IO.inspect(Serializable.serialize(42))
IO.inspect(Serializable.serialize(3.14))
IO.inspect(Serializable.serialize("hello"))
IO.inspect(Serializable.serialize([1, 2, 3]))
