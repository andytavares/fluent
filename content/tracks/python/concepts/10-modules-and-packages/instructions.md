## What you build

You write `list_public_names`, `is_cached` and `safe_import`. They use `importlib` and `sys.modules`, the parts of the import system you can reach from code. This lesson builds on **Error Handling**.

## Key concepts

### Every `.py` file is a module

A module is a file of Python code. `import` gives you the module object, and `from ... import` gives you names from it. In Go, a package is a directory, and in Java a class is the unit.

```python
# mymodule.py
PI = 3.14159

def circle_area(r: float) -> float:
    return PI * r ** 2
```

```python
import mymodule
mymodule.circle_area(5)

from mymodule import circle_area, PI
from mymodule import circle_area as area
```

### `sys.modules` caches every imported module

Python runs a module once, on its first import. Each later import returns the cached object from `sys.modules`. So a second import of the same module is safe and cheap.

```python
import sys
import json

# The same object as the cache entry
sys.modules["json"] is json  # True
```

### `__all__` lists the public names for `import *`

`from mymodule import *` imports only the names in `__all__`. `__all__` does not block an explicit import. It is a convention and a hint for tools.

```python
# mymodule.py
# Only circle_area goes out with *
__all__ = ["circle_area"]

def circle_area(r): ...
# Not exported by *
def _internal_helper(): ...

# This still works:
# from mymodule import _internal_helper
```

### A package is a directory with `__init__.py`

`import mypackage` runs `mypackage/__init__.py`. That file decides what the package exposes.

```
mypackage/
    __init__.py   # runs on import
    utils.py
    models/
        __init__.py
        user.py
```

```python
# mypackage/__init__.py
# Relative import
from .utils import helper
# Re-export
from .models.user import User

__all__ = ["helper", "User"]
```

### Relative imports work only inside a package

`.` is the current package and `..` is the parent package. A script you run directly has the `__name__` `"__main__"`, not a package path. So relative imports fail there.

```python
# In mypackage/models/user.py
from ..utils import helper   # parent
from . import constants      # current
```

### `importlib` imports by name at run time

`importlib.import_module` takes the module name as a string. `importlib.reload` runs the module body again, which helps in development and plugin systems.

```python
import importlib

mod = importlib.import_module("json")
mod.loads('{"key": 1}')

importlib.reload(mod)
```

### `__name__` tells a script from an import

When Python runs a file directly, `__name__` is `"__main__"`. When another module imports it, `__name__` is the module name. With this guard, one file works as a library and as a script.

```python
def main():
    print("running")

if __name__ == "__main__":
    main()
```

## Watch out

- A top-level circular import (A imports B, B imports A) raises `ImportError` or gives a half-built module.
- To fix a circular import, move the import into a function, or change the dependencies.
- `python user.py` makes `__name__` equal `"__main__"`. Then a relative import fails.
- That error says `ImportError: attempted relative import with no known parent package`.
- Module-level code runs once, on the first import. Do not expect its side effects to run again on a second `import`.
- `importlib.reload()` does not update references that other modules already hold. `from mod import func` keeps the old `func`.
- Use `reload` in development only. It is not a way to patch live code.

## The task

Write three functions in `stub.py` around the import system. You do not need a package. Each function takes the name of an installed standard library module as a string.

1. `list_public_names(module_name: str) -> list[str]` imports the module with `importlib.import_module`.
2. If the module defines `__all__`, `list_public_names` returns `__all__` as a sorted list.
3. Otherwise, it returns every name in the module namespace that does not start with `_`, sorted.
4. `is_cached(module_name: str) -> bool` returns `True` if `module_name` is a key in `sys.modules`.
5. `is_cached` returns `False` if the process has not imported the module yet.
6. `safe_import(module_name: str) -> object | None` calls `importlib.import_module(module_name)` and returns the module object.
7. If the module does not exist, `safe_import` catches `ModuleNotFoundError` and returns `None`.
8. `safe_import` catches only `ModuleNotFoundError`. Any other exception from the import propagates.

```python
list_public_names("json")
# ['JSONDecodeError', 'JSONDecoder',
#  'JSONEncoder', 'dump', 'dumps',
#  'load', 'loads']
list_public_names("os.path")
# Sorted, with no "_" names:
# ['abspath', 'altsep', 'basename', ...]

# Before any import of csv
is_cached("csv")   # False
import json
is_cached("json")  # True
is_cached("sys")   # True: always loaded

# A module object for csv
safe_import("csv")
safe_import("textwrap")  # has .dedent
safe_import("no_such_module_fluent_xyz")
# None
```
