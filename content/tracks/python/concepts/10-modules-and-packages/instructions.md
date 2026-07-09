# Modules & Packages

## What you'll learn

How Python's import system works under the hood — module objects, `sys.modules`, `__init__.py`, `__all__`, relative imports, and `importlib` for dynamic loading.

## Key concepts

**Every `.py` file is a module:**
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

**`sys.modules` — the import cache:**
```python
import sys
import json

# Already imported? Returns the cached module object.
id(sys.modules["json"]) == id(json)  # True
```

Importing the same module twice is safe and cheap — Python caches the module object and returns the same reference every time.

**`__all__` — public API:**
```python
# mymodule.py
__all__ = ["circle_area"]   # only this is exported by "from mymodule import *"

def circle_area(r): ...
def _internal_helper(): ...   # won't be exported by *
```

`__all__` has no effect on explicit imports (`from mymodule import _internal_helper` still works). It's a convention and tooling hint.

**Packages — directories with `__init__.py`:**
```
mypackage/
    __init__.py     # runs on "import mypackage"
    utils.py
    models/
        __init__.py
        user.py
```

`__init__.py` controls what `import mypackage` exposes:
```python
# mypackage/__init__.py
from .utils import helper       # relative import
from .models.user import User   # re-export

__all__ = ["helper", "User"]
```

**Relative imports:**
```python
# inside mypackage/models/user.py
from ..utils import helper      # .. = parent package
from . import constants         # . = current package
```

Relative imports only work inside packages — not in scripts run directly (`python user.py`). The `__name__` of a directly-run script is `"__main__"`, not the package path.

**`importlib` — dynamic imports:**
```python
import importlib

mod = importlib.import_module("json")
mod.loads('{"key": 1}')

# reload a module (useful in dev/plugin systems)
importlib.reload(mod)
```

**`if __name__ == "__main__"` guard:**
```python
def main():
    print("running")

if __name__ == "__main__":
    main()
```

When Python runs a file directly, `__name__` is `"__main__"`. When it's imported as a module, `__name__` is the module name. This guard is how you write files that work both as a library and as a runnable script.

## vs other languages

| Feature | Python | JavaScript (ESM) | Java | Go |
|---|---|---|---|---|
| Module = file | Yes | Yes | No (class-based) | Yes (package = directory) |
| Import caching | `sys.modules` | ESM specifier cache | ClassLoader | compile-time |
| Public API control | `__all__` | Named exports | `public` modifier | Capitalized identifiers |
| Package init | `__init__.py` | `index.js` (convention) | No | `package` declaration |
| Dynamic import | `importlib.import_module` | `await import()` | `Class.forName` | `plugin` patterns |
| Circular imports | Partially supported (fragile) | Supported (live bindings) | Supported | Not allowed |

Python's circular import handling is fragile — if module A imports B and B imports A at the top level, you get `ImportError` or partially-initialized modules. The fix is to move imports inside functions or restructure the package.

## Watch out

- Circular imports (A imports B, B imports A) at module top level raise `ImportError` or hand you a half-initialized module — move the import inside a function, or restructure the dependency, rather than fighting the import order.
- Relative imports (`from . import x`) only work inside a package that was itself imported — running `python user.py` directly makes `__name__ == "__main__"` and relative imports fail with `ImportError: attempted relative import with no known parent package`.
- Module-level code runs exactly **once**, on first import, no matter how many times or where it's imported from afterward — don't rely on top-level side effects (like appending to a global list) running again on a second `import`.
- `importlib.reload()` re-executes the module body but does **not** update references other modules already hold to the old objects (`from mod import func` keeps the old `func`) — reload is a development convenience, not a live-patching mechanism.

## The task

Implement three standalone functions around Python's import machinery. No package structure is needed for this exercise — everything operates on already-installed stdlib module names passed as strings.

**`list_public_names(module_name: str) -> list[str]`** — dynamically imports the module named `module_name` using `importlib.import_module`. If the module defines `__all__`, return a **sorted** list of that. Otherwise, return a sorted list of every name in the module's namespace that doesn't start with `_`.

```python
list_public_names("os.path")
# a sorted list of os.path's public names, e.g. ['abspath', 'altsep', 'basename', ...]

list_public_names("json")
# sorted(json.__all__) if json defines __all__, else its sorted public names
```

**`is_cached(module_name: str) -> bool`** — returns `True` if `module_name` is currently a key in `sys.modules` (i.e. has already been imported somewhere in the process), `False` otherwise.

```python
import sys
sys.modules.pop("csv", None)   # ensure a clean slate for this example
is_cached("csv")   # False
import csv
is_cached("csv")   # True
is_cached("sys")   # True — sys itself is always loaded
```

**`safe_import(module_name: str) -> object | None`** — attempts `importlib.import_module(module_name)` and returns the resulting module object on success. If the module doesn't exist, catches **only** `ModuleNotFoundError` and returns `None` (let any other exception the module might raise on import propagate normally).

```python
safe_import("os")                      # <module 'os' ...>
safe_import("no_such_module_xyz")      # None
```
