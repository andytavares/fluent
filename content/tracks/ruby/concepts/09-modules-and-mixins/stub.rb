module Printable
  # TODO: add print_info instance method that prints "#{self.class.name}: #{to_s}"
end

module Taggable
  # TODO: add tags, add_tag(tag), tagged_with?(tag)
end

class Article
  include Printable
  include Taggable

  attr_reader :title

  def initialize(title)
    @title = title
  end

  def to_s
    title
  end
end

if __FILE__ == $PROGRAM_NAME
  a = Article.new("Ruby Metaprogramming")
  a.print_info
  a.add_tag("ruby").add_tag("programming")
  p a.tags
  p a.tagged_with?("ruby")
  p a.tagged_with?("python")
end
