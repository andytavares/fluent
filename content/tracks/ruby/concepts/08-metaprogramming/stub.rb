def method_exists?(obj, method_name)
  # TODO: return true if obj responds to method_name
end

def dynamic_accessor(klass, *attr_names)
  # TODO: use define_method to add getter and setter for each name
end

class HashProxy
  def initialize(hash)
    # TODO: store the hash
  end

  def method_missing(name, *args)
    # TODO: return hash[name] if key exists, else super
  end

  def respond_to_missing?(name, include_private = false)
    # TODO: return true if hash has key name, else super
  end
end

if __FILE__ == $PROGRAM_NAME
  p method_exists?("hello", :upcase)
  p method_exists?("hello", :nonexistent)

  klass = Class.new
  dynamic_accessor(klass, :name, :age)
  obj = klass.new
  obj.name = "Bob"
  p obj.name

  hp = HashProxy.new({ name: "Alice", city: "Portland" })
  p hp.name
  p hp.city
end
