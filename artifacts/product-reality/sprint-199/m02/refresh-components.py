"""Refresh current source metadata using the retained, unchanged capability input."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'cmos/scripts'))
from refresh_structured_data import generate_structured_payloads, write_json

TARGET = ROOT / 'cmos/planning/oods-components.json'
components, _ = generate_structured_payloads(
    generated_at=json.loads(TARGET.read_text())['generatedAt'],
    component_capabilities_path=Path(__file__).with_name('component-capabilities-input.json'),
)
write_json(TARGET, components)
