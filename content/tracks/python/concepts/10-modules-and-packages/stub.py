import importlib
import sys


def list_public_names(module_name: str) -> list[str]:
    # TODO: import module_name with importlib; return sorted __all__ if present,
    # else sorted names that don't start with '_'
    return []


def is_cached(module_name: str) -> bool:
    # TODO: return True if module_name is in sys.modules
    return False


def safe_import(module_name: str) -> "object | None":
    # TODO: import module_name; return the module or None if ModuleNotFoundError
    return None


if __name__ == "__main__":
    print(is_cached("json"))        # False (not yet imported)
    import json
    print(is_cached("json"))        # True

    print(safe_import("os"))        # <module 'os' ...>
    print(safe_import("no_such_module_xyz"))  # None

    names = list_public_names("os.path")
    print(names[:5])                # first 5 public names from os.path
