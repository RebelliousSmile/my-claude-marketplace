# Python Framework Migration Reference

Key breaking changes per framework version — use during `01-scan` to identify migration work.

## Django

### Django 3.x → 4.x

| Change | Impact | Detection |
|---|---|---|
| `django.utils.encoding.force_text` removed | Replace with `force_str` | grep `force_text\|smart_text` |
| `django.utils.translation.ugettext` removed | Use `gettext` | grep `ugettext` |
| `django.conf.urls.url()` removed | Use `re_path()` or `path()` | grep `url(r'` |
| `default_app_config` deprecated | Remove from `__init__.py` | grep `default_app_config` |
| `USE_L10N` defaults to `True` in 4.0 | May change number/date display | check settings.py |
| `CSRF_TRUSTED_ORIGINS` requires scheme | `"example.com"` → `"https://example.com"` | check settings.py |

### Django 4.x → 5.x

| Change | Impact | Detection |
|---|---|---|
| `django.db.models.query.QuerySet.__class_getitem__` | Type hint syntax change | low risk |
| `ModelForm.Meta.fields = '__all__'` deprecated | Enumerate fields explicitly | grep `'__all__'` |
| `django.contrib.auth` password hashers updated | Test login flows | config check |
| Python 3.10+ required | Check runtime | `python --version` |

### Django ORM patterns to watch

| Anti-pattern | Risk | Modern alternative |
|---|---|---|
| `Model.objects.all()` with iteration | N+1 risk | `select_related` / `prefetch_related` |
| `len(queryset)` | Forces eval + no caching | `queryset.count()` |
| `if queryset:` | Forces eval | `queryset.exists()` |
| Raw SQL strings | Injection risk | `QuerySet.raw()` with params |
| `order_by()` with non-deterministic field | Unstable pagination | add `id` as tiebreaker |

## FastAPI

### FastAPI 0.9x → 0.10x+

| Change | Impact | Detection |
|---|---|---|
| Pydantic v2 migration | Field validators syntax changed | `@validator` → `@field_validator` |
| `orm_mode = True` | Renamed to `model_config = ConfigDict(from_attributes=True)` | grep `orm_mode` |
| `schema_extra` | Renamed to `json_schema_extra` | grep `schema_extra` |
| `validator` decorator | `field_validator` + `model_validator` | grep `@validator` |
| `__fields__` attribute | Use `model_fields` | grep `__fields__` |
| Response model typing | `response_model=List[X]` → `list[X]` | style |

### Pydantic v1 → v2 (critical)

| v1 | v2 |
|---|---|
| `class Config: orm_mode = True` | `model_config = ConfigDict(from_attributes=True)` |
| `@validator('field')` | `@field_validator('field', mode='before')` |
| `@root_validator` | `@model_validator(mode='before'\|'after')` |
| `.dict()` | `.model_dump()` |
| `.json()` | `.model_dump_json()` |
| `.parse_obj(data)` | `Model.model_validate(data)` |
| `__fields__` | `model_fields` |
| `Field(...)` required field | Same, but `default_factory` syntax tightened |

Detection: `grep -r "from pydantic import"` + check pydantic version in requirements.

## SQLAlchemy

### SQLAlchemy 1.x → 2.x

| Old (1.x) | New (2.x) | Detection |
|---|---|---|
| `session.execute(query)` returns `ResultProxy` | Returns `Result` — use `.scalars()` | grep `session.execute` |
| `Query` API (`session.query(Model)`) | `select(Model)` statement | grep `session\.query(` |
| `relationship` with `lazy='dynamic'` | `lazy='select'` or `write_only` | grep `lazy='dynamic'` |
| `Base = declarative_base()` | `class Base(DeclarativeBase): pass` | grep `declarative_base()` |
| `Column(Integer)` | `mapped_column(int)` with `Mapped[int]` | migration optional but preferred |

Detection signal: `sqlalchemy.__version__` in requirements or `from sqlalchemy.ext.declarative import declarative_base`.
