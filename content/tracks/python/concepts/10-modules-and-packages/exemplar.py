import importlib
import sys


def list_public_names(module_name: str) -> list[str]:
    mod = importlib.import_module(module_name)
    if hasattr(mod, "__all__"):
        return sorted(mod.__all__)
    return sorted(name for name in dir(mod) if not name.startswith("_"))


def is_cached(module_name: str) -> bool:
    return module_name in sys.modules


def safe_import(module_name: str) -> "object | None":
    try:
        return importlib.import_module(module_name)
    except ModuleNotFoundError:
        return None
