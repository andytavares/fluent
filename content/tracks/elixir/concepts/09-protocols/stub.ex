defprotocol Serializable do
  @doc "Returns a string representation."
  def serialize(value)

  @doc "Returns the byte size of the serialized form."
  def byte_length(value)
end

defimpl Serializable, for: Integer do
  def serialize(n) do
    # TODO: "int:#{n}"
    ""
  end

  def byte_length(n) do
    # TODO: byte_size(serialize(n))
    0
  end
end

defimpl Serializable, for: Float do
  def serialize(n) do
    # TODO: "float:#{formatted}" using :erlang.float_to_binary(n, decimals: 2)
    ""
  end

  def byte_length(n) do
    # TODO: byte_size(serialize(n))
    0
  end
end

defimpl Serializable, for: BitString do
  def serialize(s) do
    # TODO: "str:#{s}"
    ""
  end

  def byte_length(s) do
    # TODO: byte_size(serialize(s))
    0
  end
end

defimpl Serializable, for: List do
  def serialize(list) do
    # TODO: "list:[item1,item2,...]" — serialize each element, comma-join
    ""
  end

  def byte_length(list) do
    # TODO: byte_size(serialize(list))
    0
  end
end

IO.inspect(Serializable.serialize(42))
IO.inspect(Serializable.serialize(3.14))
IO.inspect(Serializable.serialize("hello"))
IO.inspect(Serializable.serialize([1, 2, 3]))
