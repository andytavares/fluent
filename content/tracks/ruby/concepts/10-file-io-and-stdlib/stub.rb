require "json"
require "csv"

def count_lines(path)
  # TODO: return line count, or 0 if file does not exist
end

def parse_json_keys(json_string)
  # TODO: return sorted array of top-level string keys
end

def csv_column(csv_string, column_name)
  # TODO: parse csv_string with headers, return array of values for column_name
end

def write_lines(path, lines)
  # TODO: write each line to path, overwriting if exists
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
