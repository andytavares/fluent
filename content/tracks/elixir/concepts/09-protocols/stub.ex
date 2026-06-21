defprotocol Serializable do
  @doc "Returns a string representation."
  def serialize(value)

  @doc "Returns the byte size of the serialized form."
  def byte_size(value)
end

defimpl Serializable, for: Integer do
  def serialize(n) do
    # TODO: "int:#{n}"
    ""
  end

  def byte_size(n) do
    # TODO
    0
  end
end

defimpl Serializable, for: Float do
  def serialize(n) do
    # TODO: "float:#{formatted}"
    ""
  end

  def byte_size(n) do
    # TODO
    0
  end
end

defimpl Serializable, for: BitString do
  def serialize(s) do
    # TODO: "str:#{s}"
    ""
  end

  def byte_size(s) do
    # TODO
    0
  end
end

defimpl Serializable, for: List do
  def serialize(list) do
    # TODO: "list:[item1,item2,...]"
    ""
  end

  def byte_size(list) do
    # TODO
    0
  end
end

IO.inspect(Serializable.serialize(42))
IO.inspect(Serializable.serialize(3.14))
IO.inspect(Serializable.serialize("hello"))
IO.inspect(Serializable.serialize([1, 2, 3]))
