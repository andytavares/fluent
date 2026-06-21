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

## The task

Implement three functions. These are standalone functions — no package structure needed for this exercise.

- `list_public_names(module_name: str) -> list[str]` — dynamically imports the module by name using `importlib.import_module`, then returns its `__all__` attribute if present, otherwise returns all names that don't start with `_`. Returns a sorted list.
- `is_cached(module_name: str) -> bool` — returns `True` if the module name is already in `sys.modules`.
- `safe_import(module_name: str) -> object | None` — attempts to import the module; returns the module object on success, `None` if the module doesn't exist (catches `ModuleNotFoundError` only).
