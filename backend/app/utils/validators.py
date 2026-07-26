"""Shared validation helpers."""


def get_phone_validation_error(value: str) -> str | None:
    if not value:
        return "Phone number is required"
    if not value.isdigit():
        return "Only numbers can be entered"
    if not value.startswith("07"):
        return "Phone number must start with 07"
    if len(value) != 10:
        return "Phone number must be exactly 10 digits"
    return None
