require "json"
require "csv"

def count_lines(path)
  return 0 unless File.exist?(path.to_s)
  File.foreach(path).count
end

def parse_json_keys(json_string)
  JSON.parse(json_string).keys.sort
end

def csv_column(csv_string, column_name)
  CSV.parse(csv_string, headers: true).map { |row| row[column_name] }
end

def write_lines(path, lines)
  File.open(path.to_s, "w") do |f|
    lines.each { |line| f.puts line }
  end
end

if __FILE__ == $PROGRAM_NAME
  require "tempfile"

  Tempfile.create("demo") do |f|
    f.puts "line one"
    f.puts "line two"
    f.puts "line three"
    f.flush
    p count_lines(f.path)
  end

  p parse_json_keys('{"zebra":1,"apple":2,"mango":3}')

  csv = "name,score\nAlice,95\nBob,87"
  p csv_column(csv, "name")
end
