module Printable
  def print_info
    puts "#{self.class.name}: #{to_s}"
  end
end

module Taggable
  def tags
    @tags ||= []
  end

  def add_tag(tag)
    tags << tag
    self
  end

  def tagged_with?(tag)
    tags.include?(tag)
  end
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
