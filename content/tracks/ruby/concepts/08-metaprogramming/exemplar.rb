def method_exists?(obj, method_name)
  obj.respond_to?(method_name.to_sym)
end

def dynamic_accessor(klass, *attr_names)
  attr_names.each do |name|
    klass.define_method(name) do
      instance_variable_get(:"@#{name}")
    end
    klass.define_method(:"#{name}=") do |value|
      instance_variable_set(:"@#{name}", value)
    end
  end
end

class HashProxy
  def initialize(hash)
    @hash = hash
  end

  def method_missing(name, *args)
    return @hash[name] if @hash.key?(name)
    return @hash[name.to_s] if @hash.key?(name.to_s)
    super
  end

  def respond_to_missing?(name, include_private = false)
    @hash.key?(name) || @hash.key?(name.to_s) || super
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
